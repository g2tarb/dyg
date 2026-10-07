// Single source of truth for all constants shared across the app
// Import from here, not from archetypes.js or validation.js

export const VALID_ARCHETYPES = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'];
export const VALID_PILLARS = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy', 'ia'];
export const REVIEW_PILLARS = ['collaboration', 'craft', 'velocity'];
export const VALID_STATUSES = ['open', 'staffing', 'building', 'review', 'shipped', 'archived'];
export const GITHUB_USERNAME_RE = /^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?$/i;

// DYG-H1 : un projet « shippé » ne confère de récompenses d'équipe (points DYG,
// badges de ship, décompte five-shipped) que s'il a réellement réuni une équipe.
// Sans ce seuil, n'importe qui pouvait farmer badges et points avec des projets
// solo bidon. 2 = le minimum pour qu'« équipe » ait un sens.
export const MIN_TEAM_SIZE_FOR_REWARDS = 2;

export function teamRewardsEligible(memberCount) {
  return Number.isInteger(memberCount) && memberCount >= MIN_TEAM_SIZE_FOR_REWARDS;
}
