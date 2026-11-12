import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { checkWrite, gradeChoice, gradeType, optionOrder } from '@/lib/academy/grade';
import { tilesFor } from '@/lib/academy/lesson-steps';
import type { ChoiceExercise, Exercise, TypeExercise, WriteExercise } from '@/lib/academy/types';
import { radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export type Say = (text: string, slow?: boolean) => void;

type Props = {
  exercise: Exercise;
  /** Guided practice lets a wrong answer be tried again; a check takes the first answer. */
  mode: 'practise' | 'check';
  canListen: boolean;
  say: Say;
  /**
   * Called once, with the first answer's mark: true or false, or null for a written answer the
   * learner checks themselves.
   */
  onAnswered: (correct: boolean | null) => void;
  onNext: () => void;
  nextLabel?: string;
  /** Words the lesson teaches: a few are mixed into the tiles of an answer that is built from words. */
  words?: readonly string[];
};

const haptic = (ok: boolean) => {
  if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
};

/** One exercise, its feedback and the button on to the next. */
export function ExerciseView(props: Props) {
  const { exercise } = props;
  if (exercise.kind === 'choice') return <Choice key={exercise.id} {...props} exercise={exercise} />;
  if (exercise.kind === 'type') return <Typed key={exercise.id} {...props} exercise={exercise} />;
  return <Written key={exercise.id} {...props} exercise={exercise} />;
}

function Prompt({ text, czech, listen, canListen, say }: { text: string; czech?: string; listen?: boolean; canListen: boolean; say: Say }) {
  const { colors } = useTheme();
  return (
    <View style={styles.prompt}>
      <Text variant="title3" accessibilityRole="header">
        {text}
      </Text>
      {czech && listen ? (
        <SpeakRow text={czech} say={say} canListen={canListen} />
      ) : czech ? (
        <View style={[styles.passage, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
          <Text variant="body" lang="cs">
            {czech}
          </Text>
          {canListen ? <SpeakRow text={czech} say={say} canListen compact /> : null}
        </View>
      ) : null}
    </View>
  );
}

export function SpeakRow({ text, say, canListen, compact }: { text: string; say: Say; canListen: boolean; compact?: boolean }) {
  const { colors } = useTheme();
  if (!canListen) return null;
  return (
    <View style={styles.speakRow}>
      <Pressable
        onPress={() => say(text)}
        accessibilityRole="button"
        accessibilityLabel="Play"
        style={[compact ? styles.speakSmall : styles.speak, { backgroundColor: colors.accentSoft }]}>
        <Icon name="speaker" size={compact ? 18 : 24} color={colors.accent} />
      </Pressable>
      <Pressable onPress={() => say(text, true)} accessibilityRole="button" accessibilityLabel="Play slowly" hitSlop={8}>
        <Text variant="subhead" weight="600" color="accent" chrome>
          Slower
        </Text>
      </Pressable>
    </View>
  );
}

function Feedback({ ok, title, body }: { ok: boolean | null; title: string; body?: string }) {
  const { colors } = useTheme();
  const tone = ok === null ? colors.accent : ok ? colors.success : colors.danger;
  const soft = ok === null ? colors.accentSoft : ok ? colors.successSoft : colors.dangerSoft;
  return (
    <Animated.View entering={FadeIn.duration(180)} style={[styles.feedback, { backgroundColor: soft }]} accessibilityLiveRegion="polite">
      <View style={styles.feedbackHead}>
        <Icon name={ok === null ? 'info' : ok ? 'checkCircle' : 'alert'} size={20} color={tone} />
        <Text variant="headline" style={styles.flex}>
          {title}
        </Text>
      </View>
      {body ? (
        <Text variant="callout" color="label2">
          {body}
        </Text>
      ) : null}
    </Animated.View>
  );
}

function Choice({ exercise: e, mode, canListen, say, onAnswered, onNext, nextLabel = 'Next' }: Props & { exercise: ChoiceExercise }) {
  const { colors } = useTheme();
  const [chosen, setChosen] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [reported, setReported] = useState(false);
  // A listening item plays as it appears.
  useEffect(() => {
    if (e.listen && e.text && canListen) say(e.text);
  }, [e, canListen, say]);

  const settled = chosen !== null && (gradeChoice(e, chosen) || mode === 'check');
  const pick = (i: number) => {
    if (settled) return;
    const ok = gradeChoice(e, i);
    if (!reported) {
      onAnswered(ok);
      setReported(true);
    }
    haptic(ok);
    announce(ok ? 'Right' : mode === 'practise' ? 'Not quite. Try again.' : `Not quite. It was ${e.options[e.answer]}`);
    setChosen(i);
    if (!ok) setWrong((w) => [...w, i]);
  };

  return (
    <View style={styles.body}>
      <Prompt text={e.prompt} czech={e.text} listen={e.listen} canListen={canListen} say={say} />
      <View style={styles.options} accessibilityRole="radiogroup">
        {optionOrder(e).map((i) => {
          const o = e.options[i];
          const state = settled && i === e.answer ? 'right' : wrong.includes(i) ? 'wrong' : 'idle';
          return (
            <Pressable
              key={o}
              onPress={() => pick(i)}
              disabled={settled || wrong.includes(i)}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen === i, disabled: settled || wrong.includes(i) }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: state === 'right' ? colors.successSoft : state === 'wrong' ? colors.dangerSoft : pressed ? colors.fill : colors.surface,
                  borderColor: state === 'right' ? colors.success : state === 'wrong' ? colors.danger : colors.separator,
                },
              ]}>
              <Text variant="callout" weight="500" style={styles.flex} lang={/[áčďéěíňóřšťúůýž]/i.test(o) ? 'cs' : undefined}>
                {o}
              </Text>
              {state !== 'idle' ? <Icon name={state === 'right' ? 'checkCircle' : 'close'} size={20} color={state === 'right' ? colors.success : colors.danger} /> : null}
            </Pressable>
          );
        })}
      </View>
      {settled ? (
        <>
          <Feedback ok={gradeChoice(e, chosen!)} title={gradeChoice(e, chosen!) ? 'Right' : `It’s “${e.options[e.answer]}”`} body={e.explain} />
          {e.listen && e.text ? (
            <Text variant="callout" color="label2" lang="cs">
              You heard: {e.text}
            </Text>
          ) : null}
          <Button label={nextLabel} onPress={onNext} />
        </>
      ) : chosen !== null ? (
        <Text variant="footnote" color="label2">
          Not quite. Try another answer.
        </Text>
      ) : null}
    </View>
  );
}

