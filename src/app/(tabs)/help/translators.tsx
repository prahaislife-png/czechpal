import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { fold } from '@/lib/help/practices';
import { CHECKED_ON, POPULAR_COUNT, registerUrl, translatorLanguages } from '@/lib/help/translators';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Certified translators by language. Picking a language opens the Ministry of Justice's official
 * register, already filtered: the register stays the source, and nobody's details are copied.
 */
export default function TranslatorsScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('');
  const [anywhere, setAnywhere] = useState(false);

  const q = fold(filter);
  const matches = useMemo(() => translatorLanguages.filter((l) => fold(l.name).includes(q)), [q]);
  const external = <Icon name="external" size={14} color={colors.label3} />;
  const open = (id: number) => Linking.openURL(registerUrl(id, anywhere));
  const rows = (list: typeof translatorLanguages) =>
    list.map((l) => (
      <Row
        key={l.id}
        title={l.name}
        accessory={external}
        accessibilityHint="Opens the official register of certified translators"
        onPress={() => open(l.id)}
      />
    ));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text variant="subhead" color="label2" style={styles.intro}>
        Foreign documents for the immigration office usually need a certified translation (soudní překlad). Only
        translators in the Ministry of Justice’s official register can make one.
      </Text>

      <View style={[styles.filter, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        <Icon name="search" size={16} color={colors.label3} />
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Language"
          placeholderTextColor={colors.label3}
          autoCorrect={false}
          accessibilityLabel="Filter languages"
          style={[styles.filterInput, ramp.body, { color: colors.label }]}
        />
      </View>

      <List>
        <Row
          icon="location"
          title="Translators anywhere in Czechia"
          subtitle={anywhere ? 'Showing the whole country' : 'Showing translators based in Prague'}
          accessory={
            <Switch
              value={anywhere}
              onValueChange={setAnywhere}
              trackColor={{ true: colors.accentFill }}
              accessibilityLabel="Translators anywhere in Czechia"
            />
          }
        />
      </List>

      {q ? (
        <View>
          <SectionHeader title="Languages" />
          {matches.length ? (
            <List>{rows(matches)}</List>
          ) : (
            <Text variant="callout" color="label2" style={styles.intro}>
              No register language matches “{filter.trim()}”.
            </Text>
          )}
        </View>
      ) : (
        <>
          <View>
            <SectionHeader title="Most asked for" />
            <List>{rows(translatorLanguages.slice(0, POPULAR_COUNT))}</List>
          </View>
          <View>
            <SectionHeader title="All languages" />
            <List>{rows(translatorLanguages.slice(POPULAR_COUNT))}</List>
          </View>
        </>
      )}

      <Text variant="footnote" color="label3" style={styles.intro}>
        Opens seznat.justice.cz, the official register run by the Ministry of Justice, in Czech. Languages as listed in
        the register on {new Date(`${CHECKED_ON}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  intro: { paddingHorizontal: space.xs },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  filterInput: { flex: 1, paddingVertical: space.sm, outlineWidth: 0, outlineColor: 'transparent' },
});
