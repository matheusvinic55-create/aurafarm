export const MEADOW = {
  id: 'first-meadow', name: 'Clareira do Amanhecer', width: 900, height: 1400,
  spawn: { x: 461, y: 810 },
  walkArea: { x: 446, y: 758, width: 565, height: 444 }
} as const;
export interface MapProgress { unlockedAreas: string[] }
