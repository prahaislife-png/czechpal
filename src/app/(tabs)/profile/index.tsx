import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card, SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { confirm, notify } from '@/lib/dialogs';
import { FREE_ANALYSES_PER_MONTH, useRemainingAnalyses, useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const remaining = useRemainingAnalyses();
  const used = FREE_ANALYSES_PER_MONTH - remaining;
  const caseCount = useStore((s) => s.cases.length);
  const { clearAll, resetUsage, resetOnboarding } = useStore.getState();

  const deleteAll = async () => {
    const ok = await confirm({
      title: 'Delete all messages?',
      message: `This removes ${caseCount === 1 ? '1 message' : `${caseCount} messages`} and their replies from this device. It can’t be undone.`,
      confirmLabel: 'Delete all',
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
          CzechReply Pro — unlimited explanations and saved cases across devices — is coming soon.
        </Text>
      </Card>

      <View>
        <SectionHeader title="Preferences" />
        <List>
          <Row icon="globe" title="Explanations in" value="English" chevron={false} />
        </List>
      </View>

      <View>
        <SectionHeader title="Privacy" />
        <List>
          <Row
            icon="shield"
            title="How your data is handled"
            onPress={() =>
              notify(
                'How your data is handled',
                'Messages are kept on this device. When live analysis is switched on, a message is sent securely for analysis only after you tap Explain — and nothing is ever sent to anyone on your behalf.',
              )
            }
          />
          <Row icon="trash" title="Delete all messages" destructive chevron={false} onPress={deleteAll} />
        </List>
      </View>

      <View>
        <SectionHeader title="Demo" />
        <List>
          <Row icon="refresh" title="Reset free explanations" chevron={false} onPress={resetUsage} />
          <Row
            icon="star"
            title="Show the welcome screen again"
            chevron={false}
            onPress={() => {
              resetOnboarding();
              router.replace('/welcome');
            }}
          />
        </List>
      </View>

      <Text variant="footnote" color="label3" align="center">
        CzechReply 1.0 · Demo build
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
});
