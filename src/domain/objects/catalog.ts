import type { ResourceId } from '../resources/catalog';
import type { Position } from '../player/types';
export interface WorldObject extends Position {
  id: string; kind: 'wood' | 'flowers' | 'berries'; name: string; description: string;
  resource: ResourceId; amount: number; energyCost: number; respawnMs: number;
}
export interface ObjectProgress { availableAt: number; collections: number }
export const OBJECTS: readonly WorldObject[] = [
  { id: 'meadow-branches', kind: 'wood', name: 'Galhos caídos', description: 'Um pouco de madeira para novos começos.', x: 363, y: 733, resource: 'wood', amount: 3, energyCost: 3, respawnMs: 12_000 },
  { id: 'meadow-flowers', kind: 'flowers', name: 'Flores do campo', description: 'Colha fibras com calma. Sem gastar energia.', x: 254, y: 885, resource: 'fiber', amount: 2, energyCost: 0, respawnMs: 12_000 },
  { id: 'meadow-berries', kind: 'berries', name: 'Amoreira', description: 'Um lanche que devolve energia à aventura.', x: 635, y: 680, resource: 'berry', amount: 2, energyCost: 0, respawnMs: 25_000 }
];
export const findObject = (id: string) => OBJECTS.find(object => object.id === id);
