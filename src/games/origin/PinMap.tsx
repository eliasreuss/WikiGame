import { memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentRef, type Ref } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, useCompetingGestures, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G, Line, Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { WORLD } from '../../data/worldmap';
import { color, lift } from '../../theme/tokens';
import type { LatLon } from '../compass/geo';
import { countryPath, landmassBounds, MAP_H, MAP_W, project, unproject, type MapPoint } from './world';

/** Extra map rendered around the viewport, so panning and pinching out don't show blank edges before the re-render. */
const OVERSCAN = 0.5;
const MIN_Z = 1;
const MAX_Z = 28;
const PIN = 20;
const SEA = '#E4ECF6';
const LAND = color.surface;
const BORDER = '#B9C0C8';

type Camera = { z: number; cx: number; cy: number };

export type PinMapAnswer = { country: number; point: MapPoint | null; color: string };

export type PinMapHandle = {
  /** Flies back to the starting view, for a new round. */
  reset: (insetBottom: number) => void;
  /** Frames the pin and the landmass of the answer country above `insetBottom`. */
  focus: (answer: { country: number; point: MapPoint | null; pin: LatLon; insetBottom: number }) => void;
};

type Props = {
  ref?: Ref<PinMapHandle>;
  pin: LatLon | null;
  /** Country under the pin, highlighted while guessing; -1 for none. */
  pinCountry: number;
  answer: PinMapAnswer | null;
  locked: boolean;
  /** Height covered by floating UI at the bottom; the camera keeps content clear of it. */
  insetBottom: number;
  onPin: (pin: LatLon) => void;
};

/** Keeps the map covering the viewport, or centred in the uncovered part when it is smaller. */
function clampCenter(c: number, k: number, size: number, content: number, inset: number) {
  'worklet';
  const avail = size - inset;
  if (content * k <= avail) return content / 2 + (size / 2 - avail / 2) / k;
  const lo = size / 2 / k;
  const hi = content - (avail - size / 2) / k;
  return Math.min(Math.max(c, lo), hi);
}

function clampZ(z: number) {
  'worklet';
  return Math.min(MAX_Z, Math.max(MIN_Z, z));
}

const Countries = memo(function Countries() {
  return WORLD.countries.map((c, i) => <Path key={i} d={c.d} />);
});

