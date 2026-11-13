import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildJourney } from '../src/lib/academy/journey';
import { mockOutcome, speakingSelfScore, writingEstimate, writingToMark, type MockRun } from '../src/lib/academy/mock';
import { SAMPLE_FORM_GUIDE } from '../src/lib/ai/form-sample';
import { allFields, czechDate, fieldsToFill, formProgress, looksLikeForm, yoursValue } from '../src/lib/forms';
import { courseSize, FREE_UNITS, gated, mockLocked, planWords, plusBenefits, plusHeadline, stepLocked, unitLocked, usableStoreKey } from '../src/lib/plus/access';

const journey = buildJourney({}, {}, { canListen: true });
const free = { live: true, plus: false };
const member = { live: true, plus: true };
const notOnSale = { live: false, plus: false };

describe('what CzechLocal Plus opens', () => {
  it('locks nothing in a build that can’t sell Plus', () => {
    for (const u of journey.units) {
      assert.equal(unitLocked(u.n, notOnSale), false);
      for (const n of u.nodes) assert.equal(stepLocked(n.id, notOnSale), false);
    }
    assert.equal(mockLocked(notOnSale), false);
    assert.equal(gated(notOnSale), false);
  });

  it('keeps the whole first unit free: its lessons and one exam task of each part', () => {
    const first = journey.units[0];
    assert.equal(FREE_UNITS, 1);
    assert.ok(first.lessonsTotal >= 3);
    for (const n of first.nodes) assert.equal(stepLocked(n.id, free), false, n.id);
    const parts = new Set(first.nodes.flatMap((n) => (n.kind === 'task' ? [n.part] : [])));
    assert.deepEqual([...parts].sort(), ['listening', 'reading', 'speaking', 'writing']);
    assert.equal(unitLocked(1, free), false);
  });

  it('locks every later unit and the mock exams for someone without Plus', () => {
    for (const u of journey.units.slice(1)) {
      assert.equal(unitLocked(u.n, free), true);
      for (const n of u.nodes) assert.equal(stepLocked(n.id, free), true, n.id);
    }
    assert.equal(mockLocked(free), true);
  });

  it('opens everything with Plus', () => {
    for (const u of journey.units) for (const n of u.nodes) assert.equal(stepLocked(n.id, member), false);
    assert.equal(mockLocked(member), false);
    assert.equal(unitLocked(14, member), false);
  });

  it('never locks what isn’t a step of the journey', () => {
    assert.equal(stepLocked('grammar-accusative', free), false);
    assert.equal(stepLocked(undefined, free), false);
  });

  it('says what the course holds in true numbers', () => {
    assert.equal(courseSize.units, journey.units.length);
    assert.equal(courseSize.lessons, journey.units.reduce((n, u) => n + u.lessonsTotal, 0));
    assert.ok(courseSize.examTasks >= 40);
    assert.ok(plusBenefits.length >= 5);
    for (const reason of ['course', 'mock', 'explain', 'form', 'settings'] as const) assert.ok(plusHeadline[reason].title && plusHeadline[reason].lead);
  });
});

describe('the store key', () => {
  it('never lets a Test Store key into a release build, where the store SDK crashes on purpose', () => {
    assert.equal(usableStoreKey('test_abc123', false), undefined);
    assert.equal(usableStoreKey('test_abc123', true), 'test_abc123');
  });

  it('uses a real store key in any build, and nothing when there is none', () => {
    assert.equal(usableStoreKey('appl_abc123', false), 'appl_abc123');
    assert.equal(usableStoreKey(' appl_abc123 ', true), 'appl_abc123');
    assert.equal(usableStoreKey(undefined, false), undefined);
    assert.equal(usableStoreKey('', true), undefined);
  });

  it('names every kind of plan the store can offer', () => {
    for (const p of ['year', 'month', 'lifetime', 'other'] as const) assert.ok(planWords[p].name && planWords[p].renews);
    assert.ok(/no renewal/.test(planWords.lifetime.renews));
  });
});

