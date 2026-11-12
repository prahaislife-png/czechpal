import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { diagnostic, diagnosticFor } from '../../src/lib/academy/diagnostic';
import { addAttempts, makeAttempt, MIN_EVIDENCE, skillReadiness, weakObjectives, type Attempt } from '../../src/lib/academy/evidence';
import { checkWrite, gradeChoice, gradeType, optionOrder } from '../../src/lib/academy/grade';
import { grammar, grammarById } from '../../src/lib/academy/grammar';
import { lessonById, lessons } from '../../src/lib/academy/lessons';
import { buildJourney, MOCK_AFTER_UNITS, upcomingSteps } from '../../src/lib/academy/journey';
import { dailyPlan, planMinutes, STEP_MINUTES, stepDoneToday, type PlanInput, type TodayEvidence } from '../../src/lib/academy/plan';
import { practiceSets } from '../../src/lib/academy/tasks';
import { speakingTasks } from '../../src/lib/academy/tasks/speaking';
import { writingTasks } from '../../src/lib/academy/tasks/writing';
import { calendarDays, lessonSecure, nextLesson, retestDue, retestsDue, topicProgress, type LessonLog } from '../../src/lib/academy/roadmap';
import { topicById, topics } from '../../src/lib/academy/topics';
import type { ChoiceExercise, Exercise, TypeExercise, WriteExercise } from '../../src/lib/academy/types';
import { contentById } from '../../src/lib/learn/content';
import {
  checkFormAnswer,
  countWords,
  emailScoreCap,
  examOutcome,
  examParts,
  examTasks,
  passMarks,
  PRONUNCIATION_POINTS,
} from '../../src/lib/learn/exam';
import { situationById } from '../../src/lib/learn/situations';

const now = new Date(2026, 10, 6, 10); // 6 November 2026, 10:00
const daysAgo = (n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n, 9).toISOString();

describe('exam rules (2026 format)', () => {
  it('tasks add up to each part’s points; speaking includes pronunciation', () => {
    for (const p of examParts) {
      const tasks = examTasks.filter((t) => t.part === p.id).reduce((n, t) => n + t.points, 0);
      assert.equal(tasks + (p.id === 'speaking' ? PRONUNCIATION_POINTS : 0), p.points, p.id);
    }
    assert.equal(examParts.filter((p) => p.id !== 'speaking').reduce((n, p) => n + p.points, 0), passMarks.written.of);
    assert.equal(examParts.find((p) => p.id === 'speaking')!.points, passMarks.speaking.of);
  });

  it('reading and listening tasks have one point per item', () => {
    for (const t of examTasks.filter((t) => t.items)) assert.equal(t.items, t.points, `${t.part} ${t.n}`);
  });

  it('pass marks are 60% of each part', () => {
    assert.equal(passMarks.written.need, Math.ceil(passMarks.written.of * 0.6));
    assert.equal(passMarks.speaking.need, Math.ceil(passMarks.speaking.of * 0.6));
  });

  it('both parts must pass; a missing part leaves the result open', () => {
    assert.equal(examOutcome({ reading: 25, writing: 20, listening: 25, speaking: 23 }).passed, false);
    assert.equal(examOutcome({ reading: 14, writing: 14, listening: 14, speaking: 24 }).passed, true);
    assert.equal(examOutcome({ reading: 14, writing: 13, listening: 14, speaking: 40 }).passed, false);
    const open = examOutcome({ reading: 25, writing: 20, listening: 25 });
    assert.equal(open.passed, null);
    assert.equal(open.written.passed, true);
    assert.equal(examOutcome({ reading: 25, listening: 25, speaking: 40 }).written.score, null);
    // Scores are clamped to each part's maximum.
    assert.equal(examOutcome({ reading: 99, writing: 20, listening: 25, speaking: 40 }).written.score, 70);
  });

  it('counts words as the exam does', () => {
    assert.equal(countWords('Jsem z Indie a bydlím v Praze.'), 7);
    assert.equal(countWords('  Píšu  e-mail – zítra .  '), 3);
    assert.equal(countWords(''), 0);
    assert.equal(countWords('Mám 2 děti.'), 3);
  });

  it('checks a form answer: 10 words, a capital, a full stop', () => {
    const ok = checkFormAnswer('Jsem z Indie a teď bydlím v Praze na Žižkově s rodinou.');
    assert.deepEqual({ ...ok, words: ok.words >= 10 }, { words: true, enoughWords: true, capital: true, endsWithStop: true });
    const short = checkFormAnswer('bydlím v praze');
    assert.equal(short.enoughWords, false);
    assert.equal(short.capital, false);
    assert.equal(short.endsWithStop, false);
  });

  it('an e-mail under 35 words scores 0', () => {
    assert.equal(emailScoreCap(Array(34).fill('slovo').join(' ')).zero, true);
    assert.equal(emailScoreCap(Array(35).fill('slovo').join(' ')).zero, false);
  });
});

