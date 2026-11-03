import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { library } from '../../src/lib/learn/content';
import {
  answerQuestion,
  completeChapter,
  emptyProgress,
  isFinished,
  openChapter,
  quizScore,
  readShare,
  saveOffset,
} from '../../src/lib/learn/progress';
import { isDue, isNew, newSchedule, preview, review, untilLabel, type Schedule } from '../../src/lib/learn/srs';

const t0 = new Date('2026-11-03T09:00:00Z');
const later = (from: Date, ms: number) => new Date(from.getTime() + ms);

describe('flashcard scheduling (FSRS)', () => {
  it('makes a new card that is due now', () => {
    const s = newSchedule(t0);
    assert.ok(isNew(s));
    assert.ok(isDue(s, t0));
  });

  it('brings an Again card back sooner than an Easy one', () => {
    const s = newSchedule(t0);
    const again = review('c', s, 'again', t0).schedule;
    const easy = review('c', s, 'easy', t0).schedule;
    assert.ok(new Date(again.due) < new Date(easy.due));
    assert.ok(!isDue(easy, t0));
  });

  it('orders the four previews: again ≤ hard ≤ good ≤ easy', () => {
    const p = preview(newSchedule(t0), t0);
    assert.ok(p.again <= p.hard && p.hard <= p.good && p.good <= p.easy);
  });

  it('spaces a remembered card further out each time', () => {
    let s: Schedule = newSchedule(t0);
    let now = t0;
    const gaps: number[] = [];
    for (let i = 0; i < 4; i++) {
      s = review('c', s, 'good', now).schedule;
      const due = new Date(s.due);
      gaps.push(due.getTime() - now.getTime());
      now = due;
    }
    for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] >= gaps[i - 1], `gap ${i} shrank`);
    assert.ok(gaps.at(-1)! > 24 * 60 * 60_000, 'a well-known card is more than a day away');
  });

  it('survives a JSON round trip', () => {
    const s = review('c', newSchedule(t0), 'good', t0).schedule;
    const back = JSON.parse(JSON.stringify(s)) as Schedule;
    const a = review('c', s, 'good', later(t0, 86_400_000)).schedule;
    const b = review('c', back, 'good', later(t0, 86_400_000)).schedule;
    assert.equal(a.state, b.state);
    assert.equal(a.reps, b.reps);
  });

  it('logs each review with the next due date', () => {
    const { schedule, entry } = review('card-1', newSchedule(t0), 'hard', t0);
    assert.equal(entry.cardId, 'card-1');
    assert.equal(entry.answer, 'hard');
    assert.equal(entry.nextDue, schedule.due);
  });

  it('labels intervals briefly', () => {
    assert.equal(untilLabel(later(t0, 30_000), t0), '<1 min');
    assert.equal(untilLabel(later(t0, 10 * 60_000), t0), '10 min');
    assert.equal(untilLabel(later(t0, 3 * 86_400_000), t0), '3 d');
  });
});

describe('reading progress', () => {
  const serial = library.find((c) => c.kind === 'serial')!;

  it('keeps the place when the same chapter is reopened after an interruption', () => {
    let p = emptyProgress(serial.id, t0);
    p = openChapter(p, serial, 1, t0);
    p = saveOffset(p, 1, 420, t0);
    // The app is closed and opened again: the stored progress comes back as JSON.
    const restored = JSON.parse(JSON.stringify(p));
    const reopened = openChapter(restored, serial, 1, t0);
    assert.equal(reopened.chapter, 1);
    assert.equal(reopened.offset, 420);
  });

  it('starts another chapter at its top', () => {
    let p = saveOffset(openChapter(emptyProgress(serial.id), serial, 0), 0, 300);
    p = openChapter(p, serial, 2);
    assert.equal(p.offset, 0);
  });

  it('ignores a late scroll position from a chapter already left', () => {
    let p = openChapter(emptyProgress(serial.id), serial, 2);
    p = saveOffset(p, 1, 999);
    assert.equal(p.offset, 0);
  });

  it('clamps chapters to the ones that exist', () => {
    assert.equal(openChapter(emptyProgress(serial.id), serial, 99).chapter, serial.chapters.length - 1);
    assert.equal(openChapter(emptyProgress(serial.id), serial, -3).chapter, 0);
  });

  it('counts a chapter once, however often it is finished', () => {
    let p = emptyProgress(serial.id);
    p = completeChapter(p, serial, 0);
    const again = completeChapter(p, serial, 0);
    assert.equal(again, p);
    assert.equal(readShare(p, serial), 1 / serial.chapters.length);
  });

  it('is finished when every chapter is', () => {
    let p = emptyProgress(serial.id);
    serial.chapters.forEach((_, i) => (p = completeChapter(p, serial, i)));
    assert.ok(isFinished(p, serial));
    assert.equal(readShare(p, serial), 1);
  });

  it('scores questions and ignores answers that don’t exist', () => {
    let p = emptyProgress(serial.id);
    p = answerQuestion(p, serial, 'q1', serial.questions[0].answer);
    p = answerQuestion(p, serial, 'q2', (serial.questions[1].answer + 1) % serial.questions[1].options.length);
    p = answerQuestion(p, serial, 'nope', 0);
    p = answerQuestion(p, serial, 'q3', 99);
    assert.deepEqual(quizScore(p, serial), { right: 1, answered: 2, total: serial.questions.length });
  });
});
