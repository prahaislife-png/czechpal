import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaseRow } from '@/components/case-row';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/card';
import { FlagMark } from '@/components/ui/flag-mark';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconWell, List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { samples } from '@/lib/ai/samples';
import { captureWithCamera, openExample, pickFromLibrary, pickPdf } from '@/lib/capture';
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
        <Badge label={`${remaining} free left`} tone="neutral" />
      </View>

      <View style={styles.greeting}>
        <Text variant="title1" accessibilityRole="header">
          What Czech message can I help with?
        </Text>
        <Text variant="callout" color="label2">
          Scan a letter, upload a file or paste the text. I’ll explain it and tell you what to do.
        </Text>
      </View>

      <View style={styles.capture}>
        <PressableScale
          onPress={captureWithCamera}
          accessibilityRole="button"
          accessibilityLabel="Scan a letter"
          accessibilityHint="Opens the camera"
          style={[styles.hero, { backgroundColor: colors.accentFill, boxShadow: colors.shadowRaised }]}>
          <View style={styles.heroIcon}>
            <Icon name="scan" size={26} color={colors.onAccent} />
          </View>
          <View style={styles.heroText}>
            <Text variant="title3" color="onAccent">
              Scan a letter
            </Text>
            <Text variant="subhead" color="onAccent" style={styles.heroSub}>
              Point your camera at any Czech document
            </Text>
          </View>
          <View style={styles.heroArrow}>
            <Icon name="arrowRight" size={18} color={colors.onAccent} />
          </View>
        </PressableScale>

        <View style={styles.tiles}>
          <Tile icon="photo" label="Photo" sub="Screenshot or image" onPress={pickFromLibrary} />
          <Tile icon="pdf" label="PDF" sub="From your files" onPress={pickPdf} />
          <Tile icon="paste" label="Paste" sub="Email, SMS, chat" onPress={() => router.push('/paste')} />
        </View>
      </View>

      {recent.length > 0 && (
        <View>
          <SectionHeader
            title="Recent"
            action={
              <PressableScale pressedScale={1} onPress={() => router.navigate('/history')} hitSlop={12} accessibilityRole="link">
                <Text variant="subhead" color="accent" weight="500">
                  See all
                </Text>
              </PressableScale>
            }
          />
          <List>
            {recent.map((item) => (
              <CaseRow key={item.id} item={item} />
            ))}
          </List>
        </View>
      )}

      <View>
        <SectionHeader title="Try an example" />
        <List>
          {samples.map((s) => (
            <Row key={s.id} icon={s.category} title={s.label} subtitle={s.hint} onPress={() => openExample(s.id)} />
          ))}
        </List>
      </View>

      <View style={styles.trust}>
        <Icon name="lock" size={14} color={colors.label3} />
        <Text variant="footnote" color="label3" style={styles.trustText}>
          You review everything. CzechReply never sends anything for you.
        </Text>
      </View>
    </ScrollView>
  );
}

function Tile({ icon, label, sub, onPress }: { icon: IconName; label: string; sub: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${sub}`}
      style={[styles.tile, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      <IconWell name={icon} tone="accent" />
      <View style={styles.tileText}>
        <Text variant="callout" weight="600">
          {label}
        </Text>
        <Text variant="caption" color="label2" weight="400" numberOfLines={2}>
          {sub}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.gutter, paddingBottom: space.huge, gap: space.xxxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  greeting: { gap: space.sm, marginTop: -space.md },
  capture: { gap: space.md },
  hero: {
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: space.xl,
    minHeight: 136,
    justifyContent: 'space-between',
    gap: space.lg,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: 2, paddingRight: 48 },
  heroSub: { opacity: 0.82 },
  heroArrow: {
    position: 'absolute',
    right: space.xl,
    bottom: space.xl,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiles: { flexDirection: 'row', gap: space.md },
  tile: {
    flex: 1,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: space.md + 2,
    gap: space.md,
    minHeight: 112,
  },
  tileText: { gap: 2 },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, marginTop: -space.sm },
  trustText: { flexShrink: 1 },
});
