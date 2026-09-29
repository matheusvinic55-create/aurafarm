import { Mountain, Compass, RotateCw, Backpack, Check, ChevronRight, CircleHelp, Feather, Flower2, Leaf, Settings2, Sparkles, Sprout, Trees, Volume2, X, Zap } from 'lucide-react';
const icons = { stone: Mountain, compass: Compass, rotate: RotateCw, backpack: Backpack, check: Check, chevron: ChevronRight, help: CircleHelp, feather: Feather, flower: Flower2, leaf: Leaf, settings: Settings2, sparkles: Sparkles, sprout: Sprout, wood: Trees, volume: Volume2, close: X, energy: Zap };
export function Icon({ name, size = 20 }: { name: keyof typeof icons; size?: number }) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" />;
}
