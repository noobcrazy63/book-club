const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

app.use(cors());
app.use(express.json());

// API routes MUST come BEFORE static file serving
app.post('/api/generate-avatar', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Check if API key is set
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ 
                error: 'OPENAI_API_KEY is not set. Please set the environment variable.' 
            });
        }

        console.log('Calling OpenAI API with prompt:', prompt);
        
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

        console.log('OpenAI response status:', response.status);
        const data = await response.json();
        console.log('OpenAI response:', data);

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'Failed to generate avatar' 
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Static files AFTER API routes
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`OPENAI_API_KEY is ${OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
});
