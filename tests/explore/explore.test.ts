import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { curatedPlaces } from '../../src/lib/explore/curated';
import {
  activities,
  areaLabel,
  areasOf,
  boundsOf,
  categories,
  clusterPlaces,
  directionsUrl,
  distanceM,
  filterPlaces,
  formatDistance,
  inPrague,
  NEAR,
  nearbyPlaces,
  pinsInView,
  placesInView,
  preferredFor,
  toggleActivity,
} from '../../src/lib/explore/filter';
import { fromRow } from '../../src/lib/explore/rows';

describe('curated places', () => {
  it('has unique ids, marked as CzechLocal’s own', () => {
    const ids = curatedPlaces.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const p of curatedPlaces) {
      assert.ok(p.id.startsWith('cz:'), p.id);
      assert.equal(p.source, 'curated');
      assert.ok(p.named);
    }
  });

  it('puts every place inside Prague', () => {
    for (const p of curatedPlaces) {
      assert.ok(p.latitude > 49.94 && p.latitude < 50.18, `${p.id}: latitude ${p.latitude}`);
      assert.ok(p.longitude > 14.22 && p.longitude < 14.71, `${p.id}: longitude ${p.longitude}`);
      assert.ok(/^Praha \d+$/.test(p.district), `${p.id}: district ${p.district}`);
    }
  });

  it('describes each place without live business details', () => {
    for (const p of curatedPlaces) {
      assert.ok(p.description.length > 30, `${p.id}: description`);
      assert.ok(!/\b\d{1,2}[:.]\d{2}\b|Kč|CZK|open daily|open now/i.test(p.description), `${p.id}: hours or prices`);
      assert.ok(p.attributes.length > 0, `${p.id}: attributes`);
      assert.ok(categories[p.category], p.id);
    }
  });

  it('still answers every activity offline, from the hand-picked list alone', () => {
    for (const a of activities) {
      const n = curatedPlaces.filter((p) => p.activities.includes(a.id)).length;
      assert.ok(n >= 2, `${a.id}: ${n} places`);
    }
  });
});

describe('filters', () => {
  it('matches any of the chosen activities', () => {
    const both = filterPlaces(curatedPlaces, { activities: ['garden', 'viewpoint'], area: 'prague' });
    assert.ok(both.length > 0);
    for (const p of both) assert.ok(p.activities.includes('garden') || p.activities.includes('viewpoint'), p.id);
    const gardens = filterPlaces(curatedPlaces, { activities: ['garden'], area: 'prague' });
    assert.ok(both.length > gardens.length);
  });

  it('shows everything when no activity is chosen', () => {
    assert.equal(filterPlaces(curatedPlaces, { activities: [], area: 'prague' }).length, curatedPlaces.length);
  });

  it('narrows to one district', () => {
    const p7 = filterPlaces(curatedPlaces, { activities: [], area: 'Praha 7' });
    assert.ok(p7.length > 0);
    for (const p of p7) assert.equal(p.district, 'Praha 7');
  });

  it('searches names and neighbourhoods without diacritics, in English or Czech', () => {
    assert.deepEqual(
      filterPlaces(curatedPlaces, { activities: [], area: 'prague', query: 'divoka sarka' }).map((p) => p.id),
      ['cz:divoka-sarka'],
    );
    assert.deepEqual(
      filterPlaces(curatedPlaces, { activities: [], area: 'prague', query: 'valdstejnska' }).map((p) => p.id),
      ['cz:valdstejnska'],
    );
    const withQuarter = [{ ...curatedPlaces[0], id: 'x', name: 'Playground in Žižkov', quarter: 'Žižkov' }];
    assert.equal(filterPlaces(withQuarter, { activities: [], area: 'prague', query: 'zizkov' }).length, 1);
  });

  it('keeps activities in picker order however they are added', () => {
    assert.deepEqual(toggleActivity(['garden'], 'walk'), ['walk', 'garden']);
    assert.deepEqual(toggleActivity(['walk', 'garden'], 'walk'), ['garden']);
  });

  it('lists Prague, then Praha 1–22 in number order, then named districts', () => {
    const p = curatedPlaces[0];
    const areas = areasOf(['Praha-Troja', 'Praha 10', 'Praha 2', 'Praha-Suchdol', 'Praha 2'].map((district, i) => ({ ...p, id: `${i}`, district })));
    assert.deepEqual(areas, ['prague', 'Praha 2', 'Praha 10', 'Praha-Suchdol', 'Praha-Troja']);
  });
});

