import Svg, { Circle, Path } from 'react-native-svg';

function star(cx: number, cy: number, outer: number, inner: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}Z`;
}

/** Stroked in its own colour with round joins, which is what blunts the five tips. */
export const STAR_PATH = star(12, 12.6, 8.4, 4.1);
const STAR_IN_BADGE = star(12, 12.4, 5.6, 2.75);

export function StarMark({ size = 24, color = '#fff', badge }: { size?: number; color?: string; badge?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {badge ? <Circle cx={12} cy={12} r={12} fill={badge} /> : null}
      <Path d={badge ? STAR_IN_BADGE : STAR_PATH} fill={color} stroke={color} strokeWidth={badge ? 1.6 : 2.2} strokeLinejoin="round" />
    </Svg>
  );
}
