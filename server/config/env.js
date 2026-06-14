import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be 64 hex chars').optional(),
  GITHUB_PAT: z.string().optional(),
  GH_CLIENT_ID: z.string().optional(),
  GH_CLIENT_SECRET: z.string().optional(),
  BASE_URL: z.string().url().default('http://localhost:5173'),
});

let env;

try {
  env = envSchema.parse(process.env);
  if (env.NODE_ENV === 'production' && !env.ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY is required in production (64 hex chars). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error('Configuration invalide :');
    for (const issue of err.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    if (process.env.NODE_ENV === 'production') process.exit(1);
    // Dev mode: use defaults with stable dev secret
    const crypto = await import('crypto');
    env = {
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/dyg',
      JWT_SECRET: process.env.JWT_SECRET || 'dyg-dev-local-secret-32-chars-min-ok',
      BASE_URL: process.env.BASE_URL || 'http://localhost:5173',
      ...process.env
    };
  }
}

export default env;
