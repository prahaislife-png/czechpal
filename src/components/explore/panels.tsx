import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ActivityId, Area } from '@/lib/explore/types';
import { radius, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

export type PlanTime = '1h' | '2h' | 'half';
export type PlanBudget = 'free' | 'low' | 'any';
export type PlanState = { time: PlanTime; activity: ActivityId; budget: PlanBudget; area: Area };

export const planTimes: { id: PlanTime; label: string }[] = [
  { id: '1h', label: 'an hour' },
  { id: '2h', label: '2 hours' },
  { id: 'half', label: 'half a day' },
];

export const planBudgets: { id: PlanBudget; label: string }[] = [
  { id: 'free', label: 'free' },
  { id: 'low', label: 'under 300 Kč' },
  { id: 'any', label: 'any budget' },
];

/**
 * Plan: the shape of the AI planner, honestly labelled. Nothing is generated yet; the one action
 * shows the places that fit the activity and area, which is all the data can answer today.
 */
export function PlanPanel({ plan, matches, onShow }: { plan: PlanState; matches: number; onShow: () => void }) {
  const { ex } = useExploreTheme();
  return (
    <View style={styles.stack}>
      <View style={[styles.card, { backgroundColor: ex.card, borderColor: ex.line }]}>
        <View style={[styles.badge, { backgroundColor: ex.sheetMuted, borderColor: ex.line }]}>
          <Text variant="caption" weight="700" chrome style={{ color: ex.ink2 }}>
            PREVIEW · NOT LIVE YET
          </Text>
        </View>
        <Text variant="title3" style={{ color: ex.ink }}>
          Plans made for your time are coming
        </Text>
        <Text variant="subhead" style={{ color: ex.ink2 }}>
          Soon CzechLocal will turn this sentence into a short route: where to start, what to see and how long each stop takes.
          It doesn’t do that yet, so nothing below is a generated plan.
        </Text>
        <Text variant="subhead" style={{ color: ex.ink2 }}>
          For now, your activity and area pick the places. Time and budget are saved for when planning arrives.
        </Text>
      </View>

      <Pressable
        onPress={onShow}
        disabled={matches === 0}
        accessibilityRole="button"
        accessibilityHint="Opens Explore with these choices"
        style={({ pressed }) => [styles.button, { backgroundColor: ex.ink, opacity: matches === 0 ? 0.4 : pressed ? 0.85 : 1 }]}>
        <Text variant="headline" chrome style={{ color: ex.sheet }}>
          {matches === 0 ? 'No places fit yet' : `Show ${matches === 1 ? 'the 1 place' : `${matches} places`} that fit`}
        </Text>
        {matches > 0 ? <Icon name="arrowRight" size={18} color={ex.sheet} /> : null}
      </Pressable>
    </View>
  );
}

/** People: what will be here, and why nothing is yet. No invented events. */
export function PeoplePanel() {
  const { ex } = useExploreTheme();
  return (
    <View style={styles.stack}>
      <View style={[styles.card, { backgroundColor: ex.card, borderColor: ex.line }]}>
        <View style={[styles.well, { backgroundColor: ex.chip }]}>
          <Icon name="people" size={22} color={ex.chipInk} />
        </View>
        <Text variant="title3" style={{ color: ex.ink }}>
          Find people to go with
        </Text>
        <Text variant="subhead" style={{ color: ex.ink2 }}>
          Walking groups, park runs and outdoor meetups for newcomers to Prague will be listed here, from organisers CzechLocal has
          checked.
        </Text>
        <Text variant="subhead" style={{ color: ex.ink2 }}>
          Nothing is listed yet. CzechLocal won’t show an event it can’t confirm is real.
        </Text>
      </View>
      <Point icon="calendar" text="Dates, places and who runs each event, so you know what you’re joining." />
      <Point icon="globe" text="The language each group speaks, including Czech practice walks." />
    </View>
  );
}

function Point({ icon, text }: { icon: IconName; text: string }) {
  const { ex } = useExploreTheme();
  return (
    <View style={styles.point}>
      <Icon name={icon} size={18} color={ex.ink3} />
      <Text variant="subhead" style={[styles.pointText, { color: ex.ink2 }]}>
        {text}
      </Text>
    </View>
  );
}

export function SavedEmpty() {
  const { ex } = useExploreTheme();
  return (
    <View style={[styles.card, { backgroundColor: ex.card, borderColor: ex.line }]}>
      <View style={[styles.well, { backgroundColor: ex.chip }]}>
        <Icon name="bookmark" size={22} color={ex.chipInk} />
      </View>
      <Text variant="title3" style={{ color: ex.ink }}>
        Keep the places you like
      </Text>
      <Text variant="subhead" style={{ color: ex.ink2 }}>
        Tap the bookmark on any place to keep it here and see it on the map. Saved places stay on this phone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  card: {
    borderRadius: radius.card,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.xl,
    gap: space.sm,
    alignItems: 'flex-start',
  },
  badge: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: space.sm, paddingVertical: 3, marginBottom: space.xs },
  well: { width: 44, height: 44, borderRadius: radius.well + 4, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 54,
    borderRadius: 999,
    paddingHorizontal: space.xl,
  },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingHorizontal: space.sm },
  pointText: { flex: 1 },
});
