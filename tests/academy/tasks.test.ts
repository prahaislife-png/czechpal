import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { exerciseById } from '../../src/lib/academy/catalog';
import { addAttempts, makeAttempt, mistakeIds, skillReadiness, type Attempt } from '../../src/lib/academy/evidence';
import { grammarById } from '../../src/lib/academy/grammar';
import { dailyPlan, type PlanInput } from '../../src/lib/academy/plan';
import { emailChecks, formChecks, gradeItem, itemExercise, itemMeta, itemOptions, scoreSet, taskSets } from '../../src/lib/academy/tasks';
import { writingTasks } from '../../src/lib/academy/tasks/writing';
import { topicById } from '../../src/lib/academy/topics';
import { countWords, EMAIL_MIN_WORDS, examTasks, FORM_MIN_WORDS } from '../../src/lib/learn/exam';

const now = new Date(2026, 10, 6, 10);

describe('exam-task sets', () => {
  it('there is a set for every reading and listening task, shaped like it', () => {
    for (const part of ['reading', 'listening'] as const)
      for (const n of [1, 2, 3, 4, 5] as const) {
        const set = taskSets.find((s) => s.part === part && s.task === n);
        assert.ok(set, `${part} ${n}`);
        const official = examTasks.find((t) => t.part === part && t.n === n)!;
        assert.equal(set.items.length, official.items, `${set.id}: items`);
      }
  });

  it('ids are unique and every set carries its provenance', () => {
    const items = taskSets.flatMap((s) => s.items.map((i) => i.id));
    assert.equal(new Set(items).size, items.length);
    assert.equal(new Set(taskSets.map((s) => s.id)).size, taskSets.length);
    for (const s of taskSets) {
      assert.equal(s.review, 'ai-checked', s.id);
      assert.equal(s.licence, 'original', s.id);
      for (const o of s.objectives) {
        const [kind, id] = o.split(':');
        assert.ok(kind === 'g' ? grammarById(id) : topicById(id), `${s.id}: ${o}`);
      }
    }
  });

  it('formats match the exam: shared choices with extras, own A–D options, or written info', () => {
    const byKey = (p: string, n: number) => taskSets.find((s) => s.part === p && s.task === n)!;
    // Reading 1: two extra replies. Reading 3: five people, one extra.
    assert.equal(byKey('reading', 1).choices!.length, byKey('reading', 1).items.length + 2);
    assert.equal(byKey('reading', 3).choices!.length, 5);
    // Listening 3: A–G, two extra. Listening 4: A–F pictures, one extra.
    assert.equal(byKey('listening', 3).choices!.length, 7);
    assert.equal(byKey('listening', 4).choices!.length, 6);
    for (const n of [2, 4]) for (const i of byKey('reading', n).items) assert.equal(i.options!.length, 4, i.id);
    for (const n of [1, 2]) for (const i of byKey('listening', n).items) assert.equal(i.options!.length, 4, i.id);
    for (const s of [byKey('reading', 5), byKey('listening', 5)]) for (const i of s.items) assert.ok(i.accept?.length, i.id);
    // Every listening item has something to hear.
    for (const s of taskSets.filter((s) => s.part === 'listening')) for (const i of s.items) assert.ok(i.audio ?? s.audio, i.id);
  });

  it('answers are valid, shared choices are each used at most once, and positions vary', () => {
    for (const s of taskSets) {
      if (s.choices) {
        const used = s.items.map((i) => i.answer);
        assert.equal(new Set(used).size, used.length, `${s.id}: a choice used twice`);
      }
      for (const i of s.items) {
        if (i.accept) continue;
        const opts = itemOptions(s, i);
        assert.ok(i.answer! >= 0 && i.answer! < opts.length, i.id);
        assert.equal(new Set(opts).size, opts.length, `${i.id}: repeated option`);
      }
      const positions = s.items.filter((i) => !i.accept).map((i) => i.answer);
      if (positions.length >= 4) assert.ok(new Set(positions).size >= 3, `${s.id}: the answer is nearly always in one place`);
    }
  });
});

