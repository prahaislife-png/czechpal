import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/glass';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { draftFromPhoto, leaveModalForReview, pickImage, pickMorePages } from '@/lib/capture';
import { MAX_PAGES, pagesOf, useStore } from '@/store/cases';
import { camera as cam, motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const isNative = process.env.EXPO_OS !== 'web';

/**
 * Full-screen scanner (immersive → fullScreenModal, explicit Close).
 * Camera permission is primed here, at the moment of intent, never on app start.
 *
 * With `addTo` (a draft's id) it adds the next page of that document and goes back to it,
 * instead of starting a new one.
 */
export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { addTo } = useLocalSearchParams<{ addTo?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [mountError, setMountError] = useState<string | null>(null);

  const fromLibrary = async () => {
    if (!addTo) return leaveModalForReview(await pickImage());
    const draft = useStore.getState().cases.find((c) => c.id === addTo);
    if (!draft) return router.back();
    if (await pickMorePages(addTo, MAX_PAGES - pagesOf(draft).length)) router.back();
  };

  const onPhoto = (uri: string) => {
    if (!addTo) return leaveModalForReview(draftFromPhoto(uri));
    useStore.getState().addPages(addTo, [uri]);
    router.back();
  };

  let body: React.ReactNode;
  if (!permission) {
    body = null; // permission status loading: stay black, no flash of UI
  } else if (!permission.granted) {
    body = permission.canAskAgain ? (
      <Prompt
        icon="viewfinder"
        title="Scan anything in Czech"
        body="The camera is only used while you’re scanning. Nothing is sent anywhere until you tap Explain."
        action={{ label: 'Allow camera', onPress: requestPermission }}
        onLibrary={fromLibrary}
      />
    ) : (
      <Prompt
        icon="camera"
        title="Camera access is off"
        body="Turn on camera access for CzechPal in Settings, or choose a photo you already have."
        action={isNative ? { label: 'Open Settings', onPress: () => Linking.openSettings() } : undefined}
        onLibrary={fromLibrary}
      />
    );
  } else if (mountError) {
    body = (
      <Prompt
        icon="camera"
        title="No camera available"
        body="This device has no camera we can use. Choose a photo or screenshot instead."
        onLibrary={fromLibrary}
      />
    );
  } else {
    body = <Viewfinder onMountError={setMountError} onLibrary={fromLibrary} onPhoto={onPhoto} addingPage={!!addTo} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {body}
      <View style={[styles.topBar, { top: insets.top + space.sm }]} pointerEvents="box-none">
        <GlassButton icon="close" label="Close" onPress={() => router.back()} />
      </View>
    </View>
  );
}

function Viewfinder({
  onMountError,
  onLibrary,
  onPhoto,
  addingPage,
}: {
  onMountError: (m: string) => void;
  onLibrary: () => void;
  onPhoto: (uri: string) => void;
  addingPage: boolean;
}) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flash = useSharedValue(0);

  // Feedback: a brief white wash confirms the capture on the same frame as the haptic.
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
      const photo = await camera.current?.takePictureAsync({ quality: 0.8 });
      if (!photo) throw new Error('no photo');
      onPhoto(photo.uri);
    } catch {
      setBusy(false);
      setError('Couldn’t take the photo. Hold steady and try again.');
    }
  };

  return (
    <>
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        animateShutter={false}
        onCameraReady={() => setReady(true)}
        onMountError={(e) => onMountError(e.message)}
      />

      <View style={styles.frameArea} pointerEvents="none">
        <View style={styles.frame}>
          <Corner position="topLeft" />
          <Corner position="topRight" />
          <Corner position="bottomLeft" />
          <Corner position="bottomRight" />
        </View>
      </View>

      <View style={[styles.torch, { top: insets.top + space.sm }]}>
        <GlassButton
          icon={torch ? 'flash' : 'flashOff'}
          label={torch ? 'Turn torch off' : 'Turn torch on'}
          onPress={() => setTorch((t) => !t)}
        />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + space.xl }]}>
        <GlassSurface style={styles.hint}>
          <Text variant="subhead" weight="500" color="onInk" accessibilityLiveRegion="polite" chrome>
            {error ?? (addingPage ? 'Point at the next page' : 'Point at any Czech text')}
          </Text>
        </GlassSurface>
        <View style={styles.shutterRow}>
          <GlassButton icon="photo" label={addingPage ? 'Choose pages from photos' : 'Choose a photo'} onPress={onLibrary} size={52} />
          <PressableScale
            onPress={shoot}
            disabled={!ready || busy}
            pressedScale={0.92}
            accessibilityRole="button"
            accessibilityLabel={addingPage ? 'Take photo of the next page' : 'Take photo'}
            style={[styles.shutter, (!ready || busy) && styles.shutterIdle]}>
            <View style={styles.shutterCore} />
          </PressableScale>
          {addingPage ? (
            // Keeps the shutter centred; switching to typing makes no sense mid-document.
            <View style={styles.shutterSpacer} />
          ) : (
            <GlassButton
              icon="keyboard"
              label="Type or paste instead"
              size={52}
              onPress={() => {
                router.back();
                router.push('/paste');
              }}
            />
          )}
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </>
  );
}