/** A finished mock with these reading and listening points. */
const run = (reading: number, listening: number, more: Partial<MockRun> = {}): MockRun => ({
  id: 'm1',
  startedAt: '2026-11-12T09:00:00.000Z',
  variant: 1,
  speakingTasks: [],
  reading: { at: '', seconds: 1800, right: reading, total: 25, answers: {}, byTask: {} },
  listening: { at: '', seconds: 2000, right: listening, total: 25, answers: {}, byTask: {} },
  ...more,
});
const writing = (estimate?: { form?: number; email?: number }, emailZero = false) => ({
  at: '',
  seconds: 1200,
  form: ['Bydlím v Praze už tři roky a pracuji v kanceláři v centru.', 'a', 'b'],
  email: 'Ahoj Petře, zvu tě na oslavu.',
  formShort: 0,
  emailWords: emailZero ? 6 : 40,
  emailZero,
  estimate,
});

describe('a mock exam’s result', () => {
  it('adds the writing estimate to reading and listening, against 42 of 70', () => {
    const passed = mockOutcome(run(15, 15, { writing: writing({ form: 6, email: 8 }) }));
    assert.equal(passed.written.score, 44);
    assert.equal(passed.written.state, 'passed');
    assert.equal(passed.written.estimated, true);
    const failed = mockOutcome(run(12, 12, { writing: writing({ form: 5, email: 7 }) }));
    assert.equal(failed.written.score, 36);
    assert.equal(failed.written.state, 'failed');
    assert.equal(failed.verdict, 'not-yet');
  });

  it('leaves the written part open until writing is marked, unless it is already decided', () => {
    const open = mockOutcome(run(15, 15, { writing: writing() }));
    assert.equal(open.written.state, 'open');
    assert.equal(open.written.score, 30);
    assert.equal(mockOutcome(run(22, 21, { writing: writing() })).written.state, 'passed');
    assert.equal(mockOutcome(run(8, 9, { writing: writing() })).written.state, 'failed');
  });

  it('scores an e-mail under 35 words as 0, whatever was estimated', () => {
    const r = run(15, 15, { writing: writing({ form: 6, email: 11 }, true) });
    assert.equal(writingEstimate(r), 6);
    assert.deepEqual(writingToMark(run(15, 15, { writing: writing(undefined, true) })), ['form']);
  });

  it('says which writing tasks still need marking', () => {
    assert.deepEqual(writingToMark(run(15, 15, { writing: writing() })), ['form', 'email']);
    assert.deepEqual(writingToMark(run(15, 15, { writing: writing({ form: 6 }) })), ['email']);
    assert.deepEqual(writingToMark(run(15, 15, { writing: writing({ form: 6, email: 8 }) })), []);
    assert.deepEqual(writingToMark(run(15, 15)), []);
  });

  it('never gives more writing points than the tasks hold', () => {
    assert.equal(writingEstimate(run(0, 0, { writing: writing({ form: 99, email: 99 }) })), 20);
  });

  it('scores speaking from the learner’s own check, only once every task is checked', () => {
    const ids = ['s1-a', 's2-a', 's3-a', 's4-a'];
    const tasks = (ticked: number | undefined) => Object.fromEntries(ids.map((id) => [id, { recorded: 4, prompts: 4, ticked, checks: ticked === undefined ? undefined : 4 }]));
    const base = run(20, 20, { speakingTasks: ids, writing: writing({ form: 6, email: 8 }) });
    assert.equal(speakingSelfScore({ ...base, speaking: { at: '', tasks: tasks(undefined) } }), null);
    const all = speakingSelfScore({ ...base, speaking: { at: '', tasks: tasks(4) } });
    assert.equal(all, 37); // the four tasks' points; pronunciation's 3 can't be self-checked
    const half = { ...base, speaking: { at: '', tasks: tasks(2) } };
    assert.equal(speakingSelfScore(half), 19);
    assert.equal(mockOutcome(half).speaking.state, 'failed');
    assert.equal(mockOutcome(half).verdict, 'not-yet');
    assert.equal(mockOutcome({ ...base, speaking: { at: '', tasks: tasks(4) } }).verdict, 'pass');
  });

  it('stays open while a part is missing', () => {
    const o = mockOutcome(run(20, 20, { writing: writing({ form: 6, email: 8 }), speakingTasks: ['s1-a'] }));
    assert.equal(o.written.state, 'passed');
    assert.equal(o.speaking.state, 'open');
    assert.equal(o.verdict, 'open');
  });
});