describe('marking exam tasks', () => {
  const r5 = taskSets.find((s) => s.id === 'r5-a')!;
  const price = r5.items.find((i) => i.id === 'r5-a.25')!;
  const place = r5.items.find((i) => i.id === 'r5-a.24')!;

  it('accepts written information in its usual forms', () => {
    assert.ok(gradeItem(price, '450 Kč').correct);
    assert.ok(gradeItem(price, '450,- Kč').correct);
    assert.ok(gradeItem(price, '450 korun.').correct);
    assert.ok(gradeItem(place, 'do kutné hory').correct);
    assert.equal(gradeItem(place, 'do Kutne Hory').accentsOnly, true);
    assert.equal(gradeItem(place, 'do Kutne Hory').correct, false);
    assert.equal(gradeItem(price, '').correct, false);
  });

  it('scores one point per item', () => {
    const l1 = taskSets.find((s) => s.id === 'l1-a')!;
    const all = Object.fromEntries(l1.items.map((i) => [i.id, i.answer!]));
    assert.deepEqual(scoreSet(l1, all), { right: 5, total: 5 });
    assert.deepEqual(scoreSet(l1, {}), { right: 0, total: 5 });
  });

  it('a task item becomes a stand-alone exercise for going over mistakes', () => {
    const l3 = taskSets.find((s) => s.id === 'l3-a')!;
    const e = itemExercise(l3, l3.items[0]);
    assert.equal(e.kind, 'choice');
    if (e.kind === 'choice') {
      assert.equal(e.listen, true);
      assert.equal(e.options.length, 7);
      assert.equal(e.options[e.answer], 'v lékárně');
    }
    assert.equal(itemExercise(r5, price).kind, 'type');
    assert.equal(exerciseById('r5-a.25')?.kind, 'type');
    assert.equal(exerciseById('personal-1.c1')?.kind, 'choice');
    assert.equal(exerciseById('diag.1')?.kind, 'choice');
    assert.equal(exerciseById('nope'), undefined);
  });

  it('task answers count as evidence; reviews of mistakes don’t', () => {
    const set = taskSets[0];
    let list: Attempt[] = [];
    for (const i of set.items) list = addAttempts(list, [makeAttempt(itemMeta(set, i), true, 'task', list, now)]);
    assert.equal(skillReadiness(list, 'reading').count, set.items.length);
    const review = makeAttempt({ ...itemMeta(set, set.items[0]), id: 'fresh-item' }, true, 'review', [], now);
    assert.equal(review.independent, false);
  });
});

describe('mistake memory', () => {
  const a = (item: string, correct: boolean | null, minute: number): Attempt => ({
    item,
    version: 1,
    skill: 'reading',
    objectives: ['g:past'],
    correct,
    independent: true,
    fresh: true,
    source: 'check',
    at: new Date(2026, 10, 6, 10, minute).toISOString(),
  });

  it('lists items whose latest answer was wrong, newest first', () => {
    const list = [a('x', false, 1), a('y', false, 2), a('x', true, 3), a('z', false, 4), a('w', null, 5)];
    assert.deepEqual(mistakeIds(list), ['z', 'y']);
  });
});

describe('writing coach', () => {
  it('form samples meet the exam’s rules, and short answers are flagged', () => {
    for (const w of writingTasks.filter((w) => w.kind === 'form')) {
      assert.equal(w.questions!.length, 3, w.id);
      for (const c of formChecks(w.sample)) assert.ok(c.enoughWords && c.capital && c.endsWithStop, w.id);
    }
    const [c] = formChecks(['bydlím v praze']);
    assert.equal(c.enoughWords, false);
    assert.equal(c.words < FORM_MIN_WORDS, true);
  });

  it('e-mail samples pass every check', () => {
    for (const w of writingTasks.filter((w) => w.kind === 'email')) {
      const c = emailChecks(w.sample.join('\n'), w);
      assert.ok(!c.zero && c.greeting && c.closing && c.signature, `${w.id}: ${JSON.stringify(c)}`);
      assert.ok(c.sentences >= c.sentencesNeeded, `${w.id}: sentences`);
      assert.ok(countWords(w.sample.join(' ')) >= EMAIL_MIN_WORDS, w.id);
    }
  });

  it('applies the 35-word zero rule and finds the parts of an e-mail', () => {
    const task = writingTasks.find((w) => w.id === 'w2-a')!;
    const short = emailChecks('Ahoj Petro,\npřijď v sobotu.\nMěj se,\nAna', task);
    assert.equal(short.zero, true);
    assert.ok(short.greeting && short.closing && short.signature);
    const noFrame = emailChecks('V sobotu mám narozeniny. Přijď.', task);
    assert.equal(noFrame.greeting, false);
    assert.equal(noFrame.signature, false);
    assert.equal(noFrame.closing, false);
  });
});

describe('daily plan with exam practice', () => {
  const at = new Date(2026, 10, 6, 9).toISOString();
  const unit1 = Object.fromEntries(topicById('personal')!.lessons.map((id) => [id, [{ at, right: 3, total: 3 }]]));
  const base: PlanInput = { minutes: 30, log: unit1, attempts: [], wordsDue: 0, canListen: true, now };

  it('exam practice follows a unit’s lessons, never before them', () => {
    assert.deepEqual(
      dailyPlan(base).map((s) => [s.kind, 'id' in s ? s.id : null]),
      [
        ['task', 'r1-a'],
        ['task', 'l1-a'],
        ['writing', 'w1-a'],
      ],
    );
    assert.ok(!dailyPlan({ ...base, log: {} }).some((s) => s.kind === 'task' || s.kind === 'writing'));
  });

  it('skips what is done, and never offers listening without a voice', () => {
    const plan = dailyPlan({ ...base, tasksDone: { 'r1-a': 2 } });
    assert.ok(!plan.some((s) => 'id' in s && s.id === 'r1-a'));
    const noVoice = dailyPlan({ ...base, canListen: false });
    assert.ok(!noVoice.some((s) => s.kind === 'task' && 'id' in s && s.id.startsWith('l')));
    assert.equal(noVoice[0].kind, 'task');
  });

  it('goes over mistakes when there are a few', () => {
    assert.ok(dailyPlan({ ...base, mistakes: 3 }).some((s) => s.kind === 'mistakes'));
    assert.ok(!dailyPlan({ ...base, mistakes: 2 }).some((s) => s.kind === 'mistakes'));
  });
});
