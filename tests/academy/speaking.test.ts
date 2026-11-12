import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { grammarById } from '../../src/lib/academy/grammar';
import { buildJourney } from '../../src/lib/academy/journey';
import { dailyPlan, type PlanInput } from '../../src/lib/academy/plan';
import { taskSets } from '../../src/lib/academy/tasks';
import { speakingPrompts, speakingTaskById, speakingTasks, spoken } from '../../src/lib/academy/tasks/speaking';
import { writingTasks } from '../../src/lib/academy/tasks/writing';
import { topicById } from '../../src/lib/academy/topics';
import { examTasks } from '../../src/lib/learn/exam';

const now = new Date(2026, 10, 6, 10);

describe('speaking tasks', () => {
  it('there is practice for each of the four exam tasks', () => {
    for (const n of [1, 2, 3, 4] as const) {
      assert.ok(speakingTasks.some((t) => t.task === n), `task ${n}`);
      assert.ok(examTasks.some((t) => t.part === 'speaking' && t.n === n));
    }
  });

  it('each is shaped like its exam task', () => {
    for (const t of speakingTasks) {
      const prompts = speakingPrompts(t);
      if (t.task === 1) {
        // 8 questions on 2 topics, 4 each, asked by the examiner.
        assert.equal(t.parts.length, 2, t.id);
        for (const p of t.parts) assert.equal(p.prompts.length, 4, t.id);
        for (const p of prompts) assert.ok(p.ask?.endsWith('?'), p.id);
      }
      if (t.task === 2) {
        // 2 dialogues, 3 questions from the card and 1 of your own; formal vy.
        assert.equal(t.parts.length, 2, t.id);
        assert.equal(t.register, 'vy');
        for (const p of t.parts) {
          assert.equal(p.prompts.length, 4, t.id);
          assert.equal(p.prompts.filter((q) => q.cue === 'vaše otázka').length, 1, t.id);
          assert.ok(p.situation, t.id);
          for (const q of p.prompts) assert.ok(q.model.endsWith('?'), `${q.id}: a question`);
        }
      }
      if (t.task === 3) {
        // 4 pictures, a story in the past about someone else.
        assert.equal(prompts.length, 4, t.id);
        for (const p of prompts) {
          assert.ok(p.icon, p.id);
          assert.ok(!/(^|\s)(jsem|jsme)\s/.test(p.model), `${p.id}: about the person, not me`);
        }
      }
      if (t.task === 4) {
        // 3 pictures to offer, then why; informal ty.
        assert.equal(t.register, 'ty');
        assert.equal(prompts.filter((p) => p.icon).length, 3, t.id);
        assert.ok(prompts[prompts.length - 1].model.startsWith('Protože'), t.id);
      }
    }
  });

  it('ids are unique across all practice, and every task carries its provenance', () => {
    const ids = speakingTasks.flatMap((t) => speakingPrompts(t).map((p) => p.id));
    assert.equal(new Set(ids).size, ids.length);
    const sets = [...speakingTasks.map((t) => t.id), ...taskSets.map((s) => s.id), ...writingTasks.map((w) => w.id)];
    assert.equal(new Set(sets).size, sets.length);
    for (const t of speakingTasks) {
      assert.equal(t.review, 'ai-checked', t.id);
      assert.equal(t.licence, 'original', t.id);
      assert.ok(t.checklist.length >= 3, t.id);
      for (const o of t.objectives) {
        const [kind, id] = o.split(':');
        assert.ok(kind === 'g' ? grammarById(id) : topicById(id), `${t.id}: ${o}`);
      }
      for (const p of speakingPrompts(t)) assert.ok(p.model.trim() && p.en.trim(), p.id);
    }
    // Prompt ids become file names.
    for (const id of ids) assert.ok(/^[a-z0-9.-]+$/.test(id), id);
    assert.equal(speakingTaskById('s3-a')?.task, 3);
    assert.equal(speakingTaskById('nope'), undefined);
  });

  it('the voice reads one form where both are written', () => {
    assert.equal(spoken('Kde jste bydlel/a předtím?'), 'Kde jste bydlel předtím?');
    assert.equal(spoken('Co děláte rád/a ve volném čase?'), 'Co děláte rád ve volném čase?');
    assert.equal(spoken('Bydlím v Praze.'), 'Bydlím v Praze.');
  });
});

describe('daily plan with speaking', () => {
  it('reaches speaking practice once the unit’s lessons, reading, listening and writing are done', () => {
    const journey = buildJourney({}, {}, { canListen: true, now });
    const unit = journey.units[0];
    const before = unit.nodes.filter((n) => !(n.kind === 'task' && n.part === 'speaking'));
    const log = Object.fromEntries(before.filter((n) => n.kind === 'lesson').map((n) => [n.id, [{ at: new Date(2026, 10, 6, 9).toISOString(), right: 3, total: 3 }]]));
    const tasksDone = Object.fromEntries(before.filter((n) => n.kind === 'task').map((n) => [n.id, 1]));
    const input: PlanInput = { minutes: 10, log, attempts: [], wordsDue: 0, canListen: true, tasksDone, now };
    const [step] = dailyPlan(input);
    assert.equal(step.kind, 'speaking');
    assert.ok('id' in step && speakingTaskById(step.id));
    assert.equal(step.id, 's1-a');
  });

  it('every speaking task is on the journey', () => {
    const ids = buildJourney({}, {}, { canListen: true, now }).units.flatMap((u) => u.nodes.filter((n) => n.kind === 'task' && n.part === 'speaking').map((n) => n.id));
    assert.deepEqual([...ids].sort(), speakingTasks.map((t) => t.id).sort());
  });
});
