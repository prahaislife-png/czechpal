import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { afterExam } from '../../src/lib/learn/exam';
import { afterTheExam, bookableDates, EXAM_DATES, EXAM_FEE_CZK, REGISTER_DAYS_BEFORE, registrationSteps } from '../../src/lib/learn/exam-guide';

const day = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

describe('A2 exam guide (official facts, checked 2026-11-09)', () => {
  it('lists the organiser’s dates in order, all on a Wednesday or a Saturday', () => {
    assert.deepEqual([...EXAM_DATES].sort(), EXAM_DATES);
    assert.equal(new Set(EXAM_DATES).size, EXAM_DATES.length);
    for (const d of EXAM_DATES) assert.ok([3, 6].includes(day(d).getDay()), d);
  });

  it('only offers dates you can still register for, at least 14 days ahead', () => {
    assert.equal(REGISTER_DAYS_BEFORE, 14);
    const list = bookableDates(day('2026-11-09'), 3);
    // 11 and 18 November are too close; 28 November is 19 days away.
    assert.deepEqual(
      list.map((d) => d.date),
      ['2026-11-28', '2026-12-05', '2026-12-16'],
    );
    assert.equal(list[0].registerBy, '2026-11-14');
    // Exactly 14 days before still counts.
    assert.equal(bookableDates(day('2026-11-14'), 1)[0].date, '2026-11-28');
    // After the last listed date there is nothing to offer, not a made-up one.
    assert.deepEqual(bookableDates(day('2028-01-01')), []);
  });

  it('agrees with the exam rules elsewhere in the app', () => {
    assert.equal(EXAM_FEE_CZK, 3200);
    assert.ok(afterTheExam.some((t) => t.includes(`${afterExam.retakeAfterMonths} months`)));
    assert.ok(afterTheExam.some((t) => t.includes(`${afterExam.retakesPerYear} times a year`)));
    assert.ok(afterTheExam.some((t) => t.includes(`${afterExam.certificateWithinDays} days`)));
    assert.ok(registrationSteps.some((s) => s.detail.includes('14 days')));
  });
});
