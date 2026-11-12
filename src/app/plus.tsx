import * as Haptics from 'expo-haptics';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { announce } from '@/lib/a11y';
import { PRIVACY_URL } from '@/lib/links';
import { buyPlan, loadPlans, plusBenefits, plusHeadline, purchasesConfigured, restorePlus, type Plan, type PlusReason } from '@/lib/plus';
import { useAccess, usePlusStore } from '@/store/plus';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const MANAGE_URL = 'https://apps.apple.com/account/subscriptions';

/** Shown only in development, where there is no store: what the plans look like. */
const SAMPLE_PLANS: Plan[] = [
  { id: 'sample-year', period: 'year', price: '999 Kč', perMonth: '83 Kč' },
  { id: 'sample-month', period: 'month', price: '149 Kč' },
];

const periodLabel = { year: 'a year', month: 'a month', other: '' } as const;

/**
 * CzechLocal Plus: what it opens, what it costs, one button. It leads with whatever the person
 * was reaching for when it opened (the next lesson, a mock exam, an explanation). Prices come
 * from the store, in the person's own currency.
 */
export default function PlusScreen() {
  const { from } = useLocalSearchParams<{ from?: PlusReason }>();
  const reason: PlusReason = from && from in plusHeadline ? from : 'settings';
  const { colors } = useTheme();
  const { live, plus } = useAccess();
  const until = usePlusStore((s) => s.until);
  const ending = usePlusStore((s) => s.ending);
  const preview = !purchasesConfigured && __DEV__;

  const [plans, setPlans] = useState<Plan[] | null>(preview ? SAMPLE_PLANS : null);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<string | undefined>(preview ? SAMPLE_PLANS[0].id : undefined);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (preview) return;
    let active = true;
    loadPlans()
      .then((found) => {
        if (!active) return;
        setPlans(found);
        setFailed(found.length === 0);
        setPicked((p) => p ?? found[0]?.id);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [preview, attempt]);

  const chosen = plans?.find((p) => p.id === picked);

  const start = async () => {
    if (!chosen || busy) return;
    setMessage(null);
    if (preview) {
      usePlusStore.getState().setPreview({ live: true, plus: true });
      return;
    }
    setBusy('buy');
    const result = await buyPlan(chosen.id);
    setBusy(null);
    if (result.status === 'bought') {
      if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      announce('CzechLocal Plus is on.');
    } else if (result.status === 'failed') setMessage(result.message);
  };

  const restore = async () => {
    if (busy) return;
    setMessage(null);
    setBusy('restore');
    const found = await restorePlus();
    setBusy(null);
    if (!found) setMessage('No earlier purchase was found for this Apple Account.');
  };

  // A build that doesn't sell Plus has nothing to show here, even when a link leads to it.
  if (!live) return <Redirect href="/" />;

  const head = plusHeadline[reason];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />

      <View style={[styles.hero, { backgroundColor: colors.ink }]}>
        <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.onInk2 }]}>
          CZECHLOCAL PLUS
        </Text>
        <Text variant="title1" accessibilityRole="header" style={{ color: colors.onInk }}>
          {plus ? 'You have Plus' : head.title}
        </Text>
        <Text variant="callout" style={{ color: colors.onInk2 }}>
          {plus
            ? until
              ? `${ending ? 'Plus stays on until' : 'It renews on'} ${longDate(until.slice(0, 10))}. Everything below is open.`
              : 'Everything below is open.'
            : head.lead}
        </Text>
      </View>

      <View style={[styles.benefits, { backgroundColor: colors.surface }]}>
        {plusBenefits.map((b) => (
          <View key={b.title} style={styles.benefit}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon name={plus ? 'check' : b.icon} size={18} color={colors.accent} />
            </View>
            <View style={styles.flex}>
              <Text variant="callout" weight="600">
                {b.title}
              </Text>
              <Text variant="footnote" color="label2">
                {b.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {plus ? (
        <View style={styles.actions}>
          <Button label="Done" onPress={() => router.back()} />
          <Button label="Manage your subscription" variant="plain" onPress={() => Linking.openURL(MANAGE_URL)} />
        </View>
      ) : (
        <>
          {plans === null && !failed ? (
            <ActivityIndicator accessibilityLabel="Loading prices" />
          ) : failed || !plans?.length ? (
            <View style={styles.actions}>
              <Text variant="callout" color="label2" align="center">
                The prices didn’t load. Check your connection and try again.
              </Text>
              <Button
                label="Try again"
                variant="secondary"
                onPress={() => {
                  setFailed(false);
                  setPlans(null);
                  setAttempt((n) => n + 1);
                }}
              />
            </View>
          ) : (
            <>
              <View style={styles.plans} accessibilityRole="radiogroup">
                {plans.map((p) => {
                  const on = p.id === picked;
                  return (
                    <PressableScale
                      key={p.id}
                      onPress={() => setPicked(p.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${p.price} ${periodLabel[p.period]}${p.perMonth ? `, ${p.perMonth} a month` : ''}`}
                      style={[styles.plan, { backgroundColor: colors.surface, borderColor: on ? colors.accentFill : colors.separator }, on && styles.planOn]}>
                      <Icon name={on ? 'checkCircle' : 'circle'} size={22} color={on ? colors.accentFill : colors.label3} />
                      <View style={styles.flex}>
                        <Text variant="headline">{p.period === 'year' ? 'Yearly' : p.period === 'month' ? 'Monthly' : 'Plus'}</Text>
                        <Text variant="footnote" color="label2">
                          {p.period === 'year' ? (p.perMonth ? `${p.perMonth} a month, paid once a year` : 'Paid once a year') : p.period === 'month' ? 'Paid every month' : ''}
                        </Text>
                      </View>
                      <Text variant="headline" tabular>
                        {p.price}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <View style={styles.actions}>
                <Button label={chosen ? `Get Plus · ${chosen.price} ${periodLabel[chosen.period]}` : 'Get Plus'} onPress={start} loading={busy === 'buy'} disabled={!chosen || busy !== null} />
                <Text variant="footnote" color="label2" align="center">
                  {chosen?.period === 'month' ? 'Renews every month' : 'Renews every year'} until you cancel. Cancel any time in your App Store settings, at least a day before it renews.
                </Text>
              </View>
            </>
          )}

          {message ? (
            <Text variant="callout" color="danger" align="center" accessibilityLiveRegion="polite">
              {message}
            </Text>
          ) : null}

          <View style={styles.links}>
            <Link label={busy === 'restore' ? 'Looking…' : 'Restore purchases'} onPress={restore} />
            <Link label="Terms" onPress={() => Linking.openURL(TERMS_URL)} />
            <Link label="Privacy" onPress={() => Linking.openURL(PRIVACY_URL)} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" style={styles.link}>
      <Text variant="footnote" weight="600" color="label2" chrome>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xl },
  flex: { flex: 1 },
  eyebrow: { letterSpacing: 0.8 },
  hero: { borderRadius: radius.sheet, borderCurve: 'continuous', padding: space.xl, gap: space.sm },
  benefits: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.lg },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  benefitIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  plans: { gap: space.sm },
  plan: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous', borderWidth: 1 },
  planOn: { borderWidth: 2 },
  actions: { gap: space.md },
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: space.xl },
  link: { minHeight: 32, justifyContent: 'center' },
});
