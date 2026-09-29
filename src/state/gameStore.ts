import { performFarmCommand } from '../domain/farming/actions';
import type { FarmCommand } from '../domain/farming/types';
import { findFarmTarget } from '../domain/farming/catalog';
import { itemDefinition, type ItemId } from '../domain/inventory/catalog';
import { createStore } from 'zustand/vanilla';
import { LocalStorageAdapter, SAVE_KEY } from '../persistence/localStorageAdapter';
import { decodeSave, newSave, type SaveData } from '../persistence/schema';
import { regenerate, recoverEnergy } from '../domain/energy/energy';
import { interact } from '../domain/exploration/interact';
import type { InteractionFeedback } from '../domain/exploration/types';
import { objectPresent } from '../domain/exploration/worldState';
import type { Position } from '../domain/player/types';
import type { GameSettings } from '../settings/types';
import { normalizeWorld } from '../persistence/normalizeWorld';
import { MEADOW, findWorldObject } from '../domain/maps/meadow';
import { meadowNavigation } from '../domain/maps/navigation';
import { audioService } from '../audio/audioService';
import { claimQuest as claimQuestReward, storyFlag, syncQuests } from '../domain/quests/system';
import { characterById } from '../domain/characters/catalog';

interface GameState {
  data: SaveData; ready: boolean; fatal: string | null; selectedId: string | null;
  farmRequest: { command: FarmCommand; serial: number } | null;
  actionRequest: { id: string; serial: number } | null; feedback: InteractionFeedback | null;
  anchor: { x: number; y: number } | null;
  zoneName: string; saveStatus: 'saved' | 'error'; notice: string; noticeId: number;
}
const adapter = new LocalStorageAdapter();
export const gameStore = createStore<GameState>(() => ({
  data: newSave(), ready: false, fatal: null, selectedId: null,
  farmRequest: null, actionRequest: null, feedback: null, anchor: null,
  zoneName: MEADOW.name, saveStatus: 'saved', notice: '', noticeId: 0
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
      const data = normalizeWorld(stored ?? newSave());
      data.energy = regenerate(data.energy, Date.now());
      syncQuests(data);
      adapter.save(data);
      gameStore.setState({ data, ready: true });
      if (recovered) notify('Seu progresso foi recuperado da cópia local.');
    } catch {
      gameStore.setState({ fatal: 'Não foi possível abrir seu progresso com segurança. Seus dados foram preservados. Reabra o jogo para tentar novamente.' });
    }
  },
  selectObject(id: string | null) { gameStore.setState({ selectedId: id, anchor: null }); },
  move(position: Position) { if (!meadowNavigation(gameStore.getState().data).isWalkable(position)) return; commit(data => { data.player.position = { ...position }; }); },
  notify,
  setZone(zoneName: string) { if (gameStore.getState().zoneName !== zoneName) gameStore.setState({ zoneName }); },
  visitPlace(id: string) {
    if (!findWorldObject(id)?.interaction || gameStore.getState().data.maps[MEADOW.id].visitedPlaces.includes(id)) return;
    commit(data => { data.maps[MEADOW.id].visitedPlaces.push(id); });
  },
  setAnchor(anchor: { x: number; y: number } | null) {
    const previous = gameStore.getState().anchor;
    if (previous && anchor && Math.abs(previous.x-anchor.x)<2 && Math.abs(previous.y-anchor.y)<2) return;
    if (previous === anchor) return;
    gameStore.setState({ anchor });
  },
  requestInteraction(id: string) {
    const state = gameStore.getState();
    if (!state.ready || state.fatal) return;
    const object = findWorldObject(id);
    if (!object || !objectPresent(object, state.data)) return;
    gameStore.setState({ actionRequest: { id, serial: (state.actionRequest?.serial ?? 0) + 1 } });
  },
  performInteraction(id: string) {
    const state = gameStore.getState();
    if (!state.ready || state.fatal) return;
    const data = structuredClone(state.data);
    const result = interact(data, id, Date.now());
    if ('error' in result) { notify(result.error); return; }
    commit(draft => Object.assign(draft, data));
    gameStore.setState({ feedback: { ...result.feedback, serial: (state.feedback?.serial ?? 0) + 1 } });
    notify(result.message);
    audioService.collect(data.settings.sound);
    if (data.settings.haptics) navigator.vibrate?.(15);
    if (result.feedback.removed) actions.selectObject(null);
  },
  requestFarm(command: FarmCommand) {
    const state = gameStore.getState();
    if (!state.ready || state.fatal || !findFarmTarget(command.targetId)) return;
    gameStore.setState({ farmRequest: { command, serial: (state.farmRequest?.serial ?? 0) + 1 } });
  },
  performFarm(command: FarmCommand) {
    const state = gameStore.getState();
    if (!state.ready || state.fatal) return;
    const data = structuredClone(state.data);
    const result = performFarmCommand(data, command, Date.now());
    if ('error' in result) { notify(result.error); return; }
    if (command.kind === 'harvest') storyFlag(data, 'harvest:' + command.targetId);
    if (command.kind === 'collect') storyFlag(data, 'production:' + command.targetId + ':' + Date.now());
    syncQuests(data);
    commit(draft => Object.assign(draft, data));
    gameStore.setState({ feedback: { ...result.feedback, serial: (state.feedback?.serial ?? 0) + 1 } });
    notify(result.message);
    audioService.collect(data.settings.sound);
    if (data.settings.haptics) navigator.vibrate?.(15);
  },
  talkCharacter(id: string) {
    if (!characterById(id)) return;
    commit(data => {
      data.characters[id] ??= { friendship: 0, storyFlags: [] };
      data.characters[id].friendship += 1;
      storyFlag(data, 'talk:' + id);
    });
    notify('Uma conversa tranquila também faz parte da jornada.');
  },
  claimQuest(id: string) {
    let claimed = false;
    commit(data => { claimed = claimQuestReward(data, id); });
    notify(claimed ? 'Missão concluída. A clareira se lembra do que você fez.' : 'Ainda falta um pequeno passo nessa missão.');
  },
  eatItem(id: ItemId) {
    const { data, ready, fatal } = gameStore.getState();
    if (!ready || fatal) return;
    const recovery = itemDefinition(id).recovery;
    if (!recovery || !data.inventory[id]) return;
    const before = regenerate(data.energy, Date.now()).current;
    if (before >= data.energy.max) { notify('Sua energia está cheia. Guarde para depois.'); return; }
    commit(draft => { draft.inventory[id] -= 1; draft.energy = recoverEnergy(draft.energy, recovery, Date.now()); });
    const recovered = gameStore.getState().data.energy.current - before;
    gameStore.setState(state => ({ feedback: { serial: (state.feedback?.serial ?? 0) + 1, objectId: 'player', removed: false, rewards: {}, unlocked: false, energy: recovered } }));
    notify(`Uma pausa gostosa. +${recovered} de energia.`);
  },
  resetDevelopment() {
    const current = gameStore.getState();
    if (!current.ready || current.fatal) return;
    try {
      localStorage.setItem('aurafarm:dev-archive:v1', JSON.stringify(current.data));
      const data = newSave(); data.revision = current.data.revision + 1;
      adapter.save(data);
      gameStore.setState({ data, selectedId: null, farmRequest: null, actionRequest: null, feedback: null, anchor: null, saveStatus: 'saved' });
      notify('Novo começo criado. O save anterior foi arquivado neste aparelho.');
    } catch { notify('Não foi possível arquivar seu progresso. O reset foi cancelado.'); }
  },
  eatBerry() { actions.eatItem('berry'); },
  settings(settings: Partial<GameSettings>) { commit(data => { Object.assign(data.settings, settings); }); },
  reconcile() {
    const state = gameStore.getState();
    if (!state.ready) return;
    const energy = regenerate(state.data.energy, Date.now());
    if (energy.current !== state.data.energy.current || energy.regeneratedAt < state.data.energy.regeneratedAt || state.saveStatus === 'error') commit(data => { data.energy = energy; });
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
      const data = normalizeWorld(decodeSave(event.newValue));
      const current = gameStore.getState().data;
      if (data.revision > current.revision || (data.revision === current.revision && data.savedAt > current.savedAt)) {
        gameStore.setState({ data, saveStatus: 'saved' });
      }
    } catch { /* Another version must not overwrite the active session. */ }
  }
};
