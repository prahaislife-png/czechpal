import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ExplorePlace, LatLng } from '@/lib/explore/types';
import { useExplore, useIsSaved } from '@/store/explore';
import { layout, radius, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

import { CategoryTile, metaLine, openDirections } from './place-card';

/**
 * The tapped place, floating just above the sheet: what it is, where, and the two things people
 * do next (go there, keep it). Details opens the full page.
 */
export function PlacePreview({
  place,
  from,
  reduceMotion,
  onClose,
  onDetails,
}: {
  place: ExplorePlace;
  from?: LatLng | null;
  reduceMotion: boolean;
  onClose: () => void;
  onDetails: () => void;
}) {
  const { ex } = useExploreTheme();
  const saved = useIsSaved(place.id);
  const toggleSaved = useExplore((s) => s.toggleSaved);

  return (
    <Animated.View
      key={place.id}
      entering={reduceMotion ? FadeIn.duration(150) : FadeInDown.springify().damping(18).stiffness(220)}
      exiting={reduceMotion ? FadeOut.duration(120) : FadeOutDown.duration(160)}
      style={[styles.card, { backgroundColor: ex.card, borderColor: ex.line, boxShadow: ex.shadow }]}
      accessibilityViewIsModal={false}>
      <Pressable onPress={onDetails} accessibilityRole="button" accessibilityHint="Opens the details" style={styles.head}>
        <CategoryTile place={place} size={52} />
        <View style={styles.titles}>
          <Text variant="headline" numberOfLines={2} style={{ color: ex.ink }}>
            {place.name}
          </Text>
          <Text variant="footnote" numberOfLines={1} style={{ color: ex.ink3 }}>
            {metaLine(place, from)}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} style={[styles.close, { backgroundColor: ex.sheetMuted }]}>
        <Icon name="close" size={13} color={ex.ink2} />
      </Pressable>

      <Text variant="subhead" numberOfLines={2} style={{ color: ex.ink2 }}>
        {place.description}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => openDirections(place)}
          accessibilityRole="link"
          accessibilityLabel={`Directions to ${place.name}`}
          accessibilityHint="Opens your maps app"
          style={({ pressed }) => [styles.go, { backgroundColor: ex.ink, opacity: pressed ? 0.85 : 1 }]}>
          <Icon name="directions" size={16} color={ex.sheet} />
          <Text variant="subhead" weight="600" chrome style={{ color: ex.sheet }}>
            Directions
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleSaved(place)}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Saved. Remove from Saved' : 'Save'}
          accessibilityState={{ selected: saved }}
          style={({ pressed }) => [
            styles.side,
            { backgroundColor: saved ? ex.chip : pressed ? ex.sheetMuted : 'transparent', borderColor: saved ? ex.chipLine : ex.line },
          ]}>
          <Icon name={saved ? 'bookmarkFill' : 'bookmark'} size={16} color={saved ? ex.chipInk : ex.ink} />
          <Text variant="subhead" weight="600" chrome style={{ color: saved ? ex.chipInk : ex.ink }}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDetails}
          accessibilityRole="button"
          accessibilityLabel="Details"
          style={({ pressed }) => [styles.more, { borderColor: ex.line, backgroundColor: pressed ? ex.sheetMuted : 'transparent' }]}>
          <Icon name="chevronRight" size={16} color={ex.ink} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.gutter - 8,
    borderRadius: radius.card + 2,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
    gap: space.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingRight: space.xxl },
  titles: { flex: 1, gap: 2 },
  close: { position: 'absolute', top: space.md, right: space.md, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: space.sm },
  go: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 46, borderRadius: 999 },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 46,
    paddingHorizontal: space.lg,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  more: { width: 46, height: 46, borderRadius: 23, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
});