describe('clustering', () => {
  const centre = curatedPlaces.filter((p) => ['cz:kampa', 'cz:vojanovy', 'cz:strelecky', 'cz:detsky-ostrov'].includes(p.id));

  it('groups nearby pins when zoomed out and splits them when zoomed in', () => {
    // A phone-wide view of the whole city, then a few streets.
    const far = clusterPlaces(centre, (390 * 360) / 0.2);
    const near = clusterPlaces(centre, (390 * 360) / 0.004);
    assert.ok(far.some((c) => c.kind === 'cluster'));
    assert.equal(near.filter((c) => c.kind === 'place').length, centre.length);
  });

  it('never hides the selected place in a group', () => {
    const far = clusterPlaces(centre, (390 * 360) / 0.2, 'cz:kampa');
    assert.equal(far.find((c) => c.id === 'cz:kampa')?.kind, 'place');
    for (const c of far) if (c.kind === 'cluster') assert.ok(!c.places.some((p) => p.id === 'cz:kampa'));
  });

  it('accounts for every place exactly once', () => {
    const clusters = clusterPlaces(curatedPlaces, (390 * 360) / 0.12);
    const ids = clusters.flatMap((c) => (c.kind === 'place' ? [c.id] : c.places.map((p) => p.id)));
    assert.equal(ids.length, curatedPlaces.length);
    assert.equal(new Set(ids).size, curatedPlaces.length);
  });

  it('draws only what is on screen', () => {
    const box = boundsOf(centre, 0)!;
    const clusters = clusterPlaces(curatedPlaces, (390 * 360) / 0.004, null, 52, box);
    const drawn = clusters.flatMap((c) => (c.kind === 'place' ? [c.place] : c.places));
    for (const p of centre) assert.ok(drawn.includes(p), p.id);
    for (const p of drawn) assert.ok(p.latitude >= box.south && p.latitude <= box.north && p.longitude >= box.west && p.longitude <= box.east, p.id);
    assert.ok(!drawn.some((p) => p.id === 'cz:hostivar'));
  });

  it('stays quick with thousands of places', () => {
    const many = Array.from({ length: 6000 }, (_, i) => ({
      ...curatedPlaces[i % curatedPlaces.length],
      id: `p${i}`,
      latitude: 50 + (i % 97) / 1000,
      longitude: 14.3 + (i % 89) / 500,
    }));
    const t = performance.now();
    clusterPlaces(many, (390 * 360) / 0.15);
    assert.ok(performance.now() - t < 100, 'clustering 6,000 places took over 100 ms');
  });
});

describe('pins worth drawing', () => {
  const p = curatedPlaces[0];
  const park = { ...p, id: 'park', category: 'park' as const, named: true, areaHa: 30 };
  const playground = { ...p, id: 'play', name: 'Playground in Letná', category: 'playground' as const, named: false, source: 'osm' as const };

  it('keeps the more important of two pins that would touch, instead of a numbered group', () => {
    const pins = pinsInView([playground, park], null, (390 * 360) / 0.2);
    assert.deepEqual(pins.map((c) => [c.kind, c.id]), [['place', 'park']]);
  });

  it('shows both once the map is close enough to tell them apart', () => {
    const apart = { ...playground, latitude: p.latitude + 0.003 };
    assert.equal(pinsInView([apart, park], null, (390 * 360) / 0.01).length, 2);
  });

  it('puts the chosen activity’s kind of place first', () => {
    assert.deepEqual(preferredFor(['kids']), ['playground']);
    const pins = pinsInView([playground, park], null, (390 * 360) / 0.2, null, 45, 34, preferredFor(['kids']));
    assert.deepEqual(pins.map((c) => c.id), ['play']);
  });

  it('always draws the selected place', () => {
    const pins = pinsInView([playground, park], null, (390 * 360) / 0.2, 'play');
    assert.ok(pins.some((c) => c.id === 'play'));
  });

  it('stops at the budget', () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ ...p, id: `p${i}`, latitude: 50 + (i % 25) * 0.01, longitude: 14.2 + Math.floor(i / 25) * 0.02 }));
    assert.equal(pinsInView(many, null, (390 * 360) / 0.02, null, 45).length, 45);
  });
});

