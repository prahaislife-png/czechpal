import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { EXAM_PLAYS, gradeItem, isWriteItem, itemOptions, LETTERS, type Answers } from '@/lib/academy/tasks';
import type { TaskItem, TaskSet } from '@/lib/academy/types';
import { radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The parts of an exam task, shared by practice and the mock exam: the text, the recording with
 * its plays, the answer (options or written information) and the review of answers.
 */

export type TaskMode = 'learn' | 'exam';

export function Passage({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.passage, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <Text variant="body" lang="cs">
        {text}
      </Text>
    </View>
  );
}

export function Recording({ label, playsUsed, mode, onPlay }: { label: string; playsUsed: number; mode: TaskMode; onPlay: (slow: boolean) => void }) {
  const { colors } = useTheme();
  const left = EXAM_PLAYS - playsUsed;
  const blocked = mode === 'exam' && left <= 0;
  return (
    <View style={[styles.recording, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <Pressable
        onPress={() => onPlay(false)}
        disabled={blocked}
        accessibilityRole="button"
        accessibilityLabel={`Play ${label.toLowerCase()}`}
        accessibilityState={{ disabled: blocked }}
        style={[styles.play, { backgroundColor: blocked ? colors.fill : colors.accentFill }]}>
        <Icon name="play" size={22} color={blocked ? colors.label3 : colors.onAccent} />
      </Pressable>
      <View style={styles.flex}>
        <Text variant="headline">{label}</Text>
        <Text variant="footnote" color="label2">
          {mode === 'exam' ? (left > 0 ? `${left} ${left === 1 ? 'play' : 'plays'} left` : 'Played twice') : 'Play as often as you like'}
        </Text>
      </View>
      {mode === 'learn' ? (
        <Pressable onPress={() => onPlay(true)} accessibilityRole="button" accessibilityLabel="Play slowly" hitSlop={8}>
          <Text variant="subhead" weight="600" color="accent" chrome>
            Slower
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ItemAnswer({
  set,
  item,
  mode,
  committed,
  onCommit,
  examNote,
}: {
  set: TaskSet;
  item: TaskItem;
  mode: TaskMode;
  committed: number | string | undefined;
  onCommit: (a: number | string) => void;
  /** Shown under a chosen answer in exam mode: how long it can still change. */
  examNote?: string;
}) {
  const { colors } = useTheme();
  const [typed, setTyped] = useState('');
  const shown = mode === 'learn' && committed !== undefined;
  const locked = mode === 'learn' && committed !== undefined;
  const result = committed !== undefined ? gradeItem(item, committed) : null;

  useEffect(() => {
    if (!shown || !result) return;
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(result.correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    announce(result.correct ? 'Right' : 'Not quite');
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isWriteItem(item))
    return (
      <View style={styles.answer}>
        <TextInput
          value={mode === 'exam' ? String(committed ?? '') : committed !== undefined ? String(committed) : typed}
          onChangeText={(t) => (mode === 'exam' ? onCommit(t.trim() ? t : '') : setTyped(t))}
          editable={!locked}
          placeholder="Write the information in Czech"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          onSubmitEditing={() => mode === 'learn' && typed.trim() && onCommit(typed.trim())}
          accessibilityLabel="Your answer"
          placeholderTextColor={colors.label3}
          style={[
            styles.input,
            ramp.body,
            { color: colors.label, backgroundColor: colors.surface, borderColor: shown ? (result!.correct ? colors.success : colors.danger) : colors.separator },
          ]}
        />
        {mode === 'learn' && committed === undefined ? <Button label="Check" disabled={!typed.trim()} onPress={() => onCommit(typed.trim())} /> : null}
        {shown ? <Feedback ok={result!.correct} title={result!.correct ? 'Right' : `For example: ${item.accept![0]}`} body={(result!.accentsOnly ? 'Only the accents differ. ' : '') + item.explain} /> : null}
      </View>
    );

  const options = itemOptions(set, item);
  const icons = item.options ? undefined : set.choices?.map((c) => c.icon as IconName | undefined);
  return (
    <View style={styles.answer} accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const chosen = committed === i;
        const state = !shown ? (chosen ? 'chosen' : 'idle') : i === item.answer ? 'right' : chosen ? 'wrong' : 'idle';
        return (
          <Pressable
            key={i}
            onPress={() => onCommit(i)}
            disabled={locked}
            accessibilityRole="radio"
            accessibilityState={{ checked: chosen, disabled: locked }}
            accessibilityLabel={`${LETTERS[i]}: ${o}`}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor:
                  state === 'right' ? colors.successSoft : state === 'wrong' ? colors.dangerSoft : state === 'chosen' ? colors.accentSoft : pressed ? colors.fill : colors.surface,
                borderColor: state === 'right' ? colors.success : state === 'wrong' ? colors.danger : state === 'chosen' ? colors.accent : colors.separator,
              },
            ]}>
            <Text variant="headline" color="accent" style={styles.letter}>
              {LETTERS[i]}
            </Text>
            {icons?.[i] ? <Icon name={icons[i]!} size={22} color={colors.label2} /> : null}
            <Text variant="callout" weight="500" lang="cs" style={styles.flex}>
              {o}
            </Text>
          </Pressable>
        );
      })}
      {shown ? <Feedback ok={result!.correct} title={result!.correct ? 'Right' : `It’s ${LETTERS[item.answer!]}`} body={item.explain} /> : null}
      {mode === 'exam' && committed !== undefined && examNote ? (
        <Text variant="footnote" color="label3">
          {examNote}
        </Text>
      ) : null}
    </View>
  );
}

function Feedback({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(160)} style={[styles.feedback, { backgroundColor: ok ? colors.successSoft : colors.dangerSoft }]} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <Icon name={ok ? 'checkCircle' : 'alert'} size={20} color={ok ? colors.success : colors.danger} />
        <Text variant="headline" style={styles.flex}>
          {title}
        </Text>
      </View>
      <Text variant="callout" color="label2">
        {body}
      </Text>
    </Animated.View>
  );
}

/** Each item: your answer, the right one when yours was wrong, and why. */
export function AnswerReview({ entries, answers, explainAll }: { entries: { set: TaskSet; item: TaskItem }[]; answers: Answers; explainAll: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.review, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      {entries.map(({ set, item }, i) => {
        const a = answers[item.id];
        const r = gradeItem(item, a);
        const yours = a === undefined || a === '' ? '—' : typeof a === 'number' ? `${LETTERS[a]}: ${itemOptions(set, item)[a]}` : a;
        const correct = item.accept ? item.accept[0] : `${LETTERS[item.answer!]}: ${itemOptions(set, item)[item.answer!]}`;
        return (
          <View key={item.id}>
            {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
            <View style={styles.reviewRow}>
              <Icon name={r.correct ? 'checkCircle' : 'alert'} size={20} color={r.correct ? colors.success : colors.danger} />
              <View style={styles.flex}>
                <Text variant="subhead" weight="600" lang="cs">
                  {item.prompt}
                </Text>
                <Text variant="footnote" color="label2" lang="cs">
                  You: {yours}
                </Text>
                {!r.correct ? (
                  <Text variant="footnote" color="success" lang="cs">
                    Right: {correct}
                  </Text>
                ) : null}
                {!r.correct || explainAll ? (
                  <Text variant="footnote" color="label3">
                    {(r.accentsOnly ? 'Only the accents differ. ' : '') + item.explain}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  passage: { borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  recording: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.md },
  play: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  answer: { gap: space.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  letter: { width: 20 },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: radius.tile, paddingHorizontal: space.lg, paddingVertical: space.md },
  feedback: { borderRadius: radius.tile, padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  review: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg },
  reviewRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.md },
});
