import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { deleteServerData } from '@/lib/account';
import { isDemoMode, languageByCode } from '@/lib/ai';
import { confirm } from '@/lib/dialogs';
import { PRIVACY_URL, SUPPORT_URL } from '@/lib/links';
import { allowanceRenewsOn, useFreeLimit, useRemainingAnalyses, useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Testing tools: shown in demo mode and development builds, never in the App Store build. */
const showDevTools = isDemoMode || __DEV__;

export default function SettingsScreen() {
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
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // The server first: if that fails, nothing is deleted, so the user can simply try again.
  const deleteAll = async () => {
    if (deleting) return;
    const ok = await confirm({
      title: 'Delete everything?',
      message: `This deletes ${caseCount === 1 ? '1 item' : `${caseCount} items`} and their replies, your saved name and address, and your anonymous account on CzechPal’s server with any doctor or office reports you sent. It can’t be undone.`,
      confirmLabel: 'Delete everything',
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteServerData();
      clearAll();
      useStore.getState().setAiConsent(false);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const external = <Icon name="external" size={14} color={colors.label3} />;

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
          Renews on {allowanceRenewsOn()}. Examples, replies and messages you write are always free.
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
              title="Send texts to the AI"
              subtitle={aiConsent ? 'Allowed, to explain and write Czech' : 'You’ll be asked first next time'}
              accessory={
                <Switch
                  value={aiConsent}
                  onValueChange={(v) => useStore.getState().setAiConsent(v)}
                  trackColor={{ true: colors.accentFill }}
                  accessibilityLabel="Send texts to the AI"
                />
              }
            />
          )}
          <Row
            icon="trash"
            title={deleting ? 'Deleting…' : 'Delete everything'}
            destructive
            onPress={deleting ? undefined : deleteAll}
          />
        </List>
        {deleteError && (
          <Text variant="footnote" color="danger" style={styles.footer} accessibilityLiveRegion="polite">
            {deleteError}
          </Text>
        )}
        <Text variant="footnote" color="label2" style={styles.footer}>
          Your history and saved name and address are kept on this device. A photo or text is sent to Anthropic’s
          Claude AI only when you ask CzechPal to explain or write something; CzechPal doesn’t keep it, and Anthropic
          doesn’t use it to train AI models. Nothing is ever sent to anyone on your behalf.
        </Text>
      </View>

      <View>
        <SectionHeader title="About" />
        <List>
          <Row
            icon="lock"
            title="Privacy policy"
            accessory={external}
            accessibilityHint="Opens the website"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <Row
            icon="help"
            title="Help and contact"
            accessory={external}
            accessibilityHint="Opens the website"
            onPress={() => Linking.openURL(SUPPORT_URL)}
          />
        </List>
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
