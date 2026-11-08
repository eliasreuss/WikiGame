import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Flag } from '../../components/FlagChip';
import type { OriginItem, OriginPlace } from '../../data/origins';
import { color, font, radius, space, spring, type } from '../../theme/tokens';
import { ScoreCounter } from '../compass/ScoreCounter';
import { StarBurst } from '../compass/StarBurst';
import { WikiCard } from '../compass/WikiCard';
import { alsoListed } from './rounds';
import { formatKm, type OriginBand } from './scoring';

type Props = {
  visible: boolean;
  height: number;
  item: OriginItem;
  place: OriginPlace;
  /** The modern country the place falls in, which can differ from the place (England, the Ottoman Empire). */
  countryName: string;
  km: number;
  score: number;
  band: OriginBand;
  isLast: boolean;
  onNext: () => void;
};

export function RevealSheet({ visible, height, item, place, countryName, km, score, band, isLast, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const y = useSharedValue(height);
  const others = alsoListed(item, place);
  const inside = km <= 0;
  const today = countryName && countryName !== place.name ? `Today part of ${countryName}` : null;

  useEffect(() => {
    if (visible) y.value = reduced ? 0 : withDelay(220, withSpring(0, spring.gentle));
    else y.value = reduced ? height : withTiming(height, { duration: 220 });
  }, [visible, height, reduced, y]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View style={[styles.sheet, { height }, sheetStyle]} pointerEvents={visible ? 'auto' : 'none'} accessibilityViewIsModal={visible} aria-hidden={!visible}>
      <View style={styles.grabber} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreBlock} accessibilityLiveRegion="polite">
          <StarBurst play={visible && score >= 900} color={band.color} />
          <View style={[styles.bandPill, { backgroundColor: band.tint }]}>
            <Text style={[styles.bandText, { color: band.text }]}>{band.title}</Text>
          </View>
          <View style={styles.scoreRow}>
            {visible ? <ScoreCounter value={score} delay={420} style={type.score} /> : <Text style={type.score}>0</Text>}
            <Text style={styles.points}>points</Text>
          </View>
          <Text style={styles.km}>{inside ? 'Your pin is inside the country' : `${formatKm(km)} from the border`}</Text>
        </View>

        <View
          style={styles.answer}
          accessible
          accessibilityLabel={`${item.name} comes from ${place.name}. ${inside ? 'Your pin was inside it.' : `Your pin was ${formatKm(km)} from its border.`}`}
        >
          {place.iso2 ? <Flag iso2={place.iso2} size={28} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={type.name}>{place.name}</Text>
            {today ? <Text style={styles.also}>{today}</Text> : null}
            {others.length ? <Text style={styles.also}>Wikidata also lists {others.map((p) => p.name).join(' and ')}</Text> : null}
          </View>
        </View>

        {visible ? <WikiCard title={item.wikiTitle} /> : <View style={styles.placeholder} />}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label={isLast ? "See today's results" : 'Next round'} icon="arrowRight" onPress={onNext} />
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
  km: { ...type.meta, fontVariant: ['tabular-nums'] },
  answer: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border, padding: 16 },
  also: { ...type.meta, marginTop: 2 },
  placeholder: { height: 168, borderRadius: radius.lg, backgroundColor: color.surfaceSunken },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.xl, paddingTop: space.md, backgroundColor: color.paper, borderTopWidth: 1, borderTopColor: color.border },
});
