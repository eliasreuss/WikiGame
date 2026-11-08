import { useEffect, useState } from 'react';
import { Text, type TextStyle, type StyleProp } from 'react-native';
import { Easing, useAnimatedReaction, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export function ScoreCounter({ value, delay = 0, duration = 800, style }: { value: number; delay?: number; duration?: number; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? value : 0);
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = value;
      setShown(value);
      return;
    }
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(value, { duration, easing: Easing.out(Easing.cubic) }));
  }, [value, delay, duration, reduced, progress]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (v, prev) => {
      if (v !== prev) scheduleOnRN(setShown, v);
    },
  );

  return (
    <Text style={style} accessibilityLabel={`${value}`}>
      {shown.toLocaleString('en-US')}
    </Text>
  );
}
