import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { WritingFeedbackCard } from '@/components/academy/writing-feedback';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { emailChecks, formChecks } from '@/lib/academy/tasks';
import { writingTaskById } from '@/lib/academy/tasks/writing';
import type { WritingTask } from '@/lib/academy/types';
import { EMAIL_MIN_WORDS, examParts, examTasks, FORM_MIN_WORDS } from '@/lib/learn/exam';
import { useAcademy } from '@/store/academy';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The writing coach: the exam's form or e-mail, with its own rules checked as you write (word
 * count, the e-mail's 35-word zero rule, opening, closing, signature, a sentence per picture). It
 * doesn't give a score; the rest is a checklist and a model answer.
 */
const WRITING_MINUTES = examParts.find((p) => p.id === 'writing')!.minutes;

export default function WritingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = writingTaskById(id);
  if (!task)
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="callout" color="label2">
          This task isn’t available.
        </Text>
      </View>
    );
  return (
    <>
      <Stack.Screen options={{ title: task.kind === 'form' ? 'Writing 1: form' : 'Writing 2: e-mail', headerLeft: () => <HeaderCloseButton /> }} />
      {task.kind === 'form' ? <FormCoach task={task} /> : <EmailCoach task={task} />}
    </>
  );
}

function Instruction({ task }: { task: WritingTask }) {
  const points = examTasks.find((t) => t.part === 'writing' && t.n === (task.kind === 'form' ? 1 : 2))?.points;
  return (
    <Card style={styles.card}>
      <Text variant="headline" lang="cs">
        {task.instructionCs}
      </Text>
      <Text variant="subhead" color="label2">
        {task.instruction}
      </Text>
      {points ? (
        <Text variant="footnote" color="label3">
          In the exam: {points} points, with {WRITING_MINUTES} minutes for both writing tasks.
        </Text>
      ) : null}
    </Card>
  );
}

function Chip({ ok, label, bad }: { ok: boolean; label: string; bad?: boolean }) {
  const { colors } = useTheme();
  const tone = ok ? colors.success : bad ? colors.danger : colors.label3;
  return (
    <View style={[styles.chip, { backgroundColor: ok ? colors.successSoft : bad ? colors.dangerSoft : colors.fill }]}>
      <Icon name={ok ? 'check' : bad ? 'alert' : 'circle'} size={14} color={tone} />
      <Text variant="footnote" weight="600" color={ok ? 'success' : bad ? 'danger' : 'label2'} tabular>
        {label}
      </Text>
    </View>
  );
}

function Checklist({ items }: { items: string[] }) {
  const { colors } = useTheme();
  const [ticks, setTicks] = useState<boolean[]>(() => items.map(() => false));
  return (
    <View>
      {items.map((c, i) => (
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
  );
}

function Sample({ lines }: { lines: string[] }) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn} style={[styles.sample, { backgroundColor: colors.accentSoft }]}>
      <Text variant="footnote" weight="700" color="accent">
        A MODEL ANSWER
      </Text>
      {lines.map((l, i) => (
        <Text key={i} variant="callout" lang="cs">
          {l}
        </Text>
      ))}
    </Animated.View>
  );
}

function useInputStyle() {
  const { colors } = useTheme();
  return [styles.input, ramp.body, { color: colors.label, backgroundColor: colors.surface, borderColor: colors.separator }];
}

function FormCoach({ task }: { task: WritingTask }) {
  const { colors } = useTheme();
  const input = useInputStyle();
  const questions = task.questions ?? [];
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ''));
  const [done, setDone] = useState(false);
  const checks = formChecks(answers);

  const finish = () => {
    useAcademy.getState().saveWriting(task.id, answers);
    setDone(true);
    announce('Saved');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Instruction task={task} />
      {questions.map((q, i) => (
        <View key={q} style={styles.field}>
          <Text variant="headline" lang="cs">
            {i + 1}. {q}
          </Text>
          <TextInput
            value={answers[i]}
            onChangeText={(t) => setAnswers((a) => a.map((x, j) => (j === i ? t : x)))}
            editable={!done}
            multiline
            placeholder="Write a full sentence in Czech"
            placeholderTextColor={colors.label3}
            autoCorrect={false}
            spellCheck={false}
            accessibilityLabel={`Answer ${i + 1}`}
            style={input}
          />
          <View style={styles.chips}>
            <Chip ok={checks[i].enoughWords} bad={answers[i].trim().length > 0 && !checks[i].enoughWords} label={checks[i].enoughWords ? `${checks[i].words} words` : `${checks[i].words} of ${FORM_MIN_WORDS} words`} />
            <Chip ok={checks[i].capital} label="Capital letter" />
            <Chip ok={checks[i].endsWithStop} label="Full stop" />
          </View>
        </View>
      ))}
      <Text variant="footnote" color="label2" style={styles.note}>
        Each answer needs at least {FORM_MIN_WORDS} words. A shorter answer loses points in the exam.
      </Text>
      {done ? (
        <>
          <SectionHeader title="Check it yourself" />
          <Checklist items={['Each answer fits its question word (proč, kde, kdy…)', 'Every sentence has a verb in the right form', 'The tense fits the question (past for the past)']} />
          <WritingFeedbackCard task={task} texts={answers} />
          <Sample lines={task.sample} />
          <Text variant="footnote" color="label3" style={styles.note}>
            The checks above are the exam’s own rules; ask for AI feedback for an estimate and corrections. Saved on this phone.
          </Text>
          <Button label="Done" onPress={() => router.back()} />
        </>
      ) : (
        <Button label="Finish" onPress={finish} disabled={answers.every((a) => !a.trim())} />
      )}
    </ScrollView>
  );
}

