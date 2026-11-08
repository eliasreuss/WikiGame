import { ArrowRight, ArrowUpRight, Check, Clock, Earth, Flame, House, Lock, Minus, Plus, RotateCcw, Share, Trophy, User, Users, X, type LucideIcon } from 'lucide-react-native';

const ICONS = {
  today: House,
  friends: Users,
  arrowRight: ArrowRight,
  close: X,
  share: Share,
  external: ArrowUpRight,
  lock: Lock,
  flame: Flame,
  replay: RotateCcw,
  check: Check,
  clock: Clock,
  trophy: Trophy,
  user: User,
  plus: Plus,
  minus: Minus,
  world: Earth,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 22, color = '#202122', strokeWidth = 1.75 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const Glyph = ICONS[name];
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} absoluteStrokeWidth={size < 18} />;
}
