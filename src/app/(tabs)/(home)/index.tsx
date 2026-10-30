import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaseRow } from '@/components/case-row';
import { DocumentPaper } from '@/components/document-paper';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/card';
import { FlagMark } from '@/components/ui/flag-mark';
import { Icon, type IconName } from '@/components/ui/icon';
import { List } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { categoryLabels } from '@/lib/ai';
import { samples } from '@/lib/ai/samples';
import { draftFromExample, openReview, pickImage, pickPdf } from '@/lib/capture';
import { useRemainingAnalyses, useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const remaining = useRemainingAnalyses();
  const cases = useStore((s) => s.cases);
  const recent = useMemo(() => cases.filter((c) => c.status !== 'draft').slice(0, 3), [cases]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        { paddingTop: process.env.EXPO_OS === 'ios' ? space.sm : insets.top + space.md },
      ]}>
      <View style={styles.brandRow}>
        <View style={styles.brand}>
          <FlagMark size={26} />
          <Text variant="headline">CzechReply</Text>
        </View>
        <Pressable onPress={() => router.navigate('/profile')} hitSlop={8} accessibilityRole="link">
          <Badge label={`${remaining} free left`} tone="neutral" />
        </Pressable>
      </View>

      {/* Signature element: the viewfinder. One bold move on this screen; everything else stays quiet. */}
      <PressableScale
        onPress={() => router.push('/scan')}
        accessibilityRole="button"
        accessibilityLabel="Scan Czech text"
        accessibilityHint="Opens the camera"
        style={[styles.viewfinder, { backgroundColor: colors.ink, boxShadow: colors.shadowRaised }]}>
        <Brackets color={colors.onInk2} />
        <View style={styles.viewfinderText}>
          <Text variant="title1" color="onInk" accessibilityRole="header">
            Point at anything{'\n'}written in Czech
          </Text>
          <Text variant="callout" color="onInk2">
            Signs, menus, labels, letters and messages
          </Text>
        </View>
        <View style={styles.viewfinderFoot}>
          <View style={[styles.shutter, { borderColor: colors.onInk }]}>
            <View style={[styles.shutterCore, { backgroundColor: colors.accentFill }]}>
              <Icon name="camera" size={20} color={colors.onAccent} />
            </View>
          </View>
          <Text variant="subhead" weight="600" color="onInk">
            Scan
          </Text>
        </View>
      </PressableScale>

      <List inset={false} style={styles.sources}>
        <View style={styles.sourceRow}>
          <Source icon="photo" label="Photo" onPress={async () => openReview(await pickImage())} />
          <View style={[styles.sourceDivider, { backgroundColor: colors.separator }]} />
          <Source icon="pdf" label="PDF" onPress={async () => openReview(await pickPdf())} />
          <View style={[styles.sourceDivider, { backgroundColor: colors.separator }]} />
          <Source icon="keyboard" label="Type" onPress={() => router.push('/paste')} />
        </View>
      </List>

      <View>
        <SectionHeader title="Try it on" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.examples}
          style={styles.examplesBleed}>
          {samples.map((s) => (
            <PressableScale
              key={s.id}
              onPress={() => openReview(draftFromExample(s.id))}
              accessibilityRole="button"
              accessibilityLabel={`Try it on: ${s.label}`}
              style={styles.example}>
              <DocumentPaper text={s.original} size="small" maxLines={7} style={styles.examplePaper} />
              <View style={styles.exampleText}>
                <Text variant="subhead" weight="600" numberOfLines={1}>
                  {s.label}
                </Text>
                <Text variant="caption" color="label2" weight="400">
                  {categoryLabels[s.category]}
                </Text>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      </View>

      {recent.length > 0 && (
        <View>
          <SectionHeader
            title="Recent"
            action={
              <Pressable onPress={() => router.navigate('/history')} hitSlop={12} accessibilityRole="link">
                <Text variant="subhead" color="accent" weight="500" chrome>
                  See all
                </Text>
              </Pressable>
            }
          />
          <List>
            {recent.map((item) => (
              <CaseRow key={item.id} item={item} />
            ))}
          </List>
        </View>
      )}

      <View style={styles.trust}>
        <Icon name="lock" size={14} color={colors.label3} />
        <Text variant="footnote" color="label3" style={styles.trustText}>
          You review everything. CzechReply never sends anything for you.
        </Text>
      </View>
    </ScrollView>
  );
}

function Source({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.source, pressed && { backgroundColor: colors.fill }]}>
      <Icon name={icon} size={22} color={colors.accent} />
      <Text variant="subhead" weight="600" chrome>
        {label}
      </Text>
    </Pressable>
  );
}

/** Viewfinder corner marks, the visual link between this card and the scanner it opens. */
function Brackets({ color }: { color: string }) {
  const arm = { position: 'absolute', width: 22, height: 22, borderColor: color } as const;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[arm, { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 10 }]} />
      <View style={[arm, { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 10 }]} />
      <View style={[arm, { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 10 }]} />
      <View style={[arm, { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 10 }]} />
    </View>
  );
}

const EXAMPLE_WIDTH = 148;

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  viewfinder: {
    borderRadius: radius.card,
    borderCurve: 'continuous',
    paddingHorizontal: space.xxl + space.sm,
    paddingTop: space.huge + space.sm,
    paddingBottom: space.xxl + space.sm,
    gap: space.xxxl,
    minHeight: 268,
    justifyContent: 'space-between',
  },
  viewfinderText: { gap: space.sm },
  viewfinderFoot: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  shutter: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  sources: { marginTop: -space.md },
  sourceRow: { flexDirection: 'row', alignItems: 'stretch' },
  source: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  sourceDivider: { width: StyleSheet.hairlineWidth, marginVertical: space.md },
  examplesBleed: { marginHorizontal: -layout.gutter },
  examples: { paddingHorizontal: layout.gutter, gap: space.md },
  example: { width: EXAMPLE_WIDTH, gap: space.sm },
  examplePaper: { height: 132, overflow: 'hidden' },
  exampleText: { gap: 1, paddingHorizontal: space.xxs },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  trustText: { flexShrink: 1 },
});
