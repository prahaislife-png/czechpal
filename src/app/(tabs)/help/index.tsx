import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CaseRow } from '@/components/case-row';
import { toneColors } from '@/components/design/tone';
import { EmergencyChip } from '@/components/help/emergency-row';
import { ForYouSection } from '@/components/help/for-you';
import { isSearching, SearchField, SearchResults } from '@/components/help/search';
import { SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { daysUntil, shortDate } from '@/lib/about';
import { openReview, pickImage, pickPdf } from '@/lib/capture';
import { areas, type Area } from '@/lib/help/areas';
import { dueLabel } from '@/lib/help/for-you';
import { reminderHref, upcoming } from '@/lib/reminders';
import { useFreeLimit, useRemainingAnalyses, useStore } from '@/store/cases';
import { useAccess } from '@/store/plus';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Help, built around what the person came to do:
 *
 * 1. Find a place: one search box for every list and place.
 * 2. Understand something in Czech: the camera, on the dark card, with the other ways in beside it,
 *    and a form to fill in, field by field, right under it.
 * 3. What's waiting: deadlines read from their letters, and the letters themselves.
 * 4. Say something in Czech: a message or a call, with the people it's usually for one tap away.
 * 5. Their own offices and permit date, then the five areas of life, then the numbers to call.
 *
 * Calm, no playful motion: people come here with letters and deadlines.
 */
export default function HelpScreen() {
  const [query, setQuery] = useState('');
  const searching = isSearching(query);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
      <SearchField value={query} onChange={setQuery} />
      {searching ? (
        <SearchResults query={query} />
      ) : (
        <>
          <ScanCard />
          <List>
            <Row icon="document" title="Fill in a Czech form" subtitle="Field by field: what it asks and what to write" chevron onPress={() => router.push('/form')} />
          </List>
          <Letters />
          <WriteCard />
          <ForYouSection />
          <Areas />
          <Emergency />
        </>
      )}
    </ScrollView>
  );
}

/** The one dark card: point the camera at anything in Czech. The other ways in sit under the button. */
function ScanCard() {
  const { colors } = useTheme();
  const remaining = useRemainingAnalyses();
  const limit = useFreeLimit();
  const access = useAccess();
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <View style={[styles.scan, { backgroundColor: colors.ink }]}>
      <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.onInk2 }]}>
        GOT SOMETHING IN CZECH?
      </Text>
      <Text variant="title2" accessibilityRole="header" style={{ color: colors.onInk }}>
        Point your camera at it
      </Text>
      <Text variant="subhead" style={{ color: colors.onInk2 }}>
        A letter, a bill, a sign, a message. You get what it says, what to do and by when, and a reply in Czech.
      </Text>
      <PressableScale onPress={() => router.push('/camera')} accessibilityRole="button" accessibilityLabel="Open the camera" style={[styles.scanButton, { backgroundColor: colors.onInk }]}>
        <Icon name="camera" size={20} color={colors.ink} />
        <Text variant="headline" weight="600" chrome style={{ color: colors.ink }}>
          Open the camera
        </Text>
      </PressableScale>
      <View style={styles.sources}>
        <Source icon="photo" label="Photo" onPress={async () => openReview(await pickImage())} />
        <Source icon="pdf" label="PDF" onPress={async () => openReview(await pickPdf())} />
        <Source icon="paste" label="Paste text" onPress={() => router.push('/paste')} />
      </View>
      <View style={styles.scanFoot}>
        <Text variant="caption" style={[styles.flex, { color: colors.onInk2 }]}>
          {access.plus ? 'Unlimited explanations with Plus' : `${remaining} of ${limit} free explanations left this month`}
        </Text>
        <Pressable onPress={() => setShareOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: shareOpen }} hitSlop={8} style={styles.shareLink}>
          <Icon name="share" size={14} color={colors.onInk} />
          <Text variant="caption" weight="600" style={{ color: colors.onInk }}>
            From another app
          </Text>
        </Pressable>
      </View>
      {shareOpen ? (
        <Text variant="footnote" style={{ color: colors.onInk2 }}>
          In Photos, Files, Mail, Messages or WhatsApp, tap Share and choose CzechLocal. If it isn’t in the row, tap More and switch it on. CzechLocal opens with the photo, PDF or text
          ready to explain.
        </Text>
      ) : null}
    </View>
  );
}

