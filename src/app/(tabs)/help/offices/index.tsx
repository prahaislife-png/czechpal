import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OfficeWaitSummary } from '@/components/office-wait';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { PRAGUE_DISTRICTS } from '@/lib/help/practices';
import {
  BOOKING_URL,
  CLIENT_CENTRE,
  districtOf,
  INTEGRATION_CENTRE,
  OFFICE_NOTICES,
  officeForDistrict,
  offices,
  OFFICES_SOURCE,
  SMALLER_PARTS,
  type Office,
  type OfficeId,
} from '@/lib/visa/offices';
import { getWaitsToday, type OfficeWait } from '@/lib/visa/waits';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const checked = new Date(`${OFFICES_SOURCE.checkedOn}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** The Ministry of the Interior's residence offices in Prague, and which one is yours. */
export default function OfficesScreen() {
  const { colors } = useTheme();
  const [part, setPart] = useState<string | null>(null);
  const [waits, setWaits] = useState<Partial<Record<OfficeId, OfficeWait>> | null>(null);
  const [waitsError, setWaitsError] = useState(false);

  // Waiting times change through the day: refresh whenever the screen comes back into view.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getWaitsToday()
        .then((w) => {
          if (!active) return;
          setWaits(w);
          setWaitsError(false);
        })
        .catch(() => active && setWaitsError(true));
      return () => {
        active = false;
      };
    }, []),
  );

  const mine = part ? officeForDistrict(districtOf(part)) : null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View>
        <SectionHeader title="Which office is mine?" />
        <Text variant="footnote" color="label2" style={styles.note}>
          It depends on your registered address in Prague. Pick your city part.
        </Text>
        <View style={styles.chips}>
          {PRAGUE_DISTRICTS.map((d) => (
            <Chip key={d} label={d} role="radio" selected={part === d} onPress={() => setPart(part === d ? null : d)} />
          ))}
        </View>
        {mine && part && (
          <Pressable
            onPress={() => router.push({ pathname: '/help/offices/[id]', params: { id: mine.office.id } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.mine, { backgroundColor: colors.accentSoft, opacity: pressed ? 0.85 : 1 }]}>
            <View style={styles.mineText}>
              <Text variant="footnote" color="label2">
                {part === `Praha ${districtOf(part)}` ? part : `${part} belongs to district Praha ${districtOf(part)}`}
              </Text>
              <Text variant="headline">{mine.office.short}</Text>
              <Text variant="footnote" color="label2">
                {mine.office.address}
              </Text>
              {mine.also ? (
                <Text variant="footnote" color="label2">
                  {mine.also}
                </Text>
              ) : null}
              {mine.office.bookedOnly && <Badge label="Booked clients only" tone="warning" />}
            </View>
            <Icon name="chevronRight" size={14} color={colors.label3} />
          </Pressable>
        )}
        <Text variant="footnote" color="label3" style={styles.note}>
          University students from outside the EU go to Hládkov instead. Smaller city parts:{' '}
          {SMALLER_PARTS.map((g) => `${g.parts.join(', ')} → Praha ${g.district}`).join('; ')}.
        </Text>
      </View>

      {OFFICE_NOTICES.map((n) => (
        <View key={n} style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
          <Icon name="info" size={18} color={colors.warning} />
          <Text variant="footnote" style={styles.noticeText}>
            {n}
          </Text>
        </View>
      ))}

      <View>
        <SectionHeader title="Offices and today’s waits" />
        <List>
          {offices.map((o) => (
            <OfficeRow key={o.id} office={o} wait={waits?.[o.id]} loaded={!!waits} />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.note}>
          {waitsError
            ? 'Couldn’t load today’s waiting times. The offices are listed anyway.'
            : 'Waits are reported by CzechPal users at the office today. If you’re there, add yours on the office’s page.'}
        </Text>
      </View>

      <View>
        <SectionHeader title="Book or ask" />
        <List>
          <Row
            icon="calendar"
            title="Book an appointment online"
            subtitle="Information Portal for Foreigners (needs an account)"
            accessory={<Icon name="external" size={14} color={colors.label3} />}
            onPress={() => Linking.openURL(BOOKING_URL)}
          />
          <Row
            icon="phone"
            title={`Call the Client Centre ${CLIENT_CENTRE.display}`}
            subtitle={`${CLIENT_CENTRE.hours}. Press 1 to book, 2 for questions, 0 for your application’s status.`}
            onPress={() => Linking.openURL(`tel:${CLIENT_CENTRE.phone}`)}
          />
          <Row icon="mail" title={CLIENT_CENTRE.email} subtitle="Client Centre email" onPress={() => Linking.openURL(`mailto:${CLIENT_CENTRE.email}`)} />
          <Row
            icon="help"
            title={`${INTEGRATION_CENTRE.name}: free advice`}
            subtitle="Legal and social help for foreigners, recommended by the ministry"
            accessory={<Icon name="external" size={14} color={colors.label3} />}
            onPress={() => Linking.openURL(INTEGRATION_CENTRE.url)}
          />
        </List>
      </View>

      <View>
        <List>
          <Row
            icon="government"
            title="Ministry of the Interior: official office list"
            subtitle={`Copied ${checked}. Check here for changes.`}
            accessory={<Icon name="external" size={14} color={colors.label3} />}
            onPress={() => Linking.openURL(OFFICES_SOURCE.url)}
          />
        </List>
      </View>
    </ScrollView>
  );
}

function OfficeRow({ office: o, wait, loaded }: { office: Office; wait: OfficeWait | undefined; loaded: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/help/offices/[id]', params: { id: o.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      <View style={styles.rowText}>
        <Text variant="callout" weight="600">
          {o.short}
        </Text>
        <Text variant="footnote" color="label2" numberOfLines={2}>
          {o.serves}
        </Text>
        {loaded && <OfficeWaitSummary wait={wait} compact />}
      </View>
      <Icon name="chevronRight" size={14} color={colors.label3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  mine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    marginTop: space.md,
    borderRadius: radius.card,
    borderCurve: 'continuous',
  },
  mineText: { flex: 1, gap: 2, alignItems: 'flex-start' },
  notice: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  noticeText: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  rowText: { flex: 1, gap: 3 },
});
