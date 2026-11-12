import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allWords, ALPHABET, colourFor, formatCount, letterIndex, letterOf, railTarget, sortKey, spokenText, tagLabel, WORD_COUNT } from '../src/lib/words';

describe('the dictionary’s word list', () => {
  const words = allWords();

  it('has every word, each with a type and a meaning', () => {
    assert.equal(words.length, WORD_COUNT);
    for (const x of words) {
      assert.ok(x.w.trim() && x.en.trim(), x.w);
      assert.ok(tagLabel(x.t), `${x.w}: unknown type ${x.t}`);
      // An English example never comes without its Czech sentence.
      assert.ok(!x.exen || x.ex, x.w);
      assert.ok(ALPHABET.includes(x.letter), `${x.w}: filed under ${x.letter}`);
    }
    assert.ok(words.filter((x) => x.ex).length > 1500);
  });

  it('files words under Czech letters: ch is its own letter, long vowels are not', () => {
    assert.equal(letterOf('chleba'), 'CH');
    assert.equal(letterOf('Chodit'), 'CH');
    assert.equal(letterOf('čaj'), 'Č');
    assert.equal(letterOf('řeka'), 'Ř');
    assert.equal(letterOf('úřad'), 'U');
    assert.equal(letterOf('účet'), 'U');
    assert.equal(letterOf('ďábel'), 'D');
    assert.equal(letterOf('žena'), 'Ž');
  });

  it('sorts in Czech alphabetical order', () => {
    const sorted = (list: string[]) => [...list].sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
    // č after c, ch after h, ř after r, š after s, ž after z.
    assert.deepEqual(sorted(['čaj', 'cena', 'cukr', 'dům']), ['cena', 'cukr', 'čaj', 'dům']);
    assert.deepEqual(sorted(['chleba', 'ahoj', 'hlad', 'i', 'hora']), ['ahoj', 'hlad', 'hora', 'chleba', 'i']);
    assert.deepEqual(sorted(['řeka', 'ruka', 'ryba', 'sám']), ['ruka', 'ryba', 'řeka', 'sám']);
    assert.deepEqual(sorted(['žena', 'zima', 'šéf', 'stůl', 'teď']), ['stůl', 'šéf', 'teď', 'zima', 'žena']);
    // A long vowel only breaks a tie: "být" comes right after "byt", not after every b-word.
    assert.deepEqual(sorted(['být', 'byt', 'bydlet', 'bílý', 'bez']), ['bez', 'bílý', 'bydlet', 'byt', 'být']);
    // A phrase files with its first word.
    assert.deepEqual(sorted(['mít rád', 'mít', 'místo', 'mléko']), ['místo', 'mít', 'mít rád', 'mléko']);
  });

  it('is sorted, and every letter on the rail starts where its first word is', () => {
    for (let i = 1; i < words.length; i++) assert.ok(sortKey(words[i - 1].w) <= sortKey(words[i].w), `${words[i - 1].w} before ${words[i].w}`);
    const index = letterIndex(words);
    // The rail's letters come out in alphabet order.
    assert.deepEqual(index.letters, ALPHABET.filter((l) => index.letters.includes(l)));
    for (const l of index.letters) {
      const i = index.first[l];
      assert.equal(words[i].letter, l);
      assert.ok(i === 0 || words[i - 1].letter !== l, l);
    }
    assert.equal(index.first.A, 0);
  });

  it('the rail jumps to a letter on a tap and scrubs through it on a drag', () => {
    const index = letterIndex(words);
    const n = index.letters.length;
    assert.equal(railTarget(0, index, words.length, false)?.at, 0);
    const k = index.letters.indexOf('CH');
    const tap = railTarget((k + 0.5) / n, index, words.length, false)!;
    assert.deepEqual([tap.letter, tap.at], ['CH', index.first.CH]);
    // Dragging through the same slot moves through that letter's words, never into the next letter.
    const drag = railTarget((k + 0.5) / n, index, words.length, true)!;
    assert.equal(words[drag.at].letter, 'CH');
    assert.ok(drag.at > index.first.CH);
    // Past either end of the rail stays inside the list.
    assert.equal(railTarget(-3, index, words.length, true)?.at, 0);
    const end = railTarget(9, index, words.length, true)!;
    assert.ok(end.at < words.length && words[end.at].letter === index.letters[n - 1]);
    assert.equal(railTarget(0.5, letterIndex([]), 0, false), null);
  });

  it('formats and labels', () => {
    assert.equal(formatCount(5843), '5,843');
    assert.equal(formatCount(12), '12');
    assert.equal(formatCount(1234567), '1,234,567');
    assert.equal(tagLabel('f'), 'noun, feminine');
    assert.equal(tagLabel('zzz'), '');
    assert.equal(colourFor('A'), '#1F3FD6');
    assert.equal(colourFor('B'), '#D42A1A');
    assert.ok(/^#[0-9A-F]{6}$/.test(colourFor('Ž')));
    assert.equal(spokenText({ w: 'čaj', ex: 'Dám si černý čaj.' }), 'čaj. Dám si černý čaj.');
    assert.equal(spokenText({ w: 'a' }), 'a');
  });
});