export function PinMap({ ref, pin, pinCountry, answer, locked, insetBottom, onPin }: Props) {
  const reduced = useReducedMotion();
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<Camera | null>(null);
  const surface = useRef<ComponentRef<typeof View>>(null);

  const bw = useSharedValue(0);
  const bh = useSharedValue(0);
  const k0 = useSharedValue(1);
  const inset = useSharedValue(insetBottom);
  const z = useSharedValue(1);
  const cx = useSharedValue(MAP_W / 2);
  const cy = useSharedValue(MAP_H / 2);
  const vz = useSharedValue(1);
  const vcx = useSharedValue(MAP_W / 2);
  const vcy = useSharedValue(MAP_H / 2);

  const base = box.w ? Math.min(box.w / MAP_W, box.h / MAP_H) : 1;

  useEffect(() => {
    inset.set(insetBottom);
  }, [insetBottom, inset]);

  const commit = useCallback(
    (nz: number, ncx: number, ncy: number) => setView((v) => (v && v.z === nz && v.cx === ncx && v.cy === ncy ? v : { z: nz, cx: ncx, cy: ncy })),
    [],
  );

  useLayoutEffect(() => {
    if (!view) return;
    vz.set(view.z);
    vcx.set(view.cx);
    vcy.set(view.cy);
  }, [view, vz, vcx, vcy]);

  const clampCamera = (cam: Camera, w: number, h: number, k: number, bottom: number): Camera => {
    const nz = clampZ(cam.z);
    return { z: nz, cx: clampCenter(cam.cx, k * nz, w, MAP_W, 0), cy: clampCenter(cam.cy, k * nz, h, MAP_H, bottom) };
  };

  /** Fills the height so the map starts big, centred on Europe and Africa; pinch out for the whole world. */
  const startCamera = (w: number, h: number, k: number, bottom: number): Camera => {
    const fill = (h - bottom) / (MAP_H * k);
    const start = project({ lat: 22, lon: 15 });
    return clampCamera({ z: Math.min(3, Math.max(1, fill)), cx: start.x, cy: start.y }, w, h, k, bottom);
  };

  const jump = (cam: Camera) => {
    z.set(cam.z);
    cx.set(cam.cx);
    cy.set(cam.cy);
    commit(cam.z, cam.cx, cam.cy);
  };

  const flyTo = (target: Camera) => {
    if (reduced) {
      jump(target);
      return;
    }
    // Zooming out: render the wider target first so the shrinking layer never runs out of map.
    const zoomingOut = target.z < z.get();
    if (zoomingOut) commit(target.z, target.cx, target.cy);
    const cfg = { duration: 650, easing: Easing.inOut(Easing.cubic) };
    z.set(withTiming(target.z, cfg));
    cx.set(withTiming(target.cx, cfg));
    cy.set(
      withTiming(target.cy, cfg, (finished) => {
        'worklet';
        if (finished && !zoomingOut) scheduleOnRN(commit, target.z, target.cx, target.cy);
      }),
    );
  };

  useImperativeHandle(ref, () => ({
    reset: (bottom) => {
      if (box.w) flyTo(startCamera(box.w, box.h, base, bottom));
    },
    focus: ({ country, point, pin: guess, insetBottom: bottom }) => {
      if (!box.w) return;
      const guessPt = project(guess);
      const b = landmassBounds(country, point ?? guessPt);
      for (const p of [guessPt, point]) {
        if (!p) continue;
        b.minX = Math.min(b.minX, p.x);
        b.maxX = Math.max(b.maxX, p.x);
        b.minY = Math.min(b.minY, p.y);
        b.maxY = Math.max(b.maxY, p.y);
      }
      const w = Math.max(420, (b.maxX - b.minX) * 1.4);
      const h = Math.max(300, (b.maxY - b.minY) * 1.4);
      const avail = box.h - bottom - 24;
      const nz = clampZ(Math.min(box.w / (base * w), avail / (base * h), 14));
      const k = base * nz;
      const midX = (b.minX + b.maxX) / 2;
      const midY = (b.minY + b.maxY) / 2;
      flyTo(clampCamera({ z: nz, cx: midX, cy: midY - (avail / 2 + 24 - box.h / 2) / k }, box.w, box.h, base, bottom));
    },
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === box.w && height === box.h) return;
    const k = Math.min(width / MAP_W, height / MAP_H);
    bw.set(width);
    bh.set(height);
    k0.set(k);
    setBox({ w: width, h: height });
    jump(view ? clampCamera({ z: z.get(), cx: cx.get(), cy: cy.get() }, width, height, k, insetBottom) : startCamera(width, height, k, insetBottom));
  };

  const drop = (x: number, y: number) => {
    if (locked || !box.w) return;
    const k = base * z.get();
    const m = { x: cx.get() + (x - box.w / 2) / k, y: cy.get() + (y - box.h / 2) / k };
    if (m.x < 0 || m.x > MAP_W || m.y < 0 || m.y > MAP_H) return;
    onPin(unproject(m));
  };

  const pan = usePanGesture({
    minDistance: 6,
    onUpdate: (e) => {
      'worklet';
      const k = k0.get() * z.get();
      cx.set(clampCenter(cx.get() - e.changeX / k, k, bw.get(), MAP_W, 0));
      cy.set(clampCenter(cy.get() - e.changeY / k, k, bh.get(), MAP_H, inset.get()));
    },
    onFinalize: () => {
      'worklet';
      scheduleOnRN(commit, z.get(), cx.get(), cy.get());
    },
  });

  const pinch = usePinchGesture({
    onUpdate: (e) => {
      'worklet';
      const k = k0.get() * z.get();
      const nz = clampZ(z.get() * e.scaleChange);
      const nk = k0.get() * nz;
      const fx = e.focalX - bw.get() / 2;
      const fy = e.focalY - bh.get() / 2;
      const mx = cx.get() + fx / k;
      const my = cy.get() + fy / k;
      z.set(nz);
      cx.set(clampCenter(mx - fx / nk, nk, bw.get(), MAP_W, 0));
      cy.set(clampCenter(my - fy / nk, nk, bh.get(), MAP_H, inset.get()));
    },
    onFinalize: () => {
      'worklet';
      scheduleOnRN(commit, z.get(), cx.get(), cy.get());
    },
  });

  const tap = useTapGesture({
    enabled: !locked,
    runOnJS: true,
    onActivate: (e) => drop(e.x, e.y),
  });

  const gesture = useCompetingGestures(tap, useSimultaneousGestures(pan, pinch));

  const zoomBy = (factor: number) => {
    if (!box.w) return;
    const visibleMid = (box.h - insetBottom) / 2 - box.h / 2;
    const nz = clampZ(z.get() * factor);
    const my = cy.get() + visibleMid / (base * z.get());
    flyTo(clampCamera({ z: nz, cx: cx.get(), cy: my - visibleMid / (base * nz) }, box.w, box.h, base, insetBottom));
  };

  // Trackpad pinch and mouse wheel on web.
  const wheelCommit = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'web' || !box.w) return;
    const node = surface.current as unknown as HTMLElement | null;
    if (!node?.addEventListener) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = node.getBoundingClientRect();
      const fx = e.clientX - rect.left - box.w / 2;
      const fy = e.clientY - rect.top - box.h / 2;
      const k = base * z.get();
      const nz = clampZ(z.get() * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)));
      const nk = base * nz;
      const mx = cx.get() + fx / k;
      const my = cy.get() + fy / k;
      z.set(nz);
      cx.set(clampCenter(mx - fx / nk, nk, box.w, MAP_W, 0));
      cy.set(clampCenter(my - fy / nk, nk, box.h, MAP_H, insetBottom));
      if (wheelCommit.current) clearTimeout(wheelCommit.current);
      wheelCommit.current = setTimeout(() => commit(z.get(), cx.get(), cy.get()), 120);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [box.w, box.h, base, insetBottom, z, cx, cy, commit]);

  const layerStyle = useAnimatedStyle(() => {
    const k = k0.get() * z.get();
    return {
      transform: [{ translateX: (vcx.get() - cx.get()) * k }, { translateY: (vcy.get() - cy.get()) * k }, { scale: z.get() / vz.get() }],
    };
  });

  const pinPt = pin ? project(pin) : null;
  const answerPoint = answer?.point ?? null;

  const px = pinPt?.x ?? 0;
  const py = pinPt?.y ?? 0;
  const pinStyle = useAnimatedStyle(() => {
    const k = k0.get() * z.get();
    return { transform: [{ translateX: (px - cx.get()) * k + bw.get() / 2 - PIN / 2 }, { translateY: (py - cy.get()) * k + bh.get() / 2 - PIN / 2 }] };
  }, [px, py]);

  const ax = answerPoint?.x ?? 0;
  const ay = answerPoint?.y ?? 0;
  const answerStyle = useAnimatedStyle(() => {
    const k = k0.get() * z.get();
    return { transform: [{ translateX: (ax - cx.get()) * k + bw.get() / 2 - PIN / 2 }, { translateY: (ay - cy.get()) * k + bh.get() / 2 - PIN / 2 }] };
  }, [ax, ay]);

  const unit = view ? 1 / (base * view.z) : 1;
  const visW = box.w * unit;
  const visH = box.h * unit;
  const viewBox = view ? `${view.cx - visW * (0.5 + OVERSCAN)} ${view.cy - visH * (0.5 + OVERSCAN)} ${visW * (1 + 2 * OVERSCAN)} ${visH * (1 + 2 * OVERSCAN)}` : '0 0 1 1';
  const showPinCountry = pinCountry >= 0 && pinCountry !== answer?.country;

  return (
    <View style={styles.root} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <View
          ref={surface}
          collapsable={false}
          style={[StyleSheet.absoluteFill, Platform.OS === 'web' && ({ cursor: locked ? 'grab' : 'crosshair' } as object)]}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={pin ? 'Your pin on the world map. Tap elsewhere to move it, pinch to zoom.' : 'World map. Tap to drop a pin, pinch to zoom.'}
        >
          {view ? (
            <Animated.View
              pointerEvents="none"
              style={[
                { position: 'absolute', left: -box.w * OVERSCAN, top: -box.h * OVERSCAN, width: box.w * (1 + 2 * OVERSCAN), height: box.h * (1 + 2 * OVERSCAN) },
                layerStyle,
              ]}
            >
              <Svg width="100%" height="100%" viewBox={viewBox}>
                <G fill={LAND} stroke={BORDER} strokeWidth={0.8 * unit} strokeLinejoin="round">
                  <Countries />
                </G>
                {showPinCountry ? <Path d={countryPath(pinCountry)} fill={color.primary} fillOpacity={0.16} stroke={color.primary} strokeWidth={1.5 * unit} strokeLinejoin="round" /> : null}
                {answer ? <Path d={countryPath(answer.country)} fill={answer.color} fillOpacity={0.28} stroke={answer.color} strokeWidth={2 * unit} strokeLinejoin="round" /> : null}
                {answer && answerPoint && pinPt ? (
                  <Line
                    x1={pinPt.x}
                    y1={pinPt.y}
                    x2={answerPoint.x}
                    y2={answerPoint.y}
                    stroke={answer.color}
                    strokeWidth={2.5 * unit}
                    strokeDasharray={`${6 * unit} ${5 * unit}`}
                    strokeLinecap="round"
                  />
                ) : null}
              </Svg>
            </Animated.View>
          ) : null}
          {answer && answerPoint ? <Animated.View pointerEvents="none" style={[styles.marker, { backgroundColor: answer.color }, answerStyle]} /> : null}
          {pinPt ? <Animated.View pointerEvents="none" style={[styles.marker, styles.pin, pinStyle]} /> : null}
        </View>
      </GestureDetector>

      <View style={[styles.zoom, lift, locked && styles.hidden]} pointerEvents={locked ? 'none' : 'auto'} aria-hidden={locked}>
        <PressableScale style={styles.zoomButton} onPress={() => zoomBy(2)} accessibilityLabel="Zoom in" hitSlop={4}>
          <Icon name="plus" size={20} />
        </PressableScale>
        <View style={styles.zoomDivider} />
        <PressableScale style={styles.zoomButton} onPress={() => zoomBy(0.5)} accessibilityLabel="Zoom out" hitSlop={4}>
          <Icon name="minus" size={20} />
        </PressableScale>
        <View style={styles.zoomDivider} />
        <PressableScale
          style={styles.zoomButton}
          onPress={() => flyTo(clampCamera({ z: 1, cx: MAP_W / 2, cy: MAP_H / 2 }, box.w, box.h, base, insetBottom))}
          accessibilityLabel="Show the whole world"
          hitSlop={4}
        >
          <Icon name="world" size={19} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: SEA },
  marker: { position: 'absolute', left: 0, top: 0, width: PIN, height: PIN, borderRadius: PIN / 2, borderWidth: 3, borderColor: '#fff' },
  pin: { backgroundColor: color.ink },
  zoom: { position: 'absolute', top: 12, right: 12, backgroundColor: color.surface, borderRadius: 14, borderWidth: 1, borderColor: color.border },
  zoomButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { height: 1, backgroundColor: color.border, marginHorizontal: 8 },
  hidden: { opacity: 0 },
});
