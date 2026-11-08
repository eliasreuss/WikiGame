import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import { StarMark } from '../../components/StarMark';

const COUNT = 12;

function Particle({ i, progress, color }: { i: number; progress: SharedValue<number>; color: string }) {
  const angle = (i / COUNT) * Math.PI * 2 + (i % 2) * 0.26;
  const dist = 74 + (i % 3) * 24;
  const isStar = i % 3 === 0;
  const size = isStar ? 14 : 5 + (i % 2) * 3;
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: interpolate(p, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
      transform: [{ translateX: Math.cos(angle) * dist * p }, { translateY: Math.sin(angle) * dist * p * 0.7 }, { scale: interpolate(p, [0, 0.3, 1], [0.3, 1, 0.7]) }],
    };
  });
  return (
    <Animated.View style={[styles.particle, style]}>
      {isStar ? <StarMark size={size} color={color} /> : <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />}
    </Animated.View>
  );
}

/** A ring of dots and stars that drifts out from behind a great score. */
export function StarBurst({ play, color, delay = 600 }: { play: boolean; color: string; delay?: number }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    if (play && !reduced) progress.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [play, reduced, delay, progress]);

  if (!play || reduced) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {Array.from({ length: COUNT }, (_, i) => (
        <Particle key={i} i={i} progress={progress} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
});
