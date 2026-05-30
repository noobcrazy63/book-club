module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.WISGATE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "WISGATE_API_KEY is not set" });
    }

    const response = await fetch("https://api.wisgate.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const raw = await response.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {}

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || raw || "Image generation failed"
      });
    }

    const image = data.data?.[0] || data.data?.[0]?.url || null;

    if (data.data?.[0]?.b64_json) {
      return res.status(200).json({
        dataUrl: `data:image/png;base64,${data.data[0].b64_json}`
      });
    }

    if (data.data?.[0]?.url) {
      return res.status(200).json({
        dataUrl: data.data[0].url
      });
    }

    if (typeof image === "string") {
      return res.status(200).json({
        dataUrl: image
      });
    }

    return res.status(500).json({ error: "Unsupported image response format" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