const all: Exercise[] = [...lessons.flatMap((l) => [...l.practise, ...l.check]), ...diagnostic];

describe('content integrity', () => {
  it('ids are unique and every item carries its provenance', () => {
    assert.equal(new Set(all.map((e) => e.id)).size, all.length);
    for (const e of all) {
      assert.equal(e.author, 'CzechLocal', e.id);
      assert.equal(e.licence, 'original', e.id);
      // Nothing is shown as teacher-reviewed until a teacher has reviewed it.
      assert.equal(e.review, 'ai-checked', e.id);
      assert.ok(e.version >= 1 && e.objectives.length > 0, e.id);
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(e.checkedOn), e.id);
    }
  });

  it('choices have one valid answer and no repeated options', () => {
    for (const e of all.filter((e): e is ChoiceExercise => e.kind === 'choice')) {
      assert.ok(e.answer >= 0 && e.answer < e.options.length, e.id);
      assert.equal(new Set(e.options).size, e.options.length, e.id);
      assert.ok(e.explain.trim(), e.id);
      if (e.listen) assert.ok(e.text, `${e.id}: a listening item needs its text`);
    }
  });

  it('typed answers accept their own model answer; written tasks meet their own minimum', () => {
    for (const e of all.filter((e): e is TypeExercise => e.kind === 'type')) assert.ok(gradeType(e, e.accept[0]).correct, e.id);
    for (const e of all.filter((e): e is WriteExercise => e.kind === 'write')) {
      const c = checkWrite(e, e.sample);
      assert.ok(c.enoughWords && c.capital && c.endsWithStop, `${e.id}: the sample breaks its own rules`);
      assert.ok(e.selfCheck.length >= 2, e.id);
    }
  });

  it('objectives point at real grammar items and topics', () => {
    for (const e of all)
      for (const o of e.objectives) {
        const [kind, id] = o.split(':');
        assert.ok(kind === 'g' ? grammarById(id) : kind === 't' ? topicById(id) : false, `${e.id}: unknown objective ${o}`);
      }
  });

  it('topics link only to things that exist', () => {
    assert.equal(topics.length, 14);
    assert.equal(new Set(topics.map((t) => t.id)).size, 14);
    for (const t of topics) {
      for (const g of t.grammar) assert.ok(grammarById(g), `${t.id}: grammar ${g}`);
      for (const c of t.texts) assert.ok(contentById(c), `${t.id}: text ${c}`);
      for (const s of t.situations) assert.ok(situationById(s), `${t.id}: situation ${s}`);
      for (const l of t.lessons) assert.equal(lessonById(l)?.topic, t.id, `${t.id}: lesson ${l}`);
    }
    assert.equal(new Set(grammar.map((g) => g.id)).size, grammar.length);
  });

  it('every lesson has new Czech, a scene, practice and an independent check', () => {
    for (const l of lessons) {
      assert.ok(l.introduce.length >= 3 && l.context.length >= 3, l.id);
      assert.ok(l.practise.length >= 3 && l.check.length >= 3, l.id);
      const marked = l.check.filter((e) => e.kind !== 'write');
      assert.ok(marked.length >= 3, `${l.id}: the check needs at least three marked items`);
      // Without a Czech voice, listening items drop out; two marked items must remain.
      assert.ok(marked.filter((e) => !(e.kind === 'choice' && e.listen)).length >= 2, `${l.id}: too few items without a voice`);
    }
  });

  it('the diagnostic leaves out listening without a Czech voice', () => {
    assert.ok(diagnosticFor(true).some((e) => e.kind === 'choice' && e.listen));
    assert.ok(!diagnosticFor(false).some((e) => e.kind === 'choice' && e.listen));
  });
});

