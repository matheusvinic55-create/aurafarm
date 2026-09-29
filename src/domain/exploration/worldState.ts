import { MEADOW, TRAIL_BLOCKERS } from '../maps/meadow';
import type { WorldDefinition, SceneryObject } from '../maps/types';
import type { ExplorationProgress } from './types';
export interface WorldProgress { exploration: ExplorationProgress; maps: Record<string, { unlockedAreas: string[] }> }
export const groveOpen = (data: WorldProgress) => data.maps[MEADOW.id]?.unlockedAreas.includes('fern-grove') ?? false;
export const trailCleared = (data: WorldProgress) => TRAIL_BLOCKERS.every(id => data.exploration.obstacles[id]?.removed);
export function objectPresent(object: SceneryObject, data: WorldProgress) {
  return !data.exploration.obstacles[object.id]?.removed &&
    (!object.areaId || data.maps[MEADOW.id]?.unlockedAreas.includes(object.areaId)) &&
    !(object.id === 'old-gate' && groveOpen(data));
}
export function navigationKey(data: WorldProgress) {
  return `${groveOpen(data)}:${Object.keys(data.exploration.obstacles).filter(id => data.exploration.obstacles[id].removed).sort().join(',')}`;
}
export function resolveWorld(data: WorldProgress): WorldDefinition {
  const open = groveOpen(data);
  return { ...MEADOW, objects: MEADOW.objects.filter(object => objectPresent(object, data)),
    blockedAreas: MEADOW.blockedAreas.filter(area => area.id !== 'fern-entrance').concat(open ? [] : [{ type: 'rect', x: 880, y: 0, width: 600, height: 635 }]) };
}
