const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = "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";

app.use(cors());
app.use(express.json());

app.post('/api/generate-avatar', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: "512x512",
                model: "dall-e-2"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ 
                error: error.error?.message || 'Failed to generate avatar' 
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
