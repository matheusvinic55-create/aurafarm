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
export const PLOTS: PlotDefinition[] = Array.from({ length: 6 }, (_, index) => {
  const x = 900 + index % 3 * 112, y = 1490 + Math.floor(index / 3) * 100;
  return { id: `home-plot-${index + 1}`, mapId: 'first-meadow', areaId: 'clearing', kind: 'soil', x, y, approach: { x, y: y + 48 } };
});
export const STATIONS = [{ id: 'country-kitchen', name: 'Cozinha do jardim', x: 875, y: 1360, approach: { x: 875, y: 1420 }, slots: FARM_BALANCE.stationSlots }] as const;
export const findFarmTarget = (id: string) => PLOTS.find(plot => plot.id === id) ?? STATIONS.find(station => station.id === id);
