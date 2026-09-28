import { actions, gameStore } from '../state/gameStore';
// The engine talks to this port, never to React components or browser storage.
export const gameBridge = {
  snapshot: () => gameStore.getState(),
  subscribe: gameStore.subscribe,
  select: actions.selectObject,
  move: actions.move
};
