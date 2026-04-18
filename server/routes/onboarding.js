import { fetchGitHubProfile } from '../services/github.js';
import { determineArchetype } from '../services/scoring.js';
import { generateBio } from '../services/gemini.js';
import { ARCHETYPES } from '../constants/archetypes.js';

async function onboardingRoutes(fastify) {
  // POST /api/onboarding/scan — rate limited to prevent GitHub/Gemini API abuse
  fastify.post('/api/onboarding/scan', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const { github_username } = request.body;

    if (!github_username) {
      return reply.code(400).send({ error: 'github_username is required' });
    }

    try {
      const profile = await fetchGitHubProfile(github_username);
      const archetypeKey = determineArchetype(profile.scores);
      const archetype = ARCHETYPES[archetypeKey];
      const bio = await generateBio(profile, archetype.name);

      return {
        username: profile.username,
        name: profile.name,
        avatar_url: profile.avatar_url,
        languages: profile.languages,
        archetype: archetypeKey,
        archetype_name: archetype.name,
        archetype_description: archetype.description,
        archetype_color: archetype.color,
        bio,
        scores: profile.scores
      };
    } catch (err) {
      return reply.code(404).send({ error: 'GitHub profile not found or API error' });
    }
  });
}

export default onboardingRoutes;
