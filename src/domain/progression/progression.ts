export interface Progression { level: number; xp: number }
export const requiredXp = (level: number) => level * 100;
export function gainXp(progress: Progression, amount: number): Progression {
  let { level, xp } = progress;
  xp += Math.max(0, amount);
  while (xp >= requiredXp(level)) { xp -= requiredXp(level); level += 1; }
  return { level, xp };
}
