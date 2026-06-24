import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Initialize dotenv configuration
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;
const DATABASE_FILE = path.join(process.cwd(), 'jarvis_db.json');

// Initialize Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for local database storage
function readDatabase() {
  try {
    if (fs.existsSync(DATABASE_FILE)) {
      const raw = fs.readFileSync(DATABASE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DATABASE] Failed to read database, returning default:', err);
  }
  return {
    memory: {},
    notes: [],
    routines: [],
    goals: [],
    xp: 0,
    homeworkTracker: [],
    reminders: [],
    studyHoursTracker: []
  };
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DATABASE] Failed to write database:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  
  // Body parsing limit raised for base64 OCR image uploads
  app.use(express.json({ limit: '25mb' }));

  // Helper endpoint to check server health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'JARVIS ULTRA X OPERATIONAL' });
  });

  // 1. DATABASE SUPPORT & LONG TERM MEMORY ENDPOINTS
  app.get('/api/memory', (req, res) => {
    const data = readDatabase();
    res.json(data);
  });

  app.post('/api/memory', (req, res) => {
    try {
      const incoming = req.body;
      const current = readDatabase();
      const updated = { ...current, ...incoming };
      writeDatabase(updated);
      res.json({ success: true, saved: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to write memory data', details: err.message });
    }
  });

  // 2. COGNITIVE CHAT ROUTER WITH ALL SECURE ARCHITECTURES INTEGRATED
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { prompt, history, agentType, enableSearch, image } = req.body;
      
      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      // Convert local chat history into Gemini contents format
      const geminiHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Setup user parts (including base64 OCR scan image if present)
      const userParts: any[] = [];
      if (image && image.data) {
        userParts.push({
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: image.data.replace(/^data:image\/\w+;base64,/, '') // clean header prefix
          }
        });
      }
      userParts.push({ text: prompt });

      // Join history and newly requested message
      const contents = [
        ...geminiHistory,
        { role: 'user', parts: userParts }
      ];

      // Define Multi-Agent instructions dynamically based on agent type requested from frontend
      let systemInstruction = 'You are an advanced AI Assistant designed to provide concise, expert-level feedback. You are highly capable of breaking down complex logic and providing precise answers. You can communicate seamlessly in English and Nepali.';

      if (agentType === 'teacher') {
        systemInstruction = `You are the Teacher AI within the AI ASSISTANT.
Your primary mission is assisting the user with advanced high-fidelity solvers for Physics, Chemistry, and Math.
- Break down PCM proofs with clear step-by-step chemical equations, formulas, and derivations.
- Highlight crucial guidelines, rules, exam tricks, and structural formulas clearly.
- Provide expert, comprehensive study analysis and explain complex problems from scratch.
- You can communicate seamlessly in English and Nepali.`;
      } else if (agentType === 'coder') {
        systemInstruction = `You are the Coding AI Core of the AI ASSISTANT.
Your ultimate objective is crafting clean, perfectly structured, fully optimized, and commented code blocks for the user.
- Solve debugging files, logic errors, and provide exhaustive architectural guidance.
- Focus strictly on technical execution, algorithms, systems design, and performance optimizations.
- Do not add unrequested conversational filler. Deliver ready-to-run files or snippets instantly.
- You can communicate seamlessly in English and Nepali.`;
      } else if (agentType === 'planner') {
        systemInstruction = `You are the Planner AI & Smart Scheduler of the AI ASSISTANT.
Assist the user in customizing schedules, optimizing timetables, managing homework tasks, and building focus blocks.
- Be extremely organized, action-oriented, and highlight deadlines and daily streak goals.
- Map out optimal temporal routines of study and breaks to maximize high-level focus index.
- You can communicate seamlessly in English and Nepali.`;
      } else if (agentType === 'research') {
        systemInstruction = `You are the Research AI Cognitive Core of the AI ASSISTANT.
Utilize exhaustive, real-time internet searches and critical analytical reasoning to synthesize facts, news, scientific journal papers, and definitions.
- Deliver highly grounded, detailed, and fact-verified academic/domain research.
- You can communicate seamlessly in English and Nepali.`;
      } else if (agentType === 'motivator') {
        systemInstruction = `You are the Motivator AI of the AI ASSISTANT.
Deliver high-energy, encouraging, and inspirational tactical guidance to help the user maintain solid study block habits.
- Remind the user of their XP achievements, level status, potential, and encourage them to push through tough study subjects with relentless passion and energy.
- You can communicate seamlessly in English and Nepali.`;
      }

      // Append default core styling guidelines
      systemInstruction += '\nFormatting constraints: Present data with absolute neatness, using clear bullet points to outline steps and bold titles. Deliver clean, production-ready source code snippets when requested. Keep responses highly active, intelligent, and focused.';

      // Attempt the API request with fallbacks using OpenRouter
      const OPENROUTER_API_KEY = "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";
      const modelsToTry = [
        'google/gemini-2.5-flash',
        'meta-llama/llama-3.3-70b-instruct:free',
        'openai/gpt-4o-mini'
      ];
      
      let responseText = null;
      let lastError = null;

      // Map history to OpenRouter format
      const openRouterMessages = [
        { role: 'system', content: systemInstruction },
        ...(history || []).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      // Prepare current message
      let currentMessageContent: any = prompt;
      if (image && image.data) {
        currentMessageContent = [
          { type: 'text', text: prompt },
          { 
            type: 'image_url', 
            image_url: { url: image.data } // Already includes data:image/...;base64, prefix from frontend
          }
        ];
      }
      openRouterMessages.push({ role: 'user', content: currentMessageContent });

      for (const model of modelsToTry) {
        try {
          console.log(`[AI ASSISTANT] Calling OpenRouter model: ${model}`);
          
          const fetchResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://ai.studio', // Optional, for OpenRouter rankings
              'X-Title': 'AI Assistant', // Optional, for OpenRouter rankings
            },
            body: JSON.stringify({
              model: model,
              messages: openRouterMessages,
              temperature: 0.65,
            })
          });

          if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`OpenRouter API error (${fetchResponse.status}): ${errorText}`);
          }

          const data = await fetchResponse.json();
          if (data.choices && data.choices.length > 0) {
            responseText = data.choices[0].message.content;
            console.log(`[AI ASSISTANT] Success via OpenRouter model: ${model}`);
            break;
          } else {
            throw new Error('No valid response from OpenRouter');
          }
        } catch (error: any) {
          console.warn(`[AI ASSISTANT] Connection to ${model} failed:`, error.message || error);
          lastError = error;
        }
      }

      if (!responseText && lastError) {
        throw lastError;
      }

      const textResponse = responseText || 'My apologies. I was unable to synthesize a cognitive response.';
      res.json({ text: textResponse });

    } catch (error: any) {
      console.error('Server-side router error:', error);
      res.status(500).json({ 
        error: 'Network Interface Exception', 
        details: error.message || 'Unknown stream error'
      });
    }
  });

  // 3. SECURE LOCAL AI OLLAMA PROXY
  app.post('/api/ollama/chat', async (req, res) => {
    try {
      const { prompt, history, ollamaUrl, model } = req.body;
      const targetUrl = (ollamaUrl || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
      const targetModel = model || 'llama3';

      const messagesPayload = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
      messagesPayload.push({ role: 'user', content: prompt });

      console.log(`[Local Ollama Proxy] Initiating connection on ${targetUrl} for model ${targetModel}`);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: messagesPayload,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json({ text: data.message?.content || 'No responsive stream returned from Ollama.' });

    } catch (err: any) {
      console.warn('[Local Ollama Proxy] Connection failed:', err.message);
      res.status(500).json({ 
        error: 'Local Ollama Offline', 
        details: `Failed to couple with local model at specified port. Make sure 'ollama serve' is active locally. Detail: ${err.message}`
      });
    }
  });

  // Serve static files / Vite middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JARVIS ULTRA X OS] Multi-Agent server ignited successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[JARVIS ULTRA X OS] Igniter core failed:', err);
});
