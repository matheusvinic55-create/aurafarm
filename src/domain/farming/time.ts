import { FARM_BALANCE } from '../../config/farming';
import type { CropState } from './types';
/** All temporal state is derived from persisted wall-clock timestamps, including offline. */
export function cropProgress(crop: CropState, now: number) {
  return Math.max(0, Math.min(1, (now - crop.plantedAt) / Math.max(1, crop.readyAt - crop.plantedAt)));
}
export function cropStage(crop: CropState, now: number): 'seed' | 'sprout' | 'growing' | 'ready' {
  const progress = cropProgress(crop, now);
  return progress < FARM_BALANCE.stages[0] ? 'seed' : progress < FARM_BALANCE.stages[1] ? 'sprout' : progress < FARM_BALANCE.stages[2] ? 'growing' : 'ready';
}
export function remainingTime(readyAt: number, now: number) {
  const seconds = Math.max(0, Math.ceil((readyAt - now) / 1000));
  return seconds >= 60 ? `${Math.floor(seconds / 60)}min ${seconds % 60}s` : `${seconds}s`;
}
