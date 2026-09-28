export const ENERGY = { max: 160, regenerationMs: 20_000, berryRecovery: 10 } as const;
export interface EnergyState { current: number; max: number; regeneratedAt: number }

export function regenerate(energy: EnergyState, now: number): EnergyState {
  if (energy.current >= energy.max) return { ...energy, regeneratedAt: now };
  const anchor = Math.min(now, energy.regeneratedAt);
  const steps = Math.floor((now - anchor) / ENERGY.regenerationMs);
  const current = Math.min(energy.max, energy.current + steps);
  return { ...energy, current, regeneratedAt: current === energy.max ? now : anchor + steps * ENERGY.regenerationMs };
}

// Exploration can cost energy. Walking, gathering flowers/berries and future
// farm care, crafting, decorating and conversations remain available at zero.
export function recoverEnergy(energy: EnergyState, amount: number, now: number): EnergyState {
  const fresh = regenerate(energy, now);
  return { ...fresh, current: Math.min(fresh.max, fresh.current + Math.max(0, amount)) };
}
