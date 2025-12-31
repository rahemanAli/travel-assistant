import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import aiHandler from './api/ai.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Parse JSON bodies (same as Vercel)
app.use(express.json());

// Serve Static Files (Frontend)
app.use(express.static(__dirname));

// Mock Vercel Request/Response for the API handler
// Vercel serverless functions export default async (req, res) => { ... }
// Express uses (req, res) too, but Vercel's `res.status().json()` chain is supported by Express.
app.post('/api/ai', async (req, res) => {
    try {
        await aiHandler(req, res);
    } catch (err) {
        console.error('Local API Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Local Server Error', details: err.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`
  🚀 Local Travel Assistant running at: http://localhost:${PORT}
  
  👉 Ensure you have created a .env file with GEMINI_API_KEY=...
  `);
});