describe('marking', () => {
  const typed = lessonById('personal-1')!.practise.find((e) => e.kind === 'type') as TypeExercise;

  it('ignores capitals, spaces and end punctuation, never accents', () => {
    assert.ok(gradeType(typed, '  Bydlím   v Praze. ').correct);
    const accents = gradeType(typed, 'bydlim v praze');
    assert.equal(accents.correct, false);
    assert.equal(accents.accentsOnly, true);
    assert.deepEqual(gradeType(typed, 'jsem v praze'), { correct: false, accentsOnly: false });
    assert.equal(gradeType(typed, '   ').correct, false);
  });

  it('shows options in a stable shuffled order, so the answer moves around', () => {
    const choices = all.filter((e): e is ChoiceExercise => e.kind === 'choice');
    for (const c of choices) {
      const order = optionOrder(c);
      assert.deepEqual([...order].sort(), c.options.map((_, i) => i), c.id);
      assert.deepEqual(optionOrder(c), order, `${c.id}: not stable`);
    }
    const shownAt = choices.map((c) => optionOrder(c).indexOf(c.answer));
    for (const pos of [0, 1, 2]) assert.ok(shownAt.filter((p) => p === pos).length >= choices.length / 6, `answer shown at ${pos} too rarely`);
  });

  it('marks a choice by its index', () => {
    const c = diagnostic[0] as ChoiceExercise;
    assert.ok(gradeChoice(c, c.answer));
    assert.ok(!gradeChoice(c, (c.answer + 1) % c.options.length));
  });
});

const item = (id: string, skill: Attempt['skill'] = 'reading', objectives = ['g:past']) => ({ id, version: 1, skill, objectives, topic: 'personal' as const });

function answers(n: number, rightShare: number, skill: Attempt['skill'] = 'reading', start = 0, list: Attempt[] = []) {
  let out = list;
  for (let i = 0; i < n; i++) out = addAttempts(out, [makeAttempt(item(`x${start + i}`, skill), i < Math.round(n * rightShare), 'check', out, now)]);
  return out;
}

