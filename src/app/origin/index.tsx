import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { PaperBackground } from '../../components/PaperBackground';
import { PressableScale } from '../../components/PressableScale';
import type { OriginItem } from '../../data/origins';
import type { LatLon } from '../../games/compass/geo';
import { ItemPhoto } from '../../games/origin/ItemPhoto';
import { PinMap, type PinMapHandle } from '../../games/origin/PinMap';
import { RevealSheet } from '../../games/origin/RevealSheet';
import { judge, ORIGIN_BY_QID, pickItems, type Judgement } from '../../games/origin/rounds';
import { bandForKm, ROUNDS_PER_GAME, scoreForKm } from '../../games/origin/scoring';
import { countryAt, countryName, project } from '../../games/origin/world';
import { fetchSummary } from '../../lib/wiki';
import { isOriginComplete, useGameStore } from '../../state/store';
import { color, font, lift, radius, space, type } from '../../theme/tokens';

type Phase = 'guess' | 'reveal';
type Result = Judgement & { score: number };

export default function OriginGame() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const hydrated = useGameStore((s) => s.hydrated);
  const run = useGameStore((s) => s.originRun);
  const recordOriginRound = useGameStore((s) => s.recordOriginRound);

  const [index, setIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('guess');
  const [pin, setPin] = useState<LatLon | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [screenH, setScreenH] = useState(700);
  const [barH, setBarH] = useState(130);

  const map = useRef<PinMapHandle>(null);
  const playable = !!run && !isOriginComplete(run) && run.itemQids.every((q) => ORIGIN_BY_QID.has(q));

  // Continue an unfinished game, otherwise deal a new one.
  useEffect(() => {
    if (!hydrated || index !== null) return;
    const { originRun, startOriginRun } = useGameStore.getState();
    if (!originRun || isOriginComplete(originRun) || !originRun.itemQids.every((q) => ORIGIN_BY_QID.has(q))) startOriginRun(pickItems(originRun?.itemQids));
  }, [hydrated, index]);
  if (hydrated && index === null && playable) setIndex(run.rounds.length);

  const items = useMemo(() => (run?.itemQids ?? []).map((q) => ORIGIN_BY_QID.get(q)).filter((x): x is OriginItem => !!x), [run?.itemQids]);

  useEffect(() => {
    for (const item of items) {
      fetchSummary(item.wikiTitle).then((s) => {
        for (const uri of [s?.thumbnail, s?.image]) if (uri) Image.prefetch(uri).catch(() => {});
      });
    }
  }, [items]);

  const round = index !== null ? items[index] : undefined;
  const sheetH = Math.round(screenH * 0.5);
  const barBottom = Math.max(insets.bottom, 12);
  const guessInset = barH + barBottom + 8;
  const pinCountry = useMemo(() => (pin ? countryAt(project(pin)) : -1), [pin]);

  const lockIn = useCallback(() => {
    if (!round || !pin || phase !== 'guess') return;
    const judged = judge(round, pin);
    const score = scoreForKm(judged.km);
    setResult({ ...judged, score });
    setPhase('reveal');
    map.current?.focus({ country: judged.country, point: judged.border, pin, insetBottom: sheetH });
    recordOriginRound({ itemQid: round.qid, originQid: judged.place.qid, guessLat: pin.lat, guessLon: pin.lon, km: judged.km, score });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(bandForKm(judged.km).key === 'far' ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success);
    }
  }, [round, pin, phase, recordOriginRound, sheetH]);

  const next = useCallback(() => {
    if (index === null) return;
    if (index + 1 >= ROUNDS_PER_GAME) {
      router.replace('/origin/summary');
      return;
    }
    setPin(null);
    setResult(null);
    setPhase('guess');
    setIndex(index + 1);
    map.current?.reset(guessInset);
  }, [index, guessInset]);

  const nudge = useCallback(
    (dLat: number, dLon: number) => {
      if (phase !== 'guess') return;
      setPin((current) => {
        const base = current ?? { lat: 20, lon: 10 };
        return {
          lat: Math.max(-56, Math.min(76, base.lat + dLat)),
          lon: Math.max(-180, Math.min(180, base.lon + dLon)),
        };
      });
    },
    [phase],
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowRight') nudge(0, step);
      else if (e.key === 'ArrowLeft') nudge(0, -step);
      else if (e.key === 'ArrowUp') nudge(step, 0);
      else if (e.key === 'ArrowDown') nudge(-step, 0);
      else if (e.key === 'Enter') (phase === 'guess' ? lockIn : next)();
      else if (e.key === 'Escape') router.back();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lockIn, next, nudge, phase]);

  if (!round || index === null) return <View style={styles.root} />;

  const band = bandForKm(result?.km ?? 0);
  const pinLabel = pin ? (pinCountry >= 0 ? countryName(pinCountry) : 'Open water') : null;

  return (
    <View style={styles.root} onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}>
      <PaperBackground />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <PressableScale style={styles.close} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Close game" hitSlop={8}>
          <Icon name="close" size={20} />
        </PressableScale>
        <View style={styles.pips} accessibilityLabel={`Round ${index + 1} of ${ROUNDS_PER_GAME}`}>
          {items.map((_, i) => (
            <Animated.View
              key={i}
              layout={LinearTransition.springify()}
              style={[styles.pip, i < index || (i === index && phase === 'reveal') ? styles.pipDone : i === index ? styles.pipActive : null]}
            />
          ))}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <Animated.View
        key={index}
        entering={reduced ? undefined : FadeInDown.springify().damping(18)}
        exiting={reduced ? undefined : FadeOutUp.duration(160)}
        style={styles.itemBlock}
      >
        <ItemPhoto title={round.wikiTitle} name={round.name} size={88} />
        <View style={styles.itemText}>
          <Text style={styles.name} accessibilityRole="header" numberOfLines={2}>
            {round.name}
          </Text>
          <Text style={styles.blurb} numberOfLines={3}>
            {round.blurb}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.mapArea}>
        <PinMap
          ref={map}
          pin={pin}
          pinCountry={pinCountry}
          answer={result ? { country: result.country, point: result.border, color: band.color } : null}
          locked={phase !== 'guess'}
          insetBottom={phase === 'reveal' ? sheetH : guessInset}
          onPin={setPin}
        />
      </View>

      <View style={[styles.bar, lift, { bottom: barBottom }]} onLayout={(e) => setBarH(e.nativeEvent.layout.height)}>
        <View style={styles.status} accessibilityLiveRegion="polite">
          <View style={[styles.statusDot, pin ? styles.statusDotOn : null]} />
          {pinLabel ? (
            <Text style={styles.statusText} numberOfLines={1}>
              <Text style={styles.statusMeta}>Your pin  </Text>
              {pinLabel}
            </Text>
          ) : (
            <Text style={[styles.statusText, styles.statusMuted]} numberOfLines={1}>
              Tap the map to drop a pin. Pinch to zoom.
            </Text>
          )}
        </View>
        <Button label="Lock in" icon="check" onPress={lockIn} disabled={!pin || phase !== 'guess'} accessibilityHint="Submits your pin for this round" />
      </View>

      {result ? (
        <RevealSheet
          visible={phase === 'reveal'}
          height={sheetH}
          item={round}
          place={result.place}
          countryName={countryName(result.country)}
          km={result.km}
          score={result.score}
          band={band}
          isLast={index + 1 >= ROUNDS_PER_GAME}
          onNext={next}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: 8 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, alignItems: 'center', justifyContent: 'center' },
  pips: { flexDirection: 'row', gap: 6 },
  pip: { width: 22, height: 6, borderRadius: 3, backgroundColor: color.border },
  pipActive: { width: 34, backgroundColor: color.primary },
  pipDone: { backgroundColor: color.ink },
  itemBlock: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: space.lg, paddingTop: 4, paddingBottom: space.md },
  itemText: { flex: 1, gap: 2 },
  name: type.name,
  blurb: { ...type.body, fontSize: 15, lineHeight: 21, color: color.inkSubtle },
  mapArea: { flex: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden', borderTopWidth: 1, borderColor: color.border },
  bar: { position: 'absolute', left: space.md, right: space.md, backgroundColor: color.paper, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border, padding: 10, gap: 10 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: color.borderStrong },
  statusDotOn: { backgroundColor: color.ink, borderColor: color.ink },
  statusText: { ...type.label, flex: 1 },
  statusMeta: { ...type.meta, fontFamily: font.sansMedium },
  statusMuted: { fontFamily: font.sansMedium, color: color.inkSubtle, fontSize: 15 },
});
