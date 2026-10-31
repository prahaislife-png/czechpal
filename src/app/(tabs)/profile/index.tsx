import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Card, SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { isDemoMode, languageByCode } from '@/lib/ai';
import { confirm } from '@/lib/dialogs';
import { allowanceRenewsOn, useFreeLimit, useRemainingAnalyses, useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Testing tools: shown in demo mode and development builds, never in the App Store build. */
const showDevTools = isDemoMode || __DEV__;

export default function ProfileScreen() {
  const { colors } = useTheme();
  const remaining = useRemainingAnalyses();
  const limit = useFreeLimit();
  const used = limit - remaining;
  useFocusEffect(
    useCallback(() => {
      useStore.getState().syncAllowance();
    }, []),
  );
  const caseCount = useStore((s) => s.cases.length);
  const aiConsent = useStore((s) => s.aiConsent);
  const language = useStore((s) => s.language);
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
        <Text variant="title3">Free explanations</Text>
        <View style={styles.meter}>
          <View style={[styles.track, { backgroundColor: colors.fill }]}>
            <View
              style={[styles.fill, { backgroundColor: colors.accentFill, width: `${limit ? (used / limit) * 100 : 0}%` }]}
            />
          </View>
          <Text variant="subhead" color="label2" tabular>
            {remaining} of {limit} left this month
          </Text>
        </View>
        <Text variant="footnote" color="label3">
          Renews on {allowanceRenewsOn()}. Built-in examples and replies are always free.
        </Text>
      </Card>

      <View>
        <SectionHeader title="Preferences" />
        <List>
          <Row
            icon="globe"
            title="Explanations in"
            value={languageByCode(language).native}
            chevron
            onPress={() => router.push('/language')}
          />
        </List>
      </View>

      {showDevTools && (
        <View>
          <SectionHeader title={isDemoMode ? 'Demo' : 'Testing'} />
          <List>
            {/* Live, the server counts explanations, so only a demo allowance can be reset here. */}
            {isDemoMode && <Row icon="refresh" title="Reset free explanations" onPress={resetUsage} />}
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
      )}

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
        CzechPal {Constants.expoConfig?.version ?? ''}
        {isDemoMode ? ' · Demo' : ''}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  plan: { gap: space.lg },
  meter: { gap: space.sm },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  footer: { paddingHorizontal: space.lg, marginTop: space.sm },
});
