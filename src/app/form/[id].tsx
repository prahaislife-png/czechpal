import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { openPlus } from '@/components/plus/gate';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { IconWell } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import type { FormField, FormGuide } from '@/lib/ai';
import { confirm } from '@/lib/dialogs';
import { allFields, formProgress, needLabel, yoursValue } from '@/lib/forms';
import { useStore } from '@/store/cases';
import { useFormProgress, useForms, type FormDoc } from '@/store/forms';
import { useAccess } from '@/store/plus';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const needTone: Record<FormField['need'], BadgeTone> = { required: 'accent', if_applies: 'warning', optional: 'neutral', leave_empty: 'neutral' };

/**
 * A form guide: the form in the order it is printed, each field with what it asks, what to write,
 * an example, and the reader's own details where they belong. Fields tick off as they're filled in.
 */
export default function FormGuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const form = useForms((s) => s.forms.find((f) => f.id === id));
  if (!form) return <Redirect href="/form" />;

  return (
    <>
      <Stack.Screen options={{ title: form.guide ? '' : 'Fill in the form' }} />
      {form.status === 'working' ? <Working id={form.id} /> : form.status === 'error' || !form.guide ? <Failed form={form} /> : <Guide form={form} guide={form.guide} />}
    </>
  );
}

function Working({ id }: { id: string }) {
  const fields = useFormProgress((s) => s.byId[id]);
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" />
      <Text variant="title3" align="center">
        Reading the form
      </Text>
      <Text variant="callout" color="label2" align="center">
        {fields ? `${fields} ${fields === 1 ? 'field' : 'fields'} so far…` : 'Finding every field and what it asks. A long form takes up to a minute.'}
      </Text>
    </View>
  );
}

function Failed({ form }: { form: FormDoc }) {
  const access = useAccess();
  const limit = form.errorCode === 'limit';
  // A dropped connection is worth retrying as it is; a photo that couldn't be read needs a new one.
  const retryable = form.errorCode === 'network' || form.errorCode === 'rate' || form.errorCode === 'server';
  const startAgain = () => {
    useForms.getState().remove(form.id);
    router.replace('/form');
  };
  return (
    <View style={styles.center}>
      <IconWell name="alert" tone="danger" />
      <Text variant="title2" align="center" accessibilityRole="header">
        {limit ? 'No free explanations left' : retryable ? 'Couldn’t finish the guide' : 'Couldn’t read this form'}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {form.error ?? 'Something went wrong. Please try again.'}
      </Text>
      <View style={styles.failedActions}>
        {limit ? (
          access.live && !access.plus ? (
            <Button label="Fill in every form with Plus" onPress={() => openPlus('form')} />
          ) : null
        ) : retryable ? (
          <Button label="Try again" icon="refresh" onPress={() => useForms.getState().retry(form.id)} />
        ) : null}
        <Button label={retryable || limit ? 'Start again' : 'Try another photo'} variant={retryable || limit ? 'plain' : 'primary'} onPress={startAgain} />
      </View>
    </View>
  );
}

