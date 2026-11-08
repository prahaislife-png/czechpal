import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  nextGoal,
  recommendations,
  repeatedWeaknesses,
  skillStates,
  speakingLevel,
  wordStates,
  wordsToRevisit,
  type EvidenceEvent,
} from '../../src/lib/speak/evidence';

const day = (n: number, h = 10) => new Date(Date.UTC(2026, 10, 1 + n, h)).toISOString();
const turn = (session: string, at: string, outcome: 'success' | 'partial' | 'breakdown', independent = true): EvidenceEvent => ({
  kind: 'turn',
  session,
  at,
  context: 'free',
  outcome,
  independent,
});
const word = (session: string, at: string, type: 'independent' | 'assisted' | 'lapse', context: 'free' | 'doctor' = 'free'): EvidenceEvent => ({
  kind: 'word',
  session,
  at,
  context,
  lemma: 'hlava',
  meaning: 'head',
  form: 'hlava',
  quote: 'bolí mě hlava',
  type,
});

describe('Speak Czech evidence', () => {
  it('starts at level 0 and moves up only on two unaided successes in a row, one step per conversation', () => {
    assert.equal(speakingLevel([]), 0);
    const one = [turn('a', day(0, 1), 'success'), turn('a', day(0, 2), 'success'), turn('a', day(0, 3), 'success'), turn('a', day(0, 4), 'success')];
    assert.equal(speakingLevel(one), 1); // four successes in one conversation: still one step
    const helped = [turn('b', day(1, 1), 'success', false), turn('b', day(1, 2), 'success', false)];
    assert.equal(speakingLevel([...one, ...helped]), 1); // help doesn't raise it
    const two = [turn('c', day(2, 1), 'success'), turn('c', day(2, 2), 'success')];
    assert.equal(speakingLevel([...one, ...two]), 2);
    assert.equal(speakingLevel([...one, ...two, turn('d', day(3), 'breakdown')]), 1);
  });

  it('never makes a word known from one good answer', () => {
    const [w] = wordStates([word('a', day(0), 'independent')], new Date(day(0, 12)));
    assert.equal(w.strength, 1);
    const assisted = wordStates([word('a', day(0), 'assisted')], new Date(day(0, 12)))[0];
    assert.equal(assisted.strength, 0);
  });

  it('makes a word steady only across days, conversations and a week', () => {
    const sameConversationManyDays = [word('a', day(0), 'independent'), word('a', day(3), 'independent'), word('a', day(8), 'independent')];
    assert.equal(wordStates(sameConversationManyDays, new Date(day(8, 12)))[0].strength, 2);
    const steady = [word('a', day(0), 'independent'), word('b', day(3), 'independent', 'doctor'), word('c', day(8), 'independent')];
    assert.equal(wordStates(steady, new Date(day(8, 12)))[0].strength, 3);
    const quick = [word('a', day(0), 'independent'), word('b', day(1), 'independent', 'doctor'), word('c', day(2), 'independent')];
    assert.equal(wordStates(quick, new Date(day(2, 12)))[0].strength, 2); // under a week
    const lapsed = [...steady, word('d', day(9), 'lapse')];
    assert.equal(wordStates(lapsed, new Date(day(9, 12)))[0].strength, 1);
  });

  it('brings words back when they are due, weakest first', () => {
    const events = [word('a', day(0), 'independent')];
    assert.deepEqual(wordsToRevisit(wordStates(events, new Date(day(0, 12))), new Date(day(0, 12))), []);
    assert.deepEqual(wordsToRevisit(wordStates(events, new Date(day(2))), new Date(day(2))), ['hlava']);
  });

  it('calls a skill reliable only after unaided use in three conversations on two days', () => {
    const skill = (session: string, at: string, independent = true): EvidenceEvent => ({
      kind: 'skill',
      session,
      at,
      context: 'free',
      skill: 'past',
      outcome: 'shown',
      independent,
    });
    assert.equal(skillStates([]).past, 'not-yet');
    assert.equal(skillStates([skill('a', day(0), false)]).past, 'tried');
    assert.equal(skillStates([skill('a', day(0)), skill('a', day(0, 11)), skill('a', day(1))]).past, 'emerging');
    assert.equal(skillStates([skill('a', day(0)), skill('b', day(0, 11)), skill('c', day(1))]).past, 'reliable');
  });

  it('flags grammar only when it comes back in another conversation, and recommends it', () => {
    const weak = (session: string): EvidenceEvent => ({ kind: 'weak', session, at: day(0), context: 'free', grammar: 'cases', quote: 'v Praha', note: '' });
    assert.deepEqual(repeatedWeaknesses([weak('a'), weak('a')]), []);
    assert.equal(repeatedWeaknesses([weak('a'), weak('b')])[0].grammar, 'cases');
    const recs = recommendations([weak('a'), weak('b')], [], 'health', new Date(day(1)));
    assert.deepEqual(recs[0], { kind: 'grammar', id: 'cases', why: 'Came up in 2 conversations' });
    assert.ok(recs.some((r) => r.kind === 'topic' && r.id === 'health'));
  });

  it('aims the next conversation at what the evidence lacks', () => {
    assert.equal(nextGoal([], 0), null);
    assert.equal(nextGoal([], 1), 'questions');
    const asked: EvidenceEvent = { kind: 'skill', session: 'a', at: day(0), context: 'free', skill: 'questions', outcome: 'shown', independent: true };
    assert.equal(nextGoal([asked], 2), 'past');
  });
});
