import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, Line, RadialGradient, Rect, Stop, Text } from 'react-native-svg';
import { color } from '../../theme/tokens';

// Dial on the right of a 400×220 scene; the card crops from the left.
const CX = 322;
const CY = 84;
const R = 74;
const TARGET = 58;
const GUESS = 34;

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
};

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const deg = i * 5;
  const major = deg % 30 === 0;
  return { deg, major, a: polar(R - (major ? 10 : 5), deg), b: polar(R, deg) };
});

/** Compass card scene: a bearing dial, the needle's guess, and a dashed line to the true heading. */
export const CompassCardArt = memo(function CompassCardArt() {
  const target = polar(R - 24, TARGET);
  const guess = polar(R - 24, GUESS);
  const north = polar(R - 20, 0);
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 220" preserveAspectRatio="xMaxYMid slice">
      <Defs>
        <RadialGradient id="glow" cx={CX} cy={CY} r={260} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#fff" stopOpacity={0.22} />
          <Stop offset="0.5" stopColor="#fff" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#fff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={400} height={220} fill="url(#glow)" />
      {[R + 118, R + 88, R + 58, R + 28].map((r, i) => (
        <Circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#fff" strokeOpacity={0.07 + i * 0.03} strokeWidth={1} />
      ))}
      <Circle cx={CX} cy={CY} r={R} fill="#fff" fillOpacity={0.1} stroke="#fff" strokeOpacity={0.24} strokeWidth={1} />
      <Circle cx={CX} cy={CY} r={R - 15} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={1} />
      <G stroke="#fff" strokeLinecap="round">
        {TICKS.map((t) => (
          <Line key={t.deg} x1={t.a.x} y1={t.a.y} x2={t.b.x} y2={t.b.y} strokeOpacity={t.major ? 0.75 : 0.32} strokeWidth={t.major ? 1.8 : 1} />
        ))}
      </G>
      <Text x={north.x} y={north.y + 4} fill="#fff" fillOpacity={0.8} fontSize={11} fontWeight="700" textAnchor="middle">
        N
      </Text>
      <Line x1={CX} y1={CY} x2={target.x} y2={target.y} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.6} strokeDasharray="4.5 4" strokeLinecap="round" />
      <Circle cx={target.x} cy={target.y} r={18} fill="#fff" fillOpacity={0.12} />
      <Circle cx={target.x} cy={target.y} r={11} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={1.2} />
      <Circle cx={target.x} cy={target.y} r={5} fill="#fff" stroke={color.primaryDeep} strokeWidth={2.4} />
      <Line x1={CX} y1={CY} x2={guess.x} y2={guess.y} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      <Circle cx={guess.x} cy={guess.y} r={4.5} fill={color.primary} stroke="#fff" strokeWidth={2} />
      <Circle cx={CX} cy={CY} r={6.5} fill="#fff" />
    </Svg>
  );
});
