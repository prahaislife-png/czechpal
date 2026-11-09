import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { makeAttempt } from '../../src/lib/academy/evidence';
import { checkWriting, clock, MOCK_VARIANTS, nextVariant, markSection, mockSets, mockWriting, mockSpeakingTasks, sectionDone, weakTasks, writtenOutlook, type MockRun } from '../../src/lib/academy/mock';
import { dailyPlan } from '../../src/lib/academy/plan';
import { emailChecks, formChecks, practiceSets, taskSets } from '../../src/lib/academy/tasks';
import { speakingTaskById } from '../../src/lib/academy/tasks/speaking';
import { contentById } from '../../src/lib/learn/content';
import { examTasks, passMarks } from '../../src/lib/learn/exam';

const { form: mockForm, email: mockEmail } = mockWriting(1);
const all = (part: 'reading' | 'listening') => Object.fromEntries(mockSets(part).flatMap((s) => s.items.map((i) => [i.id, i.answer ?? i.accept![0]])));
const run = (over: Partial<MockRun> = {}): MockRun => ({ id: 'm', startedAt: '2026-11-07T08:00:00.000Z', speakingTasks: ['s1-a', 's2-a', 's3-a', 's4-a'], ...over });
const marked = (right: number, byTask: Record<number, [number, number]> = {}) => ({ at: '', seconds: 600, right, total: 25, answers: {}, byTask });

describe('mock exam content', () => {
  it('has an unseen set for every reading and listening task, shaped like the exam', () => {
    for (const part of ['reading', 'listening'] as const) {
      const sets = mockSets(part);
      assert.deepEqual(sets.map((s) => s.task), [1, 2, 3, 4, 5]);
      for (const s of sets) {
        assert.equal(s.pool, 'mock');
        assert.equal(s.items.length, examTasks.find((t) => t.part === part && t.n === s.task)!.items, s.id);
      }
      assert.equal(sets.reduce((n, s) => n + s.items.length, 0), 25);
    }
  });

  it('keeps mock sets out of everyday practice and the plan, but known for mistakes', () => {
    assert.ok(practiceSets.every((s) => !s.pool));
    assert.ok(taskSets.some((s) => s.id === 'r1-m'));
    const plan = dailyPlan({
      minutes: 30,
      difficulty: 'reading',
      diagnosticDone: true,
      log: { 'personal-1': [{ at: new Date(2026, 10, 6, 9).toISOString(), right: 3, total: 3 }] },
      attempts: [],
      wordsDue: 0,
      unread: () => true,
      storyTitle: (id) => contentById(id)?.title,
      canListen: true,
      tasksDone: Object.fromEntries(practiceSets.map((s) => [s.id, 5])),
    });
    for (const s of plan) assert.ok(!('id' in s) || !(s.id.endsWith('-m') || s.id.endsWith('-n')), s.kind);
  });

  it('mock writing samples meet the exam’s rules', () => {
    for (const c of formChecks(mockForm.sample)) assert.ok(c.enoughWords && c.capital && c.endsWithStop);
    const e = emailChecks(mockEmail.sample.join('\n'), mockEmail);
    assert.ok(!e.zero && e.greeting && e.closing && e.signature && e.sentences >= e.sentencesNeeded, JSON.stringify(e));
  });
});

describe('two mocks and two practice sets per task', () => {
  it('every mock has a full, unseen set for each task, and no question is shared', () => {
    assert.equal(MOCK_VARIANTS, 2);
    const ids = new Set<string>();
    for (let v = 1; v <= MOCK_VARIANTS; v++)
      for (const part of ['reading', 'listening'] as const) {
        const sets = mockSets(part, v);
        assert.deepEqual(sets.map((s) => s.task), [1, 2, 3, 4, 5], `mock ${v} ${part}`);
        for (const s of sets) {
          assert.equal(s.pool, 'mock', s.id);
          assert.equal(s.items.length, examTasks.find((t) => t.part === part && t.n === s.task)!.items, s.id);
          for (const i of s.items) {
            assert.ok(!ids.has(i.id), i.id);
            ids.add(i.id);
          }
        }
      }
    for (let v = 1; v <= MOCK_VARIANTS; v++) {
      const { form, email } = mockWriting(v);
      for (const c of formChecks(form.sample)) assert.ok(c.enoughWords && c.capital && c.endsWithStop, form.id);
      const e = emailChecks(email.sample.join('\n'), email);
      assert.ok(!e.zero && e.greeting && e.closing && e.signature && e.sentences >= e.sentencesNeeded, `${email.id}: ${JSON.stringify(e)}`);
    }
  });

  it('a new mock takes the one done least', () => {
    assert.equal(nextVariant([]), 1);
    assert.equal(nextVariant([{ variant: 1 }]), 2);
    assert.equal(nextVariant([{}]), 2);
    assert.equal(nextVariant([{ variant: 1 }, { variant: 2 }]), 1);
  });

  it('practice has three sets for every reading and listening task', () => {
    for (const part of ['reading', 'listening'] as const)
      for (const n of [1, 2, 3, 4, 5]) assert.equal(practiceSets.filter((s) => s.part === part && s.task === n).length, 3, `${part} ${n}`);
  });
});

