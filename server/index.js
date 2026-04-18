import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import developerRoutes from './routes/developers.js';
import teamRoutes from './routes/teams.js';
import onboardingRoutes from './routes/onboarding.js';

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://dyg.gg', 'https://dyg.dev']
    : true
});
await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// NOTE: No auth middleware — this is a portfolio demo with anonymous access.
// In production: JWT via @fastify/jwt, httpOnly cookies, RBAC on team ownership.
fastify.register(developerRoutes);
fastify.register(teamRoutes);
fastify.register(onboardingRoutes);

// Health check
fastify.get('/api/health', async () => ({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`DYG API running on port ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