describe('evidence and readiness', () => {
  it('only the first answer to an item version is fresh; practice isn’t independent', () => {
    const first = makeAttempt(item('a'), true, 'check', [], now);
    assert.ok(first.fresh && first.independent);
    assert.equal(makeAttempt(item('a'), true, 'check', [first], now).fresh, false);
    assert.equal(makeAttempt({ ...item('a'), version: 2 }, true, 'check', [first], now).fresh, true);
    assert.equal(makeAttempt(item('b'), true, 'practise', [], now).independent, false);
  });

  it('with no evidence a skill is not assessed, and under the minimum it says so', () => {
    assert.equal(skillReadiness([], 'reading').state, 'not-assessed');
    const few = skillReadiness(answers(MIN_EVIDENCE - 1, 1), 'reading');
    assert.equal(few.enough, false);
    assert.equal(few.count, MIN_EVIDENCE - 1);
  });

  it('practice, repeats and self-checked writing never count', () => {
    let list: Attempt[] = [];
    for (let i = 0; i < 20; i++) list = addAttempts(list, [makeAttempt(item(`p${i}`), true, 'practise', list, now)]);
    for (let i = 0; i < 20; i++) list = addAttempts(list, [makeAttempt(item('same'), true, 'check', list, now)]);
    for (let i = 0; i < 20; i++) list = addAttempts(list, [makeAttempt(item(`w${i}`, 'writing'), null, 'check', list, now)]);
    assert.equal(skillReadiness(list, 'reading').count, 1);
    assert.equal(skillReadiness(list, 'writing').state, 'not-assessed');
  });

  it('accuracy sets the state; there is no “ready” without an exam-format test', () => {
    assert.equal(skillReadiness(answers(10, 0.3), 'reading').state, 'building');
    assert.equal(skillReadiness(answers(10, 0.5), 'reading').state, 'developing');
    assert.equal(skillReadiness(answers(10, 1), 'reading').state, 'approaching');
  });

  it('a clear drop in the latest answers needs practice', () => {
    const good = answers(MIN_EVIDENCE, 1);
    const dropped = answers(MIN_EVIDENCE, 0.25, 'reading', 100, good);
    assert.equal(skillReadiness(dropped, 'reading').state, 'needs-practice');
  });

  it('weak objectives need three answers and under 60% right', () => {
    const list = answers(4, 0.25);
    const weak = weakObjectives(list);
    assert.equal(weak[0].objective, 'g:past');
    assert.equal(weak[0].label, 'The past tense');
    assert.deepEqual(weakObjectives(answers(2, 0)), []);
    assert.deepEqual(weakObjectives(answers(5, 0.8)), []);
  });
});

describe('roadmap and mastery', () => {
  const pass = (n: number) => ({ at: daysAgo(n), right: 3, total: 3 });
  const fail = (n: number) => ({ at: daysAgo(n), right: 1, total: 3 });

  it('counts calendar days on the phone’s calendar', () => {
    assert.equal(calendarDays(new Date(2026, 10, 5, 23), new Date(2026, 10, 6, 1)), 1);
    assert.equal(calendarDays(new Date(2026, 10, 6, 1), new Date(2026, 10, 6, 23)), 0);
  });

  it('a lesson is secure after two passes at least two days apart', () => {
    assert.equal(lessonSecure([pass(1)]), false);
    assert.equal(lessonSecure([pass(1), pass(0)]), false);
    assert.equal(lessonSecure([pass(2), pass(0)]), true);
    assert.equal(lessonSecure([pass(3), fail(0)]), false);
  });

  it('a check comes back two days after a pass, or the next day after a fail', () => {
    assert.equal(retestDue([pass(1)], now), false);
    assert.equal(retestDue([pass(2)], now), true);
    assert.equal(retestDue([fail(0)], now), false);
    assert.equal(retestDue([fail(1)], now), true);
    assert.equal(retestDue([pass(4), pass(1)], now), false);
    assert.equal(retestDue([], now), false);
  });

  it('topic states go not started → learning → practised → mastered', () => {
    // Two of the topic's lessons, so the states are easy to reach.
    const personal = { ...topicById('personal')!, lessons: ['personal-1', 'personal-2'] };
    assert.equal(topicProgress(personal, {}, []).state, 'not-started');
    assert.equal(topicProgress(personal, { 'personal-1': [pass(0)] }, []).state, 'learning');
    assert.equal(topicProgress(personal, { 'personal-1': [pass(0)], 'personal-2': [fail(0)] }, []).state, 'practised');
    const both: LessonLog = { 'personal-1': [pass(3), pass(0)], 'personal-2': [pass(5), pass(1)] };
    assert.equal(topicProgress(personal, both, []).state, 'mastered');
    // A topic without written lessons never shows as practised or mastered.
    assert.equal(topicProgress({ ...topicById('weather')!, lessons: [] }, {}, []).available, false);
  });

  it('the next lesson follows the teaching order', () => {
    assert.equal(nextLesson({})?.id, 'personal-1');
    assert.equal(nextLesson({ 'personal-1': [pass(0)] })?.id, 'personal-2');
    assert.deepEqual(retestsDue({ 'personal-1': [pass(2)], 'housing-1': [pass(0)] }, now).map((l) => l.id), ['personal-1']);
  });
});

