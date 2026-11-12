import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { toneColors } from '@/components/design/tone';
import { EmergencyRow } from '@/components/help/emergency-row';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { areaById } from '@/lib/help/areas';
import { forYou } from '@/lib/help/for-you';
import { useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * One area of life (Health, Visa and residence…), as one page: where to go, what CzechLocal can
 * do about it right now (explain a letter, write the message), and the phrases worth knowing.
 */
export default function AreaScreen() {
  const { area: id } = useLocalSearchParams<{ area: string }>();
  const { colors } = useTheme();
  const about = useStore((s) => s.about);
  const mine = useMemo(() => forYou(about), [about]);
  const area = areaById(id);
  if (!area) return <Redirect href="/help" />;
  const { tint, ink } = toneColors(colors, area.tone);
  const office = area.id === 'visa' ? mine.office : undefined;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: area.title }} />

      <View style={[styles.head, { backgroundColor: tint }]}>
        <View style={[styles.headIcon, { backgroundColor: colors.surface }]}>
          <Icon name={area.icon} size={20} color={ink} />
        </View>
        <Text variant="callout" style={[styles.flex, { color: ink }]}>
          {area.intro}
        </Text>
      </View>

      {area.id === 'health' ? (
        <List inset={false}>
          <EmergencyRow number="155" label="Ambulance" detail="Life in danger: call now, it’s free" prominent />
        </List>
      ) : null}

      <View>
        <SectionHeader title="Where to go" />
        <List>
          {office ? (
            <Row
              icon="location"
              title={`Your office: ${office.office.short}`}
              subtitle={`For ${office.district} · hours and today’s waits`}
              chevron
              onPress={() => router.push({ pathname: '/help/offices/[id]', params: { id: office.office.id } })}
            />
          ) : null}
          {area.entries.map((e) => (
            <Row key={e.id} icon={e.icon} title={e.title} subtitle={e.subtitle} chevron onPress={() => router.push(e.href)} />
          ))}
        </List>
      </View>

      <View>
        <SectionHeader title="Let CzechLocal do it" />
        <List>
          {area.actions.map((a) => (
            <Row key={a.id} icon={a.icon} title={a.title} subtitle={a.subtitle} chevron onPress={() => router.push(a.href)} />
          ))}
        </List>
      </View>

      {area.phrases ? (
        <View>
          <SectionHeader title="Say it yourself" />
          <List>
            <Row
              icon="book"
              title={area.phrases.title}
              subtitle="The sentences you’ll need, to listen to and practise"
              chevron
              onPress={() => router.push({ pathname: '/prepare/[id]', params: { id: area.phrases!.situation } })}
            />
          </List>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  headIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
