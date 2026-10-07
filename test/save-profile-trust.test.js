/**
 * DYG-C1 — Les scores persistés ne doivent jamais provenir du client.
 *
 * La faille : SaveProfileSchema acceptait un tableau `scores` fourni par le
 * client, et la route le persistait tel quel. N'importe quel compte authentifié
 * pouvait donc se fabriquer un profil 10/10 et piloter son archétype.
 *
 * Ce test verrouille le CONTRAT : le schéma de validation ne doit pas laisser
 * passer de scores ni d'archétype venant du client. On teste le schéma plutôt
 * que la route car c'est lui la frontière de confiance — s'il strippe ces
 * champs, la route ne peut structurellement plus les lire.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SaveProfileSchema } from '../server/schemas/validation.js';

const forgedBody = {
  name: 'Attaquant',
  bio: 'Je déclare être un génie.',
  archetype: 'architect',
  languages: ['JavaScript'],
  scores: [
    { pillar: 'code', score: 10 },
    { pillar: 'velocity', score: 10 },
    { pillar: 'craft', score: 10 },
    { pillar: 'collaboration', score: 10 },
    { pillar: 'versatility', score: 10 },
    { pillar: 'creativity', score: 10 },
    { pillar: 'autonomy', score: 10 },
    { pillar: 'ia', score: 10 }
  ]
};

test('save-profile ignore les scores fournis par le client', () => {
  const parsed = SaveProfileSchema.parse(forgedBody);
  assert.equal(
    parsed.scores,
    undefined,
    'Les scores client doivent être strippés par le schéma, jamais persistés.'
  );
});

test('save-profile ignore l\'archétype fourni par le client', () => {
  const parsed = SaveProfileSchema.parse(forgedBody);
  assert.equal(
    parsed.archetype,
    undefined,
    'L\'archétype doit être recalculé côté serveur, pas dicté par le client.'
  );
});

test('save-profile accepte toujours les champs cosmétiques', () => {
  const parsed = SaveProfileSchema.parse(forgedBody);
  assert.equal(parsed.name, 'Attaquant');
  assert.equal(parsed.bio, 'Je déclare être un génie.');
});