function Guide({ form, guide }: { form: FormDoc; guide: FormGuide }) {
  const { colors } = useTheme();
  const details = useStore((s) => s.details);
  const [editing, setEditing] = useState(false);
  const progress = formProgress(guide, form.done);
  const complete = progress.total > 0 && progress.done === progress.total;
  // Offer the details editor when the form has a place for something the phone doesn't know yet.
  const missing = allFields(guide).some((f) => f.yours && f.yours !== 'today' && !yoursValue(f.yours, details));

  const remove = async () => {
    if (!(await confirm({ title: 'Delete this guide?', message: 'The guide and your ticks are removed from this phone.', confirmLabel: 'Delete', destructive: true }))) return;
    router.back();
    useForms.getState().remove(form.id);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.head}>
        {form.example ? <Badge label="Example, not your form" tone="warning" /> : null}
        <Text variant="title1" accessibilityRole="header">
          {guide.title}
        </Text>
        {guide.titleCs ? (
          <Text variant="callout" color="label2" lang="cs">
            {guide.titleCs}
          </Text>
        ) : null}
        <Text variant="body">{guide.purpose}</Text>
      </View>

      <View style={[styles.progress, { backgroundColor: complete ? colors.successSoft : colors.surface }]} accessible accessibilityLabel={`${progress.done} of ${progress.total} fields done`}>
        <View style={styles.progressTop}>
          <Text variant="headline" style={styles.flex} color={complete ? 'success' : 'label'}>
            {complete ? 'Every field is done' : `${progress.done} of ${progress.total} fields done`}
          </Text>
          {complete ? <Icon name="checkCircle" size={20} color={colors.success} /> : null}
        </View>
        <View style={[styles.track, { backgroundColor: colors.fill }]}>
          <View style={[styles.fill, { backgroundColor: complete ? colors.success : colors.label, width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }]} />
        </View>
        <Text variant="footnote" color="label2">
          {complete ? 'Read it through once more, then sign it.' : 'Tick each field as you fill it in on the form.'}
        </Text>
      </View>

      {guide.howToFill.length ? (
        <View style={[styles.rules, { backgroundColor: colors.accentSoft }]}>
          <Text variant="footnote" weight="700" color="accent" style={styles.eyebrow}>
            BEFORE YOU START
          </Text>
          {guide.howToFill.map((rule) => (
            <Bullet key={rule} text={rule} color={colors.accent} />
          ))}
        </View>
      ) : null}

      {missing || editing ? (
        <View style={[styles.details, { backgroundColor: colors.surface }]}>
          <Pressable onPress={() => setEditing((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: editing }} style={styles.detailsHead}>
            <Icon name="person" size={20} color={colors.label2} />
            <View style={styles.flex}>
              <Text variant="callout" weight="600">
                Add your name and address
              </Text>
              <Text variant="footnote" color="label2">
                CzechLocal shows them at the fields they belong in. They stay on this phone.
              </Text>
            </View>
            <Icon name={editing ? 'chevronDown' : 'chevronRight'} size={14} color={colors.label3} />
          </Pressable>
          {editing ? (
            <View style={styles.detailsFields}>
              <Field label="Full name, as in your passport" value={details.name} onChangeText={(name) => useStore.getState().setDetails({ name })} autoCapitalize="words" autoCorrect={false} />
              <Field
                label="Address in Czechia"
                value={details.address}
                onChangeText={(address) => useStore.getState().setDetails({ address })}
                placeholder="Vinohradská 12, 120 00 Praha 2"
                autoCorrect={false}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {guide.sections.map((section, i) => (
        <View key={`${section.title}-${i}`}>
          <SectionHeader title={section.titleCs ? `${section.title} · ${section.titleCs}` : section.title} />
          <View style={styles.fields}>
            {section.fields.map((f) => (
              <FieldCard key={f.id} field={f} done={!!form.done[f.id]} yours={yoursValue(f.yours, details)} onToggle={() => useForms.getState().toggle(form.id, f.id)} />
            ))}
          </View>
        </View>
      ))}

      {guide.cut ? (
        <Note icon="info" title="This form is longer than one guide" lines={['The guide covers the fields above. For the rest, photograph the remaining pages as a new form.']} />
      ) : null}
      {guide.attach.length ? <Note icon="document" title="Enclose with the form" lines={guide.attach.map((a) => (a.detail ? `${a.title}: ${a.detail}` : a.title))} /> : null}
      {guide.handIn ? <Note icon="location" title="Handing it in" lines={[guide.handIn]} /> : null}
      {guide.watchOut.length ? <Note icon="alert" title="Watch out" lines={guide.watchOut} tone="warning" /> : null}
      {guide.notStated.length ? <Note icon="question" title="The form doesn’t say" lines={guide.notStated} /> : null}

      <Text variant="footnote" color="label3" style={styles.footnote}>
        {form.example
          ? 'This example was written for CzechLocal to show how a guide works. Your own form gets its own guide.'
          : 'An AI read this form, and it can misread a label. Compare each field with the form in front of you, and check anything official with the office before you hand it in.'}
      </Text>
      <Button label={form.example ? 'Close the example' : 'Delete this guide'} variant={form.example ? 'plain' : 'quietDestructive'} onPress={form.example ? () => router.back() : remove} />
    </ScrollView>
  );
}

function FieldCard({ field, done, yours, onToggle }: { field: FormField; done: boolean; yours?: string; onToggle: () => void }) {
  const { colors } = useTheme();
  const office = field.need === 'leave_empty';
  const [copied, setCopied] = useState(false);

  const tick = () => {
    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
    onToggle();
    announce(done ? 'Not done' : 'Done');
  };
  const copy = async () => {
    if (!yours) return;
    await Clipboard.setStringAsync(yours);
    setCopied(true);
    announce('Copied');
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <View style={[styles.field, { backgroundColor: colors.surface }, office && styles.office]}>
      <View style={styles.fieldHead}>
        {office ? (
          <View style={styles.tick}>
            <Icon name="lock" size={18} color={colors.label3} />
          </View>
        ) : (
          <Pressable
            onPress={tick}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={`${field.label}: filled in`}
            style={[styles.tick, styles.tickBox, { borderColor: done ? colors.success : colors.label3, backgroundColor: done ? colors.success : 'transparent' }]}>
            {done ? <Icon name="check" size={16} color={colors.surface} /> : null}
          </Pressable>
        )}
        <View style={styles.flex}>
          <Text variant="headline" lang="cs" style={done ? styles.doneText : undefined}>
            {field.label}
          </Text>
          <Text variant="subhead" color="label2">
            {field.meaning}
          </Text>
        </View>
      </View>

      <View style={styles.fieldBody}>
        <Badge label={needLabel[field.need]} tone={needTone[field.need]} />
        <Text variant="callout">{field.write}</Text>

        {field.example ? (
          <View style={[styles.example, { backgroundColor: colors.fill }]}>
            <Text variant="caption" weight="600" color="label3" style={styles.eyebrow}>
              LOOKS LIKE
            </Text>
            <Text variant="callout" weight="600" lang="cs" selectable>
              {field.example}
            </Text>
          </View>
        ) : null}

        {yours ? (
          <Pressable onPress={copy} accessibilityRole="button" accessibilityLabel={`Yours: ${yours}. Copy.`} style={[styles.yours, { backgroundColor: colors.accentSoft }]}>
            <View style={styles.flex}>
              <Text variant="caption" weight="600" color="accent" style={styles.eyebrow}>
                YOURS
              </Text>
              <Text variant="callout" weight="600" selectable>
                {yours}
              </Text>
            </View>
            <Icon name={copied ? 'check' : 'copy'} size={16} color={colors.accent} />
          </Pressable>
        ) : null}

        {field.note ? (
          <View style={styles.noteRow}>
            <Icon name="alert" size={16} color={colors.warning} />
            <Text variant="footnote" color="label2" style={styles.flex}>
              {field.note}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Bullet({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bullet}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="callout" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

function Note({ icon, title, lines, tone }: { icon: 'info' | 'document' | 'location' | 'alert' | 'question'; title: string; lines: string[]; tone?: 'warning' }) {
  const { colors } = useTheme();
  const warn = tone === 'warning';
  return (
    <View style={[styles.note, { backgroundColor: warn ? colors.warningSoft : colors.surface }]}>
      <View style={styles.noteHead}>
        <Icon name={icon} size={18} color={warn ? colors.warning : colors.label2} />
        <Text variant="headline" color={warn ? 'warning' : 'label'}>
          {title}
        </Text>
      </View>
      {lines.map((l) => (
        <Bullet key={l} text={l} color={warn ? colors.warning : colors.label3} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xl },
  flex: { flex: 1 },
  eyebrow: { letterSpacing: 0.6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.md },
  failedActions: { alignSelf: 'stretch', gap: space.xs, marginTop: space.md, maxWidth: layout.maxWidth },
  head: { gap: space.sm, alignItems: 'flex-start' },
  progress: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  progressTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  rules: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  details: { borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  detailsHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, minHeight: 64 },
  detailsFields: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md },
  fields: { gap: space.md },
  field: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.md },
  office: { opacity: 0.7 },
  fieldHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  tick: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tickBox: { borderRadius: 8, borderCurve: 'continuous', borderWidth: 2 },
  doneText: { textDecorationLine: 'line-through', opacity: 0.6 },
  fieldBody: { gap: space.sm, alignItems: 'flex-start', paddingLeft: 28 + space.md },
  example: { alignSelf: 'stretch', borderRadius: radius.well, borderCurve: 'continuous', paddingHorizontal: space.md, paddingVertical: space.sm, gap: 2 },
  yours: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.well, borderCurve: 'continuous', paddingHorizontal: space.md, paddingVertical: space.sm, minHeight: 48 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  note: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  footnote: { paddingHorizontal: space.xs },
});
