import type { Position } from '../player/types';
export interface BuildingState { id: string; definitionId: string; mapId: string; position: Position; level: number }
export interface CropState { plotId: string; cropId: string; plantedAt: number; readyAt: number }
