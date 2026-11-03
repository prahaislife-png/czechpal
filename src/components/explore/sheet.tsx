import * as Haptics from 'expo-haptics';
import { useEffect, useImperativeHandle, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, useNativeGesture, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui/text';
import { layout, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

export type SheetStop = 'low' | 'mid' | 'high';
const STOPS: SheetStop[] = ['low', 'mid', 'high'];
const STOP_NAMES: Record<SheetStop, string> = { low: 'Mostly map', mid: 'Map and places', high: 'Places' };

/** The folder tabs stand this tall above the sheet's top edge. */
export const TAB_HEIGHT = 44;

export type SheetHandle = {
  snapTo: (stop: SheetStop, velocity?: number) => void;
  scrollTo: (y: number) => void;
};

type Tab<T extends string> = { id: T; label: string; count?: number };

type Props<T extends string> = {
  ref?: Ref<SheetHandle>;
  /** Where the sheet's top edge rests for each stop, in points from the top of the screen. */
  snaps: Record<SheetStop, number>;
  stop: SheetStop;
  onStopChange: (stop: SheetStop) => void;
  /** Shared with the screen so the floating bar can fade as the sheet rises. */
  top: SharedValue<number>;
  height: number;
  /** Room to leave for the tab bar under the content. */
  bottomInset: number;
  reduceMotion: boolean;
  tabs: Tab<T>[];
  tab: T;
  onTab: (tab: T) => void;
  header: ReactNode;
  onHeaderHeight: (h: number) => void;
  children: ReactNode;
};

/**
 * A paper sheet over the map with three resting heights. The header (tabs, grabber, sentence)
 * always drags it. The content drags it too until it is fully up; then the content scrolls, and
 * pulling down from the top of the content brings the sheet down again.
 */
export function ExploreSheet<T extends string>({
  ref,
  snaps,
  stop,
  onStopChange,
  top,
  height,
  bottomInset,
  reduceMotion,
  tabs,
  tab,
  onTab,
  header,
  onHeaderHeight,
  children,
}: Props<T>) {
  const { ex } = useExploreTheme();
  const start = useSharedValue(0);
  const anchor = useSharedValue(0);
  const scrollY = useSharedValue(0);
  /** When the last drag ended: a tap on the grabber that ends a drag isn't a tap. */
  const draggedAt = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const snapTo = (next: SheetStop, velocity = 0) => {
    const to = snaps[next];
    top.set(reduceMotion ? withTiming(to, { duration: 180 }) : withSpring(to, { duration: 480, dampingRatio: 0.86, velocity }));
    if (next !== stop && process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
    onStopChange(next);
  };

  useImperativeHandle(ref, () => ({
    snapTo,
    scrollTo: (y: number) => scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: !reduceMotion }),
  }));

  // A new screen size or a taller header moves the resting heights; the sheet follows.
  useEffect(() => {
    top.set(snaps[stop]);
  }, [snaps.low, snaps.mid, snaps.high]); // eslint-disable-line react-hooks/exhaustive-deps

  const settle = (velocityY: number) => {
    'worklet';
    // Where a flick would carry it, then the nearest resting height.
    const projected = top.get() + velocityY * 0.18;
    let next: SheetStop = 'low';
    for (const s of STOPS) if (Math.abs(snaps[s] - projected) < Math.abs(snaps[next] - projected)) next = s;
    scheduleOnRN(snapTo, next, velocityY);
  };
  const clamp = (y: number) => {
    'worklet';
    return Math.min(snaps.low, Math.max(snaps.high, y));
  };

  // Header: always moves the sheet.
  const headPan = usePanGesture({
    activeOffsetY: [-6, 6],
    onActivate: () => {
      start.set(top.get());
    },
    onUpdate: (e) => {
      top.set(clamp(start.get() + e.translationY));
    },
    onDeactivate: (e) => {
      draggedAt.set(Date.now());
      settle(e.velocityY);
    },
  });

  // Content: hands over between the sheet and the scroll view.
  const native = useNativeGesture({});
  const bodyPan = usePanGesture({
    activeOffsetY: [-8, 8],
    failOffsetX: [-24, 24],
    simultaneousWith: native,
    onActivate: () => {
      start.set(top.get());
      anchor.set(0);
    },
    onUpdate: (e) => {
      const fullyUp = start.get() <= snaps.high + 0.5;
      // Fully up, the content scrolls; the sheet moves only when pulled down from the very top.
      if (fullyUp && (scrollY.get() > 0.5 || e.translationY < anchor.get())) {
        anchor.set(e.translationY);
        return;
      }
      top.set(clamp(start.get() + e.translationY - anchor.get()));
      if (top.get() > snaps.high + 0.5) scrollTo(scrollRef, 0, 0, false);
    },
    onDeactivate: (e) => {
      if (Math.abs(top.get() - start.get()) < 2) return;
      draggedAt.set(Date.now());
      settle(e.velocityY);
    },
  });

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: top.get() - TAB_HEIGHT }] }));

  return (
    <Animated.View style={[styles.sheet, { height: height + TAB_HEIGHT }, sheetStyle]} pointerEvents="box-none">
      <GestureDetector gesture={headPan}>
        <View pointerEvents="box-none">
          <View style={styles.tabs} pointerEvents="box-none" accessibilityRole="tablist">
            {tabs.map((t) => {
              const active = t.id === tab;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => onTab(t.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t.count ? `${t.label}, ${t.count}` : t.label}
                  style={[
                    styles.tab,
                    active
                      ? { height: TAB_HEIGHT, backgroundColor: ex.sheet, borderColor: ex.line, zIndex: 2 }
                      : { height: TAB_HEIGHT - 6, backgroundColor: ex.sheetMuted, borderColor: ex.line },
                  ]}>
                  <Text variant="subhead" weight={active ? '700' : '500'} chrome style={{ color: active ? ex.ink : ex.ink2 }}>
                    {t.label}
                  </Text>
                  {t.count ? (
                    <View style={[styles.count, { backgroundColor: active ? ex.chip : ex.line }]}>
                      <Text variant="caption" weight="700" tabular chrome style={{ color: active ? ex.chipInk : ex.ink2 }}>
                        {t.count}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View
            style={[styles.head, { backgroundColor: ex.sheet, borderColor: ex.line, boxShadow: ex.sheetShadow }]}
            onLayout={(e: LayoutChangeEvent) => onHeaderHeight(e.nativeEvent.layout.height)}>
            <Pressable
              onPress={() => {
                if (Date.now() - draggedAt.get() < 400) return;
                snapTo(stop === 'low' ? 'mid' : stop === 'mid' ? 'high' : 'mid');
              }}
              hitSlop={{ top: 10, bottom: 6, left: 40, right: 40 }}
              accessibilityRole="adjustable"
              accessibilityLabel="Places panel"
              accessibilityValue={{ text: STOP_NAMES[stop] }}
              accessibilityHint="Swipe up or down to show more of the places or the map"
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(e) => {
                const i = STOPS.indexOf(stop);
                snapTo(e.nativeEvent.actionName === 'increment' ? STOPS[Math.min(2, i + 1)] : STOPS[Math.max(0, i - 1)]);
              }}
              style={styles.grabberHit}>
              <View style={[styles.grabber, { backgroundColor: ex.line }]} />
            </Pressable>
            {header}
          </View>
        </View>
      </GestureDetector>

      <GestureDetector gesture={bodyPan}>
        <View style={[styles.body, { backgroundColor: ex.sheet }]}>
          <GestureDetector gesture={native}>
            <Animated.ScrollView
              ref={scrollRef}
              onScroll={onScroll}
              scrollEventThrottle={16}
              scrollEnabled={stop === 'high'}
              bounces={false}
              overScrollMode="never"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={[styles.content, { paddingBottom: snaps[stop] + bottomInset + space.huge }]}>
              {children}
            </Animated.ScrollView>
          </GestureDetector>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, top: 0 },
  tabs: {
    height: TAB_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
    paddingHorizontal: layout.gutter,
    zIndex: 2,
  },
  tab: {
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    // The active tab covers the sheet's top line, so tab and sheet read as one piece of paper.
    marginBottom: -1,
  },
  count: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  head: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderCurve: 'continuous',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: layout.gutter,
    paddingBottom: space.md,
  },
  grabberHit: { alignSelf: 'center', paddingTop: space.sm, paddingBottom: space.md, paddingHorizontal: space.xl },
  grabber: { width: 36, height: 5, borderRadius: 3 },
  body: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingTop: space.xs, gap: space.md },
});
