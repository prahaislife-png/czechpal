import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card, SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { isDemoMode } from '@/lib/ai';
import { confirm } from '@/lib/dialogs';
import { FREE_ANALYSES_PER_MONTH, useRemainingAnalyses, useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const remaining = useRemainingAnalyses();
  const used = FREE_ANALYSES_PER_MONTH - remaining;
  const caseCount = useStore((s) => s.cases.length);
  const aiConsent = useStore((s) => s.aiConsent);
  const { clearAll, resetUsage, resetOnboarding } = useStore.getState();

  const deleteAll = async () => {
    const ok = await confirm({
      title: 'Delete everything?',
      message: `This removes ${caseCount === 1 ? '1 item' : `${caseCount} items`} and their replies from this device. It can’t be undone.`,
      confirmLabel: 'Delete everything',
      destructive: true,
    });
    if (ok) clearAll();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Card style={styles.plan}>
        <View style={styles.planHead}>
          <Text variant="title3">Free plan</Text>
          <Badge label="Demo" tone="accent" />
        </View>
        <View style={styles.meter}>
          <View style={[styles.track, { backgroundColor: colors.fill }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.accentFill, width: `${(used / FREE_ANALYSES_PER_MONTH) * 100}%` },
              ]}
            />
          </View>
          <Text variant="subhead" color="label2" tabular>
            {remaining} of {FREE_ANALYSES_PER_MONTH} free explanations left this month
          </Text>
        </View>
        <Text variant="footnote" color="label3">
          CzechPal Pro, with unlimited explanations and history across devices, is coming soon.
        </Text>
      </Card>

      <View>
        <SectionHeader title="Preferences" />
        <List>
          <Row icon="globe" title="Explanations in" value="English" />
        </List>
      </View>

      <View>
        <SectionHeader title="Demo" />
        <List>
          <Row icon="refresh" title="Reset free explanations" onPress={resetUsage} />
          <Row
            icon="star"
            title="Show the welcome screen again"
            onPress={() => {
              resetOnboarding();
              router.replace('/welcome');
            }}
          />
        </List>
      </View>

      <View>
        <SectionHeader title="Privacy" />
        <List>
          {!isDemoMode && (
            <Row
              icon="shield"
              title="Send texts to the AI to explain them"
              subtitle={aiConsent ? 'Allowed' : 'You’ll be asked before the next explanation'}
              accessory={
                <Switch
                  value={aiConsent}
                  onValueChange={(v) => useStore.getState().setAiConsent(v)}
                  trackColor={{ true: colors.accentFill }}
                  accessibilityLabel="Send texts to the AI to explain them"
                />
              }
            />
          )}
          <Row icon="trash" title="Delete everything" destructive onPress={deleteAll} />
        </List>
        <Text variant="footnote" color="label2" style={styles.footer}>
          Your history is kept on this device. A photo or text is sent to Anthropic’s Claude AI only when you tap
          Explain; CzechPal doesn’t keep it, and Anthropic doesn’t use it to train AI models. Nothing is ever sent to
          anyone on your behalf.
        </Text>
      </View>

      <Text variant="footnote" color="label3" align="center">
        CzechPal 1.0 · Demo build
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  plan: { gap: space.lg },
  planHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meter: { gap: space.sm },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  footer: { paddingHorizontal: space.lg, marginTop: space.sm },
});
