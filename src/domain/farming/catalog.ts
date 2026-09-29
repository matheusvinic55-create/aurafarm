import { FARM_BALANCE } from '../../config/farming';
import type { Position } from '../player/types';
export const CROPS = {
  wheat: { id: 'wheat', name: 'Trigo', icon: '🌾', seed: 'wheatSeed', ...FARM_BALANCE.crops.wheat },
  corn: { id: 'corn', name: 'Milho', icon: '🌽', seed: 'cornSeed', ...FARM_BALANCE.crops.corn },
  carrot: { id: 'carrot', name: 'Cenoura', icon: '🥕', seed: 'carrotSeed', ...FARM_BALANCE.crops.carrot }
} as const;
export type CropId = keyof typeof CROPS;
export const isCropId = (id: string): id is CropId => Object.hasOwn(CROPS, id);
export interface PlotDefinition extends Position { id: string; mapId: string; areaId: string; approach: Position; kind: 'soil' }
// Keep Stage 04 targets in the same expanded world-space introduced by map revision 5.
const WORLD_SCALE = 1.28;
const WORLD_CENTER = 1200;
const spread = (value: number) => WORLD_CENTER + (value - WORLD_CENTER) * WORLD_SCALE;
export const PLOTS: PlotDefinition[] = Array.from({ length: 6 }, (_, index) => {
  const sourceX = 900 + index % 3 * 112, sourceY = 1490 + Math.floor(index / 3) * 100;
  const x = spread(sourceX), y = spread(sourceY);
  return { id: `home-plot-${index + 1}`, mapId: 'first-meadow', areaId: 'clearing', kind: 'soil', x, y, approach: { x, y: spread(sourceY + 48) } };
});
export const STATIONS = [{ id: 'country-kitchen', name: 'Cozinha do jardim', x: spread(875), y: spread(1360), approach: { x: spread(875), y: spread(1420) }, slots: FARM_BALANCE.stationSlots }] as const;
export const findFarmTarget = (id: string) => PLOTS.find(plot => plot.id === id) ?? STATIONS.find(station => station.id === id);
