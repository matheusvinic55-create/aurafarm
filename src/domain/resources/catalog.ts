export const RESOURCES = {
  wood: { name: 'Madeira', plural: 'madeiras' },
  fiber: { name: 'Fibra', plural: 'fibras' },
  berry: { name: 'Amora', plural: 'amoras' }
} as const;
export type ResourceId = keyof typeof RESOURCES;
