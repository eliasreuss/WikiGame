import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { WORLD } from '../../data/worldmap';
import { color } from '../../theme/tokens';
import { countryBounds, countryIndex, countryPath, project } from './world';

export const ORIGIN_CARD_BG = color.primaryDeep;

// A slice of the real game map around the Mediterranean, framed so the pin sits top right.
const VIEW_W = 1250;
const VIEW_H = 640;
const PIN = project({ lat: 42.3, lon: 12.9 });
const GUESS = project({ lat: 46.2, lon: 7.4 });
const X0 = PIN.x - VIEW_W * 0.8;
const Y0 = PIN.y - VIEW_H * 0.44;
const ITALY = countryIndex('Italy');

const VISIBLE = WORLD.countries
  .map((c, i) => ({ d: c.d, b: countryBounds(i) }))
  .filter(({ b }) => b.maxX > X0 && b.minX < X0 + VIEW_W && b.maxY > Y0 && b.minY < Y0 + VIEW_H)
  .map(({ d }) => d);

/** Origin card scene: real borders, the answer country lit, and a guess line into the pin. */
export const OriginCardArt = memo(function OriginCardArt() {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox={`${X0} ${Y0} ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMaxYMid slice">
      <G fill="#fff" fillOpacity={0.1} stroke="#fff" strokeOpacity={0.24} strokeWidth={1.6} strokeLinejoin="round">
        {VISIBLE.map((d, i) => (
          <Path key={i} d={d} />
        ))}
      </G>
      {ITALY >= 0 ? <Path d={countryPath(ITALY)} fill={color.primary} stroke="#fff" strokeOpacity={0.85} strokeWidth={2.4} strokeLinejoin="round" /> : null}
      <Line x1={GUESS.x} y1={GUESS.y} x2={PIN.x} y2={PIN.y} stroke="#fff" strokeOpacity={0.7} strokeWidth={3} strokeDasharray="9 8" strokeLinecap="round" />
      <Circle cx={GUESS.x} cy={GUESS.y} r={9} fill={ORIGIN_CARD_BG} stroke="#fff" strokeWidth={4} />
      <Circle cx={PIN.x} cy={PIN.y} r={58} fill="#fff" fillOpacity={0.1} />
      <Circle cx={PIN.x} cy={PIN.y} r={34} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={2.4} />
      <Circle cx={PIN.x} cy={PIN.y} r={15} fill="#fff" stroke={color.primary} strokeWidth={5} />
    </Svg>
  );
});
