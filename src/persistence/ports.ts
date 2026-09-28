import type { SaveData } from './schema';
export interface LocalSavePort {
  load(): { data: SaveData | null; recovered: boolean };
  save(data: SaveData): void;
}
// A future authenticated sync service composes this port with LocalSavePort.
// accountId and revision must be checked server-side; no remote store in stage 01.
export interface RemoteSavePort {
  pull(accountId: string): Promise<SaveData | null>;
  push(accountId: string, data: SaveData, expectedRevision: number): Promise<void>;
}