describe('near me', () => {
  // Standing on Old Town Square.
  const here = { latitude: 50.0875, longitude: 14.4213 };

  it('keeps only places within the walk, whatever their district', () => {
    const within = filterPlaces(curatedPlaces, { activities: [], area: NEAR, near: here, radius: 1500 });
    assert.ok(within.length > 0);
    for (const p of within) assert.ok(distanceM(here, p) <= 1500, p.id);
    assert.ok(!within.some((p) => p.id === 'cz:hostivar'));
  });

  it('walks further when too little is close by', () => {
    const { radius, list } = nearbyPlaces(curatedPlaces, { activities: ['nature'] }, here);
    assert.ok(radius > 1500);
    for (const p of list) assert.ok(distanceM(here, p) <= radius, p.id);
  });

  it('stops at the first walk that finds enough', () => {
    assert.equal(nearbyPlaces(curatedPlaces, { activities: [] }, here, 1).radius, 1500);
  });

  it('knows when someone is in Prague', () => {
    assert.ok(inPrague(here));
    assert.ok(!inPrague({ latitude: 49.19, longitude: 16.61 })); // Brno
    assert.equal(areaLabel(NEAR), 'near me');
  });
});

describe('distance', () => {
  it('reads like a person would say it', () => {
    assert.equal(formatDistance(30), '50 m');
    assert.equal(formatDistance(420), '400 m');
    assert.equal(formatDistance(1234), '1.2 km');
    assert.equal(formatDistance(15400), '15 km');
    assert.ok(Math.abs(distanceM({ latitude: 50, longitude: 14 }, { latitude: 50.01, longitude: 14 }) - 1113) < 5);
  });
});

describe('list of places in view', () => {
  it('puts written-up and named places first, and always keeps the selection', () => {
    const p = curatedPlaces[0];
    const unnamed = { ...p, id: 'unnamed', name: 'Playground in Holešovice', named: false, source: 'osm' as const, category: 'playground' as const };
    const { list, total } = placesInView([unnamed, p], boundsOf([p, unnamed]), 1);
    assert.equal(total, 2);
    assert.deepEqual(list.map((x) => x.id), [p.id]);
    assert.deepEqual(placesInView([unnamed, p], boundsOf([p, unnamed]), 1, 'unnamed').list.map((x) => x.id), ['unnamed', p.id]);
  });
});

describe('helpers', () => {
  it('builds walking directions for the platform’s maps app', () => {
    const p = { latitude: 50.1, longitude: 14.4 };
    assert.equal(directionsUrl(p, 'ios'), 'https://maps.apple.com/?daddr=50.1,14.4&dirflg=w');
    assert.equal(directionsUrl(p, 'android'), 'https://www.google.com/maps/dir/?api=1&destination=50.1,14.4&travelmode=walking');
  });

  it('pads the box round a single place to street level', () => {
    const b = boundsOf([{ latitude: 50, longitude: 14 }])!;
    assert.ok(b.north - b.south > 0.0079 && b.east - b.west > 0.0119);
    assert.equal(boundsOf([]), null);
  });

  it('reads a database row, keeping a photo only with its credit', () => {
    const row = {
      id: 'osm:w1',
      name: 'Playground in Žižkov',
      name_cs: null,
      named: false,
      category: 'playground' as const,
      district: 'Praha 3',
      quarter: 'Žižkov',
      lat: 50.08,
      lng: 14.45,
      area_ha: null,
      activities: ['kids' as const],
      attributes: ['Sand'],
      description: 'A playground in Žižkov (Praha 3).',
      photo_url: 'https://example.org/x.jpg',
      photo_credit: null,
      source: 'osm' as const,
      source_url: 'https://www.openstreetmap.org/way/1',
      checked_on: '2026-11-03',
    };
    const place = fromRow(row);
    assert.equal(place.named, false);
    assert.equal(place.quarter, 'Žižkov');
    assert.equal(place.photo, undefined);
    assert.equal(place.areaHa, undefined);
    assert.equal(place.sourceUrl, 'https://www.openstreetmap.org/way/1');
    assert.equal(fromRow({ ...row, photo_credit: 'CC BY 4.0, A. Person' }).photo?.credit, 'CC BY 4.0, A. Person');
  });
});
