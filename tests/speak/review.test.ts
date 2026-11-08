import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyReviewRules, reviewTranscript, type RawReview, type ReviewTurn } from '../../supabase/functions/_shared/speak-review-rules';

const turns: ReviewTurn[] = [
  { role: 'partner', text: 'Dobrý den, co vás trápí?' },
  { role: 'learner', text: 'Bolí mě hlava od včera.' },
  { role: 'partner', text: 'Máte horečku?' },
  { role: 'learner', text: 'Ano, mám horečku.' },
  { role: 'partner', text: 'Berete nějaké léky?' },
  { role: 'learner', text: 'Ne. Můžu jít do práce?', typed: true },
  { role: 'partner', text: 'Raději ne.' },
  { role: 'learner', text: 'Včera jsem byl doma.', helped: true },
];

const raw = (over: Partial<RawReview> = {}): RawReview => ({
  summary: 'Good.',
  wentWell: ['You said what was wrong.'],
  corrections: [],
  words: [],
  skills: [],
  weaknesses: [],
  outcomes: [],
  comprehension: [],
  ...over,
});

describe('Speak Czech review rules', () => {
  it('keeps evidence only when it is quoted from what the learner said', () => {
    const r = applyReviewRules(
      raw({
        words: [
          { lemma: 'hlava', meaning: 'head', form: 'hlava', quote: 'Bolí mě hlava', turn: 1, kind: 'independent' },
          { lemma: 'lékař', meaning: 'doctor', form: 'lékař', quote: 'jsem lékař', turn: 1, kind: 'independent' },
          { lemma: 'trápit', meaning: 'to trouble', form: 'trápí', quote: 'co vás trápí', turn: 0, kind: 'independent' },
        ],
        corrections: [
          { original: 'od včera', corrected: 'od včerejška', why: 'Both are fine, but…' },
          { original: 'Mám hlavu', corrected: 'Bolí mě hlava', why: 'invented' },
        ],
      }),
      turns,
    );
    assert.deepEqual(r.words.map((w) => w.lemma), ['hlava']);
    assert.deepEqual(r.corrections.map((c) => c.original), ['od včera']);
  });

  it('never counts help, typing or copying the partner as independent', () => {
    const r = applyReviewRules(
      raw({
        words: [
          { lemma: 'horečka', meaning: 'fever', form: 'horečku', quote: 'mám horečku', turn: 3, kind: 'independent' },
          { lemma: 'práce', meaning: 'work', form: 'práce', quote: 'do práce', turn: 5, kind: 'independent' },
          { lemma: 'doma', meaning: 'at home', form: 'doma', quote: 'byl doma', turn: 7, kind: 'independent' },
          { lemma: 'hlava', meaning: 'head', form: 'hlava', quote: 'hlava', turn: 1, kind: 'independent' },
        ],
        skills: [
          { skill: 'questions', outcome: 'shown', quote: 'Můžu jít do práce?', turn: 5 },
          { skill: 'past', outcome: 'shown', quote: 'Včera jsem byl doma', turn: 7 },
          { skill: 'flying', outcome: 'shown', quote: 'hlava', turn: 1 },
        ],
      }),
      turns,
    );
    const kind = Object.fromEntries(r.words.map((w) => [w.lemma, w.kind]));
    assert.equal(kind.horečka, 'assisted'); // the partner had just said "horečku"
    assert.equal(kind.práce, 'assisted'); // typed
    assert.equal(kind.doma, 'assisted'); // after help
    assert.equal(kind.hlava, 'independent');
    assert.deepEqual(
      r.skills.map((s) => [s.skill, s.independent]),
      [
        ['questions', false],
        ['past', false],
      ],
    );
  });

  it('gives every learner turn an outcome and counts only unaided successes', () => {
    const r = applyReviewRules(
      raw({
        outcomes: [
          { turn: 1, outcome: 'success' },
          { turn: 3, outcome: 'success' },
          { turn: 5, outcome: 'success' },
          { turn: 0, outcome: 'success' },
        ],
      }),
      turns,
    );
    assert.deepEqual(
      r.turns.map((t) => t.outcome),
      ['success', 'success', 'success', 'partial'],
    );
    assert.equal(r.independentTurns, 2);
    assert.equal(r.helpUsed, 2);
  });

  it("doesn't count turns in another language as help or as Czech", () => {
    const mixed: ReviewTurn[] = [
      { role: 'partner', text: "Hi! Let's start. Jak se jmenuješ?" },
      { role: 'learner', text: 'How do I say my name is Anna?', meaning: true },
      { role: 'partner', text: 'Say: Jmenuju se Anna.' },
      { role: 'learner', text: 'Jmenuju se Anna.' },
    ];
    const r = applyReviewRules(
      raw({
        outcomes: [
          { turn: 1, outcome: 'other' },
          { turn: 3, outcome: 'success' },
        ],
      }),
      mixed,
    );
    assert.deepEqual(r.turns.map((t) => t.outcome), ['other', 'success']);
    assert.equal(r.helpUsed, 0);
    assert.equal(r.independentTurns, 1);
  });

  it('accepts only known grammar ids and partner turns for comprehension', () => {
    const r = applyReviewRules(
      raw({
        weaknesses: [
          { grammar: 'cases', quote: 'od včera', turn: 1, note: 'x' },
          { grammar: 'astrology', quote: 'od včera', turn: 1, note: 'x' },
        ],
        comprehension: [
          { turn: 4, note: 'léky was new' },
          { turn: 3, note: 'not a partner turn' },
        ],
      }),
      turns,
    );
    assert.deepEqual(r.weaknesses.map((w) => w.grammar), ['cases']);
    assert.deepEqual(r.comprehension, ['léky was new']);
  });

  it('shows the reviewer how each learner turn was produced', () => {
    const text = reviewTranscript(turns);
    assert.ok(text.includes('[5] LEARNER (typed): Ne.'));
    assert.ok(text.includes('[7] LEARNER (asked for help):'));
    assert.ok(text.includes('[0] PARTNER:'));
  });
});
