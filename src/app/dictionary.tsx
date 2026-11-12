import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent, type ListRenderItemInfo } from 'react-native';
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon, type IconName } from '@/components/ui/icon';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { allWords, colourFor, formatCount, letterIndex, railTarget, spokenText, tagLabel, type Word } from '@/lib/words';
import { useLearn } from '@/store/learn';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The dictionary: every word in one wheel. No search, just scroll: the word in the middle is the one
 * in focus, the rail on the right jumps by letter (and scrubs through a letter when dragged), and
 * the card below shows its meaning and an example. Saving a word puts it in My words, so it
 * comes back in reviews.
 *
 * The look is its own, not the app's: a full-colour screen that changes with the letter, set in
 * Bricolage Grotesque, with a white card.
 */

const ROW = 58;
/** The focused word is drawn 1.72× the size of the others. Text is set at the large size and scaled down, so it stays sharp. */
const GROW = 1.72;
const WORD_SIZE = 22 * GROW;
const RAIL = 42;
const SUN = '#FFD23F';
const INK = '#14161C';
const CARD_HEIGHT = 244;
const web = process.env.EXPO_OS === 'web';

const display = { semi: 'BricolageGrotesque_600SemiBold', bold: 'BricolageGrotesque_700Bold', extra: 'BricolageGrotesque_800ExtraBold' } as const;

export default function DictionaryScreen() {
  const [loaded, failed] = useFonts({ BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold });
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => {
        setStatusBarStyle('auto');
        stopSpeaking();
      };
    }, []),
  );
  // The screen waits for its own font, so words don't change shape after they appear.
  if (!loaded && !failed) return <View style={[styles.root, { backgroundColor: colourFor('A') }]} />;
  return <Wheel />;
}

