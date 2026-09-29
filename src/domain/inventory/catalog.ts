import { BALANCE } from '../../config/balance';
import { FARM_BALANCE } from '../../config/farming';
export type ItemCategory = 'resources' | 'crops' | 'seeds' | 'production' | 'energy';
export const CATEGORIES: { id: ItemCategory; name: string }[] = [
  { id: 'resources', name: 'Recursos' }, { id: 'crops', name: 'Cultivos' },
  { id: 'seeds', name: 'Sementes' }, { id: 'production', name: 'Produção' }, { id: 'energy', name: 'Energia' }
];
interface ItemDefinition { name: string; plural: string; icon: string; category: ItemCategory; description: string; recovery?: number }
export const ITEMS = {
  wood: { name: 'Madeira', plural: 'madeiras', icon: '🪵', category: 'resources', description: 'Da exploração para a cozinha e futuras construções.' },
  stone: { name: 'Pedra', plural: 'pedras', icon: '🪨', category: 'resources', description: 'Guardada para novas construções.' },
  fiber: { name: 'Fibra', plural: 'fibras', icon: '🌿', category: 'resources', description: 'Folhas e fibras para futuras criações.' },
  berry: { name: 'Amora', plural: 'amoras', icon: '🫐', category: 'energy', description: 'Um lanche colhido na clareira.', recovery: BALANCE.energy.berryRecovery },
  wheat: { name: 'Trigo', plural: 'trigos', icon: '🌾', category: 'crops', description: 'Transforme em farinha na cozinha rural.' },
  corn: { name: 'Milho', plural: 'milhos', icon: '🌽', category: 'crops', description: 'Combina com pão e sopa.' },
  carrot: { name: 'Cenoura', plural: 'cenouras', icon: '🥕', category: 'crops', description: 'Coma fresquinha ou prepare uma sopa.', recovery: FARM_BALANCE.recovery.carrot },
  wheatSeed: { name: 'Semente de trigo', plural: 'sementes de trigo', icon: '🌾', category: 'seeds', description: 'A colheita devolve sementes para replantar.' },
  cornSeed: { name: 'Semente de milho', plural: 'sementes de milho', icon: '🌽', category: 'seeds', description: 'A colheita devolve sementes para replantar.' },
  carrotSeed: { name: 'Semente de cenoura', plural: 'sementes de cenoura', icon: '🥕', category: 'seeds', description: 'A colheita devolve sementes para replantar.' },
  flour: { name: 'Farinha', plural: 'farinhas', icon: '🥣', category: 'production', description: 'Moída na cozinha. A base de um pão caseiro.' },
  bread: { name: 'Pão do campo', plural: 'pães', icon: '🍞', category: 'production', description: 'Uma pausa quentinha para voltar à aventura.', recovery: FARM_BALANCE.recovery.bread },
  soup: { name: 'Sopa da horta', plural: 'sopas', icon: '🍲', category: 'production', description: 'Cenoura e milho, preparados no fogão a lenha.', recovery: FARM_BALANCE.recovery.soup }
} satisfies Record<string, ItemDefinition>;
export type ItemId = keyof typeof ITEMS;
export const itemDefinition = (id: ItemId): ItemDefinition => ITEMS[id];
