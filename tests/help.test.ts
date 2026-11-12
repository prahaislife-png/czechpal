import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allEntries, areas } from '../src/lib/help/areas';
import { emergencyNumbers, emergencyPhrases } from '../src/lib/help/directory';
import { dueLabel, forYou, PERMIT_SOON_DAYS } from '../src/lib/help/for-you';
import { situationById } from '../src/lib/learn/situations';

/** YYYY-MM-DD, `days` from today, in local time (as the app reads dates). */
function inDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('Help’s “For you”', () => {
  it('asks when nothing is known', () => {
    const mine = forYou({});
    assert.equal(mine.empty, true);
    assert.equal(mine.office, undefined);
    assert.equal(mine.permit, undefined);
    assert.equal(mine.townHallDistrict, undefined);
  });

  it('finds the immigration office and town hall for a part of Prague', () => {
    const mine = forYou({ district: 'Praha 3' });
    assert.equal(mine.empty, false);
    assert.equal(mine.office?.office.id, 'zukovskeho');
    assert.equal(mine.office?.district, 'Praha 3');
    assert.equal(mine.townHallDistrict, 'Praha 3');
    assert.equal(forYou({ district: 'Praha 4' }).office?.office.id, 'chodov');
    assert.equal(forYou({ district: 'Praha 9' }).office?.office.id, 'kolbenova');
  });

  it('names no office outside Prague', () => {
    const mine = forYou({ district: 'Elsewhere in Czechia' });
    assert.equal(mine.empty, false);
    assert.equal(mine.office, undefined);
    assert.equal(mine.townHallDistrict, undefined);
  });

  it('shows a permit only when its end is close and still ahead', () => {
    assert.equal(forYou({ stay: 'study', expires: inDays(PERMIT_SOON_DAYS + 1) }).permit, undefined);
    assert.equal(forYou({ stay: 'study', expires: inDays(-1) }).permit, undefined);
    const soon = forYou({ stay: 'study', expires: inDays(45) }).permit;
    assert.equal(soon?.days, 45);
    assert.equal(soon?.title, 'Your permit ends in 45 days');
    assert.equal(forYou({ stay: 'study', expires: inDays(1) }).permit?.title, 'Your permit ends in 1 day');
    assert.equal(forYou({ stay: 'study', expires: inDays(0) }).permit?.title, 'Your permit ends today');
  });

  it('points an employee card at its own checklist, and others at the full list', () => {
    assert.equal(forYou({ stay: 'employee_card', expires: inDays(30) }).permit?.checklist, 'extend-employee-card');
    assert.equal(forYou({ stay: 'study', expires: inDays(30) }).permit?.checklist, undefined);
  });

  it('shows no permit date for an EU citizen', () => {
    assert.equal(forYou({ stay: 'eu', expires: inDays(30) }).permit, undefined);
  });

  it('says when something is due in plain words', () => {
    assert.equal(dueLabel(0), 'today');
    assert.equal(dueLabel(1), 'tomorrow');
    assert.equal(dueLabel(5), 'in 5 days');
  });
});

describe('Help’s areas', () => {
  it('each say what they are for, where to go and what CzechLocal can do', () => {
    assert.equal(areas.length, 5);
    for (const a of areas) {
      assert.ok(a.intro.length > 20, `${a.id} has an intro`);
      assert.ok(a.short.length > 0, `${a.id} has a short line`);
      assert.ok(a.entries.length >= 1, `${a.id} has somewhere to go`);
      assert.ok(a.actions.length >= 2, `${a.id} has at least two things CzechLocal can do`);
    }
  });

  it('have unique ids, for areas, entries and actions', () => {
    assert.equal(new Set(areas.map((a) => a.id)).size, areas.length);
    assert.equal(new Set(allEntries.map((e) => e.id)).size, allEntries.length);
    const actions = areas.flatMap((a) => a.actions.map((x) => x.id));
    assert.equal(new Set(actions).size, actions.length);
  });

  it('point at phrase packs that exist', () => {
    for (const a of areas) {
      assert.ok(a.phrases, `${a.id} has phrases`);
      assert.ok(situationById(a.phrases.situation), `${a.id}: no phrase pack "${a.phrases.situation}"`);
    }
  });

  it('only start the camera, a message or a form guide', () => {
    for (const action of areas.flatMap((a) => a.actions)) {
      const path = typeof action.href === 'string' ? action.href : action.href.pathname;
      assert.ok(path === '/camera' || path === '/compose' || path === '/form', `${action.id} goes to ${path}`);
    }
  });
});

describe('Emergency', () => {
  it('leads with 112 and has the three numbers on Help’s first screen', () => {
    assert.equal(emergencyNumbers[0].number, '112');
    for (const n of ['112', '155', '158']) assert.ok(emergencyNumbers.some((e) => e.number === n), n);
  });

  it('has a Czech sentence and its meaning for each phrase', () => {
    assert.ok(emergencyPhrases.length >= 4);
    for (const p of emergencyPhrases) {
      assert.ok(p.cs.trim() && p.en.trim());
    }
    assert.equal(new Set(emergencyPhrases.map((p) => p.cs)).size, emergencyPhrases.length);
  });
});
