export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};
    const cleanPrompt = String(prompt || '').trim();

    if (!cleanPrompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_API_TOKEN;
    const model = process.env.CF_MODEL || '@cf/black-forest-labs/flux-1-schnell';

    if (!accountId) return res.status(500).json({ error: 'Missing CF_ACCOUNT_ID' });
    if (!apiToken) return res.status(500).json({ error: 'Missing CF_API_TOKEN' });

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ prompt: cleanPrompt })
      }
    );

    const data = await cfRes.json();

    if (!cfRes.ok) {
      return res.status(cfRes.status).json({
        error: data?.errors?.[0]?.message || 'Cloudflare request failed'
      });
    }

    const result = data?.result || data?.data || data;
    const image =
      result?.image ||
      result?.output ||
      result?.images?.[0]?.b64_json ||
      result?.images?.[0]?.url;

    if (!image) {
      return res.status(500).json({ error: 'No image returned from model' });
    }

    return res.status(200).json({ image });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
