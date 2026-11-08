import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import type { Country } from '../../data/countries';
import { useWikiSummary } from '../../lib/wiki';
import { color, radius, type } from '../../theme/tokens';

export function WikiCard({ country, title }: { country?: Country; title?: string }) {
  const summary = useWikiSummary(title ?? country?.wikiTitle);
  if (!summary) return <View style={styles.placeholder} />;

  return (
    <Animated.View entering={FadeIn.duration(260)}>
      <PressableScale
        style={styles.card}
        pressedScale={0.985}
        accessibilityRole="link"
        accessibilityLabel={`Read about ${summary.title} on Wikipedia`}
        onPress={() => Linking.openURL(summary.url)}
      >
        <View style={styles.top}>
          {summary.thumbnail ? <Image source={{ uri: summary.thumbnail }} style={styles.thumb} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{summary.title}</Text>
            {summary.description ? <Text style={styles.desc} numberOfLines={1}>{summary.description}</Text> : null}
          </View>
        </View>
        <Text style={styles.extract} numberOfLines={3}>
          {summary.extract}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.link}>Read on Wikipedia</Text>
          <Icon name="external" size={16} color={color.primary} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  placeholder: { height: 168, borderRadius: radius.lg, backgroundColor: color.surfaceSunken },
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: 16, gap: 12, borderWidth: 1, borderColor: color.border },
  top: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: color.surfaceSunken },
  title: type.name,
  desc: type.meta,
  extract: type.body,
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { ...type.label, color: color.primary },});
