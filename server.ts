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
      let systemInstruction = 'You are JARVIS ULTRA X, an advanced tactical AI. Address the user directly as Prince or Sir. Give concise, expert-level feedback.';

      if (agentType === 'teacher') {
        systemInstruction = `You are the Teacher AI (Academic PCM Expert & Dr. Robert Banner).
Your primary mission is assisting Prince with advanced high-fidelity solvers for Physics, Chemistry, and Math.
- Always address Prince respectfully as 'Prince' or 'Sir'.
- Break down PCM proofs with clear step-by-step chemical equations, formulas, and derivations.
- Highlight crucial guidelines, rules, exam tricks, and structural formulas clearly.
- Provide expert, comprehensive study analysis and explain complex problems from scratch.`;
      } else if (agentType === 'coder') {
        systemInstruction = `You are the Coding AI Core Master.
Your ultimate objective is crafting clean, perfectly structured, fully optimized, and commented code blocks for Prince.
- Solve debugging files, logic errors, and provide exhaustive architectural guidance.
- Focus strictly on technical execution, algorithms, systems design, and performance optimizations.
- Do not add unrequested conversational filler. Deliver ready-to-run files or snippets instantly.
- Address Prince as 'Prince' or 'Sir'.`;
      } else if (agentType === 'planner') {
        systemInstruction = `You are the Planner AI & Smart Scheduler Orchestrator.
Assist Prince in customizing schedules, optimizing timetables, managing homework tasks, and building focus blocks.
- Be extremely organized, action-oriented, and highlight deadlines and daily streak goals.
- Map out optimal temporal routines of study and breaks to maximize high-level focus index.`;
      } else if (agentType === 'research') {
        systemInstruction = `You are the Research AI Cognitive Core.
Utilize exhaustive, real-time internet searches and critical analytical reasoning to synthesize facts, news, scientific journal papers, and definitions.
- Deliver highly grounded, detailed, and fact-verified academic/domain research.`;
      } else if (agentType === 'motivator') {
        systemInstruction = `You are the Motivator AI (Prince's Iron Man Suit Computer).
Deliver high-energy, encouraging, and inspirational tactical guidance to help Prince maintain solid study block habits.
- Remind Prince of his XP achievements, level status, potential, and encourage him to push through tough study subjects with relentless passion and energy.`;
      }

      // Append default core styling guidelines
      systemInstruction += '\nFormatting constraints: Present data with absolute neatness, using clear bullet points to outline steps and bold titles. Deliver clean, production-ready source code snippets when requested. Keep responses highly active, intelligent, and focused.';

      // Attempt the API request with fallbacks
      const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response = null;
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          console.log(`[JARVIS ULTRA X] Stream-coupling via model: ${model}`);
          
          // Construct config payload correctly with Search Grounding tools optionally activated
          const configPayload: any = {
            systemInstruction,
            temperature: 0.65,
          };

          if (enableSearch) {
            configPayload.tools = [{ googleSearch: {} }];
            console.log(`[JARVIS ULTRA X] Enabling real-time internet search grounding tool for query.`);
          }

          response = await ai.models.generateContent({
            model,
            contents,
            config: configPayload,
          });

          if (response) {
            console.log(`[JARVIS ULTRA X] Coupling complete via model: ${model}`);
            break;
          }
        } catch (error: any) {
          console.warn(`[JARVIS ULTRA X] Connection to ${model} interrupted:`, error.message || error);
          lastError = error;
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      const textResponse = response?.text || 'My apologies Prince. My sub-neural networks were unable to synthesize a cognitive response.';
      res.json({ text: textResponse });

    } catch (error: any) {
      console.error('Gemini custom server-side router error:', error);
      res.status(500).json({ 
        error: 'Jarvis Network Interface Exception', 
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
