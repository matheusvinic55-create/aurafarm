import { FARM_BALANCE } from '../../config/farming';
export const RECIPES = {
  flour: { id: 'flour', name: 'Moer farinha', ...FARM_BALANCE.recipes.flour },
  bread: { id: 'bread', name: 'Assar pão do campo', ...FARM_BALANCE.recipes.bread },
  soup: { id: 'soup', name: 'Preparar sopa da horta', ...FARM_BALANCE.recipes.soup }
} as const;
export type RecipeId = keyof typeof RECIPES;
