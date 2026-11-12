import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { allEntries } from '@/lib/help/areas';
import { placeKinds, placeTitle, searchPlaces, type Place } from '@/lib/help/places';
import { fold } from '@/lib/help/practices';
import { radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Two letters are enough to start looking. */
export const isSearching = (query: string) => fold(query).length >= 2;

/** Help's search box: one field for every list and every place. */
export function SearchField({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <Icon name="search" size={18} color={colors.label3} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Doctor, embassy, notary, plumber…"
        placeholderTextColor={colors.label3}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search places and services"
        style={[styles.input, ramp.body, { color: colors.label }]}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
          <Icon name="close" size={16} color={colors.label3} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Lists that match by title or keyword, then the places themselves (office, embassy, notary…). */
export function SearchResults({ query }: { query: string }) {
  const q = fold(query);
  const entries = allEntries.filter((e) => fold(`${e.title} ${e.subtitle} ${e.keywords.join(' ')}`).includes(q));
  const [places, setPlaces] = useState<{ q: string; items: Place[] } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    let active = true;
    const t = setTimeout(() => {
      searchPlaces(query)
        .then((items) => {
          if (!active) return;
          setPlaces({ q, items });
          setFailed(null);
        })
        .catch((e: Error) => {
          if (active) setFailed(e.message);
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, q]);

  const loading = !failed && places?.q !== q;
  const found = places?.q === q ? places.items : [];

  return (
    <View style={styles.results}>
      {entries.length > 0 && (
        <View>
          <SectionHeader title="Lists" />
          <List>
            {entries.map((e) => (
              <Row key={e.id} icon={e.icon} title={e.title} subtitle={e.subtitle} chevron onPress={() => router.push(e.href)} />
            ))}
          </List>
        </View>
      )}
      {found.length > 0 && (
        <View>
          <SectionHeader title="Places" />
          <List>
            {found.map((p) => (
              <Row
                key={p.id}
                icon={placeKinds[p.kind === 'consulate' ? 'embassy' : p.kind].icon}
                title={placeTitle(p)}
                subtitle={[
                  // Say what it is: a notary's result is just a person's name otherwise.
                  p.kind === 'consulate' ? 'Consulate' : placeKinds[p.kind].one,
                  p.address,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                chevron
                onPress={() => router.push({ pathname: '/help/place/[id]', params: { id: p.id } })}
              />
            ))}
          </List>
        </View>
      )}
      {loading ? (
        <ActivityIndicator style={styles.spinner} accessibilityLabel="Searching" />
      ) : failed && entries.length === 0 ? (
        <Text variant="callout" color="danger" style={styles.footer} accessibilityLiveRegion="polite">
          {failed}
        </Text>
      ) : entries.length === 0 && found.length === 0 ? (
        <Text variant="callout" color="label2" style={styles.footer} accessibilityLiveRegion="polite">
          Nothing found for “{query.trim()}”. Try another word, or clear the search to browse.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48, paddingHorizontal: space.lg, borderRadius: radius.pill, borderCurve: 'continuous', borderWidth: 1 },
  input: { flex: 1, paddingVertical: space.md, outlineWidth: 0, outlineColor: 'transparent' },
  results: { gap: space.xxl },
  spinner: { marginTop: space.lg },
  footer: { paddingHorizontal: space.lg, marginTop: space.sm },
});
