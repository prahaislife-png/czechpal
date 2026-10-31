import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { mapsUrl } from '@/lib/help/practices';
import {
  AFTER_HOURS_BRING,
  AFTER_HOURS_PURPOSE,
  AFTER_HOURS_SOURCE,
  afterHours,
  afterHoursTypes,
  formatHours,
  isOpenNow,
  type AfterHoursService,
  type AfterHoursType,
} from '@/lib/help/urgent';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const checked = new Date(`${AFTER_HOURS_SOURCE.checkedOn}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** After-hours doctors, dentists and pharmacies in Prague, from the city's official list. */
export default function UrgentCareScreen() {
  const { colors } = useTheme();
  const [type, setType] = useState<AfterHoursType>('adults');
  const now = new Date();
  // Open now first, then by district number.
  const services = afterHours
    .filter((s) => s.type === type)
    .map((s) => ({ s, open: isOpenNow(s, now) }))
    .sort((a, b) => Number(b.open) - Number(a.open) || Number(a.s.district.replace(/\D/g, '')) - Number(b.s.district.replace(/\D/g, '')));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Pressable
        onPress={() => Linking.openURL('tel:155')}
        accessibilityRole="button"
        accessibilityLabel="Serious emergency: call 155 for an ambulance"
        style={({ pressed }) => [styles.emergency, { backgroundColor: colors.dangerSoft, opacity: pressed ? 0.8 : 1 }]}>
        <Text variant="title2" weight="700" color="danger" tabular>
          155
        </Text>
        <View style={styles.emergencyText}>
          <Text variant="callout" weight="600">
            Serious emergency? Call an ambulance
          </Text>
          <Text variant="footnote" color="label2">
            Chest pain, trouble breathing, a bad injury. 112 also works and has English-speaking operators.
          </Text>
        </View>
        <Icon name="phone" size={18} color={colors.danger} />
      </Pressable>

      <View>
        <SectionHeader title="After-hours care in Prague" />
        <Segmented options={afterHoursTypes.map((t) => ({ value: t.id, label: t.title }))} value={type} onChange={setType} />
        <Text variant="footnote" color="label2" style={styles.note}>
          {afterHoursTypes.find((t) => t.id === type)?.detail}. Tap one to open it in Maps.
        </Text>
      </View>

      <List>
        {services.map(({ s, open }) => (
          <ServiceRow key={s.id} service={s} open={open} />
        ))}
      </List>

      <View>
        <SectionHeader title="What to bring" />
        <List>
          {AFTER_HOURS_BRING.map((b) => (
            <Row key={b.label} icon="checkCircle" title={b.label} subtitle={b.detail} />
          ))}
        </List>
        <Text variant="footnote" color="label2" style={styles.note}>
          {AFTER_HOURS_PURPOSE}
        </Text>
      </View>

      <View>
        <List>
          <Row
            icon="globe"
            title="City of Prague after-hours list"
            subtitle={`Copied ${checked}. Holiday hours can change.`}
            accessory={<Icon name="external" size={14} color={colors.label3} />}
            accessibilityHint="Opens the website"
            onPress={() => Linking.openURL(AFTER_HOURS_SOURCE.url)}
          />
        </List>
      </View>
    </ScrollView>
  );
}

function ServiceRow({ service: s, open }: { service: AfterHoursService; open: boolean }) {
  const { colors } = useTheme();
  const weekdays = s.friday ? `Mon to Thu ${formatHours(s.weekdays)}, Fri ${formatHours(s.friday)}` : `Mon to Fri ${formatHours(s.weekdays)}`;
  return (
    <Pressable
      onPress={() => Linking.openURL(mapsUrl({ name: s.provider, lat: s.lat, lng: s.lng, street: s.address, house_number: null, district: s.district }))}
      accessibilityRole="button"
      accessibilityHint="Opens in Maps"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      <View style={styles.rowText}>
        <Text variant="callout" weight="600">
          {s.provider}
        </Text>
        <Text variant="footnote" color="label2">
          {s.address}, {s.district}
        </Text>
        <Text variant="footnote" color="label2">
          {weekdays}
        </Text>
        <Text variant="footnote" color="label2">
          Sat and Sun {formatHours(s.weekend)} · Holidays {formatHours(s.holidays)}
        </Text>
        {s.note ? (
          <Text variant="footnote" color="label3">
            {s.note}
          </Text>
        ) : null}
        {open && (
          <View style={styles.badge}>
            <Badge label="Open now" tone="success" />
          </View>
        )}
      </View>
      <Icon name="location" size={18} color={colors.label3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.card,
    borderCurve: 'continuous',
  },
  emergencyText: { flex: 1, gap: 2 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  rowText: { flex: 1, gap: 2 },
  badge: { flexDirection: 'row', marginTop: space.xs },
});
