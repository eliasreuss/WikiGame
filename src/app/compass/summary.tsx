import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Flag } from '../../components/FlagChip';
import { Icon, type IconName } from '../../components/Icon';
import { buildBoard, LeaderRow } from '../../components/Leaderboard';
import { PaperBackground } from '../../components/PaperBackground';
import { PressableScale } from '../../components/PressableScale';
import { StarMark } from '../../components/StarMark';
import { COUNTRIES } from '../../data/countries';
import { dailyRounds, dateKey, roundsFromPairs } from '../../games/compass/daily';
import { ScoreCounter } from '../../games/compass/ScoreCounter';
import { bandFor, MAX_ROUND_SCORE, ROUNDS_PER_DAY } from '../../games/compass/scoring';
import { StarBurst } from '../../games/compass/StarBurst';
import { shareResult, shareText } from '../../lib/share';
import { currentStreak, dayTotal, isComplete, useGameStore } from '../../state/store';
import { color, radius, shadow, space, type } from '../../theme/tokens';

const byQid = new Map(COUNTRIES.map((c) => [c.qid, c]));

function verdict(total: number) {
  const avg = total / ROUNDS_PER_DAY;
  if (avg >= 950) return 'Human compass';
  if (avg >= 850) return 'Master navigator';
  if (avg >= 700) return 'Seasoned explorer';
  if (avg >= 450) return 'Curious traveller';
  return 'Happily lost';
}

function Stat({ icon, value, label, onPress }: { icon: IconName; value: string; label: string; onPress?: () => void }) {
  return (
    <PressableScale style={styles.stat} onPress={onPress} disabled={!onPress} accessibilityLabel={label} hitSlop={6}>
      <Icon name={icon} size={18} color={color.inkMuted} />
      <Text style={styles.statValue}>{value}</Text>
    </PressableScale>
  );
}

export default function Summary() {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => dateKey(), []);
  const { history, playerName, hydrated } = useGameStore();
  const day = history[today];
  const streak = currentStreak(history, today);
  const [copied, setCopied] = useState(false);
  const fallbackRounds = useMemo(() => {
    const dealt = day?.pairs ? roundsFromPairs(day.pairs) : [];
    return dealt.length === ROUNDS_PER_DAY ? dealt : dailyRounds(today);
  }, [day, today]);
  const board = useMemo(() => buildBoard(today, { name: playerName, day }), [today, playerName, day]);

  if (!hydrated) return null;
  if (!isComplete(day)) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 80 }]}>
        <Text style={type.title}>No results yet</Text>
        <Button label="Play Compass" icon="arrowRight" onPress={() => router.replace('/compass')} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  const total = dayTotal(day);
  const max = MAX_ROUND_SCORE * ROUNDS_PER_DAY;
  const rank = board.findIndex((r) => r.isYou) + 1;

  const onShare = async () => {
    const result = await shareResult(shareText(today, day!));
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const close = () => router.dismissTo('/');

  return (
    <View style={{ flex: 1 }}>
      <PaperBackground />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <PressableScale style={styles.close} onPress={close} accessibilityLabel="Back to today" hitSlop={8}>
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
            {day!.rounds.map((r, i) => {
              const band = bandFor(r.score);
              return (
                <Animated.View key={i} entering={ZoomIn.delay(500 + i * 90).springify().damping(12)} style={[styles.badge, { backgroundColor: band.color }]}>
                  <StarMark size={18} color={band.on} />
                </Animated.View>
              );
            })}
          </View>
          <View style={styles.stats}>
            <Stat icon="flame" value={String(streak)} label={`${streak} day streak`} />
            <Stat icon="trophy" value={rank ? `#${rank}` : '—'} label={`Ranked ${rank} among friends. Open leaderboard`} onPress={() => router.navigate('/friends')} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)} style={{ gap: 8 }}>
          <Button label={copied ? 'Copied to clipboard' : 'Share result'} icon={copied ? 'check' : 'share'} variant="accent" onPress={onShare} />
          {copied ? (
            <Animated.Text entering={FadeIn} style={styles.copied} accessibilityLiveRegion="polite">
              Paste it in your group chat
            </Animated.Text>
          ) : null}
        </Animated.View>

        <View style={styles.list} accessibilityLabel="Your rounds">
          {day!.rounds.map((r, i) => {
            const from = byQid.get(r.fromQid) ?? fallbackRounds[i]?.from;
            const to = byQid.get(r.toQid) ?? fallbackRounds[i]?.to;
            const band = bandFor(r.score);
            return (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(300 + i * 60).springify().damping(18)}
                style={[styles.roundRow, i > 0 && styles.roundBorder]}
                accessible
                accessibilityLabel={`${from?.name} to ${to?.name}: ${r.score} points, ${band.title}`}
              >
                <View style={styles.roundRoute}>
                  {from ? <Flag iso2={from.iso2} size={13} /> : null}
                  <Text style={styles.roundName} numberOfLines={1}>
                    {from?.name}
                  </Text>
                  <Icon name="arrowRight" size={13} color={color.inkMuted} />
                  {to ? <Flag iso2={to.iso2} size={13} /> : null}
                  <Text style={styles.roundName} numberOfLines={1}>
                    {to?.name}
                  </Text>
                </View>
                <Text style={[styles.roundScore, { color: band.text }]}>{r.score}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={{ gap: space.md }}>
          <View style={styles.sectionHead}>
            <Text style={type.label} accessibilityRole="header">
              Friends
            </Text>
            <PressableScale onPress={() => router.navigate('/friends')} hitSlop={10} accessibilityLabel="See full leaderboard">
              <Text style={styles.link}>See all</Text>
            </PressableScale>
          </View>
          <View style={[styles.list, { padding: 6 }, shadow]}>
            {board.map((row, i) => (
              <LeaderRow key={row.id} row={row} rank={i + 1} index={i} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, gap: space.xl },
  empty: { flex: 1, alignItems: 'center', gap: 20, paddingHorizontal: space.xl },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: color.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: color.border, alignItems: 'center', paddingTop: 28, paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  verdict: type.support,
  totalRow: { flexDirection: 'row', alignItems: 'baseline' },
  outOf: { ...type.support, color: color.inkMuted, fontVariant: ['tabular-nums'] },
  badges: { flexDirection: 'row', gap: 8, marginTop: 4 },
  badge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 14, paddingTop: 16, borderTopWidth: 1, borderTopColor: color.border },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  statValue: type.data,
  copied: { ...type.meta, textAlign: 'center', color: color.successInk },
  list: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border },
  roundRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  roundBorder: { borderTopWidth: 1, borderTopColor: color.border },
  roundRoute: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  roundName: { ...type.label, flexShrink: 1 },
  roundScore: type.data,
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  link: { ...type.label, color: color.primary },
});
