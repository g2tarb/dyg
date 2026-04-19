import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import etag from '@fastify/etag';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import env from './config/env.js';
import { DygError } from './utils/errors.js';
import pool from './db/connection.js';
import developerRoutes from './routes/developers.js';
import teamRoutes from './routes/teams.js';
import onboardingRoutes from './routes/onboarding.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import messageRoutes from './routes/messages.js';
import dataRoutes from './routes/data.js';
import reputationRoutes from './routes/reputation.js';
import trainingRoutes from './routes/training.js';
import { decayAbandons } from './services/ban.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = env.NODE_ENV === 'production';

// --- Fastify with structured Pino logging ---
const fastify = Fastify({
  logger: {
    level: isProd ? 'info' : 'debug',
    transport: !isProd ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'body.password',
        'body.token',
        'body.access_token',
        'body.scores'
      ],
      censor: '[REDACTED]'
    }
  },
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  bodyLimit: 1048576 // 1MB
});

// --- Security headers ---
await fastify.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true
});

// --- Compression (gzip/brotli) ---
await fastify.register(compress, { global: true });

// --- ETags (conditional GET) ---
await fastify.register(etag);

// --- CORS ---
const ALLOWED_ORIGINS = new Set([
  'https://dyg.dev', 'https://www.dyg.dev',
  'https://dyg.gg', 'https://www.dyg.gg',
  'https://dyg-olfu.onrender.com'
]);
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean).forEach(o => ALLOWED_ORIGINS.add(o));
}

await fastify.register(cors, {
  origin: isProd
    ? (origin, cb) => {
        if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
        return cb(new Error(`Origin not allowed: ${origin}`), false);
      }
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
});

// --- Rate limiting with IP ban (in-memory) ---
const bannedIPs = new Map();

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  allowList: ['127.0.0.1'],
  onExceeded: (request) => {
    bannedIPs.set(request.ip, Date.now() + 15 * 60 * 1000);
    request.log.warn({ ip: request.ip }, 'IP banned for 15 minutes');
  }
});

// Rate limit IP ban check
fastify.addHook('onRequest', async (request, reply) => {
  const banExpiry = bannedIPs.get(request.ip);
  if (banExpiry) {
    if (Date.now() < banExpiry) {
      return reply.code(403).send({ error: 'FORBIDDEN', message: 'Too many requests. Try again later.' });
    }
    bannedIPs.delete(request.ip);
  }
});

// --- Request ID + Permissions-Policy ---
fastify.addHook('onSend', async (request, reply) => {
  reply.header('X-Request-Id', request.id);
  reply.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');
});

// --- Auth plugins ---
await fastify.register(cookie);
await fastify.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: { cookieName: 'token', signed: false },
  sign: { expiresIn: '15m' }
});

// --- GitHub OAuth ---
if (env.GH_CLIENT_ID && env.GH_CLIENT_ID !== 'your_github_client_id') {
  await fastify.register(oauth2, {
    name: 'githubOAuth2',
    scope: ['read:user', 'user:email'],
    credentials: {
      client: {
        id: env.GH_CLIENT_ID,
        secret: env.GH_CLIENT_SECRET
      },
      auth: oauth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/auth/github',
    callbackUri: env.BASE_URL + '/auth/github/callback'
  });
}

// --- Centralized error handler (Flaynn-grade) ---
fastify.setErrorHandler((error, request, reply) => {
  // Rate limit
  if (error.statusCode === 429) {
    return reply.code(429).send({
      error: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded.'
    });
  }

  // Zod validation
  if (error instanceof z.ZodError) {
    return reply.code(422).send({
      error: 'VALIDATION_FAILED',
      message: 'Invalid data',
      details: error.flatten().fieldErrors
    });
  }

  // Business errors
  if (error instanceof DygError) {
    request.log.warn({ err: error }, `DygError: ${error.code}`);
    return reply.code(error.statusCode).send({
      error: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {})
    });
  }

  // Unhandled
  request.log.error({ err: error }, 'Unhandled error');
  return reply.code(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    reference: request.id
  });
});

// --- Routes ---
fastify.register(developerRoutes);
fastify.register(teamRoutes);
fastify.register(onboardingRoutes);
fastify.register(authRoutes);
fastify.register(projectRoutes);
fastify.register(messageRoutes);
fastify.register(dataRoutes);
fastify.register(reputationRoutes);
fastify.register(trainingRoutes);

// --- Robots.txt ---
fastify.get('/robots.txt', async (request, reply) => {
  reply.header('Content-Type', 'text/plain');
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /admin/
Sitemap: ${env.BASE_URL}/sitemap.xml`;
});

// --- Sitemap ---
fastify.get('/sitemap.xml', async (request, reply) => {
  const base = env.BASE_URL;
  const staticPages = ['', '/about', '/search', '/projects', '/onboarding'];
  const usersResult = await pool.query(
    "SELECT u.github_login, u.updated_at FROM users u JOIN developers d ON d.user_id = u.id"
  );

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += `  <url><loc>${base}/#${page || '/'}</loc><priority>${page === '' ? '1.0' : '0.7'}</priority></url>\n`;
  }
  for (const user of usersResult.rows) {
    const lastmod = user.updated_at ? new Date(user.updated_at).toISOString().split('T')[0] : '';
    xml += `  <url><loc>${base}/#/u/${user.github_login}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<priority>0.6</priority></url>\n`;
  }

  xml += '</urlset>';
  reply.header('Content-Type', 'application/xml');
  return xml;
});

// --- Health check ---
fastify.get('/api/health', async () => {
  try {
    await pool.query('SELECT 1');
    return { status: 'ok', db: 'connected' };
  } catch {
    return { status: 'degraded', db: 'disconnected' };
  }
});

// --- Token garbage collection (hourly) ---
const gcInterval = setInterval(() => {
  // Clean expired banned IPs
  const now = Date.now();
  for (const [ip, expiry] of bannedIPs) {
    if (now > expiry) bannedIPs.delete(ip);
  }
  // Decay abandon counts (12 months without abandon → -1)
  decayAbandons().catch(err => fastify.log.error(err, 'Abandon decay failed'));
}, 60 * 60 * 1000);
gcInterval.unref();

// --- Production: serve built frontend ---
if (isProd) {
  const { existsSync, readdirSync } = await import('fs');
  const distPath = join(__dirname, '..', 'dist');

  fastify.log.info(`Static root: ${distPath} (exists: ${existsSync(distPath)})`);
  if (existsSync(distPath)) {
    try {
      fastify.log.info(`dist contents: ${readdirSync(distPath).join(', ')}`);
      const assetsPath = join(distPath, 'assets');
      if (existsSync(assetsPath)) {
        fastify.log.info(`assets contents: ${readdirSync(assetsPath).join(', ')}`);
      }
    } catch (e) { fastify.log.error(`dist read error: ${e.message}`); }
  }

  await fastify.register(fastifyStatic, {
    root: distPath,
    prefix: '/',
    decorateReply: true
  });

  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/') || request.url.startsWith('/auth/')) {
      return reply.code(404).send({ error: 'NOT_FOUND' });
    }
    return reply.sendFile('index.html');
  });
}

// --- Start ---
try {
  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
  fastify.log.info(`DYG API running on port ${env.PORT}${isProd ? ' (production)' : ''}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
