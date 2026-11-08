import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FRIENDS, friendDay } from '../data/friends';
import { dayTotal, isComplete, type DayResult } from '../state/store';
import { color, font, radius, space, type } from '../theme/tokens';
import { Icon } from './Icon';

export type Row = { id: string; name: string; initials: string; total: number; isYou?: boolean };

export function buildBoard(today: string, you: { name: string; day?: DayResult }): Row[] {
  const rows: Row[] = FRIENDS.map((f) => friendDay(f, today))
    .filter((r) => r.played)
    .map((r) => ({ id: r.friend.id, name: r.friend.name, initials: r.friend.initials, total: r.total }));
  if (isComplete(you.day)) {
    rows.push({ id: 'you', name: you.name, initials: you.name.slice(0, 2).toUpperCase(), total: dayTotal(you.day), isYou: true });
  }
  return rows.sort((a, b) => b.total - a.total);
}

const BOARD_TITLE = "Today's leaderboard";

// Soft fill with a deep initial from the same hue. Blue stays reserved for you.
const AVATAR_TONES = [
  { bg: '#FCE3D6', fg: '#9A3B12' },
  { bg: '#DDF0E4', fg: '#1F6B45' },
  { bg: '#EDE3F8', fg: '#5B3A8C' },
  { bg: '#FBEFC8', fg: '#7A5A00' },
  { bg: '#FADDE6', fg: '#962F55' },
  { bg: '#D9EFF2', fg: '#1C6470' },
];

function toneFor(key: string) {
  const friend = FRIENDS.findIndex((f) => f.name === key);
  if (friend >= 0) return AVATAR_TONES[friend % AVATAR_TONES.length];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function Avatar({ name, initials, isYou, size, leader }: { name: string; initials: string; isYou?: boolean; size: number; leader?: boolean }) {
  const tone = isYou ? { bg: color.primary, fg: '#fff' } : toneFor(name);
  const badge = Math.max(20, Math.round(size * 0.46));
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.avatarBase,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg },
          leader && { borderWidth: 2, borderColor: tone.fg },
        ]}
      >
        <Text style={{ fontFamily: font.serifBold, fontSize: Math.round(size * 0.42), lineHeight: Math.round(size * 0.52), color: tone.fg }}>{initials[0]}</Text>
      </View>
      {leader ? (
        <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2 }]}>
          <Icon name="trophy" size={Math.round(badge * 0.55)} color="#fff" strokeWidth={2} />
        </View>
      ) : null}
    </View>
  );
}

/** The board's heading, then the leader: avatar and name on the left, score on the right. `compact` is the Today-screen row. */
export function BoardMasthead({
  name,
  initials,
  total,
  isYou,
  compact,
  ruled,
  trailing,
}: {
  name: string;
  initials: string;
  total: number;
  isYou?: boolean;
  compact?: boolean;
  ruled?: boolean;
  trailing?: ReactNode;
}) {
  const who = isYou ? `${name} (you)` : name;
  const score = total.toLocaleString('en-US');
  const identity = (
    <View style={styles.identity}>
      <Avatar name={name} initials={initials} isYou={isYou} size={compact ? 42 : 52} leader />
      <Text style={compact ? styles.compactName : styles.lead} numberOfLines={1}>
        {who}
      </Text>
    </View>
  );

  if (compact) {
    return (
      <View style={styles.compact}>
        <View style={[styles.titleRow, styles.titleRowCompact]}>
          <Icon name="trophy" size={18} color={color.primary} strokeWidth={2} />
          <Text style={styles.compactTitle} numberOfLines={1}>
            {BOARD_TITLE}
          </Text>
        </View>
        <View style={[styles.leaderRow, styles.leaderRowCompact]}>
          {identity}
          <Text style={styles.compactScore}>{score}</Text>
          {trailing}
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.masthead, isYou && styles.mastheadYou]} accessible accessibilityRole="header" accessibilityLabel={`${BOARD_TITLE}. 1. ${who}, ${score} points`}>
        <View style={styles.titleRow}>
          <Icon name="trophy" size={20} color={color.primary} strokeWidth={2} />
          <Text style={type.name}>{BOARD_TITLE}</Text>
        </View>
        <View style={styles.leaderRow}>
          <Text style={[styles.rank, styles.rankFirst]}>1</Text>
          {identity}
          <Text style={styles.score}>{score}</Text>
        </View>
        {ruled ? <View style={styles.rule} /> : null}
      </View>
    </View>
  );
}

export function LeaderRow({ row, rank, index = 0 }: { row: Row; rank: number; index?: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(50 * index).springify().damping(18)}
      style={[styles.row, row.isYou && styles.you]}
      accessible
      accessibilityLabel={`${rank}. ${row.isYou ? 'You' : row.name}, ${row.total} points`}
    >
      <Text style={[styles.rank, rank === 1 && styles.rankFirst]}>{rank}</Text>
      <Avatar name={row.name} initials={row.initials} isYou={row.isYou} size={40} />
      <Text style={[type.label, styles.name]} numberOfLines={1}>
        {row.isYou ? `${row.name} (you)` : row.name}
      </Text>
      <Text style={type.data}>{row.total.toLocaleString('en-US')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  masthead: { marginHorizontal: -8, marginTop: -8, paddingHorizontal: 24, paddingTop: 20 },
  mastheadYou: { backgroundColor: color.primaryTint },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  titleRowCompact: { marginBottom: 0 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  leaderRowCompact: { marginBottom: 0 },
  identity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatarBase: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -5, bottom: -4, alignItems: 'center', justifyContent: 'center', backgroundColor: color.primary, borderWidth: 2, borderColor: color.surface },
  lead: { flex: 1, fontFamily: font.serifBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: color.ink },
  score: { ...type.figure },
  rule: { height: 1, backgroundColor: color.border, marginHorizontal: -24 },
  compact: { flex: 1, gap: space.sm },
  compactTitle: { flex: 1, fontFamily: font.serifBold, fontSize: 16, lineHeight: 22, color: color.ink },
  compactName: { flex: 1, fontFamily: font.serifBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3, color: color.ink },
  compactScore: { fontFamily: font.serifBold, fontSize: 20, lineHeight: 26, color: color.ink, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md },
  you: { backgroundColor: color.primaryTint },
  rank: { ...type.data, width: 22, textAlign: 'center', fontFamily: font.serif, color: color.inkMuted },
  rankFirst: { color: color.ink },
  name: { flex: 1 },
});
