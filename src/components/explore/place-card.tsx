import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { categories, directionsUrl, distanceM, formatDistance, placeWhere } from '@/lib/explore/filter';
import type { ExplorePlace, LatLng } from '@/lib/explore/types';
import { useExplore, useIsSaved } from '@/store/explore';
import { radius, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

export const openDirections = (p: ExplorePlace) => Linking.openURL(directionsUrl(p, process.env.EXPO_OS));

/** The category's glyph on a soft tint of its tone: stands in when there is no verified photo. */
export function CategoryTile({ place, size = 56 }: { place: ExplorePlace; size?: number }) {
  const { tone, icon } = categories[place.category];
  const corner = Math.round(size * 0.28);
  if (place.photo)
    return (
      <Image
        source={{ uri: place.photo.uri }}
        style={{ width: size, height: size, borderRadius: corner }}
        contentFit="cover"
        accessibilityLabel={`Photo of ${place.name}. ${place.photo.credit}`}
      />
    );
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: corner, backgroundColor: `${tone}1F` }]}>
      <Icon name={icon} size={Math.round(size * 0.44)} color={tone} />
    </View>
  );
}

/** "Park · Holešovice, Praha 7 · 1.2 km". */
export function metaLine(p: ExplorePlace, from?: LatLng | null) {
  const parts = [categories[p.category].label, placeWhere(p)];
  if (from) parts.push(formatDistance(distanceM(from, p)));
  return parts.join(' · ');
}

/**
 * The list: one quiet group of rows, the way a phone lists things. A row is the place's tile,
 * its name and where it is; tapping it shows the place on the map. Saving is one tap on the
 * right.
 */
export function PlaceList({
  places,
  selectedId,
  from,
  onSelect,
}: {
  places: ExplorePlace[];
  selectedId: string | null;
  from?: LatLng | null;
  onSelect: (p: ExplorePlace) => void;
}) {
  const { ex } = useExploreTheme();
  return (
    <View style={[styles.group, { backgroundColor: ex.card, borderColor: ex.line }]}>
      {places.map((p, i) => (
        <PlaceRow key={p.id} place={p} first={i === 0} selected={p.id === selectedId} from={from} onPress={() => onSelect(p)} />
      ))}
    </View>
  );
}

function PlaceRow({
  place,
  first,
  selected,
  from,
  onPress,
}: {
  place: ExplorePlace;
  first: boolean;
  selected: boolean;
  from?: LatLng | null;
  onPress: () => void;
}) {
  const { ex } = useExploreTheme();
  const saved = useIsSaved(place.id);
  const toggleSaved = useExplore((s) => s.toggleSaved);
  return (
    <View style={[styles.row, selected && { backgroundColor: ex.chip }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${place.name}. ${metaLine(place, from)}`}
        accessibilityHint="Shows it on the map"
        accessibilityState={{ selected }}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.6 }]}>
        <CategoryTile place={place} size={44} />
        <View style={[styles.rowText, !first && { borderTopColor: ex.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
          <Text variant="callout" weight="600" numberOfLines={1} style={{ color: ex.ink }}>
            {place.name}
          </Text>
          <Text variant="footnote" numberOfLines={1} style={{ color: ex.ink3 }}>
            {metaLine(place, from)}
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => toggleSaved(place)}
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${place.name} from Saved` : `Save ${place.name}`}
        accessibilityState={{ selected: saved }}
        hitSlop={6}
        style={[styles.save, !first && { borderTopColor: ex.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
        <Icon name={saved ? 'bookmarkFill' : 'bookmark'} size={18} color={saved ? ex.chipInk : ex.ink3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  group: { borderRadius: radius.card, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'stretch', paddingLeft: space.md },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  // The divider starts at the text, as iOS lists do.
  rowText: { flex: 1, minHeight: 62, justifyContent: 'center', gap: 2, paddingVertical: space.sm },
  save: { width: 52, alignItems: 'center', justifyContent: 'center' },
});