describe('form filling', () => {
  const details = { name: 'Maria  Elena Garcia', address: 'Vinohradská 12, 120 00 Praha 2', insurer: '111' as const };

  it('splits a name at its last word', () => {
    assert.equal(yoursValue('full_name', details), 'Maria Elena Garcia');
    assert.equal(yoursValue('given_name', details), 'Maria Elena');
    assert.equal(yoursValue('surname', details), 'Garcia');
    assert.equal(yoursValue('given_name', { name: 'Cher' }), 'Cher');
    assert.equal(yoursValue('surname', { name: 'Cher' }), undefined);
  });

  it('shows only what the phone knows', () => {
    assert.equal(yoursValue('address', details), 'Vinohradská 12, 120 00 Praha 2');
    assert.equal(yoursValue('insurer', details), 'VZP (111)');
    assert.equal(yoursValue('insurer', { insurer: 'private' }), undefined);
    assert.equal(yoursValue('full_name', {}), undefined);
    assert.equal(yoursValue('address', { address: '  ' }), undefined);
    assert.equal(yoursValue(undefined, details), undefined);
  });

  it('writes today’s date the Czech way', () => {
    assert.equal(czechDate(new Date(2026, 2, 5)), '5. 3. 2026');
    assert.equal(yoursValue('today', {}, new Date(2026, 10, 12)), '12. 11. 2026');
  });

  it('counts only the reader’s own fields, not the office’s', () => {
    const all = allFields(SAMPLE_FORM_GUIDE);
    const mine = fieldsToFill(SAMPLE_FORM_GUIDE);
    assert.equal(all.length - mine.length, all.filter((f) => f.need === 'leave_empty').length);
    assert.deepEqual(formProgress(SAMPLE_FORM_GUIDE, {}), { done: 0, total: mine.length });
    assert.deepEqual(formProgress(SAMPLE_FORM_GUIDE, { f1: true, f2: true, f18: true }), { done: 2, total: mine.length });
  });

  it('has a complete example: unique ids, every field explained', () => {
    const all = allFields(SAMPLE_FORM_GUIDE);
    assert.equal(new Set(all.map((f) => f.id)).size, all.length);
    for (const f of all) assert.ok(f.label && f.meaning && f.write, f.id);
    assert.ok(SAMPLE_FORM_GUIDE.howToFill.length >= 2);
  });

  it('recognises a form from its type, title or text', () => {
    assert.equal(looksLikeForm({ typeLabel: 'Registration form', title: 'New patient', kind: 'document' }, ''), true);
    assert.equal(looksLikeForm({ typeLabel: 'Žádost o povolení', title: 'Žádost', kind: 'document' }, ''), true);
    assert.equal(looksLikeForm({ typeLabel: 'Letter', title: 'Rent increase', kind: 'document' }, 'Vyplňte hůlkovým písmem'), true);
    assert.equal(looksLikeForm({ typeLabel: 'Electricity bill', title: 'Bill for October', kind: 'document' }, 'Částka k úhradě 1 840 Kč'), false);
    assert.equal(looksLikeForm({ typeLabel: 'Message about a form', title: 'Form', kind: 'message' }, ''), false);
  });
});