function Wheel() {
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const card = scheme === 'dark' ? { bg: INK, ink: '#F4F4F6', muted: '#A3A8B5' } : { bg: '#FFFFFF', ink: INK, muted: '#5E6472' };
  const voice = useCzechVoice();

  const deck = useLearn((s) => s.deck);
  // A word counts as saved when My words has a card for it, whatever screen it was saved from.
  const savedKeys = useMemo(() => new Set(Object.values(deck).map((c) => c.cs.toLocaleLowerCase('cs'))), [deck]);
  const isSaved = useCallback((w: string) => savedKeys.has(w.toLocaleLowerCase('cs')), [savedKeys]);

  const [savedOnly, setSavedOnly] = useState(false);
  const [hide, setHide] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [scrub, setScrub] = useState<{ letter: string; y: number } | null>(null);

  const all = useMemo(() => allWords(), []);
  const list = useMemo(() => (savedOnly ? all.filter((x) => isSaved(x.w)) : all), [all, savedOnly, isSaved]);
  const index = useMemo(() => letterIndex(list), [list]);
  const at = Math.max(0, Math.min(list.length - 1, focus));
  const current: Word | undefined = list[at];
  const letter = current?.letter ?? 'A';
  const colour = colourFor(letter);
  const empty = list.length === 0;

  const listRef = useAnimatedRef<Animated.FlatList<Word>>();
  const scrollY = useSharedValue(0);
  const centre = useSharedValue(0);
  /** Half the wheel's height in rows: words fade out towards the top and bottom edges. */
  const half = useSharedValue(0);
  const quiet = useRef(true);
  const lastTick = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef({ downY: 0, fine: false });

  /** A new word reached the middle: show it, with a light tick once the wheel has been touched. */
  const onFocus = useCallback((i: number) => {
    setFocus(i);
    if (quiet.current || web) return;
    const now = Date.now();
    if (now - lastTick.current < 45) return;
    lastTick.current = now;
    Haptics.selectionAsync();
  }, []);

  const jump = useCallback(
    (i: number, animated = false) => {
      const to = Math.max(0, Math.min(list.length - 1, i));
      setFocus(to);
      listRef.current?.scrollToOffset({ offset: to * ROW, animated });
    },
    [list.length, listRef],
  );

  /** The web has no snapping: once scrolling stops, glide to the nearest word. */
  const queueSettle = useCallback(() => {
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const y = scrollY.get();
      const to = Math.round(y / ROW) * ROW;
      if (Math.abs(y - to) > 1) listRef.current?.scrollToOffset({ offset: to, animated: true });
    }, 140);
  }, [scrollY, listRef]);

  const onScroll = useAnimatedScrollHandler((e) => {
    const y = e.contentOffset.y;
    scrollY.set(y);
    const i = Math.round(y / ROW);
    if (i !== centre.get()) {
      centre.set(i);
      scheduleOnRN(onFocus, i);
    }
    if (web) scheduleOnRN(queueSettle);
  });

  const railAt = (y: number, fine: boolean) => {
    const target = stage.height ? railTarget(y / stage.height, index, list.length, fine) : null;
    if (!target) return;
    quiet.current = false;
    jump(target.at);
    setScrub({ letter: target.letter, y: Math.max(34, Math.min(stage.height - 34, y)) });
  };
  const railStart = (e: GestureResponderEvent) => {
    drag.current = { downY: e.nativeEvent.locationY, fine: false };
    railAt(e.nativeEvent.locationY, false);
  };
  const railMove = (e: GestureResponderEvent) => {
    const y = e.nativeEvent.locationY;
    if (!drag.current.fine && Math.abs(y - drag.current.downY) > 8) drag.current.fine = true;
    railAt(y, drag.current.fine);
  };
  const railEnd = () => setScrub(null);

  const toggleSavedOnly = (on: boolean) => {
    setSavedOnly(on);
    setFocus(0);
    centre.set(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const toggleSave = () => {
    if (!current) return;
    const learn = useLearn.getState();
    if (isSaved(current.w)) {
      const key = current.w.toLocaleLowerCase('cs');
      for (const c of Object.values(learn.deck)) if (c.cs.toLocaleLowerCase('cs') === key) learn.removeCard(c.id);
    } else {
      // My words keeps short cards: a long definition is cut at its last whole part.
      learn.addOwnCard(current.w, current.en.length > 120 ? current.en.slice(0, 120).replace(/[;,]?\s*\S*$/, '') : current.en);
    }
    if (!web) Haptics.selectionAsync();
  };

  const listen = () => {
    if (current) speak(spokenText(current), { voice: voice.state === 'available' ? voice.voice : undefined, rate: 0.88 });
  };

  const pad = Math.max(0, (stage.height - ROW) / 2);
  const rowWidth = Math.max(0, stage.width - RAIL - 22 - 8);
  const ghostSize = Math.min(stage.width * 0.56, 260);

  const renderItem = useCallback(
    ({ item, index: i }: ListRenderItemInfo<Word>) => (
      <WordRow item={item} index={i} saved={isSaved(item.w)} hide={hide} width={rowWidth} scrollY={scrollY} half={half} onPress={jump} />
    ),
    [isSaved, hide, rowWidth, scrollY, half, jump],
  );

  const open = !hide || revealed === current?.w;

  return (
    <View style={[styles.root, { backgroundColor: colour, paddingTop: insets.top }]}>
      <View style={styles.head}>
        <Tool icon="chevronLeft" label="Back" colour={colour} onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))} />
        <View style={styles.headText}>
          <Text style={styles.title} accessibilityRole="header">
            Dictionary
          </Text>
          <Text style={styles.sub}>{formatCount(all.length)} words. No search, just scroll.</Text>
        </View>
        <View style={styles.tools}>
          <Tool icon={hide ? 'eyeOff' : 'eye'} label={hide ? 'Show English' : 'Hide English'} colour={colour} pressed={hide} onPress={() => setHide(!hide)} />
          <Tool icon={savedOnly ? 'star' : 'starOutline'} label="Saved words only" colour={colour} pressed={savedOnly} onPress={() => toggleSavedOnly(!savedOnly)} />
          <Tool
            icon="shuffle"
            label="Jump to a random word"
            colour={colour}
            onPress={() => {
              if (!list.length) return;
              quiet.current = false;
              jump(Math.floor(Math.random() * list.length));
            }}
          />
        </View>
      </View>

      <View
        style={styles.stage}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setStage({ width, height });
          half.set(height / ROW / 2);
        }}>
        {!empty && stage.height > 0 ? (
          <>
            <Text style={[styles.ghost, { fontSize: ghostSize, lineHeight: ghostSize, bottom: -ghostSize * 0.16 }]} accessible={false} pointerEvents="none">
              {letter}
            </Text>
            <View style={styles.tick} pointerEvents="none" />
            <Animated.FlatList
              ref={listRef}
              data={list}
              renderItem={renderItem}
              keyExtractor={(x, i) => `${i}:${x.w}`}
              getItemLayout={(_, i) => ({ length: ROW, offset: pad + ROW * i, index: i })}
              ListHeaderComponent={<View style={{ height: pad }} />}
              ListFooterComponent={<View style={{ height: pad }} />}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onScrollBeginDrag={() => {
                quiet.current = false;
              }}
              snapToInterval={ROW}
              showsVerticalScrollIndicator={false}
              initialNumToRender={14}
              maxToRenderPerBatch={14}
              windowSize={7}
              style={styles.wheel}
              contentContainerStyle={styles.wheelContent}
              accessibilityLabel="Word list"
            />
            <View
              style={styles.rail}
              accessibilityLabel="Jump to a letter"
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={railStart}
              onResponderMove={railMove}
              onResponderRelease={railEnd}
              onResponderTerminate={railEnd}>
              {index.letters.map((l) => (
                <View key={l} style={styles.railSlot} pointerEvents="none">
                  <View style={[styles.railPill, l === letter && styles.railPillOn]}>
                    <Text style={[styles.railLetter, l === letter && styles.railLetterOn]}>{l}</Text>
                  </View>
                </View>
              ))}
            </View>
            {scrub ? (
              <View style={[styles.bubble, { top: scrub.y - 32 }]} pointerEvents="none">
                <Text style={styles.bubbleLetter}>{scrub.letter}</Text>
              </View>
            ) : null}
          </>
        ) : null}
        {empty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No saved words yet. Tap Save on any word and it collects here.</Text>
            <Pressable onPress={() => toggleSavedOnly(false)} accessibilityRole="button" style={({ pressed }) => [styles.pill, styles.pillOnColour, pressed && styles.pressed]}>
              <Text style={[styles.pillLabel, { color: '#fff' }]}>Show all words</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: card.bg, height: CARD_HEIGHT + insets.bottom, paddingBottom: insets.bottom + 14 }]}>
        {current ? (
          <>
            <View style={styles.meta}>
              <Text style={[styles.metaText, { color: card.muted }]}>{tagLabel(current.t)}</Text>
              <Text style={[styles.metaText, { color: card.muted }]}>
                {formatCount(at + 1)} of {formatCount(list.length)}
              </Text>
            </View>
            <View style={styles.meanWrap}>
              {open ? (
                <Text style={[styles.mean, { color: card.ink }]} numberOfLines={2}>
                  {current.en}
                </Text>
              ) : (
                <Pressable
                  onPress={() => setRevealed(current.w)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.pill, { borderColor: card.ink }, pressed && styles.pressed]}>
                  <Text style={[styles.pillLabel, { color: card.ink }]}>Show meaning</Text>
                </Pressable>
              )}
            </View>
            {current.ex ? (
              <Text style={[styles.example, { color: card.ink }]} numberOfLines={2} lang="cs">
                {current.ex}
              </Text>
            ) : null}
            {current.exen && open ? (
              <Text style={[styles.exampleEn, { color: card.muted }]} numberOfLines={1}>
                {current.exen}
              </Text>
            ) : null}
            <View style={styles.actions}>
              {voice.state !== 'missing' ? (
                <Pressable onPress={listen} accessibilityRole="button" style={({ pressed }) => [styles.pill, { borderColor: card.ink }, pressed && styles.pressed]}>
                  <Icon name="speaker" size={16} color={card.ink} />
                  <Text style={[styles.pillLabel, { color: card.ink }]}>Listen</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={toggleSave}
                accessibilityRole="button"
                accessibilityState={{ selected: isSaved(current.w) }}
                accessibilityLabel={isSaved(current.w) ? 'Saved. Remove from My words' : 'Save to My words'}
                style={({ pressed }) => [styles.pill, { borderColor: card.ink }, isSaved(current.w) && { backgroundColor: card.ink }, pressed && styles.pressed]}>
                <Icon name={isSaved(current.w) ? 'star' : 'starOutline'} size={16} color={isSaved(current.w) ? card.bg : card.ink} />
                <Text style={[styles.pillLabel, { color: isSaved(current.w) ? card.bg : card.ink }]}>{isSaved(current.w) ? 'Saved' : 'Save'}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

/** A round button in the header; filled white while its mode is on. */
function Tool({ icon, label, colour, pressed, onPress }: { icon: IconName; label: string; colour: string; pressed?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={pressed === undefined ? undefined : { selected: pressed }}
      hitSlop={4}
      style={({ pressed: down }) => [styles.tool, pressed && styles.toolOn, down && styles.pressed]}>
      <Icon name={icon} size={20} color={pressed ? colour : '#fff'} />
    </Pressable>
  );
}

/**
 * One word on the wheel. Its distance from the middle sets everything: the word grows and drops
 * a little as it arrives, the meaning under it fades out (the card shows it instead), and rows
 * near the top and bottom edges fade away.
 */
const WordRow = memo(function WordRow({
  item,
  index,
  saved,
  hide,
  width,
  scrollY,
  half,
  onPress,
}: {
  item: Word;
  index: number;
  saved: boolean;
  hide: boolean;
  width: number;
  scrollY: SharedValue<number>;
  half: SharedValue<number>;
  onPress: (index: number, animated?: boolean) => void;
}) {
  const rowStyle = useAnimatedStyle(() => {
    const d = Math.abs(index - scrollY.get() / ROW);
    const h = half.get();
    const edge = h > 0 ? Math.max(0, Math.min(1, 1 - (d - 0.6 * h) / (0.4 * h))) : 1;
    return { opacity: Math.max(0.3, 1 - d * 0.16) * edge };
  });
  const wordStyle = useAnimatedStyle(() => {
    const near = Math.max(0, 1 - Math.abs(index - scrollY.get() / ROW));
    return { transform: [{ translateY: near * 8 }, { scale: (1 + (GROW - 1) * near) / GROW }] };
  });
  const glossStyle = useAnimatedStyle(() => ({ opacity: hide ? 0 : Math.min(1, Math.abs(index - scrollY.get() / ROW)) }));

  return (
    <Pressable onPress={() => onPress(index, true)} accessibilityRole="button" accessibilityLabel={hide ? item.w : `${item.w}, ${item.en}`}>
      <Animated.View style={[styles.row, rowStyle]}>
        <Animated.View style={[styles.wordWrap, { width: width * GROW }, wordStyle]}>
          <Text style={styles.word} numberOfLines={1} ellipsizeMode="clip" lang="cs">
            {item.w}
          </Text>
          {saved ? <View style={styles.savedDot} /> : null}
        </Animated.View>
        <Animated.Text style={[styles.gloss, { width }, glossStyle]} numberOfLines={1}>
          {item.en}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.7 },

  head: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 14, paddingBottom: 6, paddingLeft: 14, paddingRight: 12 },
  headText: { flex: 1 },
  title: { fontFamily: display.extra, fontSize: 26, lineHeight: 28, letterSpacing: -0.65, color: '#fff' },
  sub: { fontFamily: display.semi, fontSize: 13, lineHeight: 17, marginTop: 3, color: 'rgba(255,255,255,0.85)' },
  tools: { flexDirection: 'row', gap: 8 },
  tool: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  toolOn: { backgroundColor: '#fff', borderColor: '#fff' },

  stage: { flex: 1, overflow: 'hidden' },
  tick: { position: 'absolute', left: 0, top: '50%', width: 13, height: 4, marginTop: -2, backgroundColor: SUN, zIndex: 2 },
  ghost: { position: 'absolute', right: RAIL, fontFamily: display.extra, letterSpacing: -6, color: 'rgba(0,0,0,0.17)' },
  wheel: { flex: 1, marginRight: RAIL },
  wheelContent: { paddingLeft: 22, paddingRight: 8 },

  row: { height: ROW },
  // Set at the focused size and scaled down from its left edge, so the growing word stays sharp.
  wordWrap: { position: 'absolute', left: 0, top: -1, height: 42, flexDirection: 'row', alignItems: 'center', transformOrigin: 'left center' },
  word: { fontFamily: display.bold, fontSize: WORD_SIZE, lineHeight: 42, letterSpacing: -0.57, color: '#fff', flexShrink: 1 },
  savedDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: SUN, marginLeft: 12 },
  gloss: { position: 'absolute', left: 0, top: 32, fontFamily: fonts.displayItalic, fontSize: 15, lineHeight: 18, color: 'rgba(255,255,255,0.88)' },

  rail: { position: 'absolute', right: 0, top: 0, bottom: 0, width: RAIL, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.16)', zIndex: 3 },
  railSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  railPill: { minWidth: 22, height: 16, borderRadius: 8, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  railPillOn: { backgroundColor: SUN },
  railLetter: { fontFamily: display.bold, fontSize: 11, lineHeight: 13, color: 'rgba(255,255,255,0.82)' },
  railLetterOn: { fontFamily: display.extra, color: INK },
  bubble: { position: 'absolute', right: 54, width: 64, height: 64, borderRadius: 32, backgroundColor: SUN, alignItems: 'center', justifyContent: 'center', zIndex: 4, boxShadow: '0 6px 0 rgba(0,0,0,0.18)' },
  bubbleLetter: { fontFamily: display.extra, fontSize: 26, lineHeight: 30, letterSpacing: -0.8, color: INK },

  empty: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'flex-start', gap: 14, paddingHorizontal: 22 },
  emptyText: { fontFamily: display.bold, fontSize: 20, lineHeight: 25, color: '#fff', maxWidth: 340 },

  card: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderCurve: 'continuous', paddingTop: 18, paddingHorizontal: 22 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontFamily: display.semi, fontSize: 13, lineHeight: 17 },
  meanWrap: { minHeight: 40, marginTop: 6, justifyContent: 'center', alignItems: 'flex-start' },
  mean: { fontFamily: display.bold, fontSize: 25, lineHeight: 29, letterSpacing: -0.4 },
  example: { fontFamily: fonts.displayItalic, fontSize: 18.5, lineHeight: 24, marginTop: 10 },
  exampleEn: { fontFamily: display.semi, fontSize: 14, lineHeight: 19, marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 40, paddingHorizontal: 16, borderRadius: 99, borderWidth: 1.5 },
  pillOnColour: { borderColor: '#fff' },
  pillLabel: { fontFamily: display.semi, fontSize: 14, lineHeight: 18 },
});
