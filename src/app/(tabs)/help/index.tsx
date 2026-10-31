import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { emergencyNumbers, helpCategories } from '@/lib/help/directory';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function HelpScreen() {
  const [primary, ...others] = emergencyNumbers;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View>
        <SectionHeader title="Do it yourself, in Czech" />
        <List>
          <Row
            icon="compose"
            title="Write to anyone in Czech"
            subtitle="Landlord, doctor, plumber: a message or a call script"
            chevron
            onPress={() => router.push('/compose')}
          />
          <Row
            icon="qrcode"
            title="Pay a bill by QR code"
            subtitle="Turn a bill into a code your banking app scans"
            chevron
            onPress={() => router.push('/pay')}
          />
        </List>
      </View>

      <View>
        <SectionHeader title="Find help" />
        <List>
          {helpCategories.map((c) => (
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
          Official Czech directories, what to ask, and a way to write to anyone in Czech.
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
    </ScrollView>
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
      onPress={() => Linking.openURL(`tel:${number}`)}
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
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 60,
  },
  number: { width: 52 },
  emergencyText: { flex: 1, gap: 1 },
});
