import type { Position } from '../player/types';
export interface CharacterDefinition { id: string; name: string; mapId: string; position: Position; dialogueId?: string }
export interface CharacterProgress { friendship: number; storyFlags: string[] }
