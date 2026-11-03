import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryTile, openDirections } from '@/components/explore/place-card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { activityPhrase, placeMeta } from '@/lib/explore/filter';
import { placeById } from '@/lib/explore/source';
import { useExplore, useIsSaved } from '@/store/explore';
import { layout, radius, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

/** One place in full: what it is, what you can do there, and the ways to get there or keep it. */
export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ex } = useExploreTheme();
  const savedCopy = useExplore((s) => s.saved[id]?.place);
  const place = placeById(id) ?? savedCopy ?? null;
  const saved = useIsSaved(id);
  const toggleSaved = useExplore((s) => s.toggleSaved);

  if (!place)
    return (
      <View style={[styles.missing, { backgroundColor: ex.sheet }]}>
        <Text variant="headline" style={{ color: ex.ink }}>
          This place isn’t in Explore any more.
        </Text>
      </View>
    );

  const checked = new Date(`${place.checkedOn}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <Stack.Screen options={{ title: '', headerStyle: { backgroundColor: ex.sheet }, contentStyle: { backgroundColor: ex.sheet } }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: ex.sheet }} contentContainerStyle={styles.content}>
        <CategoryTile place={place} size={72} />
        <View style={styles.titles}>
          <Text variant="largeTitle" style={{ color: ex.ink }} accessibilityRole="header">
            {place.name}
          </Text>
          {place.nameCs ? (
            <Text variant="title3" weight="500" style={{ color: ex.ink2 }} lang="cs">
              {place.nameCs}
            </Text>
          ) : null}
          <Text variant="subhead" weight="500" style={{ color: ex.ink3 }}>
            {placeMeta(place)}
          </Text>
        </View>

        <Text variant="body" style={{ color: ex.ink }}>
          {place.description}
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => openDirections(place)}
            accessibilityRole="link"
            accessibilityHint="Opens your maps app"
            style={({ pressed }) => [styles.primary, { backgroundColor: ex.ink, opacity: pressed ? 0.85 : 1 }]}>
            <Icon name="directions" size={18} color={ex.sheet} />
            <Text variant="headline" chrome style={{ color: ex.sheet }}>
              Directions
            </Text>
          </Pressable>
          <Pressable
            onPress={() => toggleSaved(place)}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            style={({ pressed }) => [
              styles.secondary,
              { backgroundColor: saved ? ex.chip : pressed ? ex.sheetMuted : ex.card, borderColor: saved ? ex.chipLine : ex.line },
            ]}>
            <Icon name={saved ? 'bookmarkFill' : 'bookmark'} size={18} color={saved ? ex.chipInk : ex.ink} />
            <Text variant="headline" chrome style={{ color: saved ? ex.chipInk : ex.ink }}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            useExplore.getState().requestFocus(place.id);
            router.back();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, styles.wide, { backgroundColor: pressed ? ex.sheetMuted : ex.card, borderColor: ex.line }]}>
          <Icon name="map" size={18} color={ex.ink} />
          <Text variant="headline" chrome style={{ color: ex.ink }}>
            Show on map
          </Text>
        </Pressable>

        <Section title="Good for">
          <View style={styles.chips}>
            {place.activities.map((a) => (
              <View key={a} style={[styles.chip, { backgroundColor: ex.chip }]}>
                <Text variant="subhead" weight="600" chrome style={{ color: ex.chipInk }}>
                  {activityPhrase(a)}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="What it’s like">
          <View style={styles.chips}>
            {place.attributes.map((a) => (
              <View key={a} style={[styles.attribute, { borderColor: ex.line }]}>
                <Text variant="subhead" weight="500" chrome style={{ color: ex.ink2 }}>
                  {a}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <View style={[styles.note, { backgroundColor: ex.card, borderColor: ex.line }]}>
          <Text variant="footnote" style={{ color: ex.ink2 }}>
            {place.source === 'curated'
              ? `Written up by CzechPal; location from OpenStreetMap, checked on ${checked}.`
              : `From OpenStreetMap, the map anyone can edit, as of ${checked}.`}{' '}
            CzechPal shows no opening hours or prices: check before you go.
          </Text>
          {place.sourceUrl ? (
            <Pressable onPress={() => Linking.openURL(place.sourceUrl!)} accessibilityRole="link" hitSlop={6}>
              <Text variant="footnote" weight="600" style={{ color: ex.chipInk }}>
                See it on OpenStreetMap (and fix it if something’s wrong)
              </Text>
            </Pressable>
          ) : null}
          <Text variant="footnote" style={{ color: ex.ink3 }}>
            Place data © OpenStreetMap contributors
          </Text>
          {place.photo ? (
            <Text variant="footnote" style={{ color: ex.ink3 }}>
              Photo: {place.photo.credit}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { ex } = useExploreTheme();
  return (
    <View style={styles.section}>
      <Text variant="footnote" weight="600" style={{ color: ex.ink3 }} accessibilityRole="header">
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge * 2, gap: space.xl },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter },
  titles: { gap: space.xs },
  actions: { flexDirection: 'row', gap: space.sm },
  primary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 52, borderRadius: 999 },
  secondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 52,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  wide: { flex: 0, marginTop: -space.md },
  section: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { borderRadius: 999, paddingHorizontal: space.md, paddingVertical: 6 },
  attribute: { borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.md, paddingVertical: 6 },
  note: { borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, gap: space.xs },
});
