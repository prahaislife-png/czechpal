import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addOwnCard, answerCard, cardIdFor, dueCards, hasWord, nextDue, removeCard, saveWord, type Deck } from '../../src/lib/learn/deck';

const t0 = new Date('2026-11-03T09:00:00Z');

describe('saving words', () => {
  it('saves a dictionary word with its lemma, meaning and grammar', () => {
    const deck = saveWord({}, 'koupelna', { cs: 'Má jeden pokoj, kuchyň a koupelnu.', contentId: 'novy-byt' }, t0);
    const card = deck[cardIdFor('koupelna')];
    assert.equal(card.cs, 'koupelna');
    assert.equal(card.en, 'bathroom');
    assert.equal(card.grammar, 'noun · feminine');
    assert.equal(card.example?.contentId, 'novy-byt');
    assert.ok(hasWord(deck, 'koupelna'));
  });

  it('keeps one card per word, with its progress, when the word is saved again', () => {
    let deck = saveWord({}, 'byt', undefined, t0);
    deck = answerCard(deck, cardIdFor('byt'), 'good', t0).deck;
    const again = saveWord(deck, 'byt', undefined, t0);
    assert.equal(again, deck);
    assert.equal(Object.keys(again).length, 1);
  });

  it('ignores a word that isn’t in the dictionary', () => {
    assert.deepEqual(saveWord({}, 'kosmonaut', undefined, t0), {});
  });
});

describe('own cards', () => {
  it('adds a trimmed card', () => {
    const deck = addOwnCard({}, '  dobrou   chuť ', ' enjoy your meal ', t0, 'own:1') as Deck;
    assert.equal(deck['own:1'].cs, 'dobrou chuť');
    assert.equal(deck['own:1'].en, 'enjoy your meal');
  });

  it('refuses empty, too long and duplicate cards', () => {
    assert.equal(addOwnCard({}, ' ', 'x', t0), 'empty');
    assert.equal(addOwnCard({}, 'a'.repeat(121), 'x', t0), 'too_long');
    const deck = saveWord({}, 'byt', undefined, t0);
    assert.equal(addOwnCard(deck, 'Byt', 'flat', t0), 'duplicate');
  });

  it('removes a card and leaves the rest', () => {
    let deck = saveWord(saveWord({}, 'byt', undefined, t0), 'pokoj', undefined, t0);
    deck = removeCard(deck, cardIdFor('byt'));
    assert.deepEqual(Object.keys(deck), [cardIdFor('pokoj')]);
  });
});

describe('reviews', () => {
  it('counts a double-tapped answer once', () => {
    const deck = saveWord({}, 'byt', undefined, t0);
    const first = answerCard(deck, cardIdFor('byt'), 'easy', t0);
    const second = answerCard(first.deck, cardIdFor('byt'), 'easy', t0);
    assert.ok(first.entry);
    assert.equal(second.entry, undefined);
    assert.equal(second.deck, first.deck);
  });

  it('lists due cards, reviewed ones before new ones, up to a limit', () => {
    let deck: Deck = {};
    for (const w of ['byt', 'pokoj', 'kuchyň']) deck = saveWord(deck, w, undefined, t0);
    // pokoj was seen before and answered Again: due again within minutes.
    deck = answerCard(deck, cardIdFor('pokoj'), 'again', t0).deck;
    const soon = new Date(t0.getTime() + 60 * 60_000);
    const due = dueCards(deck, soon);
    assert.equal(due[0].id, cardIdFor('pokoj'));
    assert.equal(dueCards(deck, soon, 2).length, 2);
  });

  it('says when the next card comes due', () => {
    const deck = answerCard(saveWord({}, 'byt', undefined, t0), cardIdFor('byt'), 'easy', t0).deck;
    assert.deepEqual(dueCards(deck, t0), []);
    assert.ok(nextDue(deck, t0)! > t0);
  });
});
