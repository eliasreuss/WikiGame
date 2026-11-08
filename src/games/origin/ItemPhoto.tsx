import { useEffect, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { useWikiSummary } from '../../lib/wiki';
import { color, radius, type } from '../../theme/tokens';

/** The item's Wikipedia photo. Tap to see it full screen. */
export function ItemPhoto({ title, name, size }: { title: string; name: string; size: number }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const summary = useWikiSummary(title);
  const [open, setOpen] = useState(false);
  const [sharpFailed, setSharpFailed] = useState(false);
  const thumb = summary?.thumbnail;
  const sharp = summary?.image && summary.image !== thumb && !sharpFailed ? summary.image : null;

  // The game screen also listens for Escape, to leave the round. Swallow it while the photo is open.
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return;
    const stop = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', stop, true);
    return () => window.removeEventListener('keydown', stop, true);
  }, [open]);

  return (
    <>
      <PressableScale
        style={[styles.frame, { width: size, height: size }]}
        onPress={() => thumb && setOpen(true)}
        disabled={!thumb}
        pressedScale={0.96}
        accessibilityRole="imagebutton"
        accessibilityLabel={thumb ? `Photo of ${name}. Opens full screen.` : `Photo of ${name}`}
      >
        {thumb ? <Animated.Image entering={FadeIn.duration(220)} source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      </PressableScale>

      <Modal
        visible={open}
        animationType={reduced ? 'none' : 'fade'}
        presentationStyle="fullScreen"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View style={[styles.viewer, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
          <Pressable style={styles.stage} onPress={() => setOpen(false)} accessibilityLabel="Close photo">
            {thumb ? <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}
            {sharp ? <Image source={{ uri: sharp }} style={StyleSheet.absoluteFill} resizeMode="contain" onError={() => setSharpFailed(true)} /> : null}
          </Pressable>
          <Text style={styles.caption}>{name}</Text>
          <Pressable style={[styles.close, { top: insets.top + 12 }]} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close photo">
            <Icon name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.surfaceSunken, borderWidth: 1, borderColor: color.border },
  viewer: { flex: 1, backgroundColor: '#141516' },
  stage: { flex: 1, marginHorizontal: 12 },
  caption: { ...type.name, color: '#fff', textAlign: 'center', paddingTop: 14, paddingBottom: 8 },
  close: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
