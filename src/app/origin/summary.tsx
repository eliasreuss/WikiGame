import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Flag } from '../../components/FlagChip';
import { Icon } from '../../components/Icon';
import { PaperBackground } from '../../components/PaperBackground';
import { PressableScale } from '../../components/PressableScale';
import { StarMark } from '../../components/StarMark';
import { ScoreCounter } from '../../games/compass/ScoreCounter';
import { StarBurst } from '../../games/compass/StarBurst';
import { ORIGIN_BY_QID } from '../../games/origin/rounds';
import { bandForKm, formatKm, MAX_ROUND_SCORE, ROUNDS_PER_GAME } from '../../games/origin/scoring';
import { shareOriginText, shareResult } from '../../lib/share';
import { isOriginComplete, originTotal, useGameStore } from '../../state/store';
import { color, radius, shadow, space, type } from '../../theme/tokens';

function verdict(total: number) {
  const avg = total / ROUNDS_PER_GAME;
  if (avg >= 950) return 'Right where it started';
  if (avg >= 750) return 'In the neighbourhood';
  if (avg >= 500) return 'Right part of the world';
  if (avg >= 250) return 'A long way off';
  return 'Somewhere else entirely';
}

export default function OriginSummary() {
  const insets = useSafeAreaInsets();
  const { originRun: run, originBest, hydrated } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!hydrated) return null;
  if (!run || !isOriginComplete(run)) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 80 }]}>
        <Text style={type.title}>No results yet</Text>
        <Button label="Play Origin" icon="arrowRight" onPress={() => router.replace('/origin')} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  const total = originTotal(run);
  const max = MAX_ROUND_SCORE * ROUNDS_PER_GAME;
  const isBest = total >= originBest;

  const onShare = async () => {
    const result = await shareResult(shareOriginText(run));
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PaperBackground />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <PressableScale style={styles.close} onPress={() => router.dismissTo('/')} accessibilityLabel="Back to today" hitSlop={8}>
          <Icon name="close" size={20} />
        </PressableScale>

        <Animated.View entering={FadeInDown.springify().damping(16)} style={[styles.card, shadow]}>
          <StarBurst play={total >= 4000} color={color.primary} delay={900} />
          <Text style={styles.verdict}>{verdict(total)}</Text>
          <View style={styles.totalRow} accessibilityLabel={`${total} out of ${max} points`}>
            <ScoreCounter value={total} delay={300} duration={1100} style={type.score} />
            <Text style={styles.outOf}>/{max.toLocaleString('en-US')}</Text>
          </View>
          <View style={styles.badges} accessibilityLabel="Round results">
            {run.rounds.map((r, i) => {
              const band = bandForKm(r.km);
              return (
                <Animated.View key={i} entering={ZoomIn.delay(500 + i * 90).springify().damping(12)} style={[styles.badge, { backgroundColor: band.color }]}>
                  <StarMark size={18} color={band.on} />
                </Animated.View>
              );
            })}
          </View>
          <Text style={styles.best}>{isBest ? 'Your best game yet' : `Your best: ${originBest.toLocaleString('en-US')}`}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)} style={{ gap: 10 }}>
          <Button label="Play again" icon="replay" onPress={() => router.replace('/origin')} />
          <Button label={copied ? 'Copied to clipboard' : 'Share result'} icon={copied ? 'check' : 'share'} variant="secondary" onPress={onShare} />
          {copied ? (
            <Animated.Text entering={FadeIn} style={styles.copied} accessibilityLiveRegion="polite">
              Paste it in your group chat
            </Animated.Text>
          ) : null}
        </Animated.View>

        <View style={styles.list} accessibilityLabel="Your rounds">
          {run.rounds.map((r, i) => {
            const item = ORIGIN_BY_QID.get(r.itemQid);
            const place = item?.places.find((p) => p.qid === r.originQid) ?? item?.places[0];
            const band = bandForKm(r.km);
            const where = r.km <= 0 ? 'Right country' : `${formatKm(r.km)} off`;
            return (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(300 + i * 60).springify().damping(18)}
                style={[styles.roundRow, i > 0 && styles.roundBorder]}
                accessible
                accessibilityLabel={`${item?.name ?? 'Round'}: ${place?.name ?? ''}, ${where}, ${r.score} points`}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={type.label} numberOfLines={1}>
                    {item?.name}
                  </Text>
                  <View style={styles.place}>
                    {place?.iso2 ? <Flag iso2={place.iso2} size={13} /> : null}
                    <Text style={styles.placeText} numberOfLines={1}>
                      {place?.name} · {where}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.roundScore, { color: band.text }]}>{r.score}</Text>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, gap: space.xl },
  empty: { flex: 1, alignItems: 'center', gap: 20, paddingHorizontal: space.xl },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: color.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: color.border, alignItems: 'center', paddingTop: 28, paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  verdict: type.support,
  totalRow: { flexDirection: 'row', alignItems: 'baseline' },
  outOf: { ...type.support, color: color.inkMuted, fontVariant: ['tabular-nums'] },
  badges: { flexDirection: 'row', gap: 8, marginTop: 4 },
  badge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  best: { ...type.meta, marginTop: 4 },
  copied: { ...type.meta, textAlign: 'center', color: color.successInk },
  list: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border },
  roundRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  roundBorder: { borderTopWidth: 1, borderTopColor: color.border },
  place: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  placeText: { ...type.meta, flexShrink: 1 },
  roundScore: type.data,
});
