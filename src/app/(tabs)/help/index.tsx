import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CaseRow } from '@/components/case-row';
import { LearningCard } from '@/components/design/cards';
import { SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { openReview, pickImage, pickPdf } from '@/lib/capture';
import { useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Help: a calm landing instead of a camera that opens by itself. First, understanding Czech text
 * (photo, image or PDF, typing, sharing); then writing in Czech; then the right place to go.
 * No playful motion here: people come with letters and deadlines.
 */
export default function HelpScreen() {
  const { colors } = useTheme();
  const cases = useStore((s) => s.cases);
  const recent = useMemo(() => cases.filter((c) => c.status !== 'draft').slice(0, 2), [cases]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text variant="title1" accessibilityRole="header">
          What do you need help with?
        </Text>
        <Text variant="callout" color="label2">
          CzechPal explains anything written in Czech, helps you answer, and finds the right place to go.
        </Text>
      </View>

      <View style={[styles.understand, { backgroundColor: colors.sky }]}>
        <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.skyInk }]}>
          UNDERSTAND CZECH TEXT OR DOCUMENTS
        </Text>
        <PressableScale
          onPress={() => router.push('/camera')}
          accessibilityRole="button"
          accessibilityLabel="Take a photo of Czech text"
          style={[styles.camera, { backgroundColor: colors.accentFill }]}>
          <Icon name="camera" size={22} color={colors.onAccent} />
          <View style={styles.flex}>
            <Text variant="headline" color="onAccent">
              Take a photo
            </Text>
            <Text variant="footnote" style={{ color: colors.onAccent, opacity: 0.8 }}>
              Letters, signs, menus, labels, forms
            </Text>
          </View>
          <Icon name="chevronRight" size={16} color={colors.onAccent} />
        </PressableScale>
        <View style={styles.sources}>
          <Source icon="photo" label="Image" onPress={async () => openReview(await pickImage())} />
          <Source icon="pdf" label="PDF" onPress={async () => openReview(await pickPdf())} />
          <Source icon="paste" label="Type or paste" onPress={() => router.push('/paste')} />
        </View>
        <Text variant="footnote" style={{ color: colors.skyInk }}>
          Or share a photo, PDF or text to CzechPal from any app.
        </Text>
      </View>

      {recent.length ? (
        <View>
          <SectionHeader
            title="Recent"
            action={
              <Pressable onPress={() => router.navigate('/you/history')} hitSlop={10} accessibilityRole="link" accessibilityLabel="See all history">
                <Text variant="subhead" weight="600" color="accent" chrome>
                  See all
                </Text>
              </Pressable>
            }
          />
          <List>
            {recent.map((c) => (
              <CaseRow key={c.id} item={c} />
            ))}
          </List>
        </View>
      ) : null}

      <LearningCard
        eyebrow="Write in Czech"
        title="A message, an e-mail, a reply"
        detail="Say what you need in your words; CzechPal writes it in correct Czech."
        icon="compose"
        tone="lavender"
        onPress={() => router.push('/compose')}
      />

      <View>
        <SectionHeader title="Find the right place" />
        <List>
          <Row
            icon="doctor"
            title="Find a doctor"
            subtitle="GPs, dentists, children's doctors, who takes new patients"
            chevron
            onPress={() => router.push({ pathname: '/help/[category]', params: { category: 'doctors' } })}
          />
          <Row icon="night" title="Sick tonight or at the weekend?" subtitle="After-hours care and night pharmacies" chevron onPress={() => router.push('/help/urgent')} />
          <Row icon="government" title="Immigration offices" subtitle="Which one is yours, hours, today's waits" chevron onPress={() => router.push('/help/offices')} />
          <Row icon="document" title="What do I need?" subtitle="Checklists for your permit: new address, employer, extending" chevron onPress={() => router.push('/help/checklists')} />
          <Row icon="search" title="All services" subtitle="Town halls, embassies, notaries, translators, emergency numbers" chevron onPress={() => router.push('/help/services')} />
        </List>
      </View>
    </ScrollView>
  );
}

function Source({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.source, { backgroundColor: colors.surface }]}>
      <Icon name={icon} size={20} color={colors.skyInk} />
      <Text variant="footnote" weight="600" align="center" chrome>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  head: { gap: space.xs },
  flex: { flex: 1 },
  understand: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.md },
  eyebrow: { letterSpacing: 0.8 },
  camera: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile + 4, borderCurve: 'continuous', padding: space.lg, minHeight: 64 },
  sources: { flexDirection: 'row', gap: space.sm },
  source: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xs, borderRadius: radius.tile, borderCurve: 'continuous', paddingVertical: space.md, minHeight: 72 },
});
