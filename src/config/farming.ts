/** Stage 04 tuning: milliseconds, quantities and future expansion in one place. */
export const FARM_BALANCE = {
  startingSeeds: 6, seedCost: 1, returnedSeeds: 2, wateringBonus: .2,
  interactionRange: 110, inventoryCapacity: null as number | null,
  expansion: { additionalPlots: 3, wood: 20, stone: 12 },
  crops: {
    wheat: { durationMs: 45_000, yield: 3, futureValue: 2 },
    corn: { durationMs: 60_000, yield: 3, futureValue: 3 },
    carrot: { durationMs: 90_000, yield: 4, futureValue: 4 }
  },
  stages: [.2, .5, 1] as const,
  recipes: {
    flour: { ingredients: { wheat: 2 }, product: 'flour', quantity: 2, durationMs: 20_000 },
    bread: { ingredients: { flour: 2, corn: 1 }, product: 'bread', quantity: 2, durationMs: 30_000 },
    soup: { ingredients: { carrot: 2, corn: 1, wood: 1 }, product: 'soup', quantity: 2, durationMs: 40_000 }
  },
  recovery: { carrot: 12, bread: 55, soup: 75 },
  stationSlots: 1
} as const;
