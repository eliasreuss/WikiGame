import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, lift, radius, spring, type } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

const META: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Today', icon: 'today' },
  friends: { label: 'Friends', icon: 'friends' },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const width = useSharedValue(0);
  const x = useSharedValue(0);
  const count = state.routes.length;

  useEffect(() => {
    x.value = withSpring(state.index, spring.snappy);
  }, [state.index, x]);

  const indicator = useAnimatedStyle(() => {
    const w = (width.value - 12) / count;
    return { width: w, transform: [{ translateX: x.value * w }] };
  });

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={[styles.bar, lift]} onLayout={(e: LayoutChangeEvent) => (width.value = e.nativeEvent.layout.width)} accessibilityRole="tablist">
        <Animated.View style={[styles.indicator, indicator]} />
        {state.routes.map((route, i) => {
          const meta = META[route.name] ?? { label: route.name, icon: 'today' };
          const focused = state.index === i;
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              style={styles.tab}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
            >
              <Icon name={meta.icon} size={20} color={focused ? '#fff' : color.inkSubtle} />
              <Text style={[type.label, { color: focused ? '#fff' : color.inkSubtle }]}>{meta.label}</Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', backgroundColor: color.surface, borderRadius: radius.pill, padding: 6, width: 248, borderWidth: 1, borderColor: color.border },
  indicator: { position: 'absolute', top: 6, bottom: 6, left: 6, borderRadius: radius.pill, backgroundColor: color.ink },
  tab: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.pill },
});
