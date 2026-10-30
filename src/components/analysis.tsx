import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Badge } from '@/components/ui/badge';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconWell, List } from '@/components/ui/list';
import { SkeletonLine } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { Analysis, AnalyzeResult, KeyFact, NextStep, Urgency } from '@/lib/ai';
import { ANALYZE_DURATION_MS } from '@/lib/ai/mock-client';
import { motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const verdictStyle: Record<Urgency, { icon: IconName; tone: 'success' | 'warning' | 'danger' }> = {
  none: { icon: 'checkCircle', tone: 'success' },
  action: { icon: 'calendar', tone: 'warning' },
  urgent: { icon: 'alert', tone: 'danger' },
};

/* ───────────── What happened? ───────────── */

export function VerdictCard({ analysis }: { analysis: Analysis }) {
  const { colors } = useTheme();
  const { icon, tone } = verdictStyle[analysis.verdict.urgency];
  const fg = colors[tone];
  const bg = colors[`${tone}Soft`];
  return (
    <Card raised style={styles.verdict}>
      <View style={[styles.verdictPill, { backgroundColor: bg }]}>
        <Icon name={icon} size={18} color={fg} />
        <View style={styles.verdictPillText}>
          <Text variant="headline" style={{ color: fg }}>
            {analysis.verdict.label}
          </Text>
          {analysis.verdict.detail ? (
            <Text variant="footnote" style={{ color: fg, opacity: 0.85 }}>
              {analysis.verdict.detail}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.inShort}>
        <Text variant="caption" color="label3" weight="600">
          IN SHORT
        </Text>
        <Text variant="title3" weight="500" selectable>
          {analysis.inShort}
        </Text>
      </View>
      <View style={styles.sender}>
        <Icon name="sender" size={14} color={colors.label3} />
        <Text variant="footnote" color="label2">
          From {analysis.sender}
        </Text>
      </View>
    </Card>
  );
}

/* ───────────── What should I do? ───────────── */

export function NextSteps({ steps }: { steps: NextStep[] }) {
  const { colors } = useTheme();
  const required = steps.filter((s) => s.kind === 'required');
  const optional = steps.filter((s) => s.kind === 'optional');
  return (
    <View>
      <SectionHeader title={required.length ? 'What you need to do' : 'Nothing required — but it helps to'} />
      <Card padded={false}>
        {[...required, ...optional].map((step, i) => {
          const isRequired = step.kind === 'required';
          return (
            <View
              key={step.id}
              style={[styles.step, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator }]}>
              <View
                style={[
                  styles.stepMarker,
                  isRequired ? { backgroundColor: colors.accentFill } : { backgroundColor: colors.fill },
                ]}>
                {isRequired ? (
                  <Text variant="footnote" weight="700" color="onAccent" tabular>
                    {required.indexOf(step) + 1}
                  </Text>
                ) : (
                  <Icon name="check" size={12} color={colors.label2} />
                )}
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
                {!isRequired && (
                  <Text variant="caption" color="label3">
                    Optional
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </Card>
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
            <IconWell name={fact.icon} />
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

export function Bullets({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  const { colors } = useTheme();
  return (
    <View>
      <SectionHeader title={title} />
      <Card style={[styles.bullets, muted && { backgroundColor: colors.surfaceMuted, boxShadow: 'none' }]}>
        {items.map((item) => (
          <View key={item} style={styles.bullet}>
            <View style={[styles.dot, { backgroundColor: muted ? colors.label3 : colors.label2 }]} />
            <Text variant="callout" color={muted ? 'label2' : 'label'} style={styles.bulletText}>
              {item}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

export function OfficialNotice() {
  const { colors } = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
      <Icon name="shield" size={20} color={colors.warning} />
      <View style={styles.noticeText}>
        <Text variant="callout" weight="600" color="warning">
          Official matter
        </Text>
        <Text variant="subhead" color="label">
          Double-check requirements with the office or a qualified adviser before you act. CzechReply explains the letter;
          it isn’t legal advice.
        </Text>
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
          ? 'Matched to a built-in sample. Live AI analysis turns on when the backend is connected.'
          : 'This is a sample analysis, not your document. Live AI analysis turns on when the backend is connected.'}
      </Text>
    </View>
  );
}

/* ───────────── Analyzing ───────────── */

const stages = ['Reading the Czech text', 'Working out what it means', 'Finding dates, amounts and next steps'];

export function AnalyzingView() {
  const { colors } = useTheme();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const step = ANALYZE_DURATION_MS / stages.length;
    const timers = stages.slice(1).map((_, i) => setTimeout(() => setStage(i + 1), step * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={styles.analyzing} accessibilityLiveRegion="polite">
      <View style={styles.analyzingHead}>
        <Text variant="title2" accessibilityRole="header">
          Explaining your message
        </Text>
        <Text variant="callout" color="label2">
          This usually takes a few seconds.
        </Text>
      </View>

      <Card style={styles.stages}>
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
      </Card>

      {/* Skeleton in the exact shape of the verdict card that replaces it. */}
      <Card style={styles.skeletonCard}>
        <SkeletonLine width="55%" height={36} />
        <SkeletonLine width="30%" height={10} />
        <SkeletonLine />
        <SkeletonLine width="92%" />
        <SkeletonLine width="70%" />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  verdict: { gap: space.lg },
  verdictPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    alignSelf: 'flex-start',
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
  },
  verdictPillText: { gap: 1, flexShrink: 1, marginTop: -1 },
  inShort: { gap: space.xs },
  sender: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  step: { flexDirection: 'row', gap: space.md, padding: space.lg },
  stepMarker: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  stepText: { flex: 1, gap: 2 },
  fact: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  factText: { flex: 1, gap: 1 },
  evidence: { marginTop: 2, fontStyle: 'italic' },
  bullets: { gap: space.md },
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
  analyzing: { gap: space.xxl },
  analyzingHead: { gap: space.xs, paddingHorizontal: space.xs },
  stages: { gap: space.lg },
  stage: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stageIcon: { width: 24, alignItems: 'center' },
  skeletonCard: { gap: space.md },
});
