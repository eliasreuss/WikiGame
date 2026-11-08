import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { BoardMasthead, buildBoard, LeaderRow } from '../../components/Leaderboard';
import { PaperBackground } from '../../components/PaperBackground';
import { dateKey } from '../../games/compass/daily';
import { shareResult } from '../../lib/share';
import { isComplete, useGameStore } from '../../state/store';
import { color, radius, shadow, space, type } from '../../theme/tokens';

export default function Friends() {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => dateKey(), []);
  const { history, playerName } = useGameStore();
  const day = history[today];
  const rows = useMemo(() => buildBoard(today, { name: playerName, day }), [today, playerName, day]);
  const [copied, setCopied] = useState(false);

  const invite = async () => {
    const result = await shareResult('Play WikiDaily with me: a daily Wikipedia game. wikidaily.app');
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PaperBackground />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <Text style={type.display} accessibilityRole="header">
            Friends
          </Text>
        </Animated.View>

        {!isComplete(day) ? (
          <Animated.View entering={FadeInDown.delay(60).springify().damping(18)} style={[styles.cta, shadow]}>
            <Text style={[type.label, { color: '#fff' }]}>Play today to join the board</Text>
            <Button label="Play Compass" icon="arrowRight" variant="secondary" onPress={() => router.push('/compass')} style={{ marginTop: 8, height: 50 }} />
          </Animated.View>
        ) : null}

        {rows[0] ? (
          <View style={[styles.board, shadow]} accessibilityLabel="Today's leaderboard">
            <BoardMasthead name={rows[0].name} initials={rows[0].initials} total={rows[0].total} isYou={rows[0].isYou} ruled={rows.length > 1} />
            {rows.slice(1).map((row, i) => (
              <LeaderRow key={row.id} row={row} rank={i + 2} index={i + 1} />
            ))}
          </View>
        ) : null}

        <View style={{ gap: 8 }}>
          <Button label="Invite friends" variant="secondary" icon="share" onPress={invite} />
          {copied ? (
            <Animated.Text entering={FadeIn} style={styles.copied} accessibilityLiveRegion="polite">
              Invite link copied
            </Animated.Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, gap: space.xl },
  cta: { backgroundColor: color.primary, borderRadius: radius.lg, padding: 20, gap: 6 },
  board: { backgroundColor: color.surface, borderRadius: radius.lg, padding: 8, borderWidth: 1, borderColor: color.border, overflow: 'hidden' },
  copied: { ...type.meta, textAlign: 'center', color: color.successInk },
});