function EmailCoach({ task }: { task: WritingTask }) {
  const { colors } = useTheme();
  const input = useInputStyle();
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const c = emailChecks(text, task);
  const pictures = task.pictures ?? [];

  const finish = () => {
    useAcademy.getState().saveWriting(task.id, [text]);
    setDone(true);
    announce('Saved');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Instruction task={task} />
      <View style={styles.pictures}>
        {pictures.map((p) => (
          <View key={p.question} style={[styles.picture, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
            <Icon name={p.icon as IconName} size={26} color={colors.accent} />
            <Text variant="footnote" weight="600" align="center" lang="cs">
              {p.question}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="footnote" color="label3" style={styles.note}>
        Pictures are shown as simple icons here; in the exam they are drawings.
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        editable={!done}
        multiline
        placeholder={'Greeting,\n\nyour sentences…\n\nClosing,\nYour name'}
        placeholderTextColor={colors.label3}
        autoCorrect={false}
        spellCheck={false}
        accessibilityLabel="Your e-mail in Czech"
        style={[input, styles.email]}
      />
      <View style={styles.chips}>
        <Chip ok={!c.zero} bad={text.trim().length > 0 && c.zero} label={c.zero ? `${c.words} of ${EMAIL_MIN_WORDS} words` : `${c.words} words`} />
        <Chip ok={c.greeting} label="Greeting" />
        <Chip ok={c.closing} label="Closing" />
        <Chip ok={c.signature} label="Signature" />
        <Chip ok={c.sentences >= c.sentencesNeeded} label={c.sentences >= c.sentencesNeeded ? `${c.sentences} sentences` : `${c.sentences} of ${c.sentencesNeeded} sentences`} />
      </View>
      {c.zero ? (
        <Text variant="footnote" color={text.trim() ? 'danger' : 'label2'} style={styles.note}>
          Under {EMAIL_MIN_WORDS} words the e-mail scores 0 in the exam, however good it is.
        </Text>
      ) : null}
      <Text variant="footnote" color="label2" style={styles.note}>
        {task.register === 'ty' ? 'Writing to a friend: use ty (máš, jsi) and an informal greeting.' : 'Writing formally: use vy (máte, jste) and Dobrý den.'}
      </Text>
      {done ? (
        <>
          <SectionHeader title="Check it yourself" />
          <Checklist items={[...pictures.map((p) => `A sentence for: ${p.question}`), task.register === 'ty' ? 'I wrote ty all the way through' : 'I wrote vy all the way through']} />
          <WritingFeedbackCard task={task} texts={[text]} />
          <Sample lines={task.sample} />
          <Text variant="footnote" color="label3" style={styles.note}>
            The checks above are the exam’s own rules; ask for AI feedback for an estimate and corrections. Saved on this phone.
          </Text>
          <Button label="Done" onPress={() => router.back()} />
        </>
      ) : (
        <Button label="Finish" onPress={finish} disabled={!text.trim()} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.lg },
  card: { gap: space.sm },
  field: { gap: space.sm },
  input: { minHeight: 88, borderWidth: 1.5, borderRadius: radius.tile, paddingHorizontal: space.lg, paddingVertical: space.md, textAlignVertical: 'top' },
  email: { minHeight: 240 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  note: { paddingHorizontal: space.xs },
  tick: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
  sample: { borderRadius: radius.tile, padding: space.lg, gap: space.xs },
  pictures: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  picture: { width: '48%', flexGrow: 1, alignItems: 'center', gap: space.xs, padding: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth },
});
