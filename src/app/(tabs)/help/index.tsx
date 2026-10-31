import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { emergencyNumbers, helpCategories } from '@/lib/help/directory';
import { kindIcon, practiceKinds } from '@/lib/help/practices';
import { supportLines } from '@/lib/help/urgent';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function HelpScreen() {
  const [primary, ...others] = emergencyNumbers;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {/* The most used part of Help: one tap to every practice of a kind in Prague. */}
      <View>
        <SectionHeader title="Find a doctor in Prague" />
        <View style={styles.kinds}>
          {practiceKinds.map((k) => (
            <KindPill
              key={k.id}
              icon={kindIcon[k.id]}
              label={k.title}
              onPress={() => router.push({ pathname: '/help/find/[kind]', params: { kind: k.id } })}
            />
          ))}
        </View>
        <List style={styles.afterHours}>
          <Row
            icon="night"
            title="Sick tonight or at the weekend?"
            subtitle="After-hours doctors, dentists and night pharmacies"
            chevron
            onPress={() => router.push('/help/urgent')}
          />
        </List>
      </View>

      <View>
        <SectionHeader title="Visa and residence" />
        <List>
          <Row
            icon="government"
            title="Immigration offices in Prague"
            subtitle="Which one is yours, hours, and today’s waits"
            chevron
            onPress={() => router.push('/help/offices')}
          />
          <Row
            icon="document"
            title="What do I need?"
            subtitle="New address, new employer, extending, a lost card"
            chevron
            onPress={() => router.push('/help/checklists')}
          />
        </List>
      </View>

      <View>
        <SectionHeader title="Other help" />
        <List>
          {helpCategories
            .filter((c) => c.id !== 'doctors')
            .map((c) => (
            <Row
              key={c.id}
              icon={c.icon}
              title={c.title}
              subtitle={c.short}
              chevron
              onPress={() => router.push({ pathname: '/help/[category]', params: { category: c.id } })}
            />
            ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.footer}>
          Official Czech directories, and what to ask.
        </Text>
      </View>

      <View>
        <SectionHeader title="Emergency" />
        <List inset={false}>
          <EmergencyRow {...primary} prominent />
          {others.map((e) => (
            <EmergencyRow key={e.number} {...e} />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.footer}>
          Emergency calls are free from any phone.
        </Text>
      </View>

      <View>
        <SectionHeader title="Someone to talk to" />
        <List inset={false}>
          {supportLines.map((l) => (
            <EmergencyRow key={l.number} number={l.number} label={l.label} detail={l.detail} />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.footer}>
          Free and open day and night. Official 116 numbers listed by the Czech government.
        </Text>
      </View>
    </ScrollView>
  );
}

function KindPill({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.kind, { backgroundColor: colors.surface }]}>
      <Icon name={icon} size={18} color={colors.accent} />
      <Text variant="subhead" weight="600" chrome>
        {label}
      </Text>
    </PressableScale>
  );
}

function EmergencyRow({
  number,
  label,
  detail,
  prominent,
}: {
  number: string;
  label: string;
  detail: string;
  prominent?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => Linking.openURL(`tel:${number.replace(/\s/g, '')}`)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${label}, ${number}`}
      style={({ pressed }) => [styles.emergency, pressed && { backgroundColor: colors.fill }]}>
      <Text
        variant={prominent ? 'title2' : 'title3'}
        weight="700"
        color={prominent ? 'danger' : 'label'}
        tabular
        style={styles.number}>
        {number}
      </Text>
      <View style={styles.emergencyText}>
        <Text variant="callout" weight="600">
          {label}
        </Text>
        <Text variant="footnote" color="label2">
          {detail}
        </Text>
      </View>
      <Icon name="phone" size={18} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  footer: { paddingHorizontal: space.lg, marginTop: space.sm },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  kind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  afterHours: { marginTop: space.md },
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 60,
  },
  number: { minWidth: 52 },
  emergencyText: { flex: 1, gap: 1 },
});
