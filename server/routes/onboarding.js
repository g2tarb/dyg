import { fetchGitHubProfile } from '../services/github.js';
import { determineArchetype } from '../services/scoring.js';
import { buildBio } from '../services/bio.js';
import { ARCHETYPES } from '../constants/archetypes.js';
import { ScanSchema } from '../schemas/validation.js';

async function onboardingRoutes(fastify) {
  fastify.post('/api/onboarding/scan', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    const parsed = ScanSchema.parse(request.body);

    try {
      const profile = await fetchGitHubProfile(parsed.github_username);
      const { primary, secondary } = determineArchetype(profile.scores);
      const archetype = ARCHETYPES[primary];
      const bio = buildBio(profile, archetype.name);

      return {
        username: profile.username,
        name: profile.name,
        avatar_url: profile.avatar_url,
        languages: profile.languages,
        archetype: primary,
        secondary_archetype: secondary,
        archetype_name: archetype.name,
        archetype_description: archetype.description,
        archetype_color: archetype.color,
        bio,
        scores: profile.scores
      };
    } catch (err) {
      request.log.error({ err, username: parsed.github_username }, 'GitHub scan failed');
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'GitHub profile not found' });
    }
  });
}

export default onboardingRoutes;
