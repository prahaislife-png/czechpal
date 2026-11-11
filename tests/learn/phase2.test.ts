import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dayKey, emptyDay, lastWeek, logDay, streak, today, totals, type Days } from '../../src/lib/learn/activity';
import { contentById, library } from '../../src/lib/learn/content';
import { dailyPlan, nextText, planDone } from '../../src/lib/learn/daily';
import { answerCard, cardIdFor, saveWord, type Deck } from '../../src/lib/learn/deck';
import { daysToExam, examParts, passMarks } from '../../src/lib/learn/exam';
import { lexemeById } from '../../src/lib/learn/lexicon';
import { buildListening, linesOf, listeningWords } from '../../src/lib/learn/listening';
import { LISTEN_PASS, missionById, missionProgress, missions, missionSteps, recommendMissions, type MissionState } from '../../src/lib/learn/missions';
import { makeProfile, type LearnProfile } from '../../src/lib/learn/profile';
import { answerQuestion, completeChapter, emptyProgress, openChapter, type ReadingProgress } from '../../src/lib/learn/progress';

const t0 = new Date(2026, 10, 3, 10, 0); // 3 Nov 2026, 10:00 local
const dayAt = (d: number, h = 10) => new Date(2026, 10, d, h, 0);

const profile = (p: Partial<LearnProfile> = {}): LearnProfile =>
  makeProfile({ goal: 'everyday', level: 'new', minutes: 10, topics: [], ...p }, t0);

/** Reads every chapter of a text and answers its questions, `wrong` of them wrongly. */
function finishText(progress: Record<string, ReadingProgress>, id: string, wrong = 0): Record<string, ReadingProgress> {
  const c = contentById(id)!;
  let p = openChapter(emptyProgress(id, t0), c, 0, t0);
  c.chapters.forEach((_, i) => (p = completeChapter(p, c, i, t0)));
  c.questions.forEach((q, i) => (p = answerQuestion(p, c, q.id, i < wrong ? (q.answer + 1) % q.options.length : q.answer, t0)));
  return { ...progress, [id]: p };
}

