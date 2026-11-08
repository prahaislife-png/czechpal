import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { levelLabels, speakingLevel } from '@/lib/speak/evidence';
import { useSpeak } from '@/store/speak';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Learn's way into Speak Czech. */
export function SpeakCard() {
  const { colors } = useTheme();
  const sessions = useSpeak((s) => s.sessions.length);
  const level = useSpeak((s) => speakingLevel(s.events));
  return (
    <PressableScale
      onPress={() => router.push('/learn/speak')}
      accessibilityRole="button"
      accessibilityLabel="Speak Czech: talk with CzechLocal out loud"
      style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      <View style={[styles.well, { backgroundColor: colors.accentFill }]}>
        <Icon name="mic" size={22} color={colors.onAccent} />
      </View>
      <View style={styles.flex}>
        <Text variant="headline">Speak Czech</Text>
        <Text variant="footnote" color="label2">
          {sessions ? `${levelLabels[level]} · ${sessions} ${sessions === 1 ? 'conversation' : 'conversations'}` : 'Talk out loud with a friendly Czech tutor'}
        </Text>
      </View>
      <Icon name="chevronRight" size={16} color={colors.label3} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  well: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
