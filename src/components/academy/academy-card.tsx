import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Before setup, for learners aiming at the exam: what the A2 preparation is, and the way in. */
export function SetupCard() {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={[styles.well, { backgroundColor: colors.accentSoft }]}>
        <Icon name="school" size={22} color={colors.accent} />
      </View>
      <Text variant="title2" accessibilityRole="header">
        Get ready for the A2 exam
      </Text>
      <Text variant="callout" color="label2">
        The Czech exam for permanent residence. A short starting check, a plan for each day, and lessons by topic with checks that show what has stuck.
      </Text>
      <Button label="Set up · 2 min" onPress={() => router.push('/a2-setup')} />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: space.md },
  eyebrow: { letterSpacing: 0.8, marginBottom: -space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  well: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
