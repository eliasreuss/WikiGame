import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SourceSerif4_600SemiBold, SourceSerif4_700Bold } from '@expo-google-fonts/source-serif-4';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { color, MAX_WIDTH } from '../theme/tokens';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent', card: color.paper, text: color.ink, primary: color.primary, border: color.border },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SourceSerif4_600SemiBold,
    SourceSerif4_700Bold,
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.column}>
        {loaded ? (
          <ThemeProvider value={theme}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paper }, animation: 'slide_from_right' }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="compass/index" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="compass/summary" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="origin/index" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="origin/summary" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
            </Stack>
          </ThemeProvider>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#E9E7E1' : color.paper },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: color.paper,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 0 0 1px rgba(32,33,34,0.06), 0 24px 80px rgba(32,33,34,0.12)' } as object) : null),
  },
});
