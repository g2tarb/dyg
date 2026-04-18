import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import developerRoutes from './routes/developers.js';
import teamRoutes from './routes/teams.js';
import onboardingRoutes from './routes/onboarding.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

// --- Startup validation ---
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'dyg-change-this-secret-in-production') {
  if (isProd) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters in production.');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  } else {
    console.warn('WARNING: Using weak JWT secret. Set JWT_SECRET (32+ chars) in .env for production.');
  }
}

const fastify = Fastify({ logger: true });

// Security headers
await fastify.register(helmet, {
  contentSecurityPolicy: isProd ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      imgSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

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
  secret: jwtSecret || 'dyg-dev-secret-do-not-use-in-prod-' + crypto.randomBytes(16).toString('hex'),
  cookie: { cookieName: 'token', signed: false }
});

// GitHub OAuth
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
fastify.register(messageRoutes);

// Health check
fastify.get('/api/health', async () => ({ status: 'ok' }));

// Production: serve built frontend
if (isProd) {
  await fastify.register(fastifyStatic, {
    root: join(__dirname, '..', 'dist'),
    prefix: '/'
  });

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
