import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL requis'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères').default('dyg-dev-secret-do-not-use-in-production-' + Date.now()),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY doit faire 64 chars hex').optional(),
  GITHUB_PAT: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GH_CLIENT_ID: z.string().optional(),
  GH_CLIENT_SECRET: z.string().optional(),
  BASE_URL: z.string().url().default('http://localhost:5173'),
});

let env;

try {
  env = envSchema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error('Configuration invalide :');
    for (const issue of err.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    if (process.env.NODE_ENV === 'production') process.exit(1);
    // Dev mode: use defaults
    env = {
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/dyg',
      JWT_SECRET: 'dyg-dev-secret-do-not-use-in-production',
      BASE_URL: 'http://localhost:5173',
    };
  }
}

export default env;
