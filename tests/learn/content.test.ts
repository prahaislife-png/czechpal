import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { library } from '../../src/lib/learn/content';
import { lexemeById, lexicon } from '../../src/lib/learn/lexicon';
import { formsIn, lookUp, sentenceAround, tokenize } from '../../src/lib/learn/text';

describe('library content', () => {
  it('has unique content, chapter and question ids', () => {
    const ids = library.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    const chapters = library.flatMap((c) => c.chapters.map((ch) => ch.id));
    assert.equal(new Set(chapters).size, chapters.length);
    for (const c of library) {
      const q = c.questions.map((x) => x.id);
      assert.equal(new Set(q).size, q.length, `${c.id}: duplicate question id`);
    }
  });

  it('has the seed set the brief asks for', () => {
    const count = (f: (c: (typeof library)[number]) => boolean) => library.filter(f).length;
    assert.ok(count((c) => c.kind === 'story' && c.level === 'A1') >= 3);
    assert.ok(count((c) => c.kind === 'story' && c.level === 'A2') >= 3);
    assert.ok(count((c) => c.kind === 'dialogue') >= 2);
    assert.ok(library.some((c) => c.kind === 'serial' && c.chapters.length >= 3));
  });

  it('gives every paragraph Czech and a translation', () => {
    for (const c of library) {
      for (const ch of c.chapters) {
        assert.ok(ch.paragraphs.length > 0, `${ch.id} is empty`);
        for (const p of ch.paragraphs) {
          assert.ok(p.cs.trim(), `${ch.id}: empty Czech`);
          assert.ok(p.en.trim(), `${ch.id}: missing translation`);
        }
      }
    }
  });

  it('has answerable questions', () => {
    for (const c of library) {
      assert.ok(c.questions.length >= 3, `${c.id}: fewer than 3 questions`);
      for (const q of c.questions) {
        assert.ok(q.answer >= 0 && q.answer < q.options.length, `${c.id}/${q.id}: answer out of range`);
        assert.equal(new Set(q.options).size, q.options.length, `${c.id}/${q.id}: duplicate options`);
      }
    }
  });

  it('suggests only vocabulary that exists in the dictionary', () => {
    for (const c of library) {
      for (const id of c.vocabulary) assert.ok(lexemeById(id), `${c.id}: unknown vocabulary ${id}`);
    }
  });

  it('can look up every word of every text, unambiguously', () => {
    const missing: string[] = [];
    for (const c of library) {
      for (const form of formsIn(c)) if (!lookUp(c, form)) missing.push(`${c.id}: ${form}`);
    }
    assert.deepEqual(missing, []);
  });

  it('points senses at forms that occur in the text', () => {
    for (const c of library) {
      const forms = new Set(formsIn(c));
      for (const key of Object.keys(c.senses ?? {})) assert.ok(forms.has(key), `${c.id}: sense for missing form ${key}`);
    }
  });

  it('marks unreviewed texts as drafts', () => {
    for (const c of library) {
      if (!c.source.reviewedByNativeSpeaker) assert.equal(c.status, 'draft', `${c.id} is published without review`);
    }
  });
});

describe('dictionary', () => {
  it('has unique ids', () => {
    const ids = lexicon.map((l) => l.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('stores forms lowercase', () => {
    for (const l of lexicon) for (const f of l.forms) assert.equal(f, f.toLocaleLowerCase('cs'), `${l.id}: ${f}`);
  });

  it('only marks verbs with aspect and only nouns with gender', () => {
    for (const l of lexicon) {
      if (l.aspect) assert.equal(l.pos, 'verb', l.id);
      if (l.gender) assert.equal(l.pos, 'noun', l.id);
    }
  });
});

describe('word lookup', () => {
  const story = library.find((c) => c.id === 'novy-byt')!;

  it('maps a conjugated verb to its infinitive', () => {
    const info = lookUp(story, 'podepíšu');
    assert.equal(info?.lexeme.lemma, 'podepsat');
    assert.equal(info?.lexeme.aspect, 'pf');
    assert.equal(info?.note, 'I will sign');
  });

  it('maps an inflected noun to its lemma, whatever the case of the letters', () => {
    assert.equal(lookUp(story, 'Koupelnu')?.lexeme.lemma, 'koupelna');
    assert.equal(lookUp(story, 'bytu')?.lexeme.gender, 'mi');
  });

  it('prefers the text’s own meaning', () => {
    assert.equal(lookUp(story, 'nevadí')?.inContext, 'kočka nevadí: a cat is no problem (literally “a cat doesn’t bother”)');
  });

  it('returns nothing for a word it doesn’t know, instead of guessing', () => {
    assert.equal(lookUp(story, 'kosmonaut'), null);
  });
});

describe('text helpers', () => {
  it('splits words from punctuation and keeps everything', () => {
    const text = 'Ptám se: „Můžu tady mít kočku?“';
    const tokens = tokenize(text);
    assert.equal(tokens.map((t) => t.text).join(''), text);
    assert.deepEqual(
      tokens.filter((t) => t.word).map((t) => t.text),
      ['Ptám', 'se', 'Můžu', 'tady', 'mít', 'kočku'],
    );
  });

  it('finds the sentence around a word', () => {
    const p = 'Jsem šťastná. Zítra podepíšu smlouvu.';
    assert.equal(sentenceAround(p, p.indexOf('podepíšu')), 'Zítra podepíšu smlouvu.');
    assert.equal(sentenceAround(p, 0), 'Jsem šťastná.');
  });
});
