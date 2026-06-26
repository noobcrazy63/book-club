export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing POLLINATIONS_API_KEY' });
    }

    const cleanPrompt = prompt.trim();
    const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(cleanPrompt)}?key=${encodeURIComponent(apiKey)}`;

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('generate-image error:', error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}
