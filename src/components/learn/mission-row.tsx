import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { missionProgress, type Mission, type MissionState } from '@/lib/learn/missions';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** A mission in a list: the task, its Czech, and how far along it is as five segments. */
export function MissionRow({ mission, state }: { mission: Mission; state: MissionState }) {
  const { colors } = useTheme();
  const { done, total, finished, next } = missionProgress(mission, state);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/mission/[id]', params: { id: mission.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${mission.title}, ${mission.level}. ${finished ? 'Complete' : `${done} of ${total} steps done`}`}
      style={[styles.row, { backgroundColor: colors.surface }]}>
      <View style={[styles.icon, { backgroundColor: finished ? colors.successSoft : colors.accentSoft }]}>
        <Icon name={finished ? 'check' : 'flag'} size={20} color={finished ? colors.success : colors.accent} />
      </View>
      <View style={styles.text}>
        <Text variant="headline" numberOfLines={2}>
          {mission.title}
        </Text>
        <Text variant="footnote" color="label2" numberOfLines={1}>
          {finished ? 'Complete' : done === 0 ? `${mission.level} · ${mission.cs}` : `Next: ${next?.label}`}
        </Text>
        <View style={styles.segments}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.segment, { backgroundColor: i < done ? (finished ? colors.success : colors.accentFill) : colors.fill }]} />
          ))}
        </View>
      </View>
      <Icon name="chevronRight" size={14} color={colors.label3} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 3 },
  segments: { flexDirection: 'row', gap: 4, marginTop: space.xs },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});