describe('the A2 journey', () => {
  const done = (ids: string[]): LessonLog => Object.fromEntries(ids.map((id) => [id, [{ at: daysAgo(1), right: 3, total: 3 }]]));
  const fresh = buildJourney({}, {}, { canListen: true, now });

  it('is fourteen units: each topic’s lessons, then exam tasks from every part', () => {
    assert.equal(fresh.units.length, topics.length);
    for (const u of fresh.units) {
      assert.deepEqual(
        u.nodes.filter((n) => n.kind === 'lesson').map((n) => n.id),
        u.topic.lessons,
      );
      // Lessons come first, exam practice after.
      const kinds = u.nodes.map((n) => n.kind);
      assert.ok(kinds.lastIndexOf('lesson') < kinds.indexOf('task') || !kinds.includes('task'), `unit ${u.n}`);
      assert.ok(u.nodes.some((n) => n.kind === 'task' && n.part === 'reading') && u.nodes.some((n) => n.kind === 'task' && n.part === 'listening'), `unit ${u.n}`);
    }
    assert.equal(fresh.total, fresh.units.reduce((n, u) => n + u.nodes.length, 0));
    assert.equal(fresh.done, 0);
    assert.deepEqual(
      fresh.units.filter((u) => u.mockAfter).map((u) => u.n),
      MOCK_AFTER_UNITS,
    );
  });

  it('uses every lesson and every exam task exactly once', () => {
    const ids = fresh.units.flatMap((u) => u.nodes.map((n) => n.id));
    assert.equal(new Set(ids).size, ids.length);
    const everything = [...lessons.map((l) => l.id), ...practiceSets.map((s) => s.id), ...writingTasks.map((w) => w.id), ...speakingTasks.map((t) => t.id)];
    assert.deepEqual([...ids].sort(), [...everything].sort());
    // Nothing kept for the mock exam is on the path.
    assert.ok(!ids.some((id) => id.endsWith('-m') || id.endsWith('-n')));
  });

  it('meets all five reading tasks before any repeats', () => {
    const firstFive = fresh.units.slice(0, 5).map((u) => u.nodes.find((n) => n.kind === 'task' && n.part === 'reading')!.id);
    assert.deepEqual(firstFive, ['r1-a', 'r2-a', 'r3-a', 'r4-a', 'r5-a']);
    assert.equal(fresh.units[5].nodes.find((n) => n.kind === 'task' && n.part === 'reading')!.id, 'r1-b');
  });

  it('starts at lesson one, with nothing to set up, and moves on as steps are done', () => {
    assert.equal(fresh.next?.node.id, 'personal-1');
    assert.equal(fresh.next?.unit.n, 1);
    const afterLessons = buildJourney(done(topics[0].lessons), {}, { canListen: true, now });
    assert.equal(afterLessons.next?.node.kind, 'task');
    assert.equal(afterLessons.next?.unit.n, 1);
    assert.equal(afterLessons.done, topics[0].lessons.length);
    const unit1 = afterLessons.units[0];
    const tasks = Object.fromEntries(unit1.nodes.filter((n) => n.kind === 'task').map((n) => [n.id, 1]));
    const moved = buildJourney(done(topics[0].lessons), tasks, { canListen: true, now });
    assert.ok(moved.units[0].complete);
    assert.equal(moved.next?.unit.n, 2);
    assert.equal(moved.next?.node.id, topics[1].lessons[0]);
  });

  it('never makes a listening task next without a Czech voice', () => {
    const log = done(topics[0].lessons);
    const steps = upcomingSteps(buildJourney(log, {}, { canListen: false, now }), 20, false);
    assert.ok(steps.length === 20 && !steps.some((s) => s.node.kind === 'task' && s.node.part === 'listening'));
    assert.ok(upcomingSteps(buildJourney(log, {}, { canListen: true, now }), 20, true).some((s) => s.node.kind === 'task' && s.node.part === 'listening'));
  });
});

