import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { exerciseById, wordsForExercise } from '../../src/lib/academy/catalog';
import { gradeType } from '../../src/lib/academy/grade';
import { lessonSteps, lessonWords, matchOrder, quickPick, shortForm, shuffled, tilesFor, wordsOf } from '../../src/lib/academy/lesson-steps';
import { lessonById, lessons } from '../../src/lib/academy/lessons';
import { PASS, passed } from '../../src/lib/academy/roadmap';
import type { TypeExercise } from '../../src/lib/academy/types';

const lesson = lessonById('personal-1')!;

describe('how a lesson is taught', () => {
  it('goes in small steps: phrases one at a time, a quick pick, matching, the conversation, practice, the check', () => {
    const kinds = lessonSteps(lesson, { retest: false, canListen: true }).map((s) => s.kind);
    assert.deepEqual(kinds.slice(0, 9), ['start', 'phrase', 'phrase', 'phrase', 'pick', 'phrase', 'phrase', 'match', 'scene']);
    assert.equal(kinds.filter((k) => k === 'practise').length, lesson.practise.length);
    assert.equal(kinds.filter((k) => k === 'check').length, lesson.check.length);
    // Practice comes before the check, and the check is announced.
    assert.ok(kinds.lastIndexOf('practise') < kinds.indexOf('checkIntro'));
    assert.equal(kinds.indexOf('checkIntro') + 1, kinds.indexOf('check'));
  });

  it('a retest is the check alone', () => {
    const kinds = lessonSteps(lesson, { retest: true, canListen: true }).map((s) => s.kind);
    assert.equal(kinds[0], 'checkIntro');
    assert.ok(kinds.slice(1).every((k) => k === 'check'));
  });

  it('leaves listening questions out when the phone has no Czech voice', () => {
    for (const l of lessons) {
      const steps = lessonSteps(l, { retest: false, canListen: false });
      for (const s of steps) {
        const e = s.kind === 'check' ? l.check[s.i] : s.kind === 'practise' ? l.practise[s.i] : null;
        assert.ok(!(e && e.kind === 'choice' && e.listen), `${l.id}: a listening question without a voice`);
      }
    }
  });

  it('the quick pick asks about a phrase already shown, and its answer is among the options', () => {
    for (const l of lessons) {
      const pick = quickPick(l);
      assert.ok(pick, l.id);
      const target = l.introduce.find((p) => p.en === pick.ask);
      assert.ok(target && l.introduce.indexOf(target) < 3, l.id);
      assert.equal(pick.options[pick.answer], target.cs, l.id);
      assert.equal(new Set(pick.options).size, pick.options.length, l.id);
    }
  });

  it('matching offers every meaning once, never in the same order as the phrases', () => {
    for (const l of lessons) {
      const order = matchOrder(l);
      assert.deepEqual([...order].sort(), l.introduce.map((_, i) => i), l.id);
      assert.ok(order.some((v, i) => v !== i), `${l.id}: the meanings line up with the phrases`);
    }
  });

  it('shuffles the same way every time', () => {
    assert.deepEqual(shuffled([1, 2, 3, 4, 5], 'x'), shuffled([1, 2, 3, 4, 5], 'x'));
    assert.deepEqual([...shuffled([1, 2, 3, 4, 5], 'x')].sort(), [1, 2, 3, 4, 5]);
  });
});

describe('word tiles', () => {
  it('splits a sentence into words, without punctuation', () => {
    assert.deepEqual(wordsOf('To je všechno, děkuju.'), ['To', 'je', 'všechno', 'děkuju']);
    assert.deepEqual(wordsOf('Jak se řekne česky „window“?'), ['Jak', 'se', 'řekne', 'česky', 'window']);
    assert.deepEqual(wordsOf('Kde je šatna?'), ['Kde', 'je', 'šatna']);
  });

  it('mixes in a few of the lesson’s other words, never one from the answer', () => {
    const pool = lessonWords(lesson);
    const tiles = tilesFor('Jsem z Indie.', pool, 'x');
    assert.equal(tiles.length, 6);
    for (const w of ['Jsem', 'z', 'Indie']) assert.ok(tiles.includes(w));
    const extra = tiles.filter((w) => !['Jsem', 'z', 'Indie'].includes(w));
    assert.equal(extra.length, 3);
    for (const w of extra) assert.ok(!['jsem', 'z', 'indie'].includes(w.toLocaleLowerCase('cs')), w);
    // Only real words are offered: no slashes, dots or brackets from phrases with two forms.
    assert.ok(pool.every((w) => /^\p{L}+$/u.test(w)));
  });

  it('every sentence a lesson asks for can be built from its tiles and is marked right', () => {
    let count = 0;
    for (const l of lessons) {
      const pool = lessonWords(l);
      for (const e of [...l.practise, ...l.check].filter((e): e is TypeExercise => e.kind === 'type')) {
        const words = wordsOf(e.accept[0]);
        const tiles = tilesFor(e.accept[0], pool, e.id);
        // Each word of the answer is there as many times as it's needed.
        for (const w of new Set(words)) assert.ok(tiles.filter((t) => t === w).length >= words.filter((x) => x === w).length, `${e.id}: “${w}” is missing`);
        assert.ok(gradeType(e, words.join(' ')).correct, `${e.id}: built from tiles, “${words.join(' ')}” isn’t accepted`);
        // An answer of one or two words needs other tiles to choose between.
        assert.ok(tiles.length > words.length || words.length > 2, `${e.id}: nothing to choose from`);
        count++;
      }
    }
    assert.ok(count >= 100, `${count} typed exercises`);
  });
});

describe('going over mistakes', () => {
  it('has other words to mix into the tiles, from the lesson or the exam text the item came from', () => {
    const fromLesson = wordsForExercise('food-1.c3');
    assert.ok(fromLesson.includes('kartou') && fromLesson.length > 10);
    // A "write the information" item from an exam task: words from its text, so the tiles aren't just the answer.
    const item = exerciseById('r5-a.25');
    assert.ok(item && item.kind === 'type');
    const fromTask = wordsForExercise('r5-a.25');
    assert.ok(fromTask.includes('Kutné') && fromTask.length > 20);
    assert.deepEqual(wordsForExercise('nothing-like-this'), []);
  });
});

describe('lesson content fits the way it is taught', () => {
  it('phrases and their meanings are different from each other within a lesson', () => {
    for (const l of lessons) {
      assert.ok(l.introduce.length >= 3, `${l.id}: too few phrases`);
      assert.equal(new Set(l.introduce.map((p) => shortForm(p.cs))).size, l.introduce.length, `${l.id}: two phrases look the same on a tile`);
      assert.equal(new Set(l.introduce.map((p) => p.en)).size, l.introduce.length, `${l.id}: two phrases have the same meaning`);
    }
  });

  it('phrases are short enough to learn at a glance', () => {
    for (const l of lessons) for (const p of l.introduce) assert.ok(shortForm(p.cs).length <= 60, `${l.id}: “${p.cs}” is long`);
  });

  it('one slip in the check still passes; two don’t', () => {
    const run = (right: number, total: number) => passed({ at: '', right, total });
    assert.ok(run(3, 4) && run(2, 3) && run(4, 4));
    assert.ok(!run(2, 4) && !run(1, 3));
    assert.ok(PASS > 0.5 && PASS < 0.67);
    // Every lesson has enough marked questions for that to mean something.
    for (const l of lessons) assert.ok(l.check.filter((e) => e.kind !== 'write' && !(e.kind === 'choice' && e.listen)).length >= 3, l.id);
  });
});
