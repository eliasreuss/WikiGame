import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { flagUrl } from '../lib/wiki';
import { color, font } from '../theme/tokens';

export function Flag({ iso2, size = 22 }: { iso2: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const w = Math.round(size * 1.4);
  if (failed) {
    return (
      <View style={[styles.fallback, { width: w, height: size }]}>
        <Text style={styles.fallbackText}>{iso2.toUpperCase()}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: flagUrl(iso2, size > 30 ? 160 : 80) }}
      onError={() => setFailed(true)}
      style={[styles.flag, { width: w, height: size }]}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  flag: { borderRadius: 4, backgroundColor: color.surfaceSunken, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.12)' },
  fallback: { borderRadius: 4, backgroundColor: color.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontFamily: font.sansSemi, fontSize: 10, color: color.inkSubtle },
});
