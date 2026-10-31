import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { checklistById, CHECKLISTS_CHECKED_ON } from '@/lib/visa/checklists';
import { CLIENT_CENTRE, INTEGRATION_CENTRE } from '@/lib/visa/offices';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const checked = new Date(`${CHECKLISTS_CHECKED_ON}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ChecklistScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const checklist = checklistById(id);
  const [variantIndex, setVariantIndex] = useState('0');

  if (!checklist) return <Redirect href="/help/checklists" />;
  const v = checklist.variants[Number(variantIndex)] ?? checklist.variants[0];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: '' }} />
      <Text variant="title2" weight="700" accessibilityRole="header">
        {checklist.title}
      </Text>

      {checklist.variants.length > 1 ? (
        <View>
          <SectionHeader title="Your permit" />
          {/* Chips, not a segmented control: the permit names are too long to share one row. */}
          <ChipGroup options={checklist.variants.map((x, i) => ({ id: String(i), label: x.forWhom }))} value={variantIndex} onChange={setVariantIndex} />
        </View>
      ) : (
        <Text variant="subhead" color="label2">
          {v.forWhom}
        </Text>
      )}

      <View style={[styles.key, { backgroundColor: colors.accentSoft }]}>
        {v.when ? <KeyFact label="When it applies" value={v.when} /> : null}
        <KeyFact label="Deadline" value={v.deadline} />
        <KeyFact label="Fee" value={v.fee} />
      </View>

      <View>
        <SectionHeader title="What you need" />
        <List>
          {v.documents.map((d) => (
            <View key={d.en} style={styles.doc}>
              <Icon name="checkCircle" size={18} color={colors.accent} />
              <View style={styles.docText}>
                <Text variant="callout" weight="600">
                  {d.en}
                </Text>
                <Text variant="footnote" color="label2" selectable>
                  {d.cs}
                </Text>
                {d.note ? (
                  <Text variant="footnote" color="label3">
                    {d.note}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </List>
      </View>

      <View>
        <SectionHeader title="Steps" />
        <View style={styles.steps}>
          {v.steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.accentFill }]}>
                <Text variant="footnote" weight="700" color="onAccent" tabular chrome>
                  {i + 1}
                </Text>
              </View>
              <Text variant="callout" style={styles.stepText}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {v.watchOut?.length ? (
        <View>
          <SectionHeader title="Watch out" />
          <View style={styles.steps}>
            {v.watchOut.map((w) => (
              <View key={w} style={styles.step}>
                <Icon name="warning" size={16} color={colors.warning} />
                <Text variant="callout" style={styles.stepText}>
                  {w}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionHeader title="Not sure it fits you?" />
        <List>
          <Row
            icon="phone"
            title={`Ask the ministry: ${CLIENT_CENTRE.display}`}
            subtitle={`Press 2 for questions. ${CLIENT_CENTRE.hours}.`}
            onPress={() => Linking.openURL(`tel:${CLIENT_CENTRE.phone}`)}
          />
          <Row
            icon="help"
            title={`${INTEGRATION_CENTRE.name}: free advice`}
            subtitle="Legal and social help for foreigners"
            accessory={<Icon name="external" size={14} color={colors.label3} />}
            onPress={() => Linking.openURL(INTEGRATION_CENTRE.url)}
          />
          <Row
            icon="government"
            title="Official page (in Czech)"
            subtitle={`Checked ${checked}. Rules change, so check before you act.`}
            accessory={<Icon name="external" size={14} color={colors.label3} />}
            onPress={() => Linking.openURL(checklist.source)}
          />
        </List>
        <Text variant="footnote" color="label3" style={styles.note}>
          This explains the official rules in plain words. It isn’t legal advice.
        </Text>
      </View>
    </ScrollView>
  );
}

function KeyFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.keyFact}>
      <Text variant="footnote" weight="600" color="label2">
        {label}
      </Text>
      <Text variant="callout" weight="600">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  key: { gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  keyFact: { gap: 2 },
  doc: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', paddingHorizontal: space.lg, paddingVertical: space.md },
  docText: { flex: 1, gap: 2 },
  steps: { gap: space.md, paddingHorizontal: space.xs },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNumber: { width: 24, height: 24, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
  note: { paddingHorizontal: space.lg, marginTop: space.sm },
});
