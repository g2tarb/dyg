// Génère une bio courte à partir des données GitHub réelles.
// 100% local, déterministe, sans appel à une IA externe.
function buildBio(profile, archetype) {
  const langs = (profile.languages || []).slice(0, 3).join(', ');
  if (langs) return `${langs} developer. ${archetype} profile.`;
  return `${archetype} profile.`;
}

export { buildBio };
