import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameCard } from '../../components/GameCard';
import { BoardMasthead, buildBoard } from '../../components/Leaderboard';
import { CompassCardArt } from '../../games/compass/CompassCardArt';
import { Icon } from '../../components/Icon';
import { PaperBackground } from '../../components/PaperBackground';
import { PressableScale } from '../../components/PressableScale';
import { StarMark } from '../../components/StarMark';
import { dateKey } from '../../games/compass/daily';
import { ROUNDS_PER_DAY } from '../../games/compass/scoring';
import { ORIGIN_CARD_BG, OriginCardArt } from '../../games/origin/OriginCardArt';
import { ROUNDS_PER_GAME as ORIGIN_ROUNDS } from '../../games/origin/scoring';
import { useCountdownToMidnight } from '../../lib/share';
import { currentStreak, dayTotal, isComplete, isOriginComplete, useGameStore } from '../../state/store';
import { color, font, radius, shadow, space, type } from '../../theme/tokens';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

const enter = (i: number) =>
  FadeInDown.delay(60 * i)
    .springify()
    .damping(18);

export default function Today() {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => dateKey(), []);
  const { history, originRun, originBest, playerName, replayCompass } = useGameStore();
  const day = history[today];
  const done = isComplete(day);
  const inProgress = !!day && !done;
  const originProgress = !!originRun && originRun.rounds.length > 0 && !isOriginComplete(originRun);
  const streak = currentStreak(history, today);
  const countdown = useCountdownToMidnight();

  const leader = useMemo(() => buildBoard(today, { name: playerName, day })[0], [today, playerName, day]);

  const compassMeta = (
    <View style={styles.metaRow}>
      <View style={styles.metaPill}>
        <Text style={styles.metaPillText}>
          {done ? `${dayTotal(day).toLocaleString('en-US')} pts` : inProgress ? `Round ${day.rounds.length + 1} of ${ROUNDS_PER_DAY}` : `${ROUNDS_PER_DAY} rounds · 2 min`}
        </Text>
      </View>
      <View style={styles.play}>
        {done ? (
          <Text style={styles.playText}>Results</Text>
        ) : (
          <>
            <Text style={styles.playText}>{inProgress ? 'Continue' : 'Play'}</Text>
            <Icon name="arrowRight" size={18} color={color.primaryDeep} strokeWidth={2} />
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <PaperBackground />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)} style={styles.topBar}>
          <View style={styles.brand}>
            <StarMark size={30} badge={color.primary} />
            <Text style={type.name}>WikiDaily</Text>
          </View>
          <View style={styles.streak} accessibilityLabel={`${streak} day streak`}>
            <Icon name="flame" size={18} color={color.ink} />
            <Text style={type.data}>{streak}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <Text style={type.display} accessibilityRole="header">
            {greeting()},{'\n'}
            {playerName}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(2)} style={styles.sectionHead}>
          <View style={styles.sectionTitleRow}>
            <Text style={type.name} accessibilityRole="header">
              Daily challenge
            </Text>
            <View style={styles.countdownChip} accessible accessibilityLabel={`New puzzle in ${countdown}`}>
              <Icon name="clock" size={14} color={color.inkSubtle} />
              <Text style={styles.countdown}>{countdown}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={enter(3)} style={styles.dailyGroup}>
          <GameCard
            title="Compass"
            subtitle="Point from one country to another, without a map."
            tone={{ bg: color.primary, fg: '#fff' }}
            art={<CompassCardArt />}
            meta={compassMeta}
            onPress={() => router.push(done ? '/compass/summary' : '/compass')}
            accessibilityLabel={done ? `Compass, finished with ${dayTotal(day)} points. View results` : 'Play Compass'}
          />
          {done ? (
            <PressableScale onPress={() => replayCompass(today)} accessibilityLabel="Play Compass again with new countries" hitSlop={12} style={styles.replay}>
              <Icon name="replay" size={16} color={color.inkMuted} />
            </PressableScale>
          ) : null}

          {leader ? (
            <PressableScale
              style={[styles.friends, shadow, leader.isYou && styles.friendsYou]}
              onPress={() => router.navigate('/friends')}
              accessibilityLabel={`Today's leaderboard. ${leader.isYou ? 'You lead' : `${leader.name} leads`} with ${leader.total.toLocaleString('en-US')}. Open the leaderboard`}
            >
              <BoardMasthead compact name={leader.name} initials={leader.initials} total={leader.total} isYou={leader.isYou} trailing={<Icon name="arrowRight" size={18} color={color.inkSubtle} />} />
            </PressableScale>
          ) : null}
        </Animated.View>

        <Animated.View entering={enter(4)} style={[styles.sectionHead, styles.freeHead]}>
          <Text style={type.name} accessibilityRole="header">
            Free play
          </Text>
        </Animated.View>

        <Animated.View entering={enter(5)}>
          <GameCard
            title="Origin"
            subtitle="Find the country it comes from."
            tone={{ bg: ORIGIN_CARD_BG, fg: '#fff' }}
            art={<OriginCardArt />}
            meta={
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    {originProgress ? `Round ${originRun.rounds.length + 1} of ${ORIGIN_ROUNDS}` : originBest > 0 ? `Best ${originBest.toLocaleString('en-US')}` : `${ORIGIN_ROUNDS} rounds · 2 min`}
                  </Text>
                </View>
                <View style={styles.play}>
                  <Text style={[styles.playText, { color: ORIGIN_CARD_BG }]}>{originProgress ? 'Continue' : 'Play'}</Text>
                  <Icon name="arrowRight" size={18} color={ORIGIN_CARD_BG} strokeWidth={2} />
                </View>
              </View>
            }
            onPress={() => router.push('/origin')}
            accessibilityLabel={originProgress ? 'Continue Origin' : 'Play Origin'}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, gap: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 },
  metaPill: { paddingVertical: 7 },
  metaPillText: { ...type.meta, fontFamily: font.sansSemi, color: '#fff', fontVariant: ['tabular-nums'] },
  play: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: radius.pill, height: 44, paddingHorizontal: 18 },
  playText: { ...type.label, color: color.primaryDeep },
  sectionHead: { marginBottom: -space.sm },
  freeHead: { marginTop: space.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countdownChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, height: 28, borderRadius: radius.pill, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border },
  countdown: { ...type.meta, fontFamily: font.sansSemi, fontVariant: ['tabular-nums'] },
  dailyGroup: { gap: space.md },
  replay: { alignSelf: 'flex-end', padding: 4, marginTop: -4 },
  friends: { backgroundColor: color.surface, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: color.border },
  friendsYou: { backgroundColor: color.primaryTint },
});
