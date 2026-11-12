import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { toneColors, type Tone } from '@/components/design/tone';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { dueCards } from '@/lib/learn/deck';
import { formatCount, WORD_COUNT } from '@/lib/words';
import { useLearn } from '@/store/learn';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The three things a learner reaches for at any moment, at the very top of Learn: the
 * dictionary, their own words, and the speaking tutor.
 */
export function QuickTiles() {
  const deck = useLearn((s) => s.deck);
  const due = useMemo(() => dueCards(deck, new Date(), 999).length, [deck]);
  const saved = Object.keys(deck).length;
  return (
    <View style={styles.row}>
      <Tile tone="lavender" icon="text" title="Dictionary" detail={`${formatCount(WORD_COUNT)} words`} href="/dictionary" />
      <Tile
        tone="sky"
        icon="cards"
        title="My words"
        detail={due > 0 ? `${due} to review` : saved > 0 ? `${saved} saved` : 'Save as you go'}
        href={due > 0 ? '/flashcards' : '/learn/words'}
      />
      <Tile tone="coral" icon="mic" title="Speak" detail="Talk with a tutor" href="/learn/speak" />
    </View>
  );
}

function Tile({ tone, icon, title, detail, href }: { tone: Tone; icon: IconName; title: string; detail: string; href: Href }) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, tone);
  return (
    <PressableScale onPress={() => router.push(href)} accessibilityRole="button" accessibilityLabel={`${title}. ${detail}`} style={[styles.tile, { backgroundColor: tint }]}>
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Icon name={icon} size={18} color={ink} />
      </View>
      <View>
        <Text variant="subhead" weight="700" numberOfLines={1} style={{ color: ink }}>
          {title}
        </Text>
        <Text variant="caption" numberOfLines={1} style={{ color: ink, opacity: 0.8 }}>
          {detail}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  tile: { flex: 1, minHeight: 104, borderRadius: radius.card, borderCurve: 'continuous', padding: space.md, justifyContent: 'space-between' },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
