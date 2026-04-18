import { z } from 'zod';

// --- Shared ---

const VALID_PILLARS = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy'];
const VALID_ARCHETYPES = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor'];
const VALID_STATUSES = ['open', 'staffing', 'building', 'review', 'shipped', 'archived'];
const REVIEW_PILLARS = ['collaboration', 'craft', 'velocity'];

const pillar = z.enum(VALID_PILLARS);
const archetype = z.enum(VALID_ARCHETYPES);
const uuid = z.string().uuid();

// --- Onboarding ---

export const ScanSchema = z.object({
  github_username: z.string()
    .trim()
    .min(1)
    .max(39)
    .regex(/^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?$/i, 'Pseudo GitHub invalide')
}).strip();

export const SaveProfileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  avatar_url: z.string().url().max(500).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  archetype: archetype,
  languages: z.array(z.string().max(50)).max(30).default([]),
  scores: z.array(z.object({
    pillar: pillar,
    score: z.number().int().min(1).max(10)
  })).length(7)
}).strip();

// --- Projects ---

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional().nullable(),
  repo_url: z.string().url().max(500).optional().nullable(),
  max_members: z.number().int().min(2).max(10).default(5)
}).strip();

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  repo_url: z.string().url().max(500).optional().nullable(),
  status: z.enum(VALID_STATUSES).optional()
}).strip();

// --- Reviews ---

const ReviewEntry = z.object({
  user_id: uuid,
  collaboration: z.number().int().min(1).max(5),
  craft: z.number().int().min(1).max(5),
  velocity: z.number().int().min(1).max(5)
});

export const SubmitReviewsSchema = z.object({
  reviews: z.array(ReviewEntry).min(1).max(10)
}).strip();

// --- Messages ---

export const SendMessageSchema = z.object({
  to: uuid,
  body: z.string().trim().min(1).max(2000)
}).strip();

export const ReplyMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000)
}).strip();

// --- Teams ---

export const UpdateTeamSchema = z.object({
  developer_ids: z.array(uuid).max(5)
}).strip();

export const CreateTeamSchema = z.object({
  name: z.string().trim().min(1).max(100).default('My Team'),
  developer_ids: z.array(uuid).max(5)
}).strip();

export { VALID_PILLARS, VALID_ARCHETYPES, VALID_STATUSES, REVIEW_PILLARS };
