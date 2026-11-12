import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toneColors, type Tone } from '@/components/design/tone';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import type { JourneyNode, JourneyUnit } from '@/lib/academy/journey';
import { mockFinished } from '@/lib/academy/mock';
import { nodeHref, partIcon, useJourney } from '@/lib/academy/use-plan';
import { useAcademy } from '@/store/academy';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const TONES: Tone[] = ['sky', 'sage', 'coral', 'lavender'];

/**
 * The A2 journey as a path: fourteen units, the one the learner is in opened to show its
 * lessons and its exam practice, the others one tap away. Mock exams sit on the path as
 * milestones. Everything is open; nothing is locked.
 */
export function JourneySection() {
  const journey = useJourney();
  const mocksDone = useAcademy((s) => s.mocks.filter(mockFinished).length);
  const current = journey.next?.unit.n ?? 0;
  // null: the unit the learner is in. 0: all closed. Otherwise the unit they opened.
  const [opened, setOpened] = useState<number | null>(null);
  const open = opened ?? current;

  return (
    <View>
      <SectionHeader
        title="Your A2 journey"
        action={
          <Pressable onPress={() => router.push('/learn/topics')} hitSlop={10} accessibilityRole="link" accessibilityLabel="See all topics">
            <Text variant="subhead" weight="600" color="accent" chrome>
              All topics
            </Text>
          </Pressable>
        }
      />
      <View style={styles.units}>
        {journey.units.map((u) => (
          <View key={u.n} style={styles.units}>
            <UnitCard unit={u} tone={TONES[(u.n - 1) % TONES.length]} open={open === u.n} current={current === u.n} nextId={journey.next?.node.id} onToggle={() => setOpened(open === u.n ? 0 : u.n)} />
            {u.mockAfter ? <MockRow n={u.mockAfter} done={mocksDone >= u.mockAfter} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function UnitCard({ unit, tone, open, current, nextId, onToggle }: { unit: JourneyUnit; tone: Tone; open: boolean; current: boolean; nextId?: string; onToggle: () => void }) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, tone);
  const done = unit.lessonsDone + unit.tasksDone;
  const total = unit.lessonsTotal + unit.tasksTotal;
  const lessons = unit.nodes.filter((n) => n.kind === 'lesson');
  const tasks = unit.nodes.filter((n) => n.kind === 'task');

  return (
    <View style={[styles.unit, { backgroundColor: colors.surface, boxShadow: colors.shadow }, current && { borderColor: colors.label, borderWidth: 1.5 }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Unit ${unit.n}, ${unit.topic.title}. ${done} of ${total} steps done.`}
        style={styles.unitHead}>
        <View style={[styles.number, { backgroundColor: unit.complete ? colors.successSoft : tint }]}>
          {unit.complete ? (
            <Icon name="check" size={18} color={colors.success} />
          ) : (
            <Text variant="headline" weight="700" tabular style={{ color: ink }}>
              {unit.n}
            </Text>
          )}
        </View>
        <View style={styles.flex}>
          <Text variant="headline" numberOfLines={1}>
            {unit.topic.title}
          </Text>
          <Text variant="footnote" color="label2" numberOfLines={1}>
            {done === 0 ? `${unit.lessonsTotal} lessons · ${unit.tasksTotal} exam tasks` : `${done} of ${total} done`}
            {current ? ' · you are here' : ''}
          </Text>
        </View>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} color={colors.label3} />
      </Pressable>
      <View style={[styles.track, { backgroundColor: colors.fill }]}>
        <View style={[styles.fill, { backgroundColor: unit.complete ? colors.success : colors.label, width: `${total ? (done / total) * 100 : 0}%` }]} />
      </View>

      {open ? (
        <View style={styles.nodes}>
          {lessons.map((n) => (
            <NodeRow key={n.id} node={n} next={n.id === nextId} />
          ))}
          {tasks.length ? (
            <Text variant="caption" weight="600" color="label3" style={styles.divider}>
              EXAM PRACTICE, IN THE EXAM’S OWN FORMATS
            </Text>
          ) : null}
          {tasks.map((n) => (
            <NodeRow key={n.id} node={n} next={n.id === nextId} />
          ))}
          <Pressable
            onPress={() => router.push({ pathname: '/learn/topic/[id]', params: { id: unit.topic.id } })}
            accessibilityRole="link"
            hitSlop={6}
            style={styles.more}>
            <Text variant="subhead" weight="600" color="accent" chrome>
              Phrases, missions and grammar for this topic
            </Text>
            <Icon name="chevronRight" size={14} color={colors.accent} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function NodeRow({ node, next }: { node: JourneyNode; next: boolean }) {
  const { colors } = useTheme();
  const label = node.kind === 'lesson' ? `Lesson ${node.n}` : node.detail;
  return (
    <PressableScale
      onPress={() => router.push(nodeHref(node))}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${node.title}${node.done ? ', done' : next ? ', next' : ''}`}
      style={[styles.node, next && { backgroundColor: colors.accentSoft }]}>
      <View style={[styles.dot, { backgroundColor: node.done ? colors.successSoft : next ? colors.accentFill : colors.fill }]}>
        <Icon
          name={node.done ? 'check' : node.kind === 'lesson' ? (next ? 'play' : 'school') : partIcon[node.part]}
          size={14}
          color={node.done ? colors.success : next ? colors.onAccent : colors.label2}
        />
      </View>
      <View style={styles.flex}>
        <Text variant="callout" weight="600" numberOfLines={1}>
          {node.title}
        </Text>
        <Text variant="footnote" color="label2" numberOfLines={1}>
          {label}
          {node.kind === 'lesson' && node.secure ? ' · mastered' : ''}
        </Text>
      </View>
      {node.kind === 'lesson' && node.retest ? <Badge label="Check again" tone="warning" /> : next ? <Badge label="Next" tone="accent" /> : null}
    </PressableScale>
  );
}

/** A mock exam on the path: all four parts, timed, on questions not seen in practice. */
function MockRow({ n, done }: { n: number; done: boolean }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => router.push('/learn/mock')}
      accessibilityRole="button"
      accessibilityLabel={`Mock exam ${n}${done ? ', done' : ''}. All four parts, timed.`}
      style={[styles.mock, { backgroundColor: colors.coralSoft }]}>
      <View style={[styles.number, { backgroundColor: colors.surface }]}>
        <Icon name={done ? 'check' : 'clock'} size={18} color={colors.coralInk} />
      </View>
      <View style={styles.flex}>
        <Text variant="headline" style={{ color: colors.coralInk }}>
          Mock exam {n}
        </Text>
        <Text variant="footnote" style={{ color: colors.coralInk, opacity: 0.85 }}>
          {done ? 'Done. Take another any time.' : 'All four parts, timed, on new questions'}
        </Text>
      </View>
      <Icon name="chevronRight" size={16} color={colors.coralInk} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  units: { gap: space.md },
  unit: { borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  unitHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, minHeight: 72 },
  number: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  track: { height: 3 },
  fill: { height: 3 },
  nodes: { padding: space.sm, gap: space.xxs },
  node: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.sm, paddingVertical: space.sm, borderRadius: radius.tile, borderCurve: 'continuous' },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  divider: { letterSpacing: 0.6, paddingHorizontal: space.sm, paddingTop: space.md, paddingBottom: space.xs },
  more: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingVertical: space.md },
  mock: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
});