function Source({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.source}>
      <Icon name={icon} size={18} color={colors.onInk} />
      <Text variant="footnote" weight="600" chrome style={{ color: colors.onInk }}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** What's waiting: deadlines read from letters (soonest first), then the latest letters. */
function Letters() {
  const cases = useStore((s) => s.cases);
  const reminders = useStore((s) => s.reminders);
  const recent = useMemo(() => cases.filter((c) => c.status !== 'draft').slice(0, 2), [cases]);
  const due = useMemo(() => upcoming(reminders.filter((r) => r.kind === 'deadline')).slice(0, 2), [reminders]);
  if (!recent.length && !due.length) return null;
  return (
    <View style={styles.block}>
      {due.length ? (
        <View>
          <SectionHeader title="Due soon" />
          <List>
            {due.map((r) => (
              <Row
                key={r.id}
                icon="bell"
                title={r.title}
                subtitle={`Due ${dueLabel(daysUntil(r.date))} · ${shortDate(r.date)}`}
                chevron
                onPress={() => router.push(reminderHref(r))}
              />
            ))}
          </List>
        </View>
      ) : null}
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
    </View>
  );
}

const writeTo: { label: string; say: string; href: Href }[] = [
  { label: 'To a landlord', say: 'Write to a landlord', href: { pathname: '/compose', params: { recipient: 'landlord' } } },
  { label: 'To a doctor', say: 'Write to a doctor', href: { pathname: '/compose', params: { recipient: 'doctor' } } },
  { label: 'To a tradesperson', say: 'Write to a tradesperson', href: { pathname: '/compose', params: { recipient: 'trades' } } },
  { label: 'Script for a call', say: 'Prepare what to say on a phone call', href: { pathname: '/compose', params: { mode: 'call' } } },
];

/** Say it in Czech: the whole card opens a blank message; the chips start one for the usual people. */
function WriteCard() {
  const { colors } = useTheme();
  return (
    <View style={[styles.write, { backgroundColor: colors.lavender }]}>
      <PressableScale onPress={() => router.push('/compose')} accessibilityRole="button" accessibilityLabel="Write in Czech. Say what you need in your own words." style={styles.writeHead}>
        <View style={styles.flex}>
          <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.lavenderInk }]}>
            NEED TO SAY SOMETHING?
          </Text>
          <Text variant="title2" style={{ color: colors.lavenderInk }}>
            Write it in Czech
          </Text>
          <Text variant="subhead" style={{ color: colors.lavenderInk, opacity: 0.85 }}>
            Say what you need in your own words, in any language. You get a correct, polite Czech message and a script for a call.
          </Text>
        </View>
        <View style={[styles.writeIcon, { backgroundColor: colors.surface }]}>
          <Icon name="compose" size={18} color={colors.lavenderInk} />
        </View>
      </PressableScale>
      <View style={styles.chips}>
        {writeTo.map((w) => (
          <PressableScale key={w.label} onPress={() => router.push(w.href)} accessibilityRole="button" accessibilityLabel={w.say} style={[styles.chip, { backgroundColor: colors.surface }]}>
            <Text variant="footnote" weight="600" chrome style={{ color: colors.lavenderInk }}>
              {w.label}
            </Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

/** The five areas of life, as tiles: one tap to everything about health, residence, offices, law and home. */
function Areas() {
  return (
    <View>
      <SectionHeader title="What’s going on?" />
      <View style={styles.tiles}>
        {areas.map((a) => (
          <AreaTile key={a.id} area={a} />
        ))}
      </View>
    </View>
  );
}

function AreaTile({ area }: { area: Area }) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, area.tone);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/help/area/[area]', params: { area: area.id } })}
      accessibilityRole="button"
      accessibilityLabel={area.title}
      accessibilityHint={area.short}
      style={[styles.tile, { backgroundColor: tint }]}>
      <View style={[styles.tileIcon, { backgroundColor: colors.surface }]}>
        <Icon name={area.icon} size={20} color={ink} />
      </View>
      <View>
        <Text variant="headline" style={{ color: ink }}>
          {area.title}
        </Text>
        <Text variant="footnote" style={{ color: ink, opacity: 0.85 }}>
          {area.short}
        </Text>
      </View>
    </PressableScale>
  );
}

/** The three numbers to reach without looking: one tap dials. The rest, and the support lines, are a tap further. */
function Emergency() {
  const { colors } = useTheme();
  return (
    <View style={[styles.emergency, { backgroundColor: colors.dangerSoft }]}>
      <View style={styles.emergencyHead}>
        <Text variant="headline" style={styles.flex}>
          In an emergency
        </Text>
        <Pressable onPress={() => router.push('/help/emergency')} hitSlop={10} accessibilityRole="link" accessibilityLabel="All emergency numbers and support lines">
          <Text variant="subhead" weight="600" color="accent" chrome>
            All numbers
          </Text>
        </Pressable>
      </View>
      <View style={styles.numbers}>
        <EmergencyChip number="112" label="Any emergency" />
        <EmergencyChip number="155" label="Ambulance" />
        <EmergencyChip number="158" label="Police" />
      </View>
      <Text variant="footnote" color="label2">
        Free from any phone. 112 operators also speak English.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  block: { gap: space.xxl },
  eyebrow: { letterSpacing: 0.8 },

  scan: { borderRadius: radius.sheet, borderCurve: 'continuous', padding: space.xl, gap: space.md },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 54, borderRadius: radius.pill, marginTop: space.xs },
  sources: { flexDirection: 'row', gap: space.sm },
  source: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, minHeight: 44, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.1)' },
  scanFoot: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.xs },
  shareLink: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 28 },

  write: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.md },
  writeHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  writeIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { minHeight: 36, justifyContent: 'center', paddingHorizontal: space.md, borderRadius: radius.pill },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: { flexBasis: '47%', flexGrow: 1, minHeight: 128, justifyContent: 'space-between', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  tileIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },

  emergency: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.md },
  emergencyHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  numbers: { flexDirection: 'row', gap: space.sm },
});
