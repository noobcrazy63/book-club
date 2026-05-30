const CF_ACCOUNT_ID = '8274e2b1f05f63c555216671bc77d9a9';
const CF_API_TOKEN = 'cfut_RmTtHV5qqOMcHZkEOBMycMzrntfWqJ11EmmHutSD19df8909';
const CF_MODEL = '@cf/black-forest-labs/flux-1-schnell';

function sanitizePrompt(text) {
  return (text || '').trim().replace(/\s+/g, ' ').slice(0, 140);
}

function buildAvatarPrompt(name) {
  const clean = sanitizePrompt(name) || 'Reader';
  return `Create a friendly profile avatar for a summer book club user named ${clean}. Make it a polished, colorful, high-quality portrait suitable for a circular profile picture. Bright background, friendly expression, clean composition.`;
}

async function generateAvatarFromPrompt(prompt) {
  if (!CF_ACCOUNT_ID || CF_ACCOUNT_ID === '8274e2b1f05f63c555216671bc77d9a9') {
    throw new Error('Cloudflare Account ID is not set.');
  }
  if (!CF_API_TOKEN || CF_API_TOKEN === 'cfut_RmTtHV5qqOMcHZkEOBMycMzrntfWqJ11EmmHutSD19df8909') {
    throw new Error('Cloudflare API token is not set.');
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CF_API_TOKEN}`
      },
      body: JSON.stringify({
        prompt,
        image_size: '1024x1024'
      })
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.message || 'Avatar generation failed');
  }

  const result = data?.result || data?.data || data;
  const image =
    result?.image ||
    result?.images?.[0]?.b64_json ||
    result?.images?.[0]?.url ||
    result?.output ||
    result?.response;

  if (!image) throw new Error('No avatar returned');

  if (typeof image === 'string' && image.startsWith('http')) return image;
  if (typeof image === 'string' && image.startsWith('data:')) return image;
  if (typeof image === 'string') return `data:image/png;base64,${image}`;

  if (Array.isArray(image) && image[0]) {
    const first = image[0];
    if (typeof first === 'string' && first.startsWith('http')) return first;
    if (typeof first === 'string') return `data:image/png;base64,${first}`;
  }

  throw new Error('Unsupported image response');
}

export { buildAvatarPrompt, generateAvatarFromPrompt };