describe('daily plan', () => {
  const base: PlanInput = { minutes: 10, log: {}, attempts: [], wordsDue: 0, canListen: true, now };
  const pass = (n: number) => [{ at: daysAgo(n), right: 3, total: 3 }];

  it('on day one it is lesson one: nothing to set up, no starting check', () => {
    const plan = dailyPlan({ ...base, minutes: 5 });
    assert.deepEqual(
      plan.map((s) => [s.kind, 'id' in s ? s.id : null]),
      [['lesson', 'personal-1']],
    );
  });

  it('follows the journey: the next lessons, then the unit’s exam practice', () => {
    const plan = dailyPlan({ ...base, minutes: 30 });
    assert.deepEqual(
      plan.filter((s) => s.kind === 'lesson').map((s) => ('id' in s ? s.id : null)),
      ['personal-1', 'personal-2', 'personal-3'],
    );
    const log: LessonLog = Object.fromEntries(topics[0].lessons.map((id) => [id, pass(0)]));
    const after = dailyPlan({ ...base, minutes: 30, log });
    assert.deepEqual(
      after.map((s) => s.kind),
      ['task', 'task', 'writing'],
    );
    assert.ok(after[0].title && after[0].why.startsWith('Unit 1'));
  });

  it('puts a due check before the next lesson and fits the minutes', () => {
    const plan = dailyPlan({ ...base, log: { 'personal-1': pass(2) } });
    assert.deepEqual(
      plan.map((s) => s.kind),
      ['retest', 'lesson'],
    );
    assert.ok(planMinutes(plan) <= 10);
  });

  it('always has at least one step, even when it’s longer than the time', () => {
    const log: LessonLog = Object.fromEntries(topics[0].lessons.map((id) => [id, pass(0)]));
    const tasksDone = { 'r1-a': 1, 'l1-a': 1 };
    const plan = dailyPlan({ ...base, minutes: 5, log, tasksDone });
    assert.deepEqual(
      plan.map((s) => s.kind),
      ['writing'],
    );
    assert.ok(STEP_MINUTES.writing > 5);
  });

  it('adds mistakes, due words and grammar that keeps being missed, after the next step', () => {
    const plan = dailyPlan({ ...base, minutes: 30, attempts: answers(4, 0), wordsDue: 7, mistakes: 4 });
    assert.deepEqual(
      plan.slice(0, 4).map((s) => s.kind),
      ['lesson', 'mistakes', 'words', 'grammar'],
    );
    assert.ok(plan.some((s) => s.kind === 'grammar' && s.id === 'past'));
    assert.ok(plan.some((s) => s.kind === 'words' && s.count === 7));
    assert.ok(!dailyPlan({ ...base, minutes: 30, mistakes: 2 }).some((s) => s.kind === 'mistakes'));
    assert.ok(planMinutes(plan) <= 30);
  });

  it('ticks a step off only for what was done today', () => {
    const none: TodayEvidence = { lessons: new Set(), sets: new Set(), grammar: new Set(), reviews: 0, reviewed: 0 };
    const [lesson] = dailyPlan(base);
    assert.equal(stepDoneToday(lesson, none), false);
    assert.equal(stepDoneToday(lesson, { ...none, lessons: new Set(['personal-1']) }), true);
    assert.equal(stepDoneToday(lesson, { ...none, lessons: new Set(['personal-2']) }), false);
    const words = dailyPlan({ ...base, minutes: 30, wordsDue: 2 }).find((s) => s.kind === 'words')!;
    assert.equal(stepDoneToday(words, { ...none, reviews: 1 }), true);
  });
});
