import type { SaveData } from '../../persistence/schema';
import { FARM_BALANCE } from '../../config/farming';
import { CROPS, PLOTS, STATIONS, findFarmTarget } from './catalog';
import { RECIPES } from '../production/catalog';
import type { FarmCommand } from './types';
import type { InteractionFeedback } from '../exploration/types';
import { ITEMS, type ItemId } from '../inventory/catalog';

type Result = { error: string } | { message: string; feedback: Omit<InteractionFeedback, 'serial'> };
/** One validated transaction. Inventory and world change together; no per-plot timers. */
export function performFarmCommand(data: SaveData, command: FarmCommand, now: number): Result {
  const target = findFarmTarget(command.targetId);
  if (!target) return { error: 'Esse lugar ainda não está disponível.' };
  if (Math.hypot(data.player.position.x - target.approach.x, data.player.position.y - target.approach.y) > FARM_BALANCE.interactionRange) return { error: 'Aproxime-se um pouquinho.' };
  const rewards: Partial<Record<ItemId, number>> = {};
  const grant = (id: ItemId, amount: number) => { data.inventory[id] += amount; rewards[id] = amount; };
  let message = '';
  if (command.kind === 'plant' || command.kind === 'water' || command.kind === 'harvest') {
    const plot = data.farm.plots[command.targetId];
    if (!plot?.unlocked || !PLOTS.some(p => p.id === command.targetId)) return { error: 'Este canteiro ainda está fechado.' };
    const planted = data.crops.find(c => c.plotId === command.targetId);
    if (command.kind === 'plant') {
      if (planted) return { error: 'Já há uma plantinha neste canteiro.' };
      const crop = CROPS[command.cropId];
      if (!crop || data.inventory[crop.seed] < FARM_BALANCE.seedCost) return { error: 'Colha para receber mais sementes.' };
      data.inventory[crop.seed] -= FARM_BALANCE.seedCost;
      plot.prepared = true;
      data.crops.push({ plotId: command.targetId, cropId: command.cropId, plantedAt: now, readyAt: now + crop.durationMs, watered: false });
      message = `${crop.name} plantado. Vai crescer mesmo com o jogo fechado.`;
    } else {
      if (!planted) return { error: 'Escolha uma semente para este canteiro.' };
      const crop = CROPS[planted.cropId];
      if (command.kind === 'water') {
        if (planted.watered || now >= planted.readyAt) return { error: 'Sua plantinha já está bem cuidada.' };
        planted.watered = true;
        planted.readyAt = Math.max(now, planted.readyAt - crop.durationMs * FARM_BALANCE.wateringBonus);
        message = 'Uma rega de carinho. A colheita chega mais cedo.';
      } else {
        if (now < planted.readyAt) return { error: 'Está crescendo no seu tempo.' };
        grant(planted.cropId, crop.yield); grant(crop.seed, FARM_BALANCE.returnedSeeds);
        data.crops = data.crops.filter(c => c.plotId !== command.targetId);
        plot.prepared = true;
        message = `+${crop.yield} ${ITEMS[planted.cropId].plural} e +${FARM_BALANCE.returnedSeeds} sementes. Canteiro pronto para replantar.`;
      }
    }
  } else {
    const station = STATIONS.find(s => s.id === command.targetId);
    if (!station) return { error: 'Procure a cozinha do jardim.' };
    const jobs = data.production.filter(job => job.stationId === station.id);
    if (command.kind === 'collect') {
      const job = jobs.find(job => now >= job.readyAt);
      if (!job) return { error: 'Ainda está sendo preparado com carinho.' };
      grant(job.product, job.quantity);
      data.production = data.production.filter(j => j.id !== job.id);
      message = `+${job.quantity} ${ITEMS[job.product].plural} na mochila.`;
    } else {
      if (jobs.length >= station.slots) return { error: 'Colete a produção atual antes de começar outra.' };
      const recipe = RECIPES[command.recipeId];
      if (!recipe) return { error: 'Receita indisponível.' };
      const ingredients = Object.entries(recipe.ingredients) as [ItemId, number][];
      if (ingredients.some(([id, quantity]) => data.inventory[id] < quantity)) return { error: 'Faltam ingredientes. Veja a receita na cozinha.' };
      ingredients.forEach(([id, quantity]) => { data.inventory[id] -= quantity; });
      data.production.push({ id: crypto.randomUUID(), recipeId: recipe.id, stationId: station.id, startedAt: now,
        durationMs: recipe.durationMs, readyAt: now + recipe.durationMs, status: 'processing', product: recipe.product, quantity: recipe.quantity });
      message = 'Já está preparando. Pode passear ou fechar o jogo.';
    }
  }
  return { message, feedback: { objectId: command.targetId, removed: false, energy: 0, rewards, unlocked: false } };
}
