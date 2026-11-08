import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { Orb } from '@/components/speak/orb';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { grammar } from '@/lib/academy/grammar';
import { topicById } from '@/lib/academy/topics';
import {
  levelLabels,
  recommendations,
  skillLabels,
  skillStateLabels,
  skillStates,
  speakingLevel,
  strengthLabels,
  totals,
  wordStates,
} from '@/lib/speak/evidence';
import { situationById, speakSituations } from '@/lib/speak/situations';
import type { SpeakSkill } from '@/lib/speak/types';
import { useSpeak } from '@/store/speak';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Speak Czech: talk with CzechPal in Czech. Free talk and situations to start a conversation, then
 * what the learner's own conversations show: level, abilities, words, what to practise next.
 */
export default function SpeakHub() {
  const { colors } = useTheme();
  const sessions = useSpeak((s) => s.sessions);
  const events = useSpeak((s) => s.events);
  const hidden = useSpeak((s) => s.hidden);
  const idle = useSharedValue(0);

  const level = useMemo(() => speakingLevel(events), [events]);
  const skills = useMemo(() => skillStates(events), [events]);
  const words = useMemo(() => wordStates(events).filter((w) => !hidden.includes(w.lemma)), [events, hidden]);
  const last = sessions[sessions.length - 1];
  const next = useMemo(() => recommendations(events, words, last ? (situationById(last.situation)?.topic ?? null) : null), [events, words, last]);
  const sum = totals(sessions);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <View style={styles.center}>
          <Orb size={96} input={idle} output={idle} state="idle" />
        </View>
        <Text variant="title2" align="center" accessibilityRole="header">
          Talk with CzechPal
        </Text>
        <Text variant="callout" color="label2" align="center">
          A patient partner who speaks only Czech, starts very simply and follows your pace. Meanings when you need them, feedback at the end.
        </Text>
        <Button label="Start free talk" icon="mic" onPress={() => router.push({ pathname: '/speak/[situation]', params: { situation: 'free' } })} />
        <Text variant="footnote" color="label3" align="center">
          5 minutes of talking a day. Typing is always open.
        </Text>
      </Card>

      <View>
        <SectionHeader title="Situations" />
        <List>
          {speakSituations
            .filter((s) => s.id !== 'free')
            .map((s) => (
              <Row
                key={s.id}
                icon="doctor"
                title={`${s.title} · ${s.titleCs}`}
                subtitle={s.subtitle}
                chevron
                onPress={() => router.push({ pathname: '/speak/[situation]', params: { situation: s.id } })}
              />
            ))}
        </List>
      </View>

      {sessions.length ? (
        <>
          <View>
            <SectionHeader title="Your speaking" />
            <Card style={styles.stats}>
              <Text variant="headline">{levelLabels[level]}</Text>
              <Text variant="footnote" color="label2">
                {sum.conversations} {sum.conversations === 1 ? 'conversation' : 'conversations'} · {sum.seconds === 0 ? 'no talking yet' : sum.minutes < 1 ? 'under a minute talking' : `${sum.minutes} min talking`} · {sum.independent}{' '}
                {sum.independent === 1 ? 'answer' : 'answers'} on your own
              </Text>
              <View style={[styles.rule, { backgroundColor: colors.separator }]} />
              {(Object.keys(skills) as SpeakSkill[]).map((k) => (
                <View key={k} style={styles.skill}>
                  <Text variant="callout" style={styles.flex}>
                    {skillLabels[k]}
                  </Text>
                  <Text variant="footnote" color={skills[k] === 'reliable' ? 'success' : skills[k] === 'not-yet' ? 'label3' : 'accent'}>
                    {skillStateLabels[skills[k]]}
                  </Text>
                </View>
              ))}
            </Card>
            <Text variant="footnote" color="label3" style={styles.note}>
              From your own answers, as judged by AI after each conversation. Help, typing and shown meanings don’t count as on your own. Not an exam score.
            </Text>
          </View>

          {next.length ? (
            <View>
              <SectionHeader title="Practise next" />
              <List>
                {next.map((r) =>
                  r.kind === 'grammar' ? (
                    <Row
                      key={`g-${r.id}`}
                      icon="book"
                      title={grammar.find((g) => g.id === r.id)?.title ?? r.id}
                      subtitle={r.why}
                      chevron
                      onPress={() => router.push({ pathname: '/learn/grammar/[id]', params: { id: r.id } })}
                    />
                  ) : r.kind === 'topic' ? (
                    <Row
                      key={`t-${r.id}`}
                      icon="map"
                      title={topicById(r.id)?.title ?? r.id}
                      subtitle={r.why}
                      chevron
                      onPress={() => router.push({ pathname: '/learn/topic/[id]', params: { id: r.id } })}
                    />
                  ) : (
                    <Row key="words" icon="mic" title="Use your words again" subtitle={r.why} chevron onPress={() => router.push({ pathname: '/speak/[situation]', params: { situation: 'free' } })} />
                  ),
                )}
              </List>
            </View>
          ) : null}

          {words.length ? (
            <View>
              <SectionHeader title="Words from your conversations" />
              <List>
                {words.slice(0, 10).map((w) => (
                  <Row key={w.lemma} title={w.lemma} subtitle={`${w.meaning} · ${strengthLabels[w.strength]}`} />
                ))}
              </List>
              <Text variant="footnote" color="label3" style={styles.note}>
                A word becomes steady only after you use it on your own on different days and in different conversations.
              </Text>
            </View>
          ) : null}

          <View>
            <SectionHeader title="Recent conversations" />
            <List>
              {[...sessions]
                .reverse()
                .slice(0, 5)
                .map((s) => (
                  <Row
                    key={s.id}
                    icon={s.mode === 'typed' ? 'keyboard' : 'mic'}
                    title={`${situationById(s.situation)?.title ?? 'Conversation'} · ${new Date(s.at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`}
                    subtitle={s.summary ?? (s.learnerTurns ? 'No feedback saved' : 'No answers recorded')}
                  />
                ))}
            </List>
          </View>
        </>
      ) : null}

      <Text variant="footnote" color="label3" style={styles.note}>
        Your voice goes to OpenAI during a conversation, and its text to Anthropic’s Claude for meanings and feedback; neither is kept by CzechPal and no
        recording is saved. CzechPal can’t judge pronunciation. Progress stays on this phone.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  center: { alignItems: 'center' },
  hero: { alignItems: 'stretch', gap: space.sm, paddingVertical: space.xl },
  stats: { gap: space.xs },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
  skill: { flexDirection: 'row', alignItems: 'center', minHeight: 32, gap: space.sm },
  note: { paddingHorizontal: space.xs, marginTop: space.sm, borderRadius: radius.tile },
});
