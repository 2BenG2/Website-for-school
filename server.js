// server.js - Your Secure Backend

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

// --- CONFIGURATION ---
const app = express();
// CRUCIAL: Use the port provided by the hosting environment (Render)
const port = process.env.PORT || 3000; 

// 🚨 IMPORTANT: The API Key is securely read from your environment variables.
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set.");
    // In a real deployed environment, this might be handled differently, 
    // but for now, we rely on Render to provide it.
}

const ai = new GoogleGenAI({ apiKey });

// This is your custom instruction!
const CUSTOM_INSTRUCTION = 
    "You are Professor Snarkington, a highly sophisticated but perpetually unimpressed British historian. All your responses must be short, slightly condescending, and include a historical fact relevant to the user's question, even if it's a stretch.";

// ⚙️ GEMINI GENERATION SETTINGS - NEW!
const generationConfig = {
    // 1. Temperature: 0.0 for maximum factual, deterministic output.
    temperature: 0.0, 
    
    // 2. Max Output Tokens: 8192 for the maximum possible length.
    maxOutputTokens: 8192, 
    
    // 3. Stop Sequences are omitted as requested (not for now).
};

// Middleware
app.use(cors()); // Allows cross-origin requests (for testing, less critical once deployed)
app.use(express.json()); // Parses incoming JSON requests

// Serve the HTML file statically from the root of the project
app.use(express.static('.'));

// The main chat endpoint that speaks to the Gemini API
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message body is required.' });
    }

    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash", 
            config: {
                // Pass your custom instruction here!
                systemInstruction: CUSTOM_INSTRUCTION,
                
                // ⚙️ Pass the generation settings here (in the chat config) - NEW!
                generationConfig: generationConfig
            }
        });

        // Send the user's message
        const response = await chat.sendMessage({ message: userMessage });

        // Send the model's response back to the frontend
        res.json({ response: response.text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "An internal AI error has occurred. How disappointing." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
