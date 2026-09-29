import { z } from 'zod';
import { MEADOW } from '../domain/maps/meadow';
import { BALANCE } from '../config/balance';
import { FARM_BALANCE } from '../config/farming';
import { PLOTS } from '../domain/farming/catalog';
import { ENERGY } from '../domain/energy/energy';

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const position = z.object({ x: z.number().finite(), y: z.number().finite() });
export const saveSchema = z.object({
  version: z.literal(2), revision: count, savedAt: count,
  player: z.object({ id: z.string(), name: z.string(), mapId: z.string(), worldRevision: z.number().int().positive().default(1), position: position.catch(() => ({ ...MEADOW.spawn })) }),
  progression: z.object({ level: z.number().int().min(1).max(10000), xp: count }),
  energy: z.object({ current: count, max: z.number().int().positive(), regeneratedAt: count }).refine(v => v.current <= v.max),
  inventory: z.object({ wood: count, stone: count.default(0), fiber: count, berry: count,
    wheat: count.default(0), corn: count.default(0), carrot: count.default(0),
    wheatSeed: count.default(FARM_BALANCE.startingSeeds), cornSeed: count.default(FARM_BALANCE.startingSeeds), carrotSeed: count.default(FARM_BALANCE.startingSeeds),
    flour: count.default(0), bread: count.default(0), soup: count.default(0) }),
  farm: z.object({ plots: z.record(z.string(), z.object({ prepared: z.boolean(), unlocked: z.boolean(), areaId: z.string() })),
    capacity: count.nullable().default(null) }).default(() => ({ plots: Object.fromEntries(PLOTS.map(p => [p.id, { prepared: false, unlocked: true, areaId: p.areaId }])), capacity: FARM_BALANCE.inventoryCapacity })),
  production: z.array(z.object({ id: z.string(), recipeId: z.enum(['flour', 'bread', 'soup']), stationId: z.string(),
    startedAt: count, durationMs: count, readyAt: count, status: z.literal('processing'),
    product: z.enum(['flour', 'bread', 'soup']), quantity: count })).default([]),
  exploration: z.object({ obstacles: z.record(z.string(), z.object({ hits: count, removed: z.boolean() })) }).default({ obstacles: {} }),
  wallet: z.object({ coins: count }),
  maps: z.record(z.string(), z.object({ unlockedAreas: z.array(z.string()), visitedPlaces: z.array(z.string()).default([]) })),
  objects: z.record(z.string(), z.object({ availableAt: count, collections: count })),
  quests: z.array(z.object({ id: z.string(), status: z.enum(['active', 'complete', 'claimed']), objectives: z.record(z.string(), count) })),
  buildings: z.array(z.object({ id: z.string(), definitionId: z.string(), mapId: z.string(), position, level: count })),
  crops: z.array(z.object({ plotId: z.string(), cropId: z.enum(['wheat', 'corn', 'carrot']), plantedAt: count, readyAt: count, watered: z.boolean().default(false) })),
  characters: z.record(z.string(), z.object({ friendship: count, storyFlags: z.array(z.string()) })),
  settings: z.object({ sound: z.boolean(), haptics: z.boolean(), reducedMotion: z.boolean() })
});
export type SaveData = z.infer<typeof saveSchema>;

export function newSave(now = Date.now()): SaveData {
  return saveSchema.parse({
    version: 2, revision: 0, savedAt: now,
    player: { id: crypto.randomUUID(), name: 'Viajante', mapId: MEADOW.id, worldRevision: MEADOW.revision, position: { ...MEADOW.spawn } },
    progression: { level: 1, xp: 0 }, energy: { current: ENERGY.max, max: ENERGY.max, regeneratedAt: now },
    inventory: { wood: 0, stone: 0, fiber: 0, berry: BALANCE.berries.startingAmount }, exploration: { obstacles: {} }, wallet: { coins: 0 },
    maps: { [MEADOW.id]: { unlockedAreas: ['clearing'], visitedPlaces: [] } }, objects: {}, quests: [], buildings: [], crops: [], characters: {},
    settings: { sound: false, haptics: true, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }
  });
}

export function decodeSave(raw: string): SaveData {
  const parsed: unknown = JSON.parse(raw);
  // Retain the existing storage key and all stage 01–03 data. Defaults only add new fields.
  // Unknown versions are rejected; never replace an unreadable save with a new game.
  if (typeof parsed !== 'object' || parsed === null || !('version' in parsed)) throw new Error('SAVE_UNREADABLE');
  if (parsed.version !== 1 && parsed.version !== 2) throw new Error('SAVE_VERSION_UNSUPPORTED');
  return saveSchema.parse(parsed.version === 1 ? { ...parsed, version: 2 } : parsed);
}