function Prompt({
  icon,
  title,
  body,
  action,
  onLibrary,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
  onLibrary: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.prompt}>
      <Icon name={icon} size={44} color={colors.onInk} />
      <View style={styles.promptText}>
        <Text variant="title2" color="onInk" align="center" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="callout" color="onInk2" align="center">
          {body}
        </Text>
      </View>
      <View style={styles.promptActions}>
        {action && <Button label={action.label} onPress={action.onPress} />}
        <Button label="Choose a photo instead" variant={action ? 'onDark' : 'primary'} onPress={onLibrary} />
      </View>
    </View>
  );
}

function GlassButton({ icon, label, onPress, size = 44 }: { icon: IconName; label: string; onPress: () => void; size?: number }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
      {({ pressed }) => (
        <GlassSurface style={[styles.glassButton, { width: size, height: size, opacity: pressed ? 0.7 : 1 }]}>
          <Icon name={icon} size={size > 44 ? 24 : 20} color={cam.foreground} />
        </GlassSurface>
      )}
    </Pressable>
  );
}

type CornerPos = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

function Corner({ position }: { position: CornerPos }) {
  const top = position.startsWith('top');
  const left = position.endsWith('Left');
  return (
    <View
      style={[
        styles.corner,
        top ? { top: 0, borderTopWidth: 3 } : { bottom: 0, borderBottomWidth: 3 },
        left ? { left: 0, borderLeftWidth: 3 } : { right: 0, borderRightWidth: 3 },
        {
          borderTopLeftRadius: top && left ? CORNER_RADIUS : 0,
          borderTopRightRadius: top && !left ? CORNER_RADIUS : 0,
          borderBottomLeftRadius: !top && left ? CORNER_RADIUS : 0,
          borderBottomRightRadius: !top && !left ? CORNER_RADIUS : 0,
        },
      ]}
    />
  );
}

const CORNER = 34;
const CORNER_RADIUS = 18;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: cam.background },
  topBar: { position: 'absolute', left: space.xl },
  torch: { position: 'absolute', right: space.xl },
  frameArea: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingBottom: 120 },
  frame: { width: '80%', maxWidth: 420, aspectRatio: 3 / 4 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: cam.corner },
  controls: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: space.xl },
  hint: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.huge },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: cam.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIdle: { opacity: 0.5 },
  shutterSpacer: { width: 52, height: 52 },
  shutterCore: { width: 62, height: 62, borderRadius: 31, backgroundColor: cam.foreground },
  glassButton: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  flash: { backgroundColor: cam.foreground },
  prompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.xxl },
  promptText: { gap: space.sm, maxWidth: 340 },
  promptActions: { alignSelf: 'stretch', maxWidth: 400, gap: space.xs },
});
