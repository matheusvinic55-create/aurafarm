import type { ResourceId } from '../resources/catalog';
export interface ObstacleProgress { hits: number; removed: boolean }
export interface ExplorationProgress { obstacles: Record<string, ObstacleProgress> }
export interface InteractionFeedback {
  serial: number;
  objectId: string;
  removed: boolean;
  energy: number;
  rewards: Partial<Record<ResourceId, number>>;
  unlocked: boolean;
}
