import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandMark } from '@/components/ui/brand-mark';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useStore } from '@/store/cases';
import { layout, motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const promises: { icon: IconName; title: string; body: string }[] = [
  { icon: 'viewfinder', title: 'Point and understand', body: 'Signs, menus, labels, letters and chats.' },
  { icon: 'checkCircle', title: 'Know what to do', body: 'Deadlines, amounts and the steps that matter.' },
  { icon: 'reply', title: 'Reply in Czech', body: 'Polite, correct and ready to copy.' },
];

// First run only, so it earns a little choreography: the sign lands, then the answer.
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
          <BrandMark size={30} />
          <Text variant="headline">CzechPal</Text>
        </Animated.View>

        <View style={styles.vignette} accessibilityLabel="Example: a Czech parking sign explained in English">
          <Animated.View entering={enter(80)} style={styles.signWrap}>
            {/* Rotation lives on the child so it never fights the entrance transform. */}
            <View style={[styles.sign, { backgroundColor: colors.paper, borderColor: colors.paperInk }]}>
              <Text variant="title3" weight="800" color="paperInk" align="center">
                ZÁKAZ STÁNÍ
              </Text>
              <Text variant="callout" weight="700" color="paperInk" align="center">
                Po–Pá 7–18 h
              </Text>
              <Text variant="caption" weight="700" color="paperInk" align="center">
                MIMO VOZIDEL ZÁSOBOVÁNÍ
              </Text>
            </View>
          </Animated.View>
          <Animated.View
            entering={FadeInUp.duration(motion.slow + 120).delay(520).easing(motion.easeOut)}
            style={styles.answerWrap}>
            <Card raised style={styles.answer}>
              <Badge label="Parking sign" tone="neutral" icon="transport" />
              <Text variant="subhead" weight="500">
                No parking on weekdays, 7:00 to 18:00. Evenings and weekends are fine.
              </Text>
            </Card>
          </Animated.View>
        </View>

        <Animated.View entering={enter(200)}>
          <Text variant="title1" accessibilityRole="header">
            Understand anything written in Czech.
          </Text>
        </Animated.View>

        <Animated.View entering={enter(280)} style={styles.promises}>
          {promises.map((p) => (
            <View key={p.title} style={styles.promise}>
              <Icon name={p.icon} size={24} color={colors.accent} style={styles.promiseIcon} />
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
  vignette: { height: 236 },
  signWrap: { width: '62%', marginTop: space.sm, marginLeft: space.lg },
  sign: {
    transform: [{ rotate: '-3deg' }],
    borderWidth: 3,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
    gap: space.xs,
  },
  answerWrap: { position: 'absolute', right: 0, bottom: 0, width: '74%' },
  answer: { gap: space.sm, padding: space.lg },
  promises: { gap: space.xl, marginTop: -space.sm },
  promise: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  promiseIcon: { marginTop: 1 },
  promiseText: { flex: 1, gap: 1 },
});
