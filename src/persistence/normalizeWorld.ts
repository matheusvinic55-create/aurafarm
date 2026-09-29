import type { SaveData } from './schema';
import { MEADOW } from '../domain/maps/meadow';
import { meadowNavigation } from '../domain/maps/navigation';
import { ENERGY } from '../domain/energy/energy';
import { trailCleared } from '../domain/exploration/worldState';
/** Additive migration: existing inventory, progression and cleared object IDs survive. */
export function normalizeWorld(data: SaveData): SaveData {
  if (data.player.worldRevision > MEADOW.revision) throw new Error('WORLD_VERSION_UNSUPPORTED');
  data.maps[MEADOW.id] ??= { unlockedAreas: ['clearing'], visitedPlaces: [] };
  if (trailCleared(data) && !data.maps[MEADOW.id].unlockedAreas.includes('fern-grove')) data.maps[MEADOW.id].unlockedAreas.push('fern-grove');
  // Only stage 01 used incompatible coordinates. Stage 02 positions remain valid.
  const oldMap = data.player.mapId !== MEADOW.id || data.player.worldRevision < 2;
  data.player.position = meadowNavigation(data).safePosition(oldMap ? MEADOW.spawn : data.player.position);
  data.player.mapId = MEADOW.id; data.player.worldRevision = MEADOW.revision;
  if (data.energy.max !== ENERGY.max) {
    data.energy.current = Math.min(ENERGY.max, data.energy.current + Math.max(0, ENERGY.max - data.energy.max));
    data.energy.max = ENERGY.max;
  }
  return data;
}
