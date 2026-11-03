import { StyleSheet, Text as RNText, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { categories } from '@/lib/explore/filter';
import type { PlaceCategory } from '@/lib/explore/types';
import { useExploreTheme } from '@/theme/use-theme';

/** Every pin sits in a 44 pt square (its tap target); a name, when shown, hangs below it. */
const HIT = 44;
const LABEL = 20;
/** The label tucks 6 pt up under the pin, so it adds this much height below the tap target. */
const LABEL_BELOW = LABEL - 6;

/** Where the pin's centre is in the marker, from the top, for anchoring it to its place. */
export const pinCentre = () => HIT / 2;
/** The same, as a fraction of the marker's height (react-native-maps anchors this way). */
export const pinAnchorY = (labelled: boolean) => HIT / 2 / (HIT + (labelled ? LABEL_BELOW : 0));

/**
 * A place on the map: a small disc in its category's tone with its glyph. Selected, it grows and
 * gets a blue ring. Close in, named places carry their name, so the map reads without tapping.
 */
export function PlacePin({ category, selected, label }: { category: PlaceCategory; selected: boolean; label?: string }) {
  const { ex } = useExploreTheme();
  const { tone, icon } = categories[category];
  const size = selected ? 36 : 26;
  const disc = (
    <View style={[styles.pin, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone, borderWidth: selected ? 2.5 : 2 }]}>
      <Icon name={icon} size={selected ? 18 : 13} color="#FFFFFF" />
    </View>
  );
  return (
    <View style={styles.marker}>
      <View style={styles.hit}>{selected ? <View style={[styles.ring, { borderColor: ex.chipInk }]}>{disc}</View> : disc}</View>
      {label ? (
        <View style={[styles.label, { backgroundColor: ex.float, borderColor: selected ? ex.chipLine : ex.line }]}>
          <RNText
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
            style={[styles.labelText, { color: selected ? ex.chipInk : ex.ink, fontWeight: selected ? '700' : '600' }]}>
            {label}
          </RNText>
        </View>
      ) : null}
    </View>
  );
}

/** Several places too close to tell apart at this zoom: a quiet count. */
export function ClusterPin({ count }: { count: number }) {
  const { ex } = useExploreTheme();
  const size = count >= 10 ? 36 : 32;
  return (
    <View style={styles.marker}>
      <View style={styles.hit}>
        <View style={[styles.cluster, { width: size, height: size, borderRadius: size / 2, backgroundColor: ex.float, borderColor: ex.line }]}>
          <Text variant="footnote" weight="700" tabular chrome style={{ color: ex.ink }}>
            {count}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: { alignItems: 'center', maxWidth: 140 },
  hit: { width: HIT, height: HIT, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    boxShadow: '0px 1px 4px rgba(40, 30, 10, 0.30)',
  },
  label: {
    height: LABEL,
    marginTop: -6,
    paddingHorizontal: 7,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    boxShadow: '0px 1px 3px rgba(40, 30, 10, 0.12)',
  },
  labelText: { fontSize: 11, lineHeight: 14, letterSpacing: -0.1 },
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: '0px 1px 6px rgba(40, 30, 10, 0.16)',
  },
});