/**
 * A sentence to put into Czech. By default it is built from word tiles, so nobody has to hunt for
 * háčky and čárky on a phone keyboard; "Type it instead" brings the keyboard for those who want
 * it. Typed answers that differ only in their accents count as right, with the spelling shown.
 */
function Typed({ exercise: e, mode, canListen, say, onAnswered, onNext, nextLabel = 'Next', words }: Props & { exercise: TypeExercise }) {
  const { colors } = useTheme();
  const tiles = useMemo(() => tilesFor(e.accept[0], words ?? [], e.id), [e, words]);
  const [picked, setPicked] = useState<number[]>([]);
  const [keyboard, setKeyboard] = useState(false);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<ReturnType<typeof gradeType> | null>(null);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const answer = keyboard ? value : picked.map((i) => tiles[i]).join(' ');
  const right = !!result && (result.correct || result.accentsOnly);
  const settled = !!result && (right || mode === 'check' || revealed);

  const submit = () => {
    if (!answer.trim() || settled) return;
    const r = gradeType(e, answer);
    const ok = r.correct || r.accentsOnly;
    if (tries === 0) onAnswered(ok);
    setTries((t) => t + 1);
    setResult(r);
    haptic(ok);
    announce(ok ? 'Right' : 'Not quite');
  };
  const change = () => {
    if (!settled) setResult(null);
  };

  return (
    <View style={styles.body}>
      <Prompt text={e.prompt} czech={e.text} canListen={canListen} say={say} />
      {keyboard ? (
        <TextInput
          value={value}
          onChangeText={(t) => {
            setValue(t);
            change();
          }}
          editable={!settled}
          autoFocus
          placeholder="Type in Czech"
          autoCapitalize="sentences"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          onSubmitEditing={submit}
          accessibilityLabel="Your answer in Czech"
          placeholderTextColor={colors.label3}
          style={[styles.input, ramp.body, { color: colors.label, backgroundColor: colors.surface, borderColor: result ? (right ? colors.success : colors.danger) : colors.separator }]}
        />
      ) : (
        <>
          <View
            style={[styles.built, { backgroundColor: colors.surface, borderColor: result ? (right ? colors.success : colors.danger) : colors.separator }]}
            accessibilityLabel={picked.length ? `Your answer: ${answer}` : 'Your answer: empty. Tap the words below in order.'}>
            {picked.length === 0 ? (
              <Text variant="callout" color="label3">
                Tap the words in order
              </Text>
            ) : (
              picked.map((i, at) => (
                <Pressable
                  key={`${i}`}
                  onPress={() => {
                    if (settled) return;
                    setPicked((p) => p.filter((_, k) => k !== at));
                    change();
                  }}
                  disabled={settled}
                  accessibilityRole="button"
                  accessibilityLabel={`${tiles[i]}, remove`}
                  style={[styles.tile, { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }]}>
                  <Text variant="callout" weight="600" lang="cs" style={{ color: colors.accent }}>
                    {tiles[i]}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
          <View style={styles.pool}>
            {tiles.map((w, i) => {
              const used = picked.includes(i);
              return (
                <Pressable
                  key={`${i}`}
                  onPress={() => {
                    if (settled || used) return;
                    setPicked((p) => [...p, i]);
                    change();
                  }}
                  disabled={settled || used}
                  accessibilityRole="button"
                  accessibilityLabel={w}
                  accessibilityState={{ disabled: settled || used }}
                  style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? colors.fill : colors.surface, borderColor: colors.separator, opacity: used ? 0.25 : 1 }]}>
                  <Text variant="callout" weight="600" lang="cs">
                    {w}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
      {settled ? (
        <>
          <Feedback
            ok={right}
            title={right ? 'Right' : `It’s “${e.accept[0]}”`}
            body={result!.accentsOnly ? `Written with its accents: “${e.accept[0]}”. ${e.explain}` : e.explain}
          />
          {canListen ? <SpeakRow text={e.accept[0]} say={say} canListen compact /> : null}
          <Button label={nextLabel} onPress={onNext} />
        </>
      ) : (
        <>
          {result ? (
            <Text variant="footnote" color="danger">
              Not quite. Change it and try again.
            </Text>
          ) : null}
          <View style={styles.row}>
            {result ? <Button label="Show the answer" variant="secondary" onPress={() => setRevealed(true)} style={styles.flex} /> : null}
            <Button label="Check" onPress={submit} disabled={!answer.trim()} style={styles.flex} />
          </View>
          <Pressable
            onPress={() => {
              setKeyboard((k) => !k);
              setResult(null);
            }}
            accessibilityRole="button"
            hitSlop={8}
            style={styles.switch}>
            <Icon name={keyboard ? 'text' : 'keyboard'} size={16} color={colors.accent} />
            <Text variant="subhead" weight="600" color="accent" chrome>
              {keyboard ? 'Use word tiles' : 'Type it instead'}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function Written({ exercise: e, canListen, say, onAnswered, onNext, nextLabel = 'Next' }: Props & { exercise: WriteExercise }) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  const [example, setExample] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>(() => e.selfCheck.map(() => false));
  const check = checkWrite(e, value);

  const submit = () => {
    if (!value.trim() || sent) return;
    setSent(true);
    onAnswered(null);
  };

  return (
    <View style={styles.body}>
      <Prompt text={e.prompt} canListen={canListen} say={say} />
      <View style={[styles.passage, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        <Text variant="headline" lang="cs">
          {e.question}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        editable={!sent}
        multiline
        placeholder="Write in Czech"
        autoCorrect={false}
        spellCheck={false}
        accessibilityLabel="Your answer in Czech"
        placeholderTextColor={colors.label3}
        style={[styles.input, styles.multi, ramp.body, { color: colors.label, backgroundColor: colors.surface, borderColor: colors.separator }]}
      />
      <View style={styles.rules}>
        <Rule ok={check.enoughWords} label={check.enoughWords ? `${check.words} words` : `${check.words} of ${e.minWords} words`} />
        <Rule ok={check.capital} label="Capital letter" />
        <Rule ok={check.endsWithStop} label="Full stop" />
      </View>
      {sent ? (
        <>
          <Feedback ok={null} title="Check it yourself" body={`A model answer: ${e.sample}`} />
          <View style={styles.ticks}>
            {e.selfCheck.map((c, i) => (
              <Pressable
                key={c}
                onPress={() => setTicks((t) => t.map((x, j) => (j === i ? !x : x)))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ticks[i] }}
                style={styles.tick}>
                <Icon name={ticks[i] ? 'checkCircle' : 'circle'} size={22} color={ticks[i] ? colors.accent : colors.label3} />
                <Text variant="callout" style={styles.flex}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="footnote" color="label3">
            Written answers aren’t scored here. Only the word count, capital and full stop are checked, as in the exam’s rules.
          </Text>
          <Button label={nextLabel} onPress={onNext} />
        </>
      ) : (
        <>
          {example ? (
            <Feedback ok={null} title="An example" body={e.sample} />
          ) : (
            <Pressable onPress={() => setExample(true)} accessibilityRole="button" hitSlop={8} style={styles.switch}>
              <Icon name="info" size={16} color={colors.accent} />
              <Text variant="subhead" weight="600" color="accent" chrome>
                Show me an example first
              </Text>
            </Pressable>
          )}
          <Button label="Done" onPress={submit} disabled={!value.trim()} />
          {/* Writing is the hardest part for a beginner: it can wait, and nothing is lost by leaving it. */}
          <Button
            label="Skip the writing for now"
            variant="plain"
            onPress={() => {
              onAnswered(null);
              onNext();
            }}
          />
        </>
      )}
    </View>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.rule, { backgroundColor: ok ? colors.successSoft : colors.fill }]}>
      <Icon name={ok ? 'check' : 'circle'} size={14} color={ok ? colors.success : colors.label3} />
      <Text variant="footnote" weight="600" color={ok ? 'success' : 'label2'} tabular>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { gap: space.lg },
  prompt: { gap: space.md },
  passage: { borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, gap: space.md },
  speakRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  speak: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  speakSmall: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  options: { gap: space.sm },
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
  feedback: { borderRadius: radius.tile, padding: space.lg, gap: space.sm },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  built: { minHeight: 64, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm, borderWidth: 1.5, borderRadius: radius.tile, borderCurve: 'continuous', padding: space.md },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.well, borderCurve: 'continuous', borderWidth: 1.5 },
  switch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, minHeight: 36 },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: radius.tile, paddingHorizontal: space.lg, paddingVertical: space.md },
  multi: { minHeight: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: space.sm },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  ticks: { gap: space.xs },
  tick: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
});
