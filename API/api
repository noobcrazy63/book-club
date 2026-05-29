export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Image generation failed"
      });
    }

    const image = data.data?.[0];
    if (!image) {
      return res.status(500).json({ error: "No image returned" });
    }

    if (image.b64_json) {
      return res.status(200).json({
        dataUrl: `data:image/png;base64,${image.b64_json}`
      });
    }

    if (image.url) {
      const imgRes = await fetch(image.url);
      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return res.status(200).json({
        dataUrl: `data:image/png;base64,${base64}`
      });
    }

    return res.status(500).json({ error: "Unsupported image response format" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
