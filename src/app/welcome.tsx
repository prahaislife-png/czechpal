import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentPaper } from '@/components/document-paper';
import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FlagMark } from '@/components/ui/flag-mark';
import { IconWell } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import type { IconName } from '@/components/ui/icon';
import { useStore } from '@/store/cases';
import { layout, motion, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const letter = `Vážení nájemníci,

dovolujeme si Vás informovat, že ve čtvrtek 12. listopadu proběhne v domě plánovaná oprava vodovodního potrubí. Od 8:00 do 14:00 bude přerušena dodávka vody.`;

const promises: { icon: IconName; title: string; body: string }[] = [
  { icon: 'translate', title: 'Explains it in plain English', body: 'Letters, bills, emails and messages.' },
  { icon: 'checkCircle', title: 'Tells you what to do next', body: 'Deadlines, amounts and the steps that matter.' },
  { icon: 'reply', title: 'Writes your reply in Czech', body: 'Polite, correct, and ready to copy.' },
];

// First-run only, so it earns a little choreography: the letter lands, then the answer.
const enter = (delay: number) => FadeInDown.duration(motion.slow + 120).delay(delay).easing(motion.easeOut);

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const start = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}>
        <Animated.View entering={FadeIn.duration(motion.base)} style={styles.brand}>
          <FlagMark size={30} />
          <Text variant="headline">CzechReply</Text>
        </Animated.View>

        <View style={styles.vignette} accessibilityLabel="Example: a Czech letter explained in English">
          <Animated.View entering={enter(80)} style={styles.paperWrap}>
            {/* Rotation lives on the child so it never fights the entrance transform. */}
            <DocumentPaper text={letter} size="small" maxLines={7} style={styles.paperTilt} />
          </Animated.View>
          <Animated.View entering={FadeInUp.duration(motion.slow + 120).delay(520).easing(motion.easeOut)} style={styles.answerWrap}>
            <Card raised style={styles.answer}>
              <Badge label="No action needed" tone="success" icon="checkCircle" />
              <Text variant="subhead" weight="500">
                {'Water is off on Thursday, 8:00⁠–⁠14:00, for repairs. You don’t need to reply.'}
              </Text>
            </Card>
          </Animated.View>
        </View>

        <Animated.View entering={enter(200)} style={styles.headline}>
          <Text variant="largeTitle" accessibilityRole="header">
            Understand Czech.{'\n'}Reply with confidence.
          </Text>
          <Text variant="body" color="label2">
            For everything that arrives in Czech — from your landlord, your child’s school or the authorities.
          </Text>
        </Animated.View>

        <Animated.View entering={enter(280)} style={styles.promises}>
          {promises.map((p) => (
            <View key={p.title} style={styles.promise}>
              <IconWell name={p.icon} tone="accent" size={40} />
              <View style={styles.promiseText}>
                <Text variant="callout" weight="600">
                  {p.title}
                </Text>
                <Text variant="subhead" color="label2">
                  {p.body}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <BottomBar>
        <Button label="Get started" onPress={start} />
        <Text variant="footnote" color="label3" align="center">
          No account needed to try it.
        </Text>
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: space.xxl, gap: space.xxxl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  vignette: { height: 230, justifyContent: 'flex-start' },
  paperWrap: { width: '78%', marginTop: space.sm, marginLeft: space.xs },
  paperTilt: { transform: [{ rotate: '-2.5deg' }] },
  answerWrap: { position: 'absolute', right: 0, bottom: 0, width: '72%' },
  answer: { gap: space.sm, padding: space.lg },
  headline: { gap: space.md },
  promises: { gap: space.lg },
  promise: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  promiseText: { flex: 1, gap: 1 },
});
