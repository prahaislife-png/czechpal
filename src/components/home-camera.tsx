import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/glass';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { camera as cam, motion, radius, space } from '@/theme/tokens';

const isNative = process.env.EXPO_OS !== 'web';

/** Space between the panel's top edge and the shutter's centre. */
export const SHUTTER_LIFT = 64;

/**
 * Home's live camera: the whole screen behind the panel, with the shutter riding just above the
 * panel's top edge. Mounted only while Home is in view (one camera preview at a time).
 * Asks for the camera in place, never on its own.
 */
export function HomeCamera({
  active,
  panelY,
  halfY,
  topY,
  strip,
  translating,
  onPhoto,
  onTranslate,
  onLibrary,
}: {
  /** Home is focused and the app is in the foreground. */
  active: boolean;
  panelY: SharedValue<number>;
  /** The panel's resting heights, to fade the shutter as the camera shrinks to a strip. */
  halfY: number;
  topY: number;
  /** The camera is only a strip above the panel: its prompt and shutter are out of the way. */
  strip: boolean;
  /** A quick translation is on its way. */
  translating: boolean;
  onPhoto: (uri: string) => void;
  /** A quick look: the frame goes to Translate, not Explain. */
  onTranslate: (uri: string) => void;
  onLibrary: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mountError, setMountError] = useState(false);
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const flash = useSharedValue(0);

  const shutterStyle = useAnimatedStyle(() => ({
    top: panelY.get() - SHUTTER_LIFT - 36,
    opacity: interpolate(panelY.get(), [topY, (topY + halfY) / 2], [0, 1], 'clamp'),
  }));
  // The prompt and hint centre in the camera's visible part, and step aside for a thin strip.
  const visibleStyle = useAnimatedStyle(() => ({
    height: panelY.get(),
    opacity: interpolate(panelY.get(), [topY, (topY + halfY) / 2], [0, 1], 'clamp'),
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));

  const shoot = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!reduceMotion) {
      flash.set(withSequence(withTiming(0.85, { duration: 50 }), withTiming(0, { duration: motion.slow, easing: motion.easeOut })));
    }
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.7 });
      if (!photo) throw new Error('no photo');
      onPhoto(photo.uri);
    } catch {
      setError('Couldn’t take the photo. Hold steady and try again.');
    } finally {
      setBusy(false);
    }
  };

  // Translate needs no flash or haptic thud: it's a glance, not a capture.
  const translate = async () => {
    if (!ready || busy || translating) return;
    setBusy(true);
    setError(null);
    if (isNative) Haptics.selectionAsync();
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.5, shutterSound: false });
      if (!photo) throw new Error('no photo');
      onTranslate(photo.uri);
    } catch {
      setError('Couldn’t take the photo. Hold steady and try again.');
    } finally {
      setBusy(false);
    }
  };

  const allowed = permission?.granted && !mountError;

  return (
    <View style={styles.root}>
      {allowed && active && (
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          animateShutter={false}
          onCameraReady={() => setReady(true)}
          onMountError={() => setMountError(true)}
        />
      )}

      <Animated.View style={[styles.visible, visibleStyle]} pointerEvents={strip ? 'none' : 'box-none'}>
        {permission && !allowed ? (
          <CameraPrompt
            off={mountError ? 'none' : permission.canAskAgain ? 'ask' : 'denied'}
            onAllow={requestPermission}
            onLibrary={onLibrary}
          />
        ) : allowed ? (
          <View style={styles.hintRow} pointerEvents="none">
            <GlassSurface style={styles.hint}>
              <Text variant="subhead" weight="500" color="onInk" accessibilityLiveRegion="polite" chrome>
                {error ?? 'Translate for a quick look, or shoot to explain'}
              </Text>
            </GlassSurface>
          </View>
        ) : null}
      </Animated.View>

      {allowed && (
        <Animated.View style={[styles.shutterRow, shutterStyle]} pointerEvents={strip ? 'none' : 'box-none'}>
          {/* Equal side slots keep the shutter centred whatever sits beside it. */}
          <View style={[styles.side, styles.sideStart]}>
            <Pressable
              onPress={translate}
              disabled={!ready || busy || translating}
              accessibilityRole="button"
              accessibilityLabel="Translate what's in view"
              accessibilityState={{ busy: translating }}
              hitSlop={8}>
              {({ pressed }) => (
                <GlassSurface style={[styles.translate, { opacity: pressed || translating ? 0.7 : 1 }]}>
                  {translating ? (
                    <ActivityIndicator color={cam.foreground} />
                  ) : (
                    <Icon name="translate" size={20} color={cam.foreground} />
                  )}
                  <Text variant="subhead" weight="600" color="onInk" chrome>
                    Translate
                  </Text>
                </GlassSurface>
              )}
            </Pressable>
          </View>
          <PressableScale
            onPress={shoot}
            disabled={!ready || busy}
            pressedScale={0.92}
            accessibilityRole="button"
            accessibilityLabel="Take photo and explain"
            style={[styles.shutter, (!ready || busy) && styles.shutterIdle]}>
            <View style={styles.shutterCore} />
          </PressableScale>
          <View style={styles.side}>
            <GlassButton
              icon={torch ? 'flash' : 'flashOff'}
              label={torch ? 'Turn torch off' : 'Turn torch on'}
              onPress={() => setTorch((t) => !t)}
            />
          </View>
        </Animated.View>
      )}

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </View>
  );
}

