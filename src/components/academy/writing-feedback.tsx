import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { ai, AnalyzeError, isDemoMode, type FeedbackCriterion, type WritingFeedback } from '@/lib/ai';
import type { WritingTask } from '@/lib/academy/types';
import { useAcademy } from '@/store/academy';
import { useStore } from '@/store/cases';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * AI feedback on a piece of writing practice, only when the learner asks. It is labelled an
 * estimate everywhere: the exam's marking scale isn't published. The text goes to the AI after
 * the same consent as explanations; it doesn't use the free explanations.
 */
export function WritingFeedbackCard({ task, texts }: { task: WritingTask; texts: string[] }) {
  const { colors } = useTheme();
  const aiConsent = useStore((s) => s.aiConsent);
  const language = useStore((s) => s.language);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(() => {
    const last = useAcademy.getState().writing[task.id]?.at(-1);
    return last && last.texts.join('\n') === texts.join('\n') ? (last.feedback ?? null) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const needsConsent = !isDemoMode && !aiConsent;
  const empty = texts.every((t) => !t.trim());

  const ask = async () => {
    if (loading || empty) return;
    if (needsConsent) useStore.getState().setAiConsent(true);
    setLoading(true);
    setError(null);
    try {
      const out = await ai.writingFeedback({
        kind: task.kind,
        instruction: task.instructionCs,
        questions: task.questions,
        pictures: task.pictures?.map((p) => p.question),
        register: task.register,
        texts,
        language,
      });
      useAcademy.getState().setWritingFeedback(task.id, out);
      if (!alive.current) return;
      setFeedback(out);
      announce(`Feedback ready. About ${out.estimate.points} of ${out.estimate.of} points, an estimate.`);
      if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      if (alive.current) setError(e instanceof AnalyzeError ? e.message : 'Feedback didn’t come through. Try again.');
    } finally {
      if (alive.current) setLoading(false);
    }
  };

  if (!feedback)
    return (
      <View style={styles.ask}>
        {needsConsent ? (
          <Text variant="footnote" color="label2" align="center">
            CzechPal sends what you wrote to Anthropic’s Claude AI for feedback. CzechPal doesn’t keep it, and Anthropic doesn’t use it to train AI models.
          </Text>
        ) : null}
        <Button
          label={needsConsent ? 'Agree and get feedback' : 'Get feedback from AI'}
          icon="star"
          variant="secondary"
          loading={loading}
          disabled={empty}
          onPress={ask}
        />
        <Text variant="footnote" color="label3" align="center">
          {loading ? 'Reading your writing… this takes a few seconds.' : 'An estimate with corrections. Doesn’t use your free explanations.'}
        </Text>
        {error ? (
          <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>
    );

  const f = feedback;
  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      <Text variant="footnote" weight="700" color="accent">
        AI FEEDBACK · AN ESTIMATE
      </Text>
      <Text variant="title2" accessibilityRole="header">
        About {f.estimate.points} of {f.estimate.of} points
      </Text>
      <Text variant="footnote" color="label3">
        The exam’s marking scale isn’t published, so this is an estimate, not an exam score.
      </Text>
      {f.zeroRule ? (
        <Text variant="callout" color="danger">
          Under 35 words, the e-mail scores 0 in the exam, whatever else is right.
        </Text>
      ) : null}
      <Text variant="callout">{f.summary}</Text>

      {f.criteria.length ? (
        <View style={styles.block}>
          {f.criteria.map((c, i) => (
            <Criterion key={i} c={c} />
          ))}
        </View>
      ) : null}

      {f.corrections.length ? (
        <View style={styles.block}>
          <Text variant="subhead" weight="600">
            Corrections
          </Text>
          {f.corrections.map((c, i) => (
            <View key={i} style={[styles.correction, { borderColor: colors.separator }]}>
              <Text variant="callout" color="danger" lang="cs" style={styles.strike}>
                {c.original}
              </Text>
              <Text variant="callout" weight="600" color="success" lang="cs">
                {c.corrected}
              </Text>
              {c.why ? (
                <Text variant="footnote" color="label2">
                  {c.why}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.improved, { backgroundColor: colors.accentSoft }]}>
        <Text variant="footnote" weight="700" color="accent">
          YOUR TEXT, CORRECTED
        </Text>
        {f.improved.map((t, i) => (
          <Text key={i} variant="callout" lang="cs">
            {f.improved.length > 1 ? `${i + 1}. ` : ''}
            {t}
          </Text>
        ))}
      </View>
      <Text variant="footnote" color="label3">
        Written by AI, which can make mistakes. Saved on this phone with your writing.
      </Text>
    </Animated.View>
  );
}

function Criterion({ c }: { c: FeedbackCriterion }) {
  const { colors } = useTheme();
  const tone = c.met === 'yes' ? colors.success : c.met === 'partly' ? colors.warning : colors.danger;
  const word = c.met === 'yes' ? 'Yes' : c.met === 'partly' ? 'Partly' : 'Not yet';
  return (
    <View style={styles.criterion} accessible accessibilityLabel={`${c.label}: ${word}. ${c.note}`}>
      <Icon name={c.met === 'yes' ? 'checkCircle' : c.met === 'partly' ? 'warning' : 'alert'} size={18} color={tone} />
      <View style={styles.flex}>
        <Text variant="callout" weight="600">
          {c.label}
        </Text>
        {c.note ? (
          <Text variant="footnote" color="label2">
            {c.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ask: { gap: space.sm },
  card: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  block: { gap: space.sm, marginTop: space.sm },
  criterion: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  correction: { gap: 2, paddingTop: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
  strike: { textDecorationLine: 'line-through' },
  improved: { borderRadius: radius.tile, padding: space.md, gap: space.xs, marginTop: space.sm },
});
