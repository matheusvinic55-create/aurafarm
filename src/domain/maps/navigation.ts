import { NavigationGrid } from '../../engine/navigation/NavigationGrid';
import { navigationKey, resolveWorld, type WorldProgress } from '../exploration/worldState';
let cached: { key: string; grid: NavigationGrid } | undefined;
/** Rebuild only when solid objects or area access change, never on movement/energy ticks. */
export function meadowNavigation(data: WorldProgress) {
  const key = navigationKey(data);
  if (cached?.key !== key) cached = { key, grid: new NavigationGrid(resolveWorld(data)) };
  return cached.grid;
}
