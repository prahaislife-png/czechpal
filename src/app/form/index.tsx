import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { openPlus } from '@/components/plus/gate';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { shortDate } from '@/lib/about';
import { isDemoMode } from '@/lib/ai';
import { formProgress } from '@/lib/forms';
import { allowanceRenewsOn, MAX_PAGES, useFreeLimit, useRemainingAnalyses, useStore } from '@/store/cases';
import { useForms, type FormDoc, type FormSource } from '@/store/forms';
import { useAccess } from '@/store/plus';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const steps: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'document', title: 'Every field, in order', detail: 'What it asks, in your language, next to the Czech label' },
  { icon: 'compose', title: 'What to write', detail: 'The format, an example, and which box to tick' },
  { icon: 'person', title: 'Your own details where they go', detail: 'Shown from this phone; they are never sent anywhere' },
];

/**
 * Fill in a form: the way in. Photograph the form, pick photos of its pages, or pick a PDF, and
 * get it back field by field. One example is always free to open, so the guide can be seen first.
 */
export default function FormStartScreen() {
  const { colors } = useTheme();
  const access = useAccess();
  const remaining = useRemainingAnalyses();
  const limit = useFreeLimit();
  const aiConsent = useStore((s) => s.aiConsent);
  const forms = useForms((s) => s.forms);
  const [problem, setProblem] = useState<string | null>(null);

  const out = !access.plus && remaining === 0;
  const needsConsent = !isDemoMode && !aiConsent;
  const mine = forms.filter((f) => !f.example);

  const begin = (source: FormSource | null) => {
    if (!source) return;
    router.push({ pathname: '/form/[id]', params: { id: useForms.getState().start(source) } });
  };

  const fromCamera = async () => {
    setProblem(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return setProblem('CzechLocal needs the camera to photograph the form. Allow it in Settings, or choose a photo instead.');
    const shot = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    begin(shot.canceled ? null : { kind: 'image', uris: [shot.assets[0].uri] });
  };
  const fromPhotos = async () => {
    setProblem(null);
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true, selectionLimit: MAX_PAGES, orderedSelection: true });
    begin(picked.canceled ? null : { kind: 'image', uris: picked.assets.slice(0, MAX_PAGES).map((a) => a.uri) });
  };
  const fromPdf = async () => {
    setProblem(null);
    const picked = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    begin(picked.canceled ? null : { kind: 'pdf', uri: picked.assets[0].uri });
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.sage }]}>
        <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.sageInk }]}>
          A FORM IN CZECH?
        </Text>
        <Text variant="title1" accessibilityRole="header" style={{ color: colors.sageInk }}>
          Fill it in without guessing
        </Text>
        <View style={styles.steps}>
          {steps.map((s) => (
            <View key={s.title} style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: colors.surface }]}>
                <Icon name={s.icon} size={18} color={colors.sageInk} />
              </View>
              <View style={styles.flex}>
                <Text variant="callout" weight="600" style={{ color: colors.sageInk }}>
                  {s.title}
                </Text>
                <Text variant="footnote" style={{ color: colors.sageInk, opacity: 0.85 }}>
                  {s.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {out ? (
        <View style={styles.actions}>
          <Text variant="callout" color="label2" align="center">
            You’ve used this month’s {limit} free explanations, and a form guide counts as one. {access.live ? '' : `They renew on ${allowanceRenewsOn()}.`}
          </Text>
          {access.live ? <Button label="Fill in every form with Plus" onPress={() => openPlus('form')} /> : null}
        </View>
      ) : needsConsent ? (
        // Apple requires explicit permission before personal data goes to a third-party AI.
        <View style={styles.actions}>
          <Text variant="footnote" color="label2" align="center">
            To read a form, CzechLocal sends its photo or PDF securely to Anthropic’s Claude AI. CzechLocal doesn’t keep it, and Anthropic doesn’t use it to train AI models. You can
            change this in Settings.
          </Text>
          <Button label="Agree and continue" onPress={() => useStore.getState().setAiConsent(true)} />
        </View>
      ) : (
        <View style={styles.actions}>
          <Button label="Photograph the form" icon="camera" onPress={fromCamera} />
          <View style={styles.sources}>
            <Source icon="photo" label="Choose photos" onPress={fromPhotos} />
            <Source icon="pdf" label="Choose a PDF" onPress={fromPdf} />
          </View>
          <Text variant="footnote" color="label2" align="center">
            {access.plus
              ? 'Unlimited with Plus. Up to 5 pages at a time.'
              : `Counts as 1 of your free explanations: ${remaining} of ${limit} left this month. Up to ${MAX_PAGES} pages at a time.`}
          </Text>
          {problem ? (
            <Text variant="callout" color="danger" align="center" accessibilityLiveRegion="polite">
              {problem}
            </Text>
          ) : null}
        </View>
      )}

      <List>
        <Row
          icon="eye"
          title="See an example first"
          subtitle="A doctor’s registration form, field by field. Free."
          chevron
          onPress={() => router.push({ pathname: '/form/[id]', params: { id: useForms.getState().openExample() } })}
        />
      </List>

      {mine.length ? (
        <View>
          <SectionHeader title="Your forms" />
          <List>
            {mine.map((f) => (
              <FormRow key={f.id} form={f} />
            ))}
          </List>
        </View>
      ) : null}

      <Text variant="footnote" color="label3" style={styles.note}>
        CzechLocal explains what a form asks. It can’t know your situation or decide for the office: for anything official, check with the office before you hand it in.
      </Text>
    </ScrollView>
  );
}

function Source({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.source, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <Icon name={icon} size={18} color={colors.label} />
      <Text variant="subhead" weight="600" chrome>
        {label}
      </Text>
    </PressableScale>
  );
}

function FormRow({ form }: { form: FormDoc }) {
  const p = form.guide ? formProgress(form.guide, form.done) : null;
  return (
    <Row
      icon={form.status === 'error' ? 'alert' : p && p.done === p.total ? 'checkCircle' : 'document'}
      title={form.guide?.title ?? (form.status === 'working' ? 'Reading the form…' : 'Couldn’t read this form')}
      subtitle={[shortDate(form.createdAt.slice(0, 10)), p ? `${p.done} of ${p.total} fields done` : null].filter(Boolean).join(' · ')}
      chevron
      onPress={() => router.push({ pathname: '/form/[id]', params: { id: form.id } })}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xl },
  flex: { flex: 1 },
  eyebrow: { letterSpacing: 0.8 },
  hero: { borderRadius: radius.sheet, borderCurve: 'continuous', padding: space.xl, gap: space.md },
  steps: { gap: space.md, marginTop: space.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: space.md },
  sources: { flexDirection: 'row', gap: space.sm },
  source: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 48, borderRadius: radius.pill, borderWidth: 1 },
  note: { paddingHorizontal: space.xs },
});
