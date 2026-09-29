/** All exploration balance lives here. Walking and observation always cost zero. */
export const BALANCE = {
  energy: { max: 240, regenerationMs: 20_000, regenerationAmount: 2, berryRecovery: 30 },
  interactionRange: 105,
  objectReach: 200,
  berries: { amount: 2, cooldownMs: 120_000, startingAmount: 3 },
  discovery: { energy: 40, berries: 2 },
  obstacles: {
    branches: { name: 'Galhos caídos', cost: 2, hits: 1, rewards: { wood: 3 }, bonusChance: .15 },
    shrub: { name: 'Arbusto fechado', cost: 3, hits: 1, rewards: { fiber: 4 }, bonusChance: .2 },
    pebble: { name: 'Pedra pequena', cost: 3, hits: 1, rewards: { stone: 3 }, bonusChance: .1 },
    boulder: { name: 'Pedra grande', cost: 5, hits: 2, rewards: { stone: 9 }, bonusChance: .15 },
    log: { name: 'Tronco caído', cost: 4, hits: 2, rewards: { wood: 9, fiber: 2 }, bonusChance: .2 },
    thicket: { name: 'Vegetação densa', cost: 4, hits: 3, rewards: { fiber: 12, wood: 3 }, bonusChance: .25 }
  },
  bonus: { berry: 1 },
} as const;
export type ObstacleType = keyof typeof BALANCE.obstacles;
