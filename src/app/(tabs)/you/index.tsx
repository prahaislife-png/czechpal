import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/design/cards';
import { CaseRow } from '@/components/case-row';
import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { daysUntil, longDate, stayById } from '@/lib/about';
import { languageByCode } from '@/lib/ai';
import { goals } from '@/lib/learn/profile';
import { reminderHref, upcoming } from '@/lib/reminders';
import { useExplore } from '@/store/explore';
import { useLearn } from '@/store/learn';
import { useStore, type StartTab } from '@/store/cases';
import { layout, space } from '@/theme/tokens';

const startOptions: { id: StartTab; label: string }[] = [
  { id: 'auto', label: 'Automatic' },
  { id: 'explore', label: 'Explore' },
  { id: 'learn', label: 'Learn' },
];

/**
 * You: a calm personal space. What's coming up, what you've looked at, places you saved, and
 * the settings that are yours. Learning progress stays in Learn. Everything here is on this phone.
 */
export default function YouScreen() {
  const reminders = useStore((s) => s.reminders);
  const cases = useStore((s) => s.cases);
  const about = useStore((s) => s.about);
  const language = useStore((s) => s.language);
  const startTab = useStore((s) => s.startTab);
  const saved = useExplore((s) => s.saved);
  const profile = useLearn((s) => s.profile);

  const soon = useMemo(() => upcoming(reminders).slice(0, 3), [reminders]);
  const recent = useMemo(() => cases.filter((c) => c.status !== 'draft').slice(0, 3), [cases]);
  const places = useMemo(() => Object.values(saved).sort((a, b) => b.savedAt - a.savedAt), [saved]);
  const stay = stayById(about.stay);
  const goal = goals.find((g) => g.id === profile?.goal);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="callout" color="label2" style={styles.lead}>
        Your reminders, history and settings. Everything here stays on this phone.
      </Text>

      <View>
        <SectionHeader title="Coming up" />
        {soon.length ? (
          <List>
            {soon.map((r) => {
              const days = daysUntil(r.date);
              return (
                <Row
                  key={r.id}
                  icon={r.kind === 'permit' ? 'shield' : 'calendar'}
                  title={r.title}
                  subtitle={`${longDate(r.date)} · ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`}
                  chevron
                  onPress={() => router.push(reminderHref(r))}
                />
              );
            })}
          </List>
        ) : (
          <List>
            <Row
              icon="calendar"
              title="No reminders yet"
              subtitle="Deadlines from your letters and your permit's end date appear here."
              chevron
              onPress={() => router.push('/about')}
            />
          </List>
        )}
      </View>

      <View>
        <SectionHeader
          title="Recent"
          action={
            recent.length ? (
              <Pressable onPress={() => router.push('/you/history')} hitSlop={10} accessibilityRole="link" accessibilityLabel="See all history">
                <Text variant="subhead" weight="600" color="accent" chrome>
                  See all
                </Text>
              </Pressable>
            ) : undefined
          }
        />
        {recent.length ? (
          <List>
            {recent.map((c) => (
              <CaseRow key={c.id} item={c} />
            ))}
          </List>
        ) : (
          <EmptyState
            icon="viewfinder"
            tone="sky"
            title="Nothing explained yet"
            body="Letters, signs and messages you ask about in Help are kept here."
            action="Go to Help"
            onAction={() => router.navigate('/help')}
          />
        )}
      </View>

      <View>
        <SectionHeader title="Saved places" />
        {places.length ? (
          <List>
            {places.slice(0, 5).map(({ place }) => (
              <Row
                key={place.id}
                icon="bookmarkFill"
                title={place.name}
                subtitle={[place.quarter, place.district].filter(Boolean).join(' · ')}
                chevron
                onPress={() => router.push({ pathname: '/explore/place/[id]', params: { id: place.id } })}
              />
            ))}
          </List>
        ) : (
          <List>
            <Row icon="bookmark" title="No saved places" subtitle="Save parks, viewpoints and gardens in Explore." chevron onPress={() => router.navigate('/explore')} />
          </List>
        )}
      </View>

      <View>
        <SectionHeader title="About you" />
        <List>
          <Row
            icon="shield"
            title="Your residence permit"
            subtitle={stay ? `${stay.label}${about.expires ? ` · until ${longDate(about.expires)}` : ''}` : 'Add it to get reminders before it ends'}
            chevron
            onPress={() => router.push('/about')}
          />
          <Row
            icon="book"
            title="Your learning plan"
            subtitle={goal ? `${goal.label} · ${profile?.minutes ?? 10} min a day` : 'Why you learn and how long each day'}
            chevron
            onPress={() => router.push('/learn-plan')}
          />
          <Row icon="globe" title="Explanation language" value={languageByCode(language).name} chevron onPress={() => router.push('/language')} />
        </List>
      </View>

      <View>
        <SectionHeader title="Open the app in" />
        <ChipGroup options={startOptions} value={startTab} onChange={(v) => useStore.getState().setStartTab(v)} />
        <Text variant="footnote" color="label3" style={styles.note}>
          Automatic opens Explore, or Learn when your plan is the A2 exam.
        </Text>
      </View>

      <View>
        <SectionHeader title="Privacy and data" />
        <List>
          <Row icon="settings" title="Settings" subtitle="AI permission, notifications, Delete everything" chevron onPress={() => router.push('/you/settings')} />
        </List>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  lead: { paddingHorizontal: space.xs },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
});
