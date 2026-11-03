import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text as RNText, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { WordSheet } from '@/components/learn/word-sheet';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { contentById } from '@/lib/learn/content';
import { hasWord } from '@/lib/learn/deck';
import { lexemeById } from '@/lib/learn/lexicon';
import { lookUp, sentenceAround, tokenize, type WordInfo } from '@/lib/learn/text';
import type { LearningContent, Question } from '@/lib/learn/types';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const RATES = [0.7, 0.85, 1] as const;
const kindLabels: Record<LearningContent['kind'], string> = { story: 'Story', dialogue: 'Dialogue', serial: 'Series' };

type Picked = { info: WordInfo | { form: string; lexeme: null }; key: string; example: string };

/** The reader: one text, chapter by chapter, every word tappable. Opens over the tabs. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const content = contentById(id);
  if (!content) return <Redirect href="/learn" />;
  return <Reader content={content} />;
}

function Reader({ content }: { content: LearningContent }) {
  const { colors } = useTheme();
  const saved = useLearn((s) => s.progress[content.id]);
  const deck = useLearn((s) => s.deck);
  const showTranslation = useLearn((s) => s.showTranslation);
  const rate = useLearn((s) => s.rate);
  const voice = useCzechVoice();
  const [chapter, setChapter] = useState(() => saved?.chapter ?? 0);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const playingRef = useRef<number | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const restored = useRef(false);

  const current = content.chapters[chapter];
  const last = chapter === content.chapters.length - 1;

  // Opening a chapter records it, so Learn's home can offer to continue here.
  useEffect(() => {
    useLearn.getState().open(content.id, chapter);
  }, [content.id, chapter]);

  const stop = useCallback(() => {
    playingRef.current = null;
    setPlaying(null);
    stopSpeaking();
  }, []);

  // Leaving the reader stops the voice.
  useFocusEffect(useCallback(() => stop, [stop]));

  /** Reads from paragraph `i` to the end of the chapter, one paragraph at a time. */
  const playFrom = (i: number) => {
    if (i >= current.paragraphs.length) return stop();
    playingRef.current = i;
    setPlaying(i);
    speak(current.paragraphs[i].cs, {
      voice: voice.voice,
      rate,
      onDone: () => {
        if (playingRef.current === i) playFrom(i + 1);
      },
    });
  };

  /** One paragraph only, for hearing a line again. */
  const playOne = (i: number) => {
    playingRef.current = -1;
    setPlaying(i);
    speak(current.paragraphs[i].cs, {
      voice: voice.voice,
      rate,
      onDone: () => {
        if (playingRef.current === -1) {
          playingRef.current = null;
          setPlaying(null);
        }
      },
    });
  };

  const goTo = (next: number) => {
    stop();
    setPicked(null);
    restored.current = true;
    setChapter(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const onWord = (form: string, paragraph: string, at: number, key: string) => {
    const info = lookUp(content, form);
    setPicked({ info: info ?? { form, lexeme: null }, key, example: sentenceAround(paragraph, at) });
  };

  const rememberPlace = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    useLearn.getState().saveOffset(content.id, chapter, e.nativeEvent.contentOffset.y);

  const canSpeak = voice.state === 'available';

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <Stack.Screen
        options={{
          title: content.chapters.length > 1 ? `${chapter + 1} / ${content.chapters.length}` : '',
          headerStyle: { backgroundColor: colors.paper },
          contentStyle: { backgroundColor: colors.paper },
          headerRight: () => (
            <Pressable
              onPress={() => useLearn.getState().toggleBookmark(content.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={saved?.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              style={styles.headerButton}>
              <Icon name={saved?.bookmarked ? 'bookmarkFill' : 'bookmark'} size={22} color={colors.accent} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        ref={scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        scrollEventThrottle={250}
        onScrollEndDrag={rememberPlace}
        onMomentumScrollEnd={rememberPlace}
        onContentSizeChange={() => {
          // Back to where the reader stopped, once, when the chapter has laid out.
          if (restored.current) return;
          restored.current = true;
          const offset = useLearn.getState().progress[content.id]?.offset ?? 0;
          if (offset > 0) scroll.current?.scrollTo({ y: offset, animated: false });
        }}>
        <View style={styles.titleBlock}>
          <Text variant="footnote" weight="600" color="label2">
            {[content.level, kindLabels[content.kind], `${content.minutes} min`].join(' · ')}
          </Text>
          <Text variant="largeTitle" accessibilityRole="header">
            {current.title}
          </Text>
          <Text variant="callout" color="label2">
            {current.titleEn}
          </Text>
        </View>

        {content.chapters.length > 1 && (
          <View style={styles.chapters} accessibilityRole="tablist">
            {content.chapters.map((c, i) => (
              <Chip key={c.id} label={`Chapter ${i + 1}`} selected={i === chapter} onPress={() => i !== chapter && goTo(i)} />
            ))}
          </View>
        )}

        <View style={styles.tools}>
          <Chip
            label="English"
            role="checkbox"
            selected={showTranslation}
            onPress={() => useLearn.getState().setShowTranslation(!showTranslation)}
          />
          {canSpeak && (
            <>
              <Pressable
                onPress={() => (playing === null ? playFrom(0) : stop())}
                accessibilityRole="button"
                accessibilityLabel={playing === null ? 'Listen to this chapter' : 'Stop'}
                style={({ pressed }) => [styles.listen, { backgroundColor: colors.label, opacity: pressed ? 0.8 : 1 }]}>
                <Icon name={playing === null ? 'play' : 'pause'} size={16} color={colors.background} />
                <Text variant="subhead" weight="600" style={{ color: colors.background }} chrome>
                  {playing === null ? 'Listen' : 'Stop'}
                </Text>
              </Pressable>
              <Chip
                label={`${rate}×`}
                selected={false}
                onPress={() => {
                  const next = RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length];
                  useLearn.getState().setRate(next);
                  announce(`Speed ${next}`);
                }}
              />
            </>
          )}
        </View>
        {voice.state === 'missing' && (
          <Text variant="footnote" color="label2" style={styles.voiceNote}>
            No Czech voice on this phone, so there’s no audio. On iPhone you can add one in Settings › Accessibility › Spoken Content › Voices.
          </Text>
        )}
        {canSpeak && (
          <Text variant="caption" color="label3" style={styles.voiceNote}>
            Your phone’s synthesized Czech voice
          </Text>
        )}

        <View style={styles.paragraphs}>
          {current.paragraphs.map((p, pi) => (
            <View key={pi} style={[styles.paragraph, playing === pi && { backgroundColor: colors.accentSoft }]}>
              {p.speaker && (
                <Text variant="footnote" weight="700" color="label2" style={styles.speaker}>
                  {p.speaker}
                </Text>
              )}
              <ReadingText text={p.cs} paragraph={pi} pickedKey={picked?.key} onWord={onWord} />
              {showTranslation && (
                <Text variant="callout" color="label2" style={styles.translation}>
                  {p.en}
                </Text>
              )}
              {canSpeak && (
                <Pressable onPress={() => playOne(pi)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Hear this again" style={styles.again}>
                  <Icon name="speaker" size={16} color={colors.label3} />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {!last ? (
          <Button
            label="Next chapter"
            icon="arrowRight"
            onPress={() => {
              useLearn.getState().completeChapter(content.id, chapter);
              goTo(chapter + 1);
            }}
          />
        ) : (
          <>
            <Questions content={content} />
            <StoryWords content={content} deck={deck} />
            <Button
              label="Finish"
              icon="check"
              onPress={() => {
                useLearn.getState().completeChapter(content.id, chapter);
                router.back();
              }}
            />
          </>
        )}
      </ScrollView>

      {picked && (
        <WordSheet
          info={picked.info}
          saved={!!picked.info.lexeme && hasWord(deck, picked.info.lexeme.id)}
          canSpeak={canSpeak}
          onSpeak={(text) => speak(text, { voice: voice.voice, rate })}
          onSave={() => picked.info.lexeme && useLearn.getState().saveWord(picked.info.lexeme.id, { cs: picked.example, contentId: content.id })}
          onClose={() => setPicked(null)}
        />
      )}
    </View>
  );
}

/**
 * One paragraph with every word tappable. VoiceOver can't step into words inside a paragraph, so
 * each distinct word is also a "Look up" action on it, reachable with the Actions rotor.
 */
function ReadingText({ text, paragraph, pickedKey, onWord }: { text: string; paragraph: number; pickedKey?: string; onWord: (form: string, paragraph: string, at: number, key: string) => void }) {
  const { colors } = useTheme();
  const { tokens, starts, actions } = useMemo(() => {
    const tokens = tokenize(text);
    const starts = tokens.map((_, ti) => tokens.slice(0, ti).reduce((n, t) => n + t.text.length, 0));
    const seen = new Set<string>();
    const actions = tokens.flatMap((t, ti) => {
      const form = t.text.toLocaleLowerCase('cs');
      if (!t.word || seen.has(form)) return [];
      seen.add(form);
      return [{ name: `w${ti}`, label: `Look up ${t.text}` }];
    });
    return { tokens, starts, actions };
  }, [text]);

  return (
    <RNText
      style={[styles.reading, { color: colors.label }]}
      maxFontSizeMultiplier={2}
      accessible
      accessibilityLabel={text}
      accessibilityHint="Has actions to look up each word"
      accessibilityActions={actions}
      onAccessibilityAction={(e) => {
        const ti = Number(e.nativeEvent.actionName.slice(1));
        if (tokens[ti]) onWord(tokens[ti].text, text, starts[ti], `${paragraph}:${ti}`);
      }}>
      {tokens.map((t, ti) => {
        if (!t.word) return t.text;
        const key = `${paragraph}:${ti}`;
        return (
          <RNText
            key={key}
            onPress={() => onWord(t.text, text, starts[ti], key)}
            suppressHighlighting
            style={pickedKey === key ? [styles.picked, { backgroundColor: colors.accentSoft, color: colors.accent }] : undefined}>
            {t.text}
          </RNText>
        );
      })}
    </RNText>
  );
}

function Questions({ content }: { content: LearningContent }) {
  // Select the stored object itself: a fresh {} on every read would re-render without end.
  const answers = useLearn((s) => s.progress[content.id]?.answers);
  return (
    <View style={styles.section}>
      <SectionHeader title="Did you get it?" />
      {content.questions.map((q) => (
        <QuestionCard key={q.id} contentId={content.id} q={q} chosen={answers?.[q.id]} />
      ))}
    </View>
  );
}

function QuestionCard({ contentId, q, chosen }: { contentId: string; q: Question; chosen?: number }) {
  const { colors } = useTheme();
  const answered = chosen !== undefined;
  return (
    <View style={[styles.question, { backgroundColor: colors.surface }]}>
      <Text variant="headline">{q.cs}</Text>
      <Text variant="footnote" color="label2">
        {q.en}
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {q.options.map((o, i) => {
          const right = answered && i === q.answer;
          const wrong = answered && i === chosen && i !== q.answer;
          return (
            <Pressable
              key={o}
              onPress={() => {
                useLearn.getState().answer(contentId, q.id, i);
                announce(i === q.answer ? 'Right' : `Not quite. The answer is ${q.options[q.answer]}`);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen === i }}
              style={[
                styles.option,
                { borderColor: right ? colors.success : wrong ? colors.danger : colors.separator, backgroundColor: right ? colors.successSoft : wrong ? colors.dangerSoft : 'transparent' },
              ]}>
              <Text variant="callout" style={styles.optionText}>
                {o}
              </Text>
              {right && <Icon name="check" size={16} color={colors.success} />}
              {wrong && <Icon name="close" size={16} color={colors.danger} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StoryWords({ content, deck }: { content: LearningContent; deck: ReturnType<typeof useLearn.getState>['deck'] }) {
  const { colors } = useTheme();
  const words = useMemo(() => content.vocabulary.map((id) => lexemeById(id)).filter((l) => !!l), [content.vocabulary]);
  const unsaved = words.filter((l) => !hasWord(deck, l.id));
  return (
    <View style={styles.section}>
      <SectionHeader
        title="Words from this text"
        action={
          unsaved.length > 0 ? (
            <Pressable onPress={() => unsaved.forEach((l) => useLearn.getState().saveWord(l.id, { cs: '', contentId: content.id }))} hitSlop={10} accessibilityRole="button">
              <Text variant="subhead" weight="600" color="accent" chrome>
                Save all
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      <View style={[styles.wordList, { backgroundColor: colors.surface }]}>
        {words.map((l, i) => {
          const isSaved = hasWord(deck, l.id);
          return (
            <View key={l.id} style={[styles.wordRow, i > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.wordText}>
                <Text variant="callout" weight="600">
                  {l.lemma}
                </Text>
                <Text variant="footnote" color="label2">
                  {l.en}
                </Text>
              </View>
              <Pressable
                onPress={() => !isSaved && useLearn.getState().saveWord(l.id, { cs: '', contentId: content.id })}
                disabled={isSaved}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? `${l.lemma} saved` : `Save ${l.lemma}`}
                style={[styles.saveWord, { backgroundColor: isSaved ? colors.successSoft : colors.accentSoft }]}>
                <Icon name={isSaved ? 'check' : 'plus'} size={16} color={isSaved ? colors.success : colors.accent} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingTop: space.lg, paddingBottom: 240, gap: space.xl, maxWidth: layout.maxWidth, width: '100%', alignSelf: 'center' },
  headerButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { gap: space.xs },
  chapters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tools: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
  listen: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.pill },
  voiceNote: { marginTop: -space.md, paddingHorizontal: space.xs },
  paragraphs: { gap: space.lg },
  paragraph: { borderRadius: radius.tile, borderCurve: 'continuous', paddingVertical: space.sm, paddingHorizontal: space.sm, marginHorizontal: -space.sm, gap: space.xs },
  speaker: { textTransform: 'uppercase', letterSpacing: 0.6 },
  reading: { fontSize: 22, lineHeight: 34, letterSpacing: -0.2 },
  picked: { borderRadius: 4 },
  translation: { fontStyle: 'italic' },
  again: { alignSelf: 'flex-start', minHeight: 28, justifyContent: 'center' },
  section: { gap: space.md },
  question: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.xs },
  options: { gap: space.sm, marginTop: space.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48, paddingHorizontal: space.lg, borderRadius: radius.tile, borderWidth: 1.5 },
  optionText: { flex: 1 },
  wordList: { borderRadius: radius.card, borderCurve: 'continuous', paddingHorizontal: space.lg },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingVertical: space.sm },
  wordText: { flex: 1, gap: 2 },
  saveWord: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
