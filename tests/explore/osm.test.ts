import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { areaHa, classify, describe as describePlace, inShape, joinRings, pinPoint, type Point } from '../../src/lib/explore/osm';

describe('which OpenStreetMap features become places', () => {
  it('keeps public outdoor places', () => {
    assert.equal(classify({ leisure: 'park' }), 'park');
    assert.equal(classify({ leisure: 'playground' }), 'playground');
    assert.equal(classify({ leisure: 'fitness_station' }), 'fitness');
    assert.equal(classify({ leisure: 'pitch', sport: 'basketball' }), 'pitch');
    assert.equal(classify({ tourism: 'viewpoint' }), 'viewpoint');
    assert.equal(classify({ leisure: 'nature_reserve', name: 'Divoká Šárka' }), 'reserve');
    assert.equal(classify({ natural: 'wood', name: 'Kunratický les' }), 'wood');
  });

  it('leaves out private places and yards', () => {
    assert.equal(classify({ leisure: 'park', access: 'private' }), null);
    assert.equal(classify({ leisure: 'pitch', access: 'customers' }), null);
    assert.equal(classify({ leisure: 'garden' }), null); // unnamed: almost always someone's yard
    assert.equal(classify({ leisure: 'garden', name: 'Zahrada', 'garden:type': 'residential' }), null);
    assert.equal(classify({ leisure: 'garden', name: 'Vojanovy sady' }), 'garden');
    assert.equal(classify({ natural: 'wood' }), null); // unnamed woods are just tree cover
  });

  it('leaves out sports that aren’t open to passers-by', () => {
    assert.equal(classify({ leisure: 'pitch', sport: 'equestrian' }), null);
    assert.equal(classify({ leisure: 'pitch', sport: 'shooting' }), null);
    assert.equal(classify({ leisure: 'track', sport: 'horse_racing' }), null);
    assert.equal(classify({ leisure: 'track', sport: 'running' }), 'track');
  });
});

describe('describing a place', () => {
  it('labels an unnamed place by its type and neighbourhood', () => {
    const d = describePlace('playground', {}, { district: 'Praha 3', quarter: 'Žižkov' });
    assert.equal(d.name, 'Playground in Žižkov');
    assert.equal(d.named, false);
    assert.equal(d.description, 'A playground in Žižkov (Praha 3).');
    assert.deepEqual(d.activities, ['kids']);
  });

  it('prefers the English name and keeps the Czech one', () => {
    const d = describePlace('park', { name: 'Letenské sady', 'name:en': 'Letná Park' }, { district: 'Praha 7' });
    assert.equal(d.name, 'Letná Park');
    assert.equal(d.nameCs, 'Letenské sady');
  });

  it('says what is inside a park, and what that lets you do', () => {
    const d = describePlace('park', { name: 'Stromovka' }, {
      district: 'Praha 7',
      quarter: 'Bubeneč',
      areaHa: 95.3,
      inside: { playground: true, fitness: true, viewpoint: false, sports: ['tennis'], cycleway: true },
    });
    assert.equal(
      d.description,
      'A 95-hectare park in Bubeneč (Praha 7). It has a playground, an outdoor gym and a tennis pitch. Cycle paths run through it.',
    );
    for (const a of ['walk', 'kids', 'workout', 'sport', 'cycling', 'nature'] as const) assert.ok(d.activities.includes(a), a);
    assert.equal(d.attributes[0], '95 ha');
  });

  it('names a court by its sport and flags unconfirmed access', () => {
    const d = describePlace('pitch', { leisure: 'pitch', sport: 'basketball', surface: 'asphalt', lit: 'yes' }, { district: 'Praha 2', quarter: 'Vinohrady' });
    assert.equal(d.name, 'Basketball court in Vinohrady');
    assert.ok(d.description.startsWith('A basketball court in Vinohrady (Praha 2).'));
    assert.deepEqual(d.attributes, ['Basketball', 'Lit at night', 'Asphalt', 'Access not confirmed']);
    const open = describePlace('pitch', { sport: 'basketball', access: 'yes' }, { district: 'Praha 2' });
    assert.ok(!open.attributes.includes('Access not confirmed'));
  });

  it('only says what the tags say', () => {
    const d = describePlace('playground', { min_age: '3', max_age: '12' }, { district: 'Praha 5', parent: 'Kinsky Garden' });
    assert.equal(d.description, 'A playground in Praha 5. For children aged 3 to 12. It’s in Kinsky Garden.');
    assert.ok(!/\d{1,2}:\d{2}|Kč/.test(d.description));
  });
});

describe('geometry', () => {
  // A 100 m × 100 m square near Prague, drawn as two open halves (as multipolygons come).
  const s = 0.0009;
  const lonStep = 0.0014;
  const a: Point = [50, 14];
  const b: Point = [50, 14 + lonStep];
  const c: Point = [50 + s, 14 + lonStep];
  const d: Point = [50 + s, 14];

  it('joins way pieces into closed rings, whichever way they run', () => {
    const rings = joinRings([
      [a, b, c],
      [a, d, c],
    ]);
    assert.equal(rings.length, 1);
    assert.equal(rings[0].length, 5);
  });

  it('measures area in hectares', () => {
    const ha = areaHa({ outer: [[a, b, c, d, a]], inner: [] });
    assert.ok(Math.abs(ha - 1) < 0.05, `got ${ha}`);
  });

  it('puts the pin inside an L-shaped park, not in the gap', () => {
    // An L: the bounding box centre falls outside it.
    const L: Point[] = [[0, 0], [0, 3], [1, 3], [1, 1], [3, 1], [3, 0], [0, 0]];
    const shape = { outer: [L], inner: [] };
    assert.ok(!inShape([1.5, 1.5], shape));
    assert.ok(inShape(pinPoint(shape), shape));
  });

  it('treats holes as outside', () => {
    const outer: Point[] = [[0, 0], [0, 4], [4, 4], [4, 0], [0, 0]];
    const hole: Point[] = [[1, 1], [1, 3], [3, 3], [3, 1], [1, 1]];
    assert.ok(!inShape([2, 2], { outer: [outer], inner: [hole] }));
    assert.ok(inShape([0.5, 0.5], { outer: [outer], inner: [hole] }));
  });
});
