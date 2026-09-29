import { BALANCE } from '../../config/balance';
import { findWorldObject, MEADOW, TRAIL_BLOCKERS } from '../maps/meadow';
import { regenerate, recoverEnergy } from '../energy/energy';
import { RESOURCES, type ResourceId } from '../resources/catalog';
import { groveOpen, objectPresent, trailCleared } from './worldState';
import type { SaveData } from '../../persistence/schema';
import type { InteractionFeedback } from './types';
export type InteractionResult = { error: string } | { feedback: Omit<InteractionFeedback, 'serial'>; message: string };
/** One serializable transaction: no Phaser, React, persistence, or delayed reward callbacks. */
export function interact(data: SaveData, id: string, now: number, random = Math.random): InteractionResult {
  const object = findWorldObject(id);
  if (!object?.interaction || !objectPresent(object, data)) return { error: 'Esse trecho já está livre.' };
  const approach = object.interaction.approach;
  const toApproach = Math.hypot(data.player.position.x - approach.x, data.player.position.y - approach.y);
  const toObject = Math.hypot(data.player.position.x - object.x, data.player.position.y - object.y);
  // Some action points sit in unreachable spots; the character stops at the nearest walkable cell, so also accept being close to the object.
  if (toApproach > BALANCE.interactionRange && toObject > BALANCE.objectReach) return { error: 'Chegue um pouquinho mais perto.' };
  const before = regenerate(data.energy, now);
  data.energy = before;
  const rewards: Partial<Record<ResourceId, number>> = {};
  let removed = false, unlocked = false, message = '';
  if (object.obstacleType) {
    const config = BALANCE.obstacles[object.obstacleType];
    if (before.current < config.cost) return { error: `Faltam ${config.cost - before.current} de energia. Você pode passear ou colher amoras enquanto ela volta.` };
    const hits = Math.min(config.hits, (data.exploration.obstacles[id]?.hits ?? 0) + 1);
    removed = hits >= config.hits;
    data.energy = { ...before, current: before.current - config.cost };
    data.exploration.obstacles[id] = { hits, removed };
    if (removed) {
      Object.assign(rewards, config.rewards);
      if (random() < config.bonusChance) Object.assign(rewards, BALANCE.bonus);
      message = 'Caminho mais livre';
    } else message = `${hits}/${config.hits} · Mais um pouco e o caminho fica livre`;
    if (!groveOpen(data) && trailCleared(data)) {
      data.maps[MEADOW.id].unlockedAreas.push('fern-grove');
      const beforeDiscovery = data.energy.current;
      data.energy = recoverEnergy(data.energy, BALANCE.discovery.energy, now);
      const recovered = data.energy.current - beforeDiscovery;
      rewards.berry = (rewards.berry ?? 0) + BALANCE.discovery.berries;
      unlocked = true;
      message = `Recanto das Samambaias descoberto! +${recovered} de energia e um lanche para continuar.`;
    }
  } else if (id === 'meadow-berries') {
    const state = data.objects[id];
    if (state && state.availableAt > now) return { error: 'As amoras estão amadurecendo. Volte daqui a pouco.' };
    rewards.berry = BALANCE.berries.amount;
    data.objects[id] = { collections: (state?.collections ?? 0) + 1, availableAt: now + BALANCE.berries.cooldownMs };
    message = 'Amoras fresquinhas · sem gastar energia';
  } else if (id === 'old-gate') {
    const remaining = TRAIL_BLOCKERS.filter(key => !data.exploration.obstacles[key]?.removed).length;
    return { error: `Faltam ${remaining} bloqueios na trilha. Limpe os galhos, o tronco e as samambaias.` };
  } else return { error: object.interaction.description };
  for (const [resource, amount] of Object.entries(rewards)) data.inventory[resource as ResourceId] += amount!;
  const rewardText = Object.entries(rewards).map(([key, amount]) => `+${amount} ${RESOURCES[key as ResourceId].plural}`).join(' · ');
  return { feedback: { objectId: id, removed, rewards, unlocked, energy: data.energy.current - before.current }, message: unlocked ? message : [message, rewardText].filter(Boolean).join(' · ') };
}
