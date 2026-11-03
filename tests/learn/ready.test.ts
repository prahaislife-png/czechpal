import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { logDay, today } from '../../src/lib/learn/activity';
import { addOwnCard, type Deck } from '../../src/lib/learn/deck';
import { buildSession, nextPhrases, rememberPhrase, sessionSize, sessionSummary, situationProgress } from '../../src/lib/learn/session';
import { phraseId, situationById, situations } from '../../src/lib/learn/situations';
import { situationForCase, situationOfTheDay, upcoming } from '../../src/lib/learn/upcoming';

const now = new Date(2026, 10, 3, 10); // 3 November 2026, 10:00

describe('situations', () => {
  it('has unique ids and enough phrases, each with a translation', () => {
    assert.equal(new Set(situations.map((s) => s.id)).size, situations.length);
    for (const s of situations) {
      assert.ok(s.phrases.length >= 8, `${s.id}: ${s.phrases.length} phrases`);
      assert.equal(new Set(s.phrases.map((p) => p.cs)).size, s.phrases.length, `${s.id}: repeated phrase`);
      for (const p of s.phrases) {
        assert.ok(p.cs.trim() && p.en.trim(), `${s.id}: empty phrase`);
        assert.ok(/[.?!]$/.test(p.cs), `${s.id}: “${p.cs}” should end like a sentence`);
      }
    }
  });

  it('avoids the past tense, which in Czech changes with the speaker’s gender', () => {
    for (const s of situations)
      for (const p of s.phrases) assert.ok(!/\b\w+(l|la|li)\s+jsem\b|\bjsem\s+\w+(l|la)\b/i.test(p.cs), `${s.id}: ${p.cs}`);
  });
});

describe('what’s coming up', () => {
  const base = { reminders: [], cases: [], now };

  it('gets the learner ready for a permit that ends soon, not one that’s far off', () => {
    assert.deepEqual(
      upcoming({ ...base, permitExpires: '2026-12-07' }).map((u) => [u.situation.id, u.reason]),
      [['permit', 'Your residence permit ends in 34 days']],
    );
    assert.deepEqual(upcoming({ ...base, permitExpires: '2027-09-01' }), []);
  });

  it('turns a letter’s deadline into the right situation, soonest first', () => {
    const got = upcoming({
      ...base,
      permitExpires: '2027-01-20',
      reminders: [{ kind: 'deadline', caseId: 'water', date: '2026-11-06', title: 'Pay 1 840 Kč' }],
      cases: [{ id: 'water', createdAt: '2026-11-01T09:00:00Z', status: 'ready', category: 'utilities', title: 'Water bill' }],
    });
    assert.deepEqual(got.map((u) => u.situation.id), ['bills', 'permit']);
    assert.equal(got[0].reason, 'Pay 1 840 Kč in 3 days');
  });

  it('notices recent letters without a deadline, and skips old ones and samples', () => {
    const got = upcoming({
      ...base,
      cases: [
        { id: 'a', createdAt: '2026-11-02T08:00:00Z', status: 'ready', category: 'health', title: 'Lab results' },
        { id: 'b', createdAt: '2026-09-01T08:00:00Z', status: 'ready', category: 'housing' },
        { id: 'c', createdAt: '2026-11-03T08:00:00Z', status: 'example', category: 'work' },
      ],
    });
    assert.deepEqual(got.map((u) => [u.situation.id, u.reason]), [['doctor', 'From “Lab results” you scanned yesterday']]);
  });

  it('lists each situation once', () => {
    const got = upcoming({
      ...base,
      reminders: [
        { kind: 'deadline', caseId: 'x', date: '2026-11-10', title: 'Pay rent' },
        { kind: 'deadline', caseId: 'y', date: '2026-11-05', title: 'Sign the lease' },
      ],
      cases: [
        { id: 'x', createdAt: '2026-11-01T08:00:00Z', status: 'ready', category: 'housing' },
        { id: 'y', createdAt: '2026-11-02T08:00:00Z', status: 'ready', category: 'housing' },
      ],
    });
    assert.deepEqual(got.map((u) => u.reason), ['Sign the lease in 2 days']);
  });

  it('sends parcel notices to the post office', () => {
    assert.equal(situationForCase({ id: 'p', createdAt: '', status: 'ready', category: 'other', typeLabel: 'Parcel notice' }), 'post');
    assert.equal(situationForCase({ id: 'q', createdAt: '', status: 'ready', category: 'food' }), undefined);
  });

  it('has a situation for every day when nothing is coming up', () => {
    const a = situationOfTheDay(now);
    assert.equal(situationOfTheDay(new Date(2026, 10, 3, 22)).id, a.id);
    assert.ok(situationOfTheDay(new Date(2026, 10, 4, 10)).id !== a.id);
  });
});

describe('the daily session', () => {
  const doctor = situationById('doctor')!;

  it('is words that are due, then phrases, then listening', () => {
    let deck: Deck = {};
    for (const [i, w] of ['pes', 'kočka', 'dům', 'stůl', 'okno'].entries()) {
      const next = addOwnCard(deck, w, `word ${i}`, new Date(2026, 9, 1), `own:${i}`);
      if (typeof next !== 'string') deck = next;
    }
    const steps = buildSession({ deck, focus: doctor, memory: {}, minutes: 5, canListen: true, seed: 7, now });
    assert.deepEqual(
      steps.map((s) => s.kind),
      ['card', 'card', 'card', 'card', 'phrase', 'phrase', 'phrase', 'listen', 'listen'],
    );
    assert.equal(sessionSummary(steps), '4 words · 3 phrases · 2 to listen to');
  });

  it('gives more phrases when no words are due, and no listening without a Czech voice', () => {
    const steps = buildSession({ deck: {}, focus: doctor, memory: {}, minutes: 5, canListen: false, seed: 7, now });
    assert.equal(steps.filter((s) => s.kind === 'phrase').length, sessionSize[5].phrases + 2);
    assert.ok(!steps.some((s) => s.kind === 'listen'));
  });

  it('listens to the same situation’s phrases', () => {
    const steps = buildSession({ deck: {}, focus: doctor, memory: {}, minutes: 10, canListen: true, seed: 3, now });
    for (const s of steps) if (s.kind === 'listen') assert.ok(doctor.phrases.some((p) => p.cs === s.item.say), s.item.say);
  });

  it('practises new phrases first, then the ones not known yet', () => {
    let memory = {};
    for (const i of [0, 1, 2]) memory = rememberPhrase(memory, phraseId('doctor', i), true, '2026-11-02');
    memory = rememberPhrase(memory, phraseId('doctor', 3), false, '2026-11-02');
    const next = nextPhrases(doctor, memory, 3).map((p) => p.id);
    assert.deepEqual(next, ['doctor:4', 'doctor:5', 'doctor:6']);
    const all = nextPhrases(doctor, memory, doctor.phrases.length).map((p) => p.id);
    assert.ok(all.indexOf('doctor:3') < all.indexOf('doctor:0'), 'a phrase not known yet comes before known ones');
    assert.deepEqual(situationProgress(doctor, memory), { known: 3, total: doctor.phrases.length });
  });

  it('counts phrases and sessions towards the day, including days saved before they existed', () => {
    const old = { '2026-11-03': { reviews: 2, chapters: 0, listening: 0, heard: 0, heardRight: 0 } } as never;
    const days = logDay(logDay(old, { phrases: 3 }, now), { sessions: 1 }, now);
    const d = today(days, now);
    assert.equal(d.reviews, 2);
    assert.equal(d.phrases, 3);
    assert.equal(d.sessions, 1);
  });
});