describe('daily activity', () => {
  it('keys days by the local calendar', () => {
    assert.equal(dayKey(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
  });

  it('adds to today and ignores negative counts', () => {
    let days = logDay({}, { reviews: 2 }, t0);
    days = logDay(days, { reviews: 1, chapters: -3 }, t0);
    assert.deepEqual(today(days, t0), { ...emptyDay(), reviews: 3 });
  });

  it('counts a streak of consecutive days, keeping yesterday’s streak until today is done', () => {
    let days: Days = {};
    for (const d of [1, 2, 3]) days = logDay(days, { chapters: 1 }, dayAt(d));
    assert.equal(streak(days, dayAt(3)), 3);
    // The next morning, before practising: still 3.
    assert.equal(streak(days, dayAt(4, 8)), 3);
    // A missed day ends it.
    assert.equal(streak(days, dayAt(5)), 0);
  });

  it('course work counts for the streak, and older days without that count still add up', () => {
    // A day with only a lesson check or exam practice is a day of practice.
    let days = logDay({}, { study: 1 }, dayAt(1));
    days = logDay(days, { study: 2 }, dayAt(2));
    assert.equal(streak(days, dayAt(2)), 2);
    assert.ok(lastWeek(days, dayAt(2))[6].active);
    // A day saved by an older build has no `study`, `phrases` or `sessions`: totals stay numbers.
    const old = { reviews: 3, chapters: 1, listening: 0, heard: 0, heardRight: 0 } as unknown as Days[string];
    const mixed: Days = { ...days, [dayKey(dayAt(3))]: old };
    const sum = totals(mixed, 3, dayAt(3));
    assert.equal(sum.reviews, 3);
    assert.equal(sum.study, 3);
    assert.equal(sum.sessions, 0);
    assert.equal(streak(mixed, dayAt(3)), 3);
  });

  it('shows the last seven days ending today', () => {
    const days = logDay({}, { listening: 1 }, t0);
    const week = lastWeek(days, t0);
    assert.equal(week.length, 7);
    assert.ok(week[6].today && week[6].active);
    assert.ok(!week[5].active);
  });

  it('totals the last n days only', () => {
    let days = logDay({}, { heard: 5, heardRight: 4 }, dayAt(1));
    days = logDay(days, { heard: 10, heardRight: 7 }, dayAt(3));
    assert.equal(totals(days, 2, dayAt(3)).heard, 10);
    assert.equal(totals(days, 3, dayAt(3)).heardRight, 11);
  });

  it('drops days older than about a year', () => {
    let days: Days = {};
    for (let i = 0; i < 420; i++) days = logDay(days, { reviews: 1 }, new Date(2025, 0, 1 + i, 12));
    assert.equal(Object.keys(days).length, 400);
    assert.ok(!days['2025-01-01']);
  });
});

describe('the learner’s plan', () => {
  it('keeps an exam date only when the goal is the exam', () => {
    assert.equal(profile({ goal: 'work', examDate: '2027-01-10' }).examDate, undefined);
    assert.equal(profile({ goal: 'exam', examDate: '2027-01-10' }).examDate, '2027-01-10');
  });

  it('removes repeated topics', () => {
    assert.deepEqual(profile({ topics: ['work', 'work', 'health'] }).topics, ['work', 'health']);
  });
});

describe('today’s plan', () => {
  it('starts a new learner with something to read at their level, and listening', () => {
    const plan = dailyPlan({ profile: profile(), progress: {}, deck: {}, today: emptyDay(), canListen: true, now: t0 });
    assert.deepEqual(plan.map((s) => s.kind), ['read', 'listen']);
    const read = plan[0];
    assert.ok(read.kind === 'read' && read.content.level === 'A1');
  });

  it('reads the learner’s topics first', () => {
    const text = nextText(profile({ level: 'A2', topics: ['work'] }), {});
    assert.equal(text?.content.id, 'prvni-den-v-praci');
  });

  it('carries on with an unfinished text before starting another', () => {
    const c = contentById('soused')!;
    const progress = { soused: completeChapter(emptyProgress('soused', t0), c, 0, t0) };
    const text = nextText(profile(), progress, 'soused');
    assert.equal(text?.content.id, 'soused');
    assert.ok(text?.resume);
  });

  it('leaves out listening when there is no Czech voice', () => {
    const plan = dailyPlan({ profile: profile(), progress: {}, deck: {}, today: emptyDay(), canListen: false, now: t0 });
    assert.ok(!plan.some((s) => s.kind === 'listen'));
  });

  it('puts due cards first, and five minutes holds a review or a text, not both', () => {
    const deck = saveWord({}, 'byt', undefined, t0);
    const ten = dailyPlan({ profile: profile(), progress: {}, deck, today: emptyDay(), canListen: false, now: t0 });
    assert.deepEqual(ten.map((s) => s.kind), ['review', 'read']);
    const five = dailyPlan({ profile: profile({ minutes: 5 }), progress: {}, deck, today: emptyDay(), canListen: false, now: t0 });
    assert.deepEqual(five.map((s) => s.kind), ['review']);
  });

  it('ticks steps from what was done today', () => {
    let deck: Deck = saveWord({}, 'byt', undefined, t0);
    deck = answerCard(deck, cardIdFor('byt'), 'good', t0).deck;
    const done = { ...emptyDay(), reviews: 1, chapters: 1, listening: 1 };
    const progress = finishText({}, 'novy-byt');
    const plan = dailyPlan({ profile: profile(), progress, lastContentId: 'novy-byt', deck, today: done, canListen: true, now: t0 });
    assert.deepEqual(plan.map((s) => s.kind), ['review', 'read', 'listen']);
    assert.ok(planDone(plan));
  });
});

describe('listening', () => {
  const words = ['byt', 'pokoj', 'kuchyň', 'koupelna', 'nájem', 'majitel'];
  const lines = linesOf(['novy-byt', 'v-kavarne']);

  it('builds the same session from the same seed', () => {
    assert.deepEqual(buildListening({ words, lines, count: 8, seed: 7 }), buildListening({ words, lines, count: 8, seed: 7 }));
  });

  it('has one right answer among distinct options, and says the right thing', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const items = buildListening({ words, lines, count: 8, seed });
      assert.equal(items.length, 8);
      for (const it of items) {
        assert.ok(it.options.length >= 3);
        assert.equal(new Set(it.options.map((o) => o.toLocaleLowerCase('cs'))).size, it.options.length);
        assert.ok(it.answer >= 0 && it.answer < it.options.length);
        if (it.kind === 'word') assert.equal(it.options[it.answer], it.say);
        if (it.kind === 'meaning') assert.equal(it.options[it.answer], it.reveal.en);
        if (it.kind === 'line') assert.equal(it.say, it.reveal.cs);
      }
    }
  });

  it('mixes in lines only when there are enough to choose between', () => {
    const items = buildListening({ words, lines: lines.slice(0, 2), count: 6, seed: 1 });
    assert.ok(items.every((i) => i.kind !== 'line'));
    assert.ok(buildListening({ words, lines, count: 6, seed: 1 }).some((i) => i.kind === 'line'));
  });

  it('keeps lines short enough to hold after one hearing', () => {
    assert.ok(lines.length > 0 && lines.every((l) => l.cs.length <= 80));
  });

  it('uses saved words first, then words from texts opened', () => {
    const deck = saveWord({}, 'zubař', undefined, t0);
    const ids = listeningWords(deck, { 'novy-byt': emptyProgress('novy-byt', t0) });
    assert.equal(ids[0], 'zubař');
    assert.ok(ids.includes('koupelna'));
  });
});

