import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { collectRecordings } from '../../scripts/audio/collect';
import { checkVoices, genderCue, speakersFor, VOICE } from '../../scripts/audio/speakers';
import { audioHash, turnsOf } from '../../src/lib/academy/audio-key';
import { recordings } from '../../src/lib/academy/audio-manifest';

describe('Recorded Czech audio (Azure voices)', () => {
  it('fingerprints the text, ignoring spacing but not wording', () => {
    assert.equal(audioHash('Dobrý  den,\n jak se máte?'), audioHash('Dobrý den, jak se máte?'));
    assert.ok(audioHash('Dobrý den') !== audioHash('Dobrý den.'));
    assert.ok(/^[0-9a-f]{8}$/.test(audioHash('x')));
    assert.deepEqual(turnsOf('Ahoj. – Ahoj! – Jak se máš?'), ['Ahoj.', 'Ahoj!', 'Jak se máš?']);
  });

  it('hears the speaker’s gender in the Czech', () => {
    assert.equal(genderCue('Dobrý den, chtěl bych jednu jízdenku.'), 'M');
    assert.equal(genderCue('Chtěla bych jen zkrátit vlasy.'), 'F');
    assert.equal(genderCue('Byla jsem s dětmi v bazénu.'), 'F');
    assert.equal(genderCue('Ne, musel jsem jít do práce.'), 'M');
    assert.equal(genderCue('Jasně, rád.'), 'M');
    // About someone else, not the speaker: no cue.
    assert.equal(genderCue('Knih má dost. Koupíme mu lístky do kina, rád chodí na filmy.'), null);
    assert.equal(genderCue('Petro, co jsi dělala v sobotu?'), null);
  });

  it('gives every recording a voice for each turn that agrees with the Czech', () => {
    const all = collectRecordings();
    assert.ok(all.length >= 100);
    const problems = all.flatMap((r) => checkVoices(r.key, r.text));
    assert.deepEqual(problems, []);
    for (const r of all) for (const s of speakersFor(r.key)!) assert.ok(VOICE[s].name.startsWith('cs-CZ-'));
  });

  it('never ships a recording made from different text', () => {
    const texts = new Map(collectRecordings().map((r) => [r.key, r.text]));
    for (const [key, r] of Object.entries(recordings)) {
      assert.ok(texts.has(key), `${key} is no longer in the app`);
      assert.equal(r.hash, audioHash(texts.get(key)!), `${key} changed since its audio was made: run scripts/audio/generate.ps1`);
    }
  });
});
