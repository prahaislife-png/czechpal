import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { CaseRow } from '@/components/case-row';
import { DocumentPaper } from '@/components/document-paper';
import { HomeCamera } from '@/components/home-camera';
import { QuickLook, type QuickLookState } from '@/components/quick-look';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { GlassSurface } from '@/components/ui/glass';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { daysUntil, shortDate } from '@/lib/about';
import { ai, AnalyzeError, categoryLabels, isDemoMode } from '@/lib/ai';
import { samples } from '@/lib/ai/samples';
import { announce, useLargeText } from '@/lib/a11y';
import { draftFromExample, explainPhoto, openReview, pickImage, pickPdf } from '@/lib/capture';
import { reminderHref, upcoming } from '@/lib/reminders';
import { useRemainingAnalyses, useStore } from '@/store/cases';
import { camera as cam, layout, motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Stop = 'top' | 'half' | 'full';
const STOPS: Stop[] = ['top', 'half', 'full'];
const STOP_NAMES: Record<Stop, string> = { top: 'Camera small', half: 'Camera and panel', full: 'Full camera' };
/** The panel's handle and its Photo / PDF / Type row, still showing when the camera is full screen. */
const PEEK = 112;

/**
 * The camera, opened from Help (full screen, explicit Close). A panel slides over it with three
 * resting heights: half (the camera on top, everything else below), full camera (pinch out, or
 * drag the panel down) and a camera strip (drag it up to read more). The camera runs only while
 * this screen is in view and the app is open. (Until 2.0 this was the Home tab.)
 */
export default function CameraScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [areaHeight, setAreaHeight] = useState(0);
  const height = areaHeight || windowHeight;
  const reduceMotion = useReducedMotion();
  const remaining = useRemainingAnalyses();
  const largeText = useLargeText();

  // A full-screen modal: no tab bar, only the home indicator to keep clear of.
  const tabBar = insets.bottom;
  const snaps = useMemo(
    () => ({ top: insets.top + 96, half: Math.round(height * 0.56), full: height - tabBar - PEEK }),
    [height, insets.top, tabBar],
  );
  const [stop, setStop] = useState<Stop>('half');
  const panelY = useSharedValue(snaps.half);
  const dragStart = useSharedValue(0);

  // A new screen size (first layout, rotation, split view) puts the panel on its resting height.
  useEffect(() => {
    panelY.set(snaps[stop]);
  }, [snaps]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback(
    (next: Stop) => {
      setStop(next);
      const to = snaps[next];
      panelY.set(reduceMotion ? withTiming(to, { duration: motion.fast }) : withSpring(to, motion.snap));
      if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
    },
    [snaps, panelY, reduceMotion],
  );

  const pan = usePanGesture({
    activeOffsetY: [-6, 6],
    onActivate: () => {
      dragStart.set(panelY.get());
    },
    onUpdate: (e) => {
      panelY.set(Math.min(snaps.full, Math.max(snaps.top, dragStart.get() + e.translationY)));
    },
    onDeactivate: (e) => {
      // Where a flick would carry it, then the nearest resting height.
      const projected = panelY.get() + e.velocityY * 0.15;
      const options: [Stop, number][] = [
        ['top', snaps.top],
        ['half', snaps.half],
        ['full', snaps.full],
      ];
      let next = options[0];
      for (const o of options) if (Math.abs(o[1] - projected) < Math.abs(next[1] - projected)) next = o;
      scheduleOnRN(goTo, next[0]);
    },
  });

  // Pinch out for the whole screen, pinch in for the panel back.
  const pinch = usePinchGesture({
    onDeactivate: (e) => {
      if (e.scale > 1.12) scheduleOnRN(goTo, 'full');
      else if (e.scale < 0.88) scheduleOnRN(goTo, 'half');
    },
  });

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: panelY.get() }] }));

  // One camera preview at a time: only while Home is in view and the app is in the foreground.
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      setStatusBarStyle('light');
      return () => {
        setFocused(false);
        setStatusBarStyle('auto');
      };
    }, []),
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  const fromLibrary = async () => openReview(await pickImage());

  // Translate: a quick look in the panel. The latest tap wins; an older answer arriving late is dropped.
  const [look, setLook] = useState<QuickLookState | null>(null);
  const lookId = useRef(0);
  const runTranslate = async (uri: string) => {
    const id = ++lookId.current;
    setLook({ state: 'loading', uri });
    if (stop === 'full') goTo('half');
    try {
      const result = await ai.quickTranslate({ uri, language: useStore.getState().language });
      if (id !== lookId.current) return;
      setLook({ state: 'done', uri, result });
      announce(result.status === 'ok' ? 'Translation ready' : 'No Czech text found');
    } catch (e) {
      if (id !== lookId.current) return;
      setLook({ state: 'error', uri, message: e instanceof AnalyzeError ? e.message : 'Couldn’t read that. Try again.' });
    }
  };
  const translate = (uri: string) => {
    // The photo leaves the phone, so it needs the same agreement as an explanation.
    if (!isDemoMode && !useStore.getState().aiConsent) {
      lookId.current++;
      setLook({ state: 'consent', uri });
      if (stop === 'full') goTo('half');
      return;
    }
    runTranslate(uri);
  };

  return (
    <View style={styles.root} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
      <GestureDetector gesture={pinch}>
        <View style={StyleSheet.absoluteFill}>
          <HomeCamera
            active={focused && foreground}
            panelY={panelY}
            halfY={snaps.half}
            topY={snaps.top}
            strip={stop === 'top'}
            translating={look?.state === 'loading'}
            onPhoto={explainPhoto}
            onTranslate={translate}
            onLibrary={fromLibrary}
          />
        </View>
      </GestureDetector>

      <View style={[styles.topBar, { top: insets.top + space.sm }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close camera">
          {({ pressed }) => (
            <GlassSurface style={[styles.close, { opacity: pressed ? 0.7 : 1 }]}>
              <Icon name="close" size={20} color={cam.foreground} />
            </GlassSurface>
          )}
        </Pressable>
        <View accessible accessibilityLabel={`${remaining} free explanations left this month`}>
          <GlassSurface style={styles.settings}>
            <Text variant="footnote" weight="600" color="onInk" chrome>
              {remaining} free
            </Text>
          </GlassSurface>
        </View>
      </View>

      <Animated.View style={[styles.panel, { height, backgroundColor: colors.background }, panelStyle]}>
        <GestureDetector gesture={pan}>
          <View style={styles.panelHead}>
            <Pressable
              onPress={() => goTo(stop === 'half' ? 'top' : 'half')}
              hitSlop={{ top: 12, bottom: 8, left: 40, right: 40 }}
              accessibilityRole="adjustable"
              accessibilityLabel="Panel"
              accessibilityValue={{ text: STOP_NAMES[stop] }}
              accessibilityHint="Swipe up or down to change how much of the camera shows"
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(e) => {
                const i = STOPS.indexOf(stop);
                // Increment shows more of the panel, so the camera gets smaller.
                goTo(e.nativeEvent.actionName === 'increment' ? STOPS[Math.max(0, i - 1)] : STOPS[Math.min(2, i + 1)]);
              }}
              style={styles.grabberHit}>
              <View style={[styles.grabber, { backgroundColor: colors.separator }]} />
            </Pressable>
            <List inset={false}>
              <View style={[styles.sourceRow, largeText && styles.sourceColumn]}>
                <Source icon="photo" label="Photo" onPress={fromLibrary} />
                <View style={[largeText ? styles.sourceDividerStacked : styles.sourceDivider, { backgroundColor: colors.separator }]} />
                <Source icon="pdf" label="PDF" onPress={async () => openReview(await pickPdf())} />
                <View style={[largeText ? styles.sourceDividerStacked : styles.sourceDivider, { backgroundColor: colors.separator }]} />
                <Source icon="keyboard" label="Type" onPress={() => router.push('/paste')} />
              </View>
            </List>
          </View>
        </GestureDetector>

        <ScrollView
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[styles.content, { paddingBottom: snaps[stop] + tabBar + space.huge }]}
          scrollEnabled={stop !== 'full'}>
          {look && (
            <QuickLook
              look={look}
              onAllow={() => {
                useStore.getState().setAiConsent(true);
                runTranslate(look.uri);
              }}
              onExplain={() => {
                setLook(null);
                explainPhoto(look.uri);
              }}
              onClose={() => {
                lookId.current++;
                setLook(null);
              }}
            />
          )}
          <PanelBody />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/** Everything that isn't the camera: what's coming up, About you, writing in Czech, examples, recent. */
function PanelBody() {
  const { colors } = useTheme();
  const cases = useStore((s) => s.cases);
  const recent = useMemo(() => cases.filter((c) => c.status !== 'draft').slice(0, 3), [cases]);
  // Examples are for the first visit: gone once something real has been explained.
  const triedForReal = cases.some((c) => c.source !== 'example' && c.status === 'ready');
  const reminders = useStore((s) => s.reminders);
  const comingUp = useMemo(() => upcoming(reminders).slice(0, 3), [reminders]);
  const about = useStore((s) => s.about);
  const askAbout = !about.stay && !about.district && !about.dismissed;

  return (
    <>
      {comingUp.length > 0 && (
        <View>
          <SectionHeader title="Coming up" />
          <List>
            {comingUp.map((r) => (
              <Row
                key={r.id}
                icon="calendar"
                title={r.title}
                subtitle={`${shortDate(r.date)} · ${inDays(daysUntil(r.date))}`}
                chevron
                onPress={() => router.push(reminderHref(r))}
              />
            ))}
          </List>
        </View>
      )}

      {askAbout && (
        <Card style={styles.about}>
          <View style={styles.aboutHead}>
            <Text variant="headline" style={styles.aboutTitle}>
              Make CzechPal fit you
            </Text>
            <Pressable
              onPress={() => useStore.getState().setAbout({ dismissed: true })}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Not now"
              style={styles.aboutClose}>
              <Icon name="close" size={18} color={colors.label3} />
            </Pressable>
          </View>
          <Text variant="subhead" color="label2">
            Your permit and where you live, in three quick questions. Explanations then fit your situation, and you get
            a reminder before your permit expires.
          </Text>
          <Button label="Add" variant="secondary" size="medium" onPress={() => router.push('/about')} style={styles.aboutButton} />
        </Card>
      )}

      <View>
        <SectionHeader title="Get things done" />
        <List>
          <Row
            icon="compose"
            title="Write to someone in Czech"
            subtitle="Landlord, doctor or tradesperson"
            chevron
            onPress={() => router.push('/compose')}
          />
        </List>
      </View>

      {!triedForReal && (
        <View>
          <SectionHeader title="Try it on" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.examples}
            style={styles.examplesBleed}>
            {samples.map((s) => (
              <PressableScale
                key={s.id}
                onPress={() => openReview(draftFromExample(s.id))}
                accessibilityRole="button"
                accessibilityLabel={`Try it on: ${s.label}`}
                style={styles.example}>
                <DocumentPaper text={s.original} size="small" maxLines={7} style={styles.examplePaper} />
                <View style={styles.exampleText}>
                  <Text variant="subhead" weight="600" numberOfLines={1}>
                    {s.label}
                  </Text>
                  <Text variant="caption" color="label2" weight="400">
                    {categoryLabels[s.category]}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      )}

      {recent.length > 0 && (
        <View>
          <SectionHeader
            title="Recent"
            action={
              <Pressable onPress={() => router.push('/you/history')} hitSlop={12} accessibilityRole="link">
                <Text variant="subhead" color="accent" weight="500" chrome>
                  See all
                </Text>
              </Pressable>
            }
          />
          <List>
            {recent.map((item) => (
              <CaseRow key={item.id} item={item} />
            ))}
          </List>
        </View>
      )}

      <View style={styles.trust}>
        <Icon name="lock" size={14} color={colors.label3} />
        <Text variant="footnote" color="label3" style={styles.trustText}>
          You review everything. CzechPal never sends anything for you.
        </Text>
      </View>
    </>
  );
}

function inDays(days: number) {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function Source({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.source, pressed && { backgroundColor: colors.fill }]}>
      <Icon name={icon} size={22} color={colors.accent} />
      <Text variant="subhead" weight="600" chrome>
        {label}
      </Text>
    </Pressable>
  );
}

const EXAMPLE_WIDTH = 148;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: cam.background },
  topBar: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    borderCurve: 'continuous',
    boxShadow: '0px -6px 24px rgba(0, 0, 0, 0.18)',
  },
  panelHead: { paddingHorizontal: layout.gutter, paddingBottom: space.sm },
  grabberHit: { alignSelf: 'center', paddingVertical: space.md, paddingHorizontal: space.xl },
  grabber: { width: 40, height: 5, borderRadius: 3 },

  content: { paddingHorizontal: layout.gutter, paddingTop: space.lg, gap: space.xxl },
  about: { gap: space.sm },
  aboutHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  aboutTitle: { flex: 1 },
  aboutClose: { minWidth: 28, minHeight: 28, alignItems: 'center', justifyContent: 'center' },
  aboutButton: { alignSelf: 'flex-start', marginTop: space.xs },
  sourceRow: { flexDirection: 'row', alignItems: 'stretch' },
  source: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  sourceDivider: { width: StyleSheet.hairlineWidth, marginVertical: space.md },
  sourceColumn: { flexDirection: 'column' },
  sourceDividerStacked: { height: StyleSheet.hairlineWidth, marginHorizontal: space.lg },
  examplesBleed: { marginHorizontal: -layout.gutter },
  examples: { paddingHorizontal: layout.gutter, gap: space.md },
  example: { width: EXAMPLE_WIDTH, gap: space.sm },
  examplePaper: { height: 132, overflow: 'hidden' },
  exampleText: { gap: 1, paddingHorizontal: space.xxs },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  trustText: { flexShrink: 1 },
});
