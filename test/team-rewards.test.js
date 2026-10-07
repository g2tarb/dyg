/**
 * DYG-H1 — Les récompenses de ship exigent une vraie équipe.
 *
 * Un projet solo ne doit conférer ni points DYG, ni badge de ship, ni compter
 * dans five-shipped. Le prédicat `teamRewardsEligible` est le point de décision
 * unique partagé par les trois chokepoints (closing.js, projects.js, badges.js) ;
 * on le verrouille ici. Les effets DB (award réel) relèvent d'un test
 * d'intégration, qui attend le harnais app-factory (voir suivi).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teamRewardsEligible, MIN_TEAM_SIZE_FOR_REWARDS } from '../server/constants/shared.js';

test('le seuil d\'équipe est bien de 2', () => {
  assert.equal(MIN_TEAM_SIZE_FOR_REWARDS, 2);
});

test('un projet solo (1 membre) ne confère aucune récompense', () => {
  assert.equal(teamRewardsEligible(1), false);
  assert.equal(teamRewardsEligible(0), false);
});

test('un projet à 2 membres ou plus confère les récompenses', () => {
  assert.equal(teamRewardsEligible(2), true);
  assert.equal(teamRewardsEligible(5), true);
});

test('les entrées non entières ou négatives sont rejetées', () => {
  assert.equal(teamRewardsEligible(1.9), false);
  assert.equal(teamRewardsEligible(-3), false);
  assert.equal(teamRewardsEligible(NaN), false);
  assert.equal(teamRewardsEligible('2'), false);
});
