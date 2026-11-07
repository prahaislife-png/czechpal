import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyRules, countWords as serverWords, EMAIL_MIN_WORDS as SERVER_MIN, EMAIL_POINTS, FORM_POINTS } from '../../supabase/functions/_shared/feedback-rules';
import { countWords, EMAIL_MIN_WORDS, examTasks } from '../../src/lib/learn/exam';

describe('writing feedback rules (applied by the server, not the model)', () => {
  it('match the exam: 8 and 12 points, the 35-word minimum, the same word count as the app', () => {
    assert.equal(FORM_POINTS, examTasks.find((t) => t.part === 'writing' && t.n === 1)!.points);
    assert.equal(EMAIL_POINTS, examTasks.find((t) => t.part === 'writing' && t.n === 2)!.points);
    assert.equal(SERVER_MIN, EMAIL_MIN_WORDS);
    for (const s of ['Dobrý den, paní Novotná,', 'Bydlím v Praze 9 – už tři roky.', '  ', 'S pozdravem\nAna']) assert.equal(serverWords(s), countWords(s), s);
  });

  it('an e-mail under 35 words gets 0, whatever the model estimated', () => {
    const r = applyRules('email', ['Ahoj Petro, přijď v sobotu. Měj se, Ana'], 9, ['Ahoj Petro, přijď v sobotu.']);
    assert.equal(r.zeroRule, true);
    assert.deepEqual(r.estimate, { points: 0, of: 12 });
  });

  it('keeps points whole and within the task’s range', () => {
    const long = Array.from({ length: 40 }, () => 'slovo').join(' ');
    assert.deepEqual(applyRules('email', [long], 15, []).estimate, { points: 12, of: 12 });
    assert.deepEqual(applyRules('email', [long], -2, []).estimate, { points: 0, of: 12 });
    assert.deepEqual(applyRules('form', ['a', 'b', 'c'], 5.6, []).estimate, { points: 6, of: 8 });
    assert.deepEqual(applyRules('form', ['a', 'b', 'c'], Number.NaN, []).estimate, { points: 0, of: 8 });
    assert.equal(applyRules('form', ['a', 'b', 'c'], 4, []).zeroRule, false);
  });

  it('gives one corrected text per answer, the learner’s own where the model gave none', () => {
    assert.deepEqual(applyRules('form', ['jedna', 'dva', 'tři'], 4, ['Jedna.', '  ']).improved, ['Jedna.', 'dva', 'tři']);
  });
});
