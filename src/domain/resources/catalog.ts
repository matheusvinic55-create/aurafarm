export const RESOURCES = {
  wood: { name: 'Madeira', plural: 'madeiras' },
  stone: { name: 'Pedra', plural: 'pedras' },
  fiber: { name: 'Fibra', plural: 'fibras' },
  berry: { name: 'Amora', plural: 'amoras' }
} as const;
export type ResourceId = keyof typeof RESOURCES;
