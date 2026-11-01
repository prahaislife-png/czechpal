import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DocumentPaper } from '@/components/document-paper';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, RowIcon } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import type { Analysis, AnalyzeResult, KeyFact, NextStep, PartialAnalysis, TranslatedLine, Urgency } from '@/lib/ai';
import { announce } from '@/lib/a11y';
import { ANALYZE_DURATION_MS } from '@/lib/ai/mock-client';
import type { CaseItem } from '@/store/cases';
import { motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const verdictStyle: Record<Urgency, { icon: IconName; tone: 'success' | 'warning' | 'danger' }> = {
  none: { icon: 'checkCircle', tone: 'success' },
  action: { icon: 'alert', tone: 'warning' },
  urgent: { icon: 'alert', tone: 'danger' },
};

/* ───────────── What is it, and what does it mean for me? ───────────── */

/**
 * Signature element of the result: the answer set straight on the page, no card around it.
 * While the explanation streams in, any part can still be missing.
 */
export function ResultHero({ analysis }: { analysis: Pick<PartialAnalysis, 'category' | 'typeLabel' | 'inShort' | 'verdict' | 'sender'> }) {
  const { colors } = useTheme();
  return (
    <View style={styles.hero}>
      <View style={styles.typeRow}>
        {analysis.category && <Icon name={analysis.category} size={16} color={colors.label2} />}
        <Text variant="footnote" weight="600" color="label2">
          {analysis.typeLabel ?? ' '}
        </Text>
      </View>
      <Text variant="title2" weight="600" selectable accessibilityRole="header">
        {analysis.inShort ?? ' '}
      </Text>
      {analysis.verdict && <Verdict verdict={analysis.verdict} />}
      {analysis.sender ? (
        <Text variant="footnote" color="label2">
          From {analysis.sender}
        </Text>
      ) : null}
    </View>
  );
}

function Verdict({ verdict }: { verdict: NonNullable<Analysis['verdict']> }) {
  const { colors } = useTheme();
  const { icon, tone } = verdictStyle[verdict.urgency];
  const soft = { success: colors.successSoft, warning: colors.warningSoft, danger: colors.dangerSoft }[tone];
  return (
    <View style={[styles.verdict, { backgroundColor: soft }]}>
      <Icon name={icon} size={18} color={colors[tone]} />
      <View style={styles.verdictText}>
        <Text variant="callout" weight="600" color={tone}>
          {verdict.label}
        </Text>
        {verdict.detail ? (
          <Text variant="footnote" color="label2">
            {verdict.detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ───────────── What it says ───────────── */

export function TranslatedLines({ lines }: { lines: TranslatedLine[] }) {
  return (
    <View>
      <SectionHeader title="What it says" />
      <List inset={false}>
        {lines.map((line) => (
          <View key={line.cs} style={styles.line}>
            <Text variant="subhead" color="label2" selectable>
              {line.cs}
            </Text>
            <Text variant="headline" selectable>
              {line.en}
            </Text>
            {line.note ? (
              <Text variant="footnote" color="label3">
                {line.note}
              </Text>
            ) : null}
          </View>
        ))}
      </List>
    </View>
  );
}

/* ───────────── What should I do? ───────────── */

export function NextSteps({ steps }: { steps: NextStep[] }) {
  const { colors } = useTheme();
  const required = steps.filter((s) => s.kind === 'required');
  const optional = steps.filter((s) => s.kind === 'optional');
  return (
    <View>
      <SectionHeader title={required.length ? 'What you need to do' : 'Good to know'} />
      <List>
        {[...required, ...optional].map((step) => {
          const isRequired = step.kind === 'required';
          return (
            <View key={step.id} style={styles.step}>
              <View style={styles.stepMarkerColumn}>
                <View style={[styles.stepMarker, { backgroundColor: isRequired ? colors.accentFill : colors.fill }]}>
                  {isRequired ? (
                    <Text variant="footnote" weight="700" color="onAccent" tabular chrome>
                      {required.indexOf(step) + 1}
                    </Text>
                  ) : (
                    <Icon name="check" size={12} color={colors.label2} />
                  )}
                </View>
              </View>
              <View style={styles.stepText}>
                <Text variant="callout" weight="600">
                  {step.title}
                </Text>
                {step.detail ? (
                  <Text variant="subhead" color="label2" selectable>
                    {step.detail}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </List>
    </View>
  );
}

/* ───────────── Supporting detail ───────────── */

export function KeyFacts({ facts }: { facts: KeyFact[] }) {
  return (
    <View>
      <SectionHeader title="Key details" />
      <List>
        {facts.map((fact) => (
          <View key={fact.id} style={styles.fact}>
            <RowIcon name={fact.icon} />
            <View style={styles.factText}>
              <Text variant="footnote" color="label2">
                {fact.label}
              </Text>
              <Text variant="callout" weight="600" selectable tabular>
                {fact.value}
              </Text>
              {fact.evidence ? (
                <Text variant="footnote" color="label3" style={styles.evidence} selectable>
                  “{fact.evidence}”
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </List>
    </View>
  );
}

/** Prose bullets sit on the page: grouping by whitespace, not another card. */
export function Bullets({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  const { colors } = useTheme();
  return (
    <View>
      <SectionHeader title={title} />
      <View style={styles.bullets}>
        {items.map((item) => (
          <View key={item} style={styles.bullet}>
            <View style={[styles.dot, { backgroundColor: muted ? colors.label3 : colors.accent }]} />
            <Text variant="callout" color={muted ? 'label2' : 'label'} style={styles.bulletText}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cautions = {
  official: {
    title: 'Official matter',
    body: 'Double-check requirements with the office or a qualified adviser before you act. CzechPal explains the text; it isn’t legal advice.',
  },
  medical: {
    title: 'Health information',
    body: 'Follow what your doctor or pharmacist told you. If anything is unclear, ask them; CzechPal isn’t medical advice.',
  },
};

export function CautionNotice({ kind }: { kind: NonNullable<Analysis['caution']> }) {
  const { colors } = useTheme();
  const { title, body } = cautions[kind];
  return (
    <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
      <Icon name="shield" size={20} color={colors.warning} />
      <View style={styles.noticeText}>
        <Text variant="callout" weight="600" color="warning">
          {title}
        </Text>
        <Text variant="subhead">{body}</Text>
      </View>
    </View>
  );
}

export function DemoNotice({ demo }: { demo: AnalyzeResult['demo'] }) {
  if (!demo) return null;
  return (
    <View style={styles.demo}>
      <Badge label="Demo" tone="accent" />
      <Text variant="footnote" color="label2" style={styles.demoText}>
        {demo === 'matched'
          ? 'Matched to a built-in sample. Live AI reading turns on when the backend is connected.'
          : 'This is a sample result, not a reading of your text. Live AI reading turns on when the backend is connected.'}
      </Text>
    </View>
  );
}

/** Sits below the last section while the explanation is still being written. */
export function StillWriting() {
  const { colors } = useTheme();
  return (
    <View style={styles.stillWriting} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" color={colors.label3} />
      <Text variant="footnote" color="label2">
        Writing the rest of the explanation
      </Text>
    </View>
  );
}

/* ───────────── Reading ───────────── */

const stages = ['Reading the Czech text', 'Working out what it means', 'Finding what matters to you'];

/**
 * The text being read, with a scan line passing over it.
 * Motion purpose: explanation (it shows the app is reading this). Reduce Motion drops the sweep.
 */
export function AnalyzingView({ item }: { item: CaseItem }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [height, setHeight] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    const step = ANALYZE_DURATION_MS / stages.length;
    const timers = stages.slice(1).map((_, i) => setTimeout(() => setStage(i + 1), step * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => announce(stages[stage]), [stage]);

  useEffect(() => {
    if (!reduceMotion) sweep.set(withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [sweep, reduceMotion]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sweep.get() * Math.max(0, height - 2) }] }));

  return (
    <View style={styles.analyzing} accessibilityLiveRegion="polite">
      <View style={styles.preview} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} contentFit="cover" style={styles.previewImage} accessible={false} />
        ) : (
          <DocumentPaper text={item.text ?? item.fileName ?? ''} maxLines={9} style={styles.previewPaper} />
        )}
        {!reduceMotion && height > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.scanLine, { backgroundColor: colors.accent, boxShadow: `0px 0px 16px ${colors.accent}` }, lineStyle]}
          />
        )}
      </View>

      <View style={styles.stages}>
        {stages.map((label, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <Animated.View key={label} entering={FadeIn.duration(motion.base)} style={styles.stage}>
              <View style={styles.stageIcon}>
                {done ? (
                  <Icon name="checkCircle" size={22} color={colors.success} />
                ) : active ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Icon name="circle" size={22} color={colors.label3} />
                )}
              </View>
              <Text variant="callout" weight={active ? '600' : '400'} color={done || active ? 'label' : 'label3'}>
                {label}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md, paddingTop: space.sm },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  verdict: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    alignSelf: 'flex-start',
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
  },
  verdictText: { gap: 1, flexShrink: 1 },
  line: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: 2 },
  step: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  stepMarkerColumn: { width: 24, alignItems: 'center', paddingTop: 1 },
  stepMarker: { width: 24, height: 24, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1, gap: 2 },
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  factText: { flex: 1, gap: 1 },
  evidence: { marginTop: 2, fontStyle: 'italic' },
  bullets: { gap: space.md, paddingHorizontal: space.xs },
  bullet: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  bulletText: { flex: 1 },
  notice: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    borderCurve: 'continuous',
  },
  noticeText: { flex: 1, gap: 2 },
  demo: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingHorizontal: space.xs },
  demoText: { flex: 1 },
  stillWriting: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xs },
  analyzing: { gap: space.xxl },
  preview: { borderRadius: radius.tile, borderCurve: 'continuous', overflow: 'hidden', maxHeight: 300 },
  previewImage: { width: '100%', aspectRatio: 4 / 3 },
  previewPaper: { minHeight: 200 },
  scanLine: { position: 'absolute', left: 0, right: 0, top: 0, height: 2 },
  stages: { gap: space.lg, paddingHorizontal: space.xs },
  stage: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stageIcon: { width: 24, alignItems: 'center' },
});