describe('marking a mock', () => {
  it('scores one point a question, by task', () => {
    const r = markSection(mockSets('reading'), all('reading'));
    assert.equal(r.right, 25);
    assert.deepEqual(r.byTask[4], [6, 6]);
    assert.equal(markSection(mockSets('listening'), {}).right, 0);
  });

  it('applies the e-mail zero rule and counts short form answers', () => {
    const short = checkWriting(['Bydlím v Praze.', ...mockForm.sample.slice(1)], 'Dobrý den,\nděkuji.\nS pozdravem\nAna');
    assert.equal(short.formShort, 1);
    assert.equal(short.emailZero, true);
    const good = checkWriting(mockForm.sample, mockEmail.sample.join('\n'));
    assert.equal(good.formShort, 0);
    assert.equal(good.emailZero, false);
  });

  it('a mock answer counts as fresh, independent evidence', () => {
    const a = makeAttempt({ id: 'r1-m.1', version: 1, skill: 'reading', objectives: [] }, true, 'mock', []);
    assert.equal(a.independent, true);
    assert.equal(a.fresh, true);
  });
});

describe('what the mock means for the written part', () => {
  it('needs reading and listening before it says anything', () => {
    assert.equal(writtenOutlook(run({ reading: marked(20) })).verdict, 'not-yet');
  });

  it('says how many writing points are still needed, never a writing score', () => {
    const o = writtenOutlook(run({ reading: marked(15), listening: marked(14) }));
    assert.equal(o.marked, 29);
    assert.equal(o.need, passMarks.written.need - 29);
    assert.equal(o.verdict, 'possible');
    assert.equal(writtenOutlook(run({ reading: marked(22), listening: marked(21) })).verdict, 'reached');
    assert.equal(writtenOutlook(run({ reading: marked(5), listening: marked(6) })).verdict, 'out-of-reach');
  });

  it('an e-mail under 35 words leaves only the form’s 8 points', () => {
    const w = { at: '', seconds: 1, form: [], email: '', formShort: 0, emailWords: 20, emailZero: true };
    const o = writtenOutlook(run({ reading: marked(17), listening: marked(15), writing: w }));
    assert.equal(o.writingMax, 8);
    assert.equal(o.need, 10);
    assert.equal(o.verdict, 'out-of-reach');
  });

  it('lists the tasks under 60%, weakest first', () => {
    const w = weakTasks(run({ reading: marked(10, { 1: [5, 5], 2: [1, 5], 3: [2, 4] }), listening: marked(10, { 5: [0, 5] }) }));
    assert.deepEqual(
      w.map((t) => `${t.part}${t.task}`),
      ['listening5', 'reading2', 'reading3'],
    );
  });
});

describe('the speaking run and progress', () => {
  it('picks one speaking set for each task, the one practised least', () => {
    const ids = mockSpeakingTasks({ 's1-a': 2 });
    assert.deepEqual(ids.map((id) => speakingTaskById(id)!.task), [1, 2, 3, 4]);
    assert.equal(ids[0], 's1-b');
  });

  it('speaking is done only when all four tasks are', () => {
    const three = run({ speaking: { at: '', tasks: { 's1-a': { recorded: 8, prompts: 8 }, 's2-a': { recorded: 8, prompts: 8 }, 's3-a': { recorded: 4, prompts: 4 } } } });
    assert.equal(sectionDone(three, 'speaking'), false);
    assert.equal(sectionDone({ ...three, speaking: { at: '', tasks: { ...three.speaking!.tasks, 's4-a': { recorded: 4, prompts: 4 } } } }, 'speaking'), true);
  });

  it('formats the clock', () => {
    assert.equal(clock(0), '0:00');
    assert.equal(clock(2400), '40:00');
    assert.equal(clock(-5), '0:00');
    assert.equal(clock(61.9), '1:01');
  });
});
