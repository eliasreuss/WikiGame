import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import type { Country } from '../../data/countries';
import { color, font, radius, space, spring, type } from '../../theme/tokens';
import { DotMap } from './DotMap';
import { angleDiff, headingLabel, wholeDeg } from './geo';
import { ScoreCounter } from './ScoreCounter';
import type { Band } from './scoring';
import { StarBurst } from './StarBurst';
import { WikiCard } from './WikiCard';

type Props = {
  visible: boolean;
  height: number;
  from: Country;
  to: Country;
  guess: number;
  truth: number;
  score: number;
  band: Band;
  isLast: boolean;
  onNext: () => void;
};

export function RevealSheet({ visible, height, from, to, guess, truth, score, band, isLast, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const y = useSharedValue(height);

  useEffect(() => {
    if (visible) y.value = reduced ? 0 : withDelay(260, withSpring(0, spring.gentle));
    else y.value = reduced ? height : withTiming(height, { duration: 220 });
  }, [visible, height, reduced, y]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const off = Math.round(angleDiff(guess, truth));

  return (
    <Animated.View
      style={[styles.sheet, { height }, sheetStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityViewIsModal={visible}
      aria-hidden={!visible}
    >
      <View style={styles.grabber} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreBlock} accessibilityLiveRegion="polite">
          <StarBurst play={visible && score >= 900} color={band.color} />
          <View style={[styles.bandPill, { backgroundColor: band.tint }]}>
            <Text style={[styles.bandText, { color: band.text }]}>{band.title}</Text>
          </View>
          <View style={styles.scoreRow}>
            {visible ? <ScoreCounter value={score} delay={480} style={type.score} /> : <Text style={type.score}>0</Text>}
            <Text style={styles.points}>points</Text>
          </View>
          <Text style={styles.off}>{off === 0 ? 'Dead on' : `${off}° off`}</Text>
        </View>

        <View style={styles.chips}>
          <View style={styles.chip} accessible accessibilityLabel={`Your answer: ${wholeDeg(guess)} degrees ${headingLabel(guess)}`}>
            <Icon name="user" size={18} color={color.ink} />
            <Text style={styles.chipValue}>
              {wholeDeg(guess)}° <Text style={styles.chipPoint}>{headingLabel(guess)}</Text>
            </Text>
          </View>
          <View style={styles.chip} accessible accessibilityLabel={`Correct answer: ${wholeDeg(truth)} degrees ${headingLabel(truth)}`}>
            <Icon name="check" size={18} color={band.color} strokeWidth={2} />
            <Text style={styles.chipValue}>
              {wholeDeg(truth)}° <Text style={styles.chipPoint}>{headingLabel(truth)}</Text>
            </Text>
          </View>
        </View>

        {visible ? (
          <View accessible accessibilityLabel={`Map: ${to.name} lies ${headingLabel(truth)} of ${from.name}`}>
            <DotMap from={from} to={to} accent={band.color} delay={700} />
          </View>
        ) : (
          <View style={{ aspectRatio: 2 }} />
        )}

        {visible ? <WikiCard country={to} /> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label={isLast ? 'See today’s results' : 'Next round'} icon="arrowRight" onPress={onNext} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.border,
    overflow: 'hidden',
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.borderStrong, marginTop: 10 },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.xl },
  scoreBlock: { alignItems: 'center', gap: space.sm },
  bandPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  bandText: { ...type.meta, fontFamily: font.sansSemi },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  points: { ...type.label, color: color.inkSubtle },
  off: { ...type.meta, fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', gap: space.md },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, paddingHorizontal: 14, paddingVertical: 12 },
  chipValue: type.figure,
  chipPoint: { ...type.meta, letterSpacing: 0.4 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.xl, paddingTop: space.md, backgroundColor: color.paper, borderTopWidth: 1, borderTopColor: color.border },
});
