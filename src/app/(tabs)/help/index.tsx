import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useLargeText } from '@/lib/a11y';
import { allEntries, areas } from '@/lib/help/areas';
import { emergencyNumbers } from '@/lib/help/directory';
import { placeKinds, placeTitle, searchPlaces, type Place } from '@/lib/help/places';
import { fold } from '@/lib/help/practices';
import { supportLines } from '@/lib/help/urgent';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Find: every contact and place an expat looks for, in one tab. Search first, then the areas,
 * then the numbers to call in an emergency or when someone needs to talk.
 */
export default function FindScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const searching = fold(query).length >= 2;
  const [primary, ...others] = emergencyNumbers;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}>
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        <Icon name="search" size={18} color={colors.label3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Doctor, embassy, notary, plumber…"
          placeholderTextColor={colors.label3}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search everything in Find"
          style={[styles.searchInput, ramp.body, { color: colors.label }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
            <Icon name="close" size={16} color={colors.label3} />
          </Pressable>
        ) : null}
      </View>

      {searching ? (
        <SearchResults query={query} />
      ) : (
        <>
          <List inset={false}>
            <EmergencyRow {...primary} prominent />
            <Row
              icon="night"
              title="Sick tonight or at the weekend?"
              subtitle="After-hours doctors, dentists and night pharmacies"
              chevron
              onPress={() => router.push('/help/urgent')}
            />
          </List>

          <View style={styles.tiles}>
            {areas.map((a) => (
              <AreaTile
                key={a.id}
                icon={a.icon}
                title={a.title}
                short={a.short}
                onPress={() => router.push({ pathname: '/help/area/[area]', params: { area: a.id } })}
              />
            ))}
          </View>

          <View>
            <SectionHeader title="Emergency" />
            <List inset={false}>
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
        </>
      )}
    </ScrollView>
  );
}

/** Lists that match by title or keyword, then the places themselves (office, embassy, notary…). */
function SearchResults({ query }: { query: string }) {
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
      ) : failed ? (
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

function AreaTile({ icon, title, short, onPress }: { icon: Parameters<typeof Icon>[0]['name']; title: string; short: string; onPress: () => void }) {
  const { colors } = useTheme();
  const largeText = useLargeText();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={short}
      style={[styles.tile, largeText && styles.tileWide, { backgroundColor: colors.surface }]}>
      <View style={[styles.tileIcon, { backgroundColor: colors.accentSoft }]}>
        <Icon name={icon} size={22} color={colors.accent} />
      </View>
      <Text variant="headline">{title}</Text>
      <Text variant="footnote" color="label2">
        {short}
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  searchInput: { flex: 1, paddingVertical: space.md, outlineWidth: 0, outlineColor: 'transparent' },
  results: { gap: space.xxl },
  spinner: { marginTop: space.lg },
  footer: { paddingHorizontal: space.lg, marginTop: space.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    minHeight: 132,
  },
  tileWide: { flexBasis: '100%' },
  tileIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
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