function CameraPrompt({ off, onAllow, onLibrary }: { off: 'ask' | 'denied' | 'none'; onAllow: () => void; onLibrary: () => void }) {
  const copy = {
    ask: { title: 'Point at anything written in Czech', body: 'Turn on the camera to point it at Czech text. Nothing is sent until you tap Translate or take a photo.' },
    denied: { title: 'Camera access is off', body: 'Turn it on for CzechLocal in Settings, or choose a photo you already have.' },
    none: { title: 'No camera here', body: 'Choose a photo or screenshot instead.' },
  }[off];
  return (
    <View style={styles.prompt}>
      <Text variant="title2" color="onInk" align="center" accessibilityRole="header">
        {copy.title}
      </Text>
      <Text variant="callout" color="onInk2" align="center">
        {copy.body}
      </Text>
      <View style={styles.promptActions}>
        {off === 'ask' && <Button label="Turn on the camera" icon="camera" onPress={onAllow} />}
        {off === 'denied' && isNative && <Button label="Open Settings" onPress={() => Linking.openSettings()} />}
        <Button label="Choose a photo" variant={off === 'none' ? 'primary' : 'onDark'} onPress={onLibrary} />
      </View>
    </View>
  );
}

function GlassButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
      {({ pressed }) => (
        <GlassSurface style={[styles.glassButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Icon name={icon} size={22} color={cam.foreground} />
        </GlassSurface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, backgroundColor: cam.background },
  visible: { position: 'absolute', top: 0, left: 0, right: 0, justifyContent: 'center' },
  hintRow: { position: 'absolute', top: 108, left: 0, right: 0, alignItems: 'center' },
  hint: { paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.pill, overflow: 'hidden' },
  shutterRow: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
  },
  side: { flex: 1, alignItems: 'flex-start' },
  sideStart: { alignItems: 'flex-end' },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: cam.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIdle: { opacity: 0.5 },
  shutterCore: { width: 56, height: 56, borderRadius: 28, backgroundColor: cam.foreground },
  translate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  glassButton: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  flash: { backgroundColor: cam.foreground },
  prompt: { alignItems: 'center', paddingHorizontal: space.xxxl, paddingTop: 96, paddingBottom: space.xxl, gap: space.md },
  promptActions: { alignSelf: 'stretch', maxWidth: 400, gap: space.xs, marginTop: space.md },
});
