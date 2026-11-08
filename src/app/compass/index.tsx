import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Flag } from '../../components/FlagChip';
import { Icon } from '../../components/Icon';
import { PaperBackground } from '../../components/PaperBackground';
import { PressableScale } from '../../components/PressableScale';
import { CompassDial } from '../../games/compass/CompassDial';
import { dailyRounds, dateKey, roundsFromPairs } from '../../games/compass/daily';
import { normalizeDeg } from '../../games/compass/geo';
import { RevealSheet } from '../../games/compass/RevealSheet';
import { bandFor, ROUNDS_PER_DAY, scoreFor } from '../../games/compass/scoring';
import { useGameStore } from '../../state/store';
import { color, MAX_WIDTH, radius, space, spring, type } from '../../theme/tokens';

type Phase = 'guess' | 'reveal';
type Result = { guess: number; truth: number; score: number };

export default function CompassGame() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { width: winW, height: winH } = useWindowDimensions();
  const width = Math.min(winW, MAX_WIDTH);

  const today = useMemo(() => dateKey(), []);
  const hydrated = useGameStore((s) => s.hydrated);
  const pairs = useGameStore((s) => s.history[today]?.pairs);
  const played = useGameStore((s) => s.history[today]?.rounds.length ?? 0);
  const recordRound = useGameStore((s) => s.recordRound);
  const ensureCompassDeal = useGameStore((s) => s.ensureCompassDeal);
  const rounds = useMemo(() => {
    const dealt = pairs ? roundsFromPairs(pairs) : [];
    return dealt.length === ROUNDS_PER_DAY ? dealt : dailyRounds(today);
  }, [pairs, today]);

  useEffect(() => {
    if (hydrated) ensureCompassDeal(today);
  }, [hydrated, today, ensureCompassDeal]);

  const [index, setIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('guess');
  const [moved, setMoved] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!hydrated || index !== null) return;
    if (played >= ROUNDS_PER_DAY) router.replace('/compass/summary');
    else setIndex(played);
  }, [hydrated, played, index]);

  const heading = useSharedValue(0);
  const truth = useSharedValue(0);
  const reveal = useSharedValue(0);

  const [screenH, setScreenH] = useState(winH);
  const [dialFrame, setDialFrame] = useState({ y: 0, h: 0 });
  const headerBottom = insets.top + 64;
  const sheetH = Math.round(screenH * 0.58);
  const dialSize = Math.max(220, Math.min(width - 56, dialFrame.h - 56, 360));

  const fitScale = Math.min(1, Math.max(0.4, (screenH - sheetH - headerBottom - 20) / dialSize));
  const naturalCenter = dialFrame.y + (dialFrame.h - 48) / 2;
  const targetCenter = headerBottom + (screenH - sheetH - headerBottom) / 2;
  const shiftY = targetCenter - naturalCenter;

  const dialWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [0, shiftY]) }, { scale: interpolate(reveal.value, [0, 1], [1, fitScale]) }],
  }));
  const routeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.6], [1, 0]),
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [0, -16]) }],
  }));

  const round = index !== null ? rounds[index] : null;

  const lockIn = useCallback(() => {
    if (!round || phase !== 'guess' || !moved || index === null) return;
    const guess = Math.round(normalizeDeg(heading.value)) % 360;
    const score = scoreFor(guess, round.bearing);
    const band = bandFor(score);
    setResult({ guess, truth: round.bearing, score });
    setPhase('reveal');
    recordRound(today, { fromQid: round.from.qid, toQid: round.to.qid, guess, truth: round.bearing, score });

    const delta = ((round.bearing - normalizeDeg(heading.value) + 540) % 360) - 180;
    truth.value = heading.value;
    if (reduced) {
      truth.value = heading.value + delta;
      reveal.value = 1;
    } else {
      truth.value = withDelay(140, withSpring(heading.value + delta, spring.sweep));
      reveal.value = withSpring(1, spring.gentle);
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(band.key === 'lost' ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success);
    }
  }, [round, phase, moved, index, heading, truth, reveal, reduced, recordRound, today]);

  const next = useCallback(() => {
    if (index === null) return;
    if (index + 1 >= ROUNDS_PER_DAY) {
      router.replace('/compass/summary');
      return;
    }
    reveal.value = reduced ? 0 : withTiming(0, { duration: 260 });
    heading.value = 0;
    truth.value = 0;
    setMoved(false);
    setPhase('guess');
    setResult(null);
    setIndex(index + 1);
  }, [index, reveal, heading, truth, reduced]);

  const nudge = useCallback(
    (d: number) => {
      if (phase !== 'guess') return;
      heading.value = heading.value + d;
    },
    [phase, heading],
  );

  // Keyboard play on web: arrows aim (Shift for 10°), Enter locks in / continues.
  const keyRef = useRef({ lockIn, next, nudge, phase });
  keyRef.current = { lockIn, next, nudge, phase };
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const k = keyRef.current;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') k.nudge(step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') k.nudge(-step);
      else if (e.key === 'Enter') (k.phase === 'guess' ? k.lockIn : k.next)();
      else if (e.key === 'Escape') router.back();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onDialArea = (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    if (phase === 'guess') setDialFrame({ y, h: height });
  };

  if (!round || index === null) return <View style={styles.root} />;
  const band = result ? bandFor(result.score) : bandFor(1000);

  return (
    <View style={styles.root} onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}>
      <PaperBackground />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <PressableScale
          style={styles.close}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityLabel="Close game"
          hitSlop={8}
        >
          <Icon name="close" size={20} />
        </PressableScale>
        <View style={styles.pips} accessibilityLabel={`Round ${index + 1} of ${ROUNDS_PER_DAY}`}>
          {rounds.map((_, i) => (
            <Animated.View
              key={i}
              layout={LinearTransition.springify()}
              style={[styles.pip, i < index || (i === index && phase === 'reveal') ? styles.pipDone : i === index ? styles.pipActive : null]}
            />
          ))}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <Animated.View style={[styles.routeWrap, routeStyle]}>
        <Animated.View key={index} entering={reduced ? undefined : FadeInDown.springify().damping(18)} exiting={reduced ? undefined : FadeOutUp.duration(160)}>
          <Text style={styles.prompt}>Point the way</Text>
          <View style={styles.route} accessible accessibilityLabel={`From ${round.from.name} to ${round.to.name}`}>
            <View style={styles.place}>
              <View style={styles.placeRow}>
                <Flag iso2={round.from.iso2} size={20} />
                <Text style={styles.placeName} numberOfLines={2}>
                  {round.from.name}
                </Text>
              </View>
            </View>
            <View style={styles.arrow}>
              <Icon name="arrowRight" size={18} color={color.primary} strokeWidth={2} />
            </View>
            <View style={styles.place}>
              <View style={styles.placeRow}>
                <Flag iso2={round.to.iso2} size={20} />
                <Text style={styles.placeName} numberOfLines={2}>
                  {round.to.name}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <View style={styles.dialArea} onLayout={onDialArea}>
        {dialFrame.h > 0 ? (
          <Animated.View style={dialWrapStyle} entering={FadeIn.duration(300)}>
            <CompassDial
              key={index}
              size={dialSize}
              heading={heading}
              truth={truth}
              reveal={reveal}
              locked={phase !== 'guess'}
              bandColor={band.color}
              onFirstMove={() => setMoved(true)}
            />
          </Animated.View>
        ) : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label="Lock in"
          icon="check"
          onPress={lockIn}
          disabled={!moved || phase !== 'guess'}
          accessibilityHint="Submits your heading for this round"
        />
      </View>

      {result ? (
        <RevealSheet
          visible={phase === 'reveal'}
          height={sheetH}
          from={round.from}
          to={round.to}
          guess={result.guess}
          truth={result.truth}
          score={result.score}
          band={band}
          isLast={index + 1 >= ROUNDS_PER_DAY}
          onNext={next}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: 10 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  pips: { flexDirection: 'row', gap: 6 },
  pip: { width: 22, height: 6, borderRadius: 3, backgroundColor: color.border },
  pipActive: { width: 34, backgroundColor: color.primary },
  pipDone: { backgroundColor: color.ink },
  routeWrap: { paddingHorizontal: space.xl, paddingTop: space.sm },
  prompt: { ...type.title, textAlign: 'center', marginBottom: space.md },
  route: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border, padding: 6 },
  place: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, gap: 6 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeName: { ...type.label, flexShrink: 1 },
  arrow: { width: 36, height: 36, borderRadius: 18, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: color.primaryTint },
  dialArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: 10 },
});
