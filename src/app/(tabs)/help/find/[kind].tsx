import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { PracticeRow } from '@/components/practice';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Field } from '@/components/ui/field';
import { SkeletonLine } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  DirectoryError,
  kindById,
  PAGE_SIZE,
  PRAGUE_DISTRICTS,
  searchPractices,
  SOURCE_NOTE,
  type Practice,
  type PracticeKind,
} from '@/lib/help/practices';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Page = { key: string; items: Practice[]; done: boolean; error?: string };

/** Every GP, dentist, children's doctor or gynaecologist in Prague, with what users reported. */
export default function FindPracticeScreen() {
  const { kind: kindParam } = useLocalSearchParams<{ kind: string }>();
  const kind = kindById(kindParam);

  if (!kind) return <Redirect href="/help" />;
  return <PracticeList kind={kind.id} title={kind.title} />;
}

function PracticeList({ kind, title }: { kind: PracticeKind; title: string }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [district, setDistrict] = useState<string | undefined>();
  const [newPatients, setNewPatients] = useState(false);
  const [english, setEnglish] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState<Page | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search as you type, but only once typing pauses.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Results belong to the filters that asked for them; changing a filter shows loading, not stale rows.
  const key = JSON.stringify([kind, district, debounced, newPatients, english, attempt]);
  const current = page?.key === key ? page : null;

  useEffect(() => {
    let active = true;
    searchPractices({ kind, district, query: debounced, newPatients, english })
      .then((items) => active && setPage({ key, items, done: items.length < PAGE_SIZE }))
      .catch((e: unknown) => {
        if (active) setPage({ key, items: [], done: true, error: e instanceof DirectoryError ? e.message : 'Something went wrong.' });
      });
    return () => {
      active = false;
    };
  }, [key, kind, district, debounced, newPatients, english]);

  const loadMore = () => {
    if (!current || current.done || current.error || loadingMore) return;
    setLoadingMore(true);
    searchPractices({ kind, district, query: debounced, newPatients, english, offset: current.items.length })
      .then((more) =>
        setPage((p) => {
          if (!p || p.key !== key) return p;
          const seen = new Set(p.items.map((i) => i.id));
          return { ...p, items: [...p.items, ...more.filter((m) => !seen.has(m.id))], done: more.length < PAGE_SIZE };
        }),
      )
      .catch(() => setPage((p) => (p && p.key === key ? { ...p, done: true } : p)))
      .finally(() => setLoadingMore(false));
  };

  const filtersOn = newPatients || english || !!district || debounced.trim().length >= 2;

  const header = (
    <View style={styles.header}>
      <Field
        label="Search by name or street"
        value={query}
        onChangeText={setQuery}
        placeholder="For example Vinohradská"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <View style={styles.chips}>
        <Chip label="Taking new patients" role="checkbox" selected={newPatients} onPress={() => setNewPatients((v) => !v)} />
        <Chip label="English spoken" role="checkbox" selected={english} onPress={() => setEnglish((v) => !v)} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.districts}>
        <Chip label="All of Prague" role="radio" selected={!district} onPress={() => setDistrict(undefined)} />
        {PRAGUE_DISTRICTS.map((d) => (
          <Chip key={d} label={d} role="radio" selected={district === d} onPress={() => setDistrict(district === d ? undefined : d)} />
        ))}
      </ScrollView>
    </View>
  );

  const empty = !current ? (
    <View style={styles.skeleton} accessibilityLabel="Loading practices">
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <SkeletonLine width="70%" height={16} />
          <SkeletonLine width="45%" />
        </View>
      ))}
    </View>
  ) : current.error ? (
    <View style={styles.message}>
      <Text variant="callout" color="label2" align="center">
        {current.error}
      </Text>
      <Button label="Try again" icon="refresh" variant="secondary" size="medium" onPress={() => setAttempt((a) => a + 1)} />
    </View>
  ) : (
    <View style={styles.message}>
      <Text variant="headline" align="center">
        {newPatients || english ? 'Nobody has reported this here yet' : 'No practices found'}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {newPatients || english
          ? 'Turn the filter off to see every practice. When you contact one, tell others what you found.'
          : 'Try another district or a shorter search.'}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title }} />
      <FlatList
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
        data={current?.items ?? []}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <PracticeRow
            practice={item}
            onPress={() => router.push({ pathname: '/help/practice/[id]', params: { id: String(item.id) } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <View style={styles.footer}>
            {loadingMore ? <ActivityIndicator color={colors.label3} /> : null}
            {current && !current.error && current.items.length > 0 && !filtersOn ? (
              <Text variant="footnote" color="label3" align="center">
                Practices reported as taking new patients or speaking English come first.
              </Text>
            ) : null}
            <Text variant="footnote" color="label3" align="center">
              {SOURCE_NOTE} Reports come from CzechPal users and can change, so call to confirm.
            </Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.huge },
  header: { padding: layout.gutter, paddingBottom: space.md, gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  districts: { gap: space.sm, paddingRight: space.lg },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: space.lg },
  skeleton: { paddingHorizontal: space.lg, gap: space.xl, paddingTop: space.md },
  skeletonRow: { gap: space.sm },
  message: { alignItems: 'center', gap: space.md, padding: space.xxl },
  footer: { gap: space.md, padding: layout.gutter, paddingTop: space.xl },
});