describe('missions', () => {
  it('each mission has a text and words from that text’s dictionary', () => {
    for (const m of missions) {
      const c = contentById(m.contentId);
      assert.ok(c, `${m.id}: text ${m.contentId}`);
      assert.equal(c.level, m.level, `${m.id}: level`);
      assert.ok(c.topics.includes(m.topic), `${m.id}: topic`);
      assert.ok(m.words.length >= 5, `${m.id}: words`);
      for (const w of m.words) {
        assert.ok(lexemeById(w), `${m.id}: ${w} in dictionary`);
        assert.ok(c.vocabulary.includes(w), `${m.id}: ${w} in the text's words`);
      }
    }
    assert.equal(new Set(missions.map((m) => m.id)).size, missions.length);
  });

  it('covers every text in the library once', () => {
    assert.deepEqual(missions.map((m) => m.contentId).sort(), library.map((c) => c.id).sort());
  });

  it('ticks each step from what the learner did', () => {
    const m = missionById('flat')!;
    let s: MissionState = { progress: {}, deck: {}, listened: {} };
    assert.equal(missionProgress(m, s).done, 0);

    s = { ...s, progress: finishText({}, m.contentId) };
    assert.deepEqual(missionSteps(m, s).map((x) => x.done), [true, true, false, false, false]);

    let deck: Deck = {};
    for (const w of m.words) deck = saveWord(deck, w, undefined, t0);
    s = { ...s, deck };
    assert.equal(missionSteps(m, s)[2].done, true);
    assert.equal(missionSteps(m, s)[3].done, false);

    for (const w of m.words) deck = answerCard(deck, cardIdFor(w), 'good', t0).deck;
    s = { ...s, deck, listened: { [m.id]: LISTEN_PASS - 0.1 } };
    assert.equal(missionSteps(m, s)[3].done, true);
    assert.equal(missionProgress(m, s).finished, false);

    s = { ...s, listened: { [m.id]: LISTEN_PASS } };
    assert.ok(missionProgress(m, s).finished);
  });

  it('needs the questions mostly right, not just answered', () => {
    const m = missionById('doctor')!;
    const twoWrong = { progress: finishText({}, m.contentId, 2), deck: {}, listened: {} };
    assert.equal(missionSteps(m, twoWrong)[1].done, false);
    const oneWrong = { progress: finishText({}, m.contentId, 1), deck: {}, listened: {} };
    assert.equal(missionSteps(m, oneWrong)[1].done, true);
  });

  it('suggests started missions, then the learner’s topics and level; finished ones last', () => {
    const empty: MissionState = { progress: {}, deck: {}, listened: {} };
    assert.equal(recommendMissions(profile({ level: 'A2', topics: ['travel'] }), empty)[0].id, 'train');

    const started: MissionState = { ...empty, deck: saveWord({}, 'soused', undefined, t0) };
    // Saving one word doesn't finish a step; reading does.
    const read: MissionState = { ...started, progress: finishText({}, 'soused') };
    assert.equal(recommendMissions(profile(), read)[0].id, 'neighbour');

    const m = missionById('cafe')!;
    let deck: Deck = {};
    for (const w of m.words) deck = answerCard(saveWord(deck, w, undefined, t0), cardIdFor(w), 'good', t0).deck;
    const finished: MissionState = { progress: finishText({}, m.contentId), deck, listened: { cafe: 1 } };
    assert.equal(recommendMissions(profile(), finished).at(-1)?.id, 'cafe');
  });
});

describe('A2 exam facts', () => {
  it('adds up: the written part is 70 points, speaking 40, each passed at 60%', () => {
    const written = examParts.filter((p) => p.id !== 'speaking').reduce((n, p) => n + p.points, 0);
    assert.equal(written, passMarks.written.of);
    assert.equal(examParts.find((p) => p.id === 'speaking')?.points, passMarks.speaking.of);
    assert.equal(passMarks.written.need / passMarks.written.of, 0.6);
    assert.equal(passMarks.speaking.need / passMarks.speaking.of, 0.6);
  });

  it('counts days to the exam by the calendar', () => {
    assert.equal(daysToExam('2026-11-03', dayAt(3, 23)), 0);
    assert.equal(daysToExam('2026-11-10', dayAt(3, 23)), 7);
    assert.equal(daysToExam('2026-11-01', t0), -2);
  });
});
