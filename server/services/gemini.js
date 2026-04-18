import dotenv from 'dotenv';

dotenv.config();

async function generateBio(profile, archetype) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key') {
    return `Développeur ${profile.languages.slice(0, 3).join(', ')}. Profil ${archetype}.`;
  }

  const prompt = `Tu es un rédacteur de profils pour une plateforme de développeurs jeux vidéo.
Génère une bio de 2 lignes max pour ce développeur. Ton direct, assertif, pas de flatterie.

Données :
- Pseudo : ${profile.username}
- Langages : ${profile.languages.join(', ')}
- Archétype : ${archetype}
- Nombre de repos : ${profile.scores.length}

Réponds uniquement avec la bio, rien d'autre.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!res.ok) {
    console.error(`Gemini API error: ${res.status} ${res.statusText}`);
    return `Développeur ${profile.languages.slice(0, 3).join(', ')}. Profil ${archetype}.`;
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    `Développeur ${profile.languages.slice(0, 3).join(', ')}. Profil ${archetype}.`;
}

export { generateBio };
