import { z } from 'zod';
import { MEADOW } from '../domain/maps/meadow';
import { ENERGY } from '../domain/energy/energy';

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const position = z.object({ x: z.number().finite(), y: z.number().finite() });
export const saveSchema = z.object({
  version: z.literal(1), revision: count, savedAt: count,
  player: z.object({ id: z.string(), name: z.string(), mapId: z.string(), position }),
  progression: z.object({ level: z.number().int().min(1).max(10000), xp: count }),
  energy: z.object({ current: count, max: z.number().int().positive(), regeneratedAt: count }).refine(v => v.current <= v.max),
  inventory: z.object({ wood: count, fiber: count, berry: count }),
  wallet: z.object({ coins: count }),
  maps: z.record(z.string(), z.object({ unlockedAreas: z.array(z.string()) })),
  objects: z.record(z.string(), z.object({ availableAt: count, collections: count })),
  quests: z.array(z.object({ id: z.string(), status: z.enum(['active', 'complete', 'claimed']), objectives: z.record(z.string(), count) })),
  buildings: z.array(z.object({ id: z.string(), definitionId: z.string(), mapId: z.string(), position, level: count })),
  crops: z.array(z.object({ plotId: z.string(), cropId: z.string(), plantedAt: count, readyAt: count })),
  characters: z.record(z.string(), z.object({ friendship: count, storyFlags: z.array(z.string()) })),
  settings: z.object({ sound: z.boolean(), haptics: z.boolean(), reducedMotion: z.boolean() })
});
export type SaveData = z.infer<typeof saveSchema>;

export function newSave(now = Date.now()): SaveData {
  return {
    version: 1, revision: 0, savedAt: now,
    player: { id: crypto.randomUUID(), name: 'Viajante', mapId: MEADOW.id, position: { ...MEADOW.spawn } },
    progression: { level: 1, xp: 0 }, energy: { current: ENERGY.max, max: ENERGY.max, regeneratedAt: now },
    inventory: { wood: 0, fiber: 0, berry: 2 }, wallet: { coins: 0 },
    maps: { [MEADOW.id]: { unlockedAreas: ['clearing'] } }, objects: {}, quests: [], buildings: [], crops: [], characters: {},
    settings: { sound: false, haptics: true, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }
  };
}

export function decodeSave(raw: string): SaveData {
  const parsed: unknown = JSON.parse(raw);
  // Add explicit migrations here when version 2 is introduced. Never silently
  // reset, reinterpret or overwrite an unknown/future save version.
  if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && parsed.version !== 1) {
    throw new Error('SAVE_VERSION_UNSUPPORTED');
  }
  return saveSchema.parse(parsed);
}
