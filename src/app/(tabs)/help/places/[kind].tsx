import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { listPlaces, placeKinds, placeTitle, type Place, type PlaceKind } from '@/lib/help/places';
import { fold } from '@/lib/help/practices';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type ListKind = Exclude<PlaceKind, 'consulate'>;
const isKind = (v: unknown): v is ListKind => typeof v === 'string' && v in placeKinds;

/** A list of official places of one kind (town halls, notaries, embassies, offices), with a filter. */
export default function PlacesScreen() {
  const { colors } = useTheme();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [attempt, setAttempt] = useState(0);
  const valid = isKind(kind);

  useEffect(() => {
    if (!valid) return;
    let active = true;
    listPlaces(kind)
      .then((items) => {
        if (active) setPlaces(items);
      })
      .catch((e: Error) => {
        if (active) setFailed(e.message);
      });
    return () => {
      active = false;
    };
  }, [kind, valid, attempt]);

  const shown = useMemo(() => {
    const q = fold(filter);
    if (!places || !q) return places ?? [];
    return places.filter((p) => fold([p.name, p.country, p.address, p.district].filter(Boolean).join(' ')).includes(q));
  }, [places, filter]);

  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((a) => a + 1);
  }, []);

  if (!valid) return <Redirect href="/help" />;
  const meta = placeKinds[kind];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: meta.title }} />
      <FlatList
        data={shown}
        keyExtractor={(p) => p.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="subhead" color="label2" style={styles.intro}>
              {meta.detail}
            </Text>
            {places && places.length > 8 && (
              <View style={[styles.filter, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
                <Icon name="search" size={16} color={colors.label3} />
                <TextInput
                  value={filter}
                  onChangeText={setFilter}
                  placeholder={kind === 'embassy' ? 'Country' : 'Name, street or district'}
                  placeholderTextColor={colors.label3}
                  autoCorrect={false}
                  accessibilityLabel={`Filter ${meta.title.toLowerCase()}`}
                  style={[styles.filterInput, ramp.body, { color: colors.label }]}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.item,
              { backgroundColor: colors.surface },
              index === 0 && styles.first,
              index === shown.length - 1 && styles.last,
            ]}>
            <Row
              title={placeTitle(item)}
              subtitle={[item.kind === 'embassy' || item.kind === 'consulate' ? item.name : null, item.address]
                .filter(Boolean)
                .join(' · ')}
              chevron
              onPress={() => router.push({ pathname: '/help/place/[id]', params: { id: item.id } })}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
        ListEmptyComponent={
          failed ? (
            <View style={styles.empty} accessibilityLiveRegion="polite">
              <Text variant="callout" color="danger" accessibilityLiveRegion="polite">
                {failed}
              </Text>
              <Button label="Try again" variant="secondary" size="medium" icon="refresh" onPress={retry} style={styles.retry} />
            </View>
          ) : places === null ? (
            <ActivityIndicator style={styles.spinner} accessibilityLabel="Loading" />
          ) : (
            <Text variant="callout" color="label2" style={styles.empty}>
              Nothing matches “{filter.trim()}”.
            </Text>
          )
        }
        ListFooterComponent={
          <Text variant="footnote" color="label3" style={styles.source}>
            Source: {meta.source}.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.huge },
  header: { gap: space.lg, marginBottom: space.lg },
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
  item: { overflow: 'hidden' },
  first: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  last: { borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: space.lg },
  empty: { gap: space.md, paddingHorizontal: space.xs, paddingTop: space.lg },
  retry: { alignSelf: 'flex-start' },
  spinner: { marginTop: space.xxl },
  source: { paddingHorizontal: space.xs, marginTop: space.lg },
});
