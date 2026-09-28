import type { LocalSavePort } from './ports';
import { decodeSave, saveSchema, type SaveData } from './schema';
export const SAVE_KEY = 'aurafarm:save:v1';
const BACKUP_KEY = 'aurafarm:backup:v1';

export class LocalStorageAdapter implements LocalSavePort {
  load() {
    const current = localStorage.getItem(SAVE_KEY);
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!current && !backup) return { data: null, recovered: false };
    if (current) {
      try { return { data: decodeSave(current), recovered: false }; }
      catch (error) {
        if (error instanceof Error && error.message === 'SAVE_VERSION_UNSUPPORTED') throw error;
      }
    }
    if (backup) {
      const data = decodeSave(backup);
      // Preserve unreadable source for recovery; never replace it with a new game.
      if (current) localStorage.setItem('aurafarm:recovery', current);
      return { data, recovered: true };
    }
    throw new Error('SAVE_UNREADABLE');
  }
  save(data: SaveData) {
    const serialized = JSON.stringify(saveSchema.parse(data));
    const current = localStorage.getItem(SAVE_KEY);
    if (current) {
      try { decodeSave(current); localStorage.setItem(BACKUP_KEY, current); }
      catch (error) {
        if (error instanceof Error && error.message === 'SAVE_VERSION_UNSUPPORTED') throw error;
        // Keep the previous valid backup if the main slot is damaged.
      }
    }
    // localStorage's synchronous atomic write finishes before an action returns.
    localStorage.setItem(SAVE_KEY, serialized);
  }
}
