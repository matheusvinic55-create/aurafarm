import type { Position } from '../player/types';
import type { CropId } from './catalog';
import type { RecipeId } from '../production/catalog';
export interface BuildingState { id: string; definitionId: string; mapId: string; position: Position; level: number }
export interface CropState { plotId: string; cropId: CropId; plantedAt: number; readyAt: number; watered: boolean }
export type FarmCommand = { kind: 'plant'; targetId: string; cropId: CropId } | { kind: 'water'; targetId: string } | { kind: 'harvest'; targetId: string } | { kind: 'collect'; targetId: string } | { kind: 'produce'; targetId: string; recipeId: RecipeId };
