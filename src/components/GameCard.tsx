import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, radius, type } from '../theme/tokens';
import { PressableScale } from './PressableScale';

function withAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

type Props = {
  title: string;
  subtitle?: string;
  meta: ReactNode;
  tone: { bg: string; fg: string };
  /** Full-bleed scene; the card fades it out behind the copy on the left. */
  art: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function GameCard({ title, subtitle, meta, tone, art, onPress, accessibilityLabel }: Props) {
  return (
    <PressableScale onPress={onPress} pressedScale={0.975} accessibilityLabel={accessibilityLabel} style={[styles.card, { backgroundColor: tone.bg }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {art}
        <LinearGradient
          colors={[tone.bg, withAlpha(tone.bg, 0.9), withAlpha(tone.bg, 0)]}
          locations={[0, 0.42, 0.72]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.copy}>
          <Text style={[type.title, { color: tone.fg }]}>{title}</Text>
          {subtitle ? (
            <Text style={[type.body, styles.subtitle, { color: tone.fg }]} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {meta}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', padding: 20, minHeight: 200 },
  copy: { gap: 4, paddingRight: 110 },
  subtitle: { fontFamily: font.sansMedium, letterSpacing: 0.15 },
});
