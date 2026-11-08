import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOutDown, SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { grammarLine } from '@/lib/learn/lexicon';
import type { WordInfo } from '@/lib/learn/text';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * A tapped word: its dictionary form, grammar, meaning here, and a button to keep it as a
 * flashcard. Rises from the bottom of the reader; the text stays readable above it.
 */
export function WordSheet({
  info,
  saved,
  canSpeak,
  onSpeak,
  onSave,
  onClose,
}: {
  info: WordInfo | { form: string; lexeme: null };
  saved: boolean;
  canSpeak: boolean;
  onSpeak: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const lexeme = info.lexeme;
  const sameAsForm = lexeme && lexeme.lemma.toLocaleLowerCase('cs') === info.form.toLocaleLowerCase('cs');

  return (
    <Animated.View
      entering={reduceMotion ? undefined : SlideInDown.springify().damping(22).stiffness(220)}
      exiting={reduceMotion ? undefined : FadeOutDown.duration(160)}
      style={[
        styles.sheet,
        { backgroundColor: colors.surface, boxShadow: colors.shadowRaised, paddingBottom: insets.bottom + space.lg },
      ]}
      accessibilityViewIsModal
      accessibilityLiveRegion="polite">
      <View style={styles.head}>
        <View style={styles.titleBlock}>
          {!sameAsForm && (
            <Text variant="subhead" color="label2">
              {info.form}
              {lexeme ? '  →' : ''}
            </Text>
          )}
          <Text variant="title1" selectable accessibilityRole="header">
            {lexeme ? lexeme.lemma : info.form}
          </Text>
        </View>
        {canSpeak && lexeme && (
          <Pressable onPress={() => onSpeak(lexeme.lemma)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Hear ${lexeme.lemma}`} style={[styles.round, { backgroundColor: colors.fill }]}>
            <Icon name="speaker" size={20} color={colors.label} />
          </Pressable>
        )}
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={[styles.round, { backgroundColor: colors.fill }]}>
          <Icon name="close" size={18} color={colors.label2} />
        </Pressable>
      </View>

      {lexeme ? (
        <>
          <Text variant="footnote" color="label2">
            {grammarLine(lexeme)}
          </Text>
          <Text variant="title3">{lexeme.en}</Text>
          {'inContext' in info && info.inContext ? (
            <View style={[styles.context, { backgroundColor: colors.accentSoft }]}>
              <Text variant="footnote" weight="600" color="accent">
                Here
              </Text>
              <Text variant="callout">{info.inContext}</Text>
            </View>
          ) : null}
          {'note' in info && info.note ? (
            <Text variant="callout" color="label2">
              <Text variant="callout" weight="600">
                {info.form}
              </Text>
              : {info.note}
            </Text>
          ) : null}
          <Button
            label={saved ? 'Saved to your words' : 'Save to flashcards'}
            icon={saved ? 'check' : 'plus'}
            variant={saved ? 'secondary' : 'primary'}
            size="medium"
            disabled={saved}
            onPress={() => {
              if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onSave();
            }}
            style={styles.save}
          />
        </>
      ) : (
        <Text variant="callout" color="label2">
          This word isn’t in CzechLocal’s word list yet, so there’s no explanation for it.
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: space.sm,
    right: space.sm,
    bottom: 0,
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    borderCurve: 'continuous',
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    gap: space.sm,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  titleBlock: { flex: 1, gap: 2 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  context: { borderRadius: radius.tile, borderCurve: 'continuous', padding: space.md, gap: 2, marginTop: space.xs },
  save: { marginTop: space.md },
});
