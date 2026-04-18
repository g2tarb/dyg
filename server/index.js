import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import developerRoutes from './routes/developers.js';
import teamRoutes from './routes/teams.js';
import onboardingRoutes from './routes/onboarding.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: isProd
    ? ['https://dyg.gg', 'https://dyg.dev']
    : true,
  credentials: true
});
await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Auth plugins
await fastify.register(cookie);
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'dyg-dev-secret-change-in-production',
  cookie: { cookieName: 'token', signed: false }
});

// GitHub OAuth — only register if credentials are configured
if (process.env.GH_CLIENT_ID && process.env.GH_CLIENT_ID !== 'your_github_client_id') {
  await fastify.register(oauth2, {
    name: 'githubOAuth2',
    scope: ['read:user', 'user:email'],
    credentials: {
      client: {
        id: process.env.GH_CLIENT_ID,
        secret: process.env.GH_CLIENT_SECRET
      },
      auth: oauth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/auth/github',
    callbackUri: (process.env.BASE_URL || 'http://localhost:5173') + '/auth/github/callback'
  });
}

// API routes
fastify.register(developerRoutes);
fastify.register(teamRoutes);
fastify.register(onboardingRoutes);
fastify.register(authRoutes);
fastify.register(projectRoutes);

// Health check
fastify.get('/api/health', async () => ({ status: 'ok' }));

// Production: serve built frontend from dist/
if (isProd) {
  await fastify.register(fastifyStatic, {
    root: join(__dirname, '..', 'dist'),
    prefix: '/'
  });

  // SPA fallback: serve index.html for all non-API routes
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/') || request.url.startsWith('/auth/')) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html');
  });
}

const PORT = process.env.PORT || 3001;

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`DYG API running on port ${PORT}${isProd ? ' (production)' : ''}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
