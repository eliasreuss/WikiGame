import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { color, font, spring, type } from '../../theme/tokens';
import { headingLabel } from './geo';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  size: number;
  /** Unwrapped needle target in degrees; may exceed 360 so the needle never spins the long way. */
  heading: SharedValue<number>;
  /** Unwrapped truth needle rotation, animated by the parent during reveal. */
  truth: SharedValue<number>;
  /** 0 while guessing, 1 once the answer is shown. */
  reveal: SharedValue<number>;
  locked: boolean;
  bandColor: string;
  onFirstMove?: () => void;
  onHeadingChange?: (deg: number) => void;
};

function tick(major: boolean) {
  if (Platform.OS === 'web') return;
  if (major) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  else Haptics.selectionAsync();
}

export function CompassDial({ size, heading, truth, reveal, locked, bandColor, onFirstMove, onHeadingChange }: Props) {
  const reduced = useReducedMotion();
  const c = size / 2;
  const ringR = c - 10;

  const aim = (x: number, y: number) => {
    'worklet';
    const dx = x - c;
    const dy = y - c;
    if (dx * dx + dy * dy < 14 * 14) return;
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const current = heading.value;
    const norm = ((current % 360) + 360) % 360;
    let delta = ((deg - norm + 540) % 360) - 180;
    if (delta === -180) delta = 180;
    heading.value = current + delta;
  };

  const pan = usePanGesture({
    minDistance: 0,
    enabled: !locked,
    activeCursor: 'grabbing',
    onBegin: (e) => {
      'worklet';
      aim(e.x, e.y);
    },
    onUpdate: (e) => {
      'worklet';
      aim(e.x, e.y);
    },
  });

  // Haptic ticks every 15°, stronger on the cardinal points.
  useAnimatedReaction(
    () => Math.round(heading.value / 15),
    (step, prev) => {
      if (prev === null || step === prev) return;
      scheduleOnRN(tick, (((step % 6) + 6) % 6) === 0);
    },
  );

  const [deg, setDeg] = useState(0);
  const [moved, setMoved] = useState(false);
  useAnimatedReaction(
    () => Math.round(((heading.value % 360) + 360) % 360) % 360,
    (d, prev) => {
      if (prev === null || d === prev) return;
      scheduleOnRN(setDeg, d);
      scheduleOnRN(setMoved, true);
      if (onFirstMove) scheduleOnRN(onFirstMove);
      if (onHeadingChange) scheduleOnRN(onHeadingChange, d);
    },
  );

  const needle = useSharedValue(heading.value);
  useAnimatedReaction(
    () => heading.value,
    (h) => {
      needle.value = reduced ? h : withSpring(h, spring.needle);
    },
  );

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needle.value}deg` }],
  }));

  const truthStyle = useAnimatedStyle(() => ({
    opacity: withTiming(reveal.value > 0 ? 1 : 0, { duration: 180 }),
    transform: [{ rotate: `${truth.value}deg` }],
  }));

  // Filled wedge between the guess and the (sweeping) true needle.
  const wedgeProps = useAnimatedProps(() => {
    const r = ringR - 24;
    const a0 = heading.value;
    const a1 = truth.value;
    const span = a1 - a0;
    const toXY = (a: number) => {
      const rad = (a * Math.PI) / 180;
      return `${(c + r * Math.sin(rad)).toFixed(2)} ${(c - r * Math.cos(rad)).toFixed(2)}`;
    };
    const large = Math.abs(span) > 180 ? 1 : 0;
    const sweep = span >= 0 ? 1 : 0;
    const d = reveal.value > 0 && Math.abs(span) > 0.2 ? `M${c} ${c} L${toXY(a0)} A${r} ${r} 0 ${large} ${sweep} ${toXY(a1)} Z` : `M${c} ${c}`;
    return { d };
  });

  const ticks = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; w: number; o: number }[] = [];
    for (let a = 0; a < 360; a += 5) {
      const major = a % 90 === 0;
      const mid = a % 30 === 0;
      const len = major ? 12 : mid ? 9 : 6;
      const rad = (a * Math.PI) / 180;
      const r1 = ringR - 6;
      const r2 = r1 - len;
      out.push({
        x1: c + r1 * Math.sin(rad),
        y1: c - r1 * Math.cos(rad),
        x2: c + r2 * Math.sin(rad),
        y2: c - r2 * Math.cos(rad),
        w: major ? 2 : 1.25,
        o: major ? 1 : mid ? 0.4 : 0.18,
      });
    }
    return out;
  }, [c, ringR]);

  const labelR = ringR - 40;
  const cardinals = [
    { t: 'N', a: 0 },
    { t: 'E', a: 90 },
    { t: 'S', a: 180 },
    { t: 'W', a: 270 },
  ];
  const needleLen = labelR - 22;

  return (
    <View style={{ alignItems: 'center' }}>
      <GestureDetector gesture={pan}>
        <View
          style={[{ width: size, height: size }, Platform.OS === 'web' && ({ touchAction: 'none', userSelect: 'none', cursor: locked ? 'default' : 'grab' } as object)]}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Compass needle"
          accessibilityHint="Drag around the dial, or swipe up and down, to aim"
          accessibilityValue={{ text: `${deg} degrees, ${headingLabel(deg)}` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            if (locked) return;
            heading.value = heading.value + (e.nativeEvent.actionName === 'increment' ? 5 : -5);
          }}
        >
          <View style={[StyleSheet.absoluteFill, styles.face, { borderRadius: c }]} />
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Circle cx={c} cy={c} r={ringR - 26} fill={color.paper} />
            {ticks.map((t, i) => (
              <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={color.ink} strokeOpacity={t.o} strokeWidth={t.w} strokeLinecap="round" />
            ))}
            {cardinals.map(({ t, a }) => {
              const rad = (a * Math.PI) / 180;
              return (
                <SvgText
                  key={t}
                  x={c + labelR * Math.sin(rad)}
                  y={c - labelR * Math.cos(rad) + 5}
                  fontSize={15}
                  fontFamily={font.sansSemi}
                  fontWeight="600"
                  textAnchor="middle"
                  fill={t === 'N' ? color.ink : color.inkMuted}
                >
                  {t}
                </SvgText>
              );
            })}
            <AnimatedPath animatedProps={wedgeProps} fill={bandColor} fillOpacity={0.16} />
          </Svg>

          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, truthStyle]}>
            <Svg width={size} height={size}>
              <Line x1={c} y1={c} x2={c} y2={c - needleLen} stroke={bandColor} strokeWidth={3} strokeLinecap="round" />
              <Circle cx={c} cy={c - needleLen} r={7} fill={bandColor} />
            </Svg>
          </Animated.View>

          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, needleStyle]}>
            <Svg width={size} height={size}>
              <Line x1={c} y1={c} x2={c} y2={c - needleLen} stroke={color.ink} strokeWidth={5} strokeLinecap="round" />
            </Svg>
          </Animated.View>

          <View pointerEvents="none" style={[styles.hub, { left: c - 15, top: c - 15 }]}>
            <View style={styles.hubInner} />
          </View>
        </View>
      </GestureDetector>

      <View style={styles.readout} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={[styles.readoutLabel, !moved && styles.readoutIdle]}>{moved ? headingLabel(deg) : 'Drag anywhere on the dial'}</Text>
        {moved ? <Text style={styles.readoutDeg}>{deg}°</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.border },
  hub: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  hubInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.surface },
  readout: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 18, minHeight: 32 },
  readoutLabel: { ...type.meta, fontFamily: font.sansSemi, letterSpacing: 0.6, color: color.inkSubtle },
  readoutIdle: { ...type.body, letterSpacing: 0, color: color.inkSubtle },
  readoutDeg: type.figure,
});
