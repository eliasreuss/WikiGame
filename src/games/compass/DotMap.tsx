import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import type { Country } from '../../data/countries';
import { LANDMASK } from '../../data/landmask';
import { color } from '../../theme/tokens';
import { mercY, shortLonDelta } from './geo';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CELL = 10;
const W = LANDMASK.cols * CELL;
const H = LANDMASK.rows * CELL;
const Y_TOP = mercY(LANDMASK.latMax);
const Y_SCALE = H / (Y_TOP - mercY(LANDMASK.latMin));

function dotsPath(land: boolean) {
  const r = land ? 3.1 : 1.3;
  let d = '';
  LANDMASK.lines.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if ((line[col] === '1') !== land) continue;
      if (!land && (row + col) % 2) continue;
      const cx = col * CELL + CELL / 2;
      const cy = row * CELL + CELL / 2;
      d += `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    }
  });
  return d;
}

const LAND = dotsPath(true);
const SEA = dotsPath(false);

const project = (lat: number, lon: number) => ({
  x: ((lon + 180) / 360) * W,
  y: Math.min(H - 4, Math.max(4, (Y_TOP - mercY(Math.max(-80, Math.min(84, lat)))) * Y_SCALE)),
});

/** Dot-matrix Mercator map: the rhumb line is a straight line here. */
export function DotMap({ from, to, accent, delay = 500 }: { from: Country; to: Country; accent: string; delay?: number }) {
  const reduced = useReducedMotion();
  const draw = useSharedValue(reduced ? 1 : 0);

  const geom = useMemo(() => {
    const a = project(from.lat, from.lon);
    const bLon = from.lon + (shortLonDelta(from.lon, to.lon) * 180) / Math.PI;
    const b = { x: ((bLon + 180) / 360) * W, y: project(to.lat, to.lon).y };
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const shift = b.x > W ? -W : b.x < 0 ? W : 0;
    // Frame the view around the route so short hops are readable.
    const pad = 70;
    const minX = Math.min(a.x, b.x) - pad;
    const maxX = Math.max(a.x, b.x) + pad;
    const minY = Math.min(a.y, b.y) - pad;
    const maxY = Math.max(a.y, b.y) + pad;
    let vw = Math.max(maxX - minX, 360);
    let vh = vw * 0.5;
    if (maxY - minY > vh) {
      vh = maxY - minY;
      vw = vh * 2;
    }
    vw = Math.min(vw, W);
    vh = Math.min(vh, H);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const vx = shift ? 0 : Math.max(0, Math.min(W - vw, cx - vw / 2));
    const vy = Math.max(0, Math.min(H - vh, cy - vh / 2));
    return { a, b, len, shift, viewBox: shift ? `0 0 ${W} ${H}` : `${vx} ${vy} ${vw} ${vh}`, zoom: shift ? 1 : W / vw };
  }, [from, to]);

  useEffect(() => {
    if (reduced) return;
    draw.value = 0;
    draw.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }));
  }, [geom, delay, reduced, draw]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: geom.len * (1 - draw.value) }));
  const s = 1 / Math.sqrt(geom.zoom);
  const segment = `M${geom.a.x} ${geom.a.y}L${geom.b.x} ${geom.b.y}`;

  return (
    <View
      style={{ width: '100%', aspectRatio: 2, borderRadius: 16, overflow: 'hidden', backgroundColor: color.surface }}
      accessible
      accessibilityLabel={`Map showing the straight-line heading from ${from.name} to ${to.name}`}
    >
      <Svg width="100%" height="100%" viewBox={geom.viewBox} preserveAspectRatio="xMidYMid slice">
        <Path d={SEA} fill={color.borderStrong} fillOpacity={0.3} />
        <Path d={LAND} fill={color.inkSubtle} fillOpacity={0.42} />
        {[0, geom.shift].filter((v, i) => i === 0 || v !== 0).map((dx) => (
          <G key={dx} transform={`translate(${dx} 0)`}>
            <AnimatedPath
              d={segment}
              stroke={accent}
              strokeWidth={4 * s * 1.6}
              strokeLinecap="round"
              strokeDasharray={`${geom.len} ${geom.len}`}
              animatedProps={lineProps}
              fill="none"
            />
            <Circle cx={geom.b.x} cy={geom.b.y} r={9 * s * 1.6} fill={accent} stroke="#fff" strokeWidth={3 * s * 1.6} />
          </G>
        ))}
        <Circle cx={geom.a.x} cy={geom.a.y} r={9 * s * 1.6} fill={color.ink} stroke="#fff" strokeWidth={3 * s * 1.6} />
      </Svg>
    </View>
  );
}
