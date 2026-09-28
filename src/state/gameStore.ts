import { createStore } from 'zustand/vanilla';
import { LocalStorageAdapter, SAVE_KEY } from '../persistence/localStorageAdapter';
import { decodeSave, newSave, type SaveData } from '../persistence/schema';
import { ENERGY, regenerate, recoverEnergy } from '../domain/energy/energy';
import { findObject } from '../domain/objects/catalog';
import { gainXp } from '../domain/progression/progression';
import type { Position } from '../domain/player/types';
import type { GameSettings } from '../settings/types';
import { audioService } from '../audio/audioService';

interface GameState {
  data: SaveData; ready: boolean; fatal: string | null; selectedId: string | null;
  saveStatus: 'saved' | 'error'; notice: string; noticeId: number;
}
const adapter = new LocalStorageAdapter();
export const gameStore = createStore<GameState>(() => ({
  data: newSave(), ready: false, fatal: null, selectedId: null,
  saveStatus: 'saved', notice: '', noticeId: 0
}));

function notify(notice: string) { gameStore.setState(state => ({ notice, noticeId: state.noticeId + 1 })); }

function commit(change: (draft: SaveData) => void) {
  const state = gameStore.getState();
  if (!state.ready || state.fatal) return;
  const data = structuredClone(state.data);
  change(data); data.revision += 1; data.savedAt = Date.now();
  try { adapter.save(data); gameStore.setState({ data, saveStatus: 'saved' }); }
  catch { gameStore.setState({ data, saveStatus: 'error' }); }
}

export const actions = {
  boot() {
    if (gameStore.getState().ready) return;
    try {
      const { data: stored, recovered } = adapter.load();
      const data = stored ?? newSave();
      data.energy = regenerate(data.energy, Date.now());
      adapter.save(data);
      gameStore.setState({ data, ready: true });
      if (recovered) notify('Seu progresso foi recuperado da cópia local.');
    } catch {
      gameStore.setState({ fatal: 'Não foi possível abrir seu progresso com segurança. Seus dados foram preservados. Reabra o jogo para tentar novamente.' });
    }
  },
  selectObject(id: string | null) { gameStore.setState({ selectedId: id }); },
  move(position: Position) { commit(data => { data.player.position = position; }); },
  collect(id: string) {
    const object = findObject(id);
    if (!object) return;
    const { data, ready } = gameStore.getState();
    if (!ready) return;
    const now = Date.now();
    if ((data.objects[id]?.availableAt ?? 0) > now) { notify('A natureza está se renovando. Volte em instantes.'); return; }
    const energy = regenerate(data.energy, now);
    if (energy.current < object.energyCost) { notify('Enquanto a energia volta, colha flores e amoras sem gastar nada.'); return; }
    commit(draft => {
      draft.energy = { ...energy, current: energy.current - object.energyCost };
      draft.inventory[object.resource] += object.amount;
      draft.objects[id] = { availableAt: now + object.respawnMs, collections: (draft.objects[id]?.collections ?? 0) + 1 };
      draft.progression = gainXp(draft.progression, 2);
    });
    notify(object.kind === 'wood' ? '+3 madeiras · +2 experiência' : object.kind === 'flowers' ? '+2 fibras · sem gastar energia' : '+2 amoras · um lanche para depois');
    audioService.collect(data.settings.sound);
    if (data.settings.haptics) navigator.vibrate?.(15);
  },
  eatBerry() {
    const { data } = gameStore.getState();
    if (!data.inventory.berry) { notify('Toque na amoreira para colher um lanche.'); return; }
    if (regenerate(data.energy, Date.now()).current >= data.energy.max) { notify('Sua energia está cheia. Guarde o lanche para depois.'); return; }
    commit(draft => { draft.inventory.berry -= 1; draft.energy = recoverEnergy(draft.energy, ENERGY.berryRecovery, Date.now()); });
    notify('Uma pausa gostosa. +10 de energia.');
  },
  settings(settings: Partial<GameSettings>) { commit(data => { Object.assign(data.settings, settings); }); },
  reconcile() {
    const state = gameStore.getState();
    if (!state.ready) return;
    const energy = regenerate(state.data.energy, Date.now());
    if (energy.current !== state.data.energy.current || state.saveStatus === 'error') commit(data => { data.energy = energy; });
  },
  flush() {
    const state = gameStore.getState();
    if (!state.ready) return;
    try { adapter.save(state.data); gameStore.setState({ saveStatus: 'saved' }); }
    catch { gameStore.setState({ saveStatus: 'error' }); }
  },
  receiveExternal(event: StorageEvent) {
    if (event.key !== SAVE_KEY || !event.newValue || !gameStore.getState().ready) return;
    try {
      const data = decodeSave(event.newValue);
      const current = gameStore.getState().data;
      if (data.revision > current.revision || (data.revision === current.revision && data.savedAt > current.savedAt)) {
        gameStore.setState({ data, saveStatus: 'saved' });
      }
    } catch { /* Another version must not overwrite the active session. */ }
  }
};
