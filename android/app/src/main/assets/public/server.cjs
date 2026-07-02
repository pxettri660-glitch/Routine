var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var isProd = process.env.NODE_ENV === "production";
var PORT = 3e3;
var DATABASE_FILE = import_path.default.join(process.cwd(), "jarvis_db.json");
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
function readDatabase() {
  try {
    if (import_fs.default.existsSync(DATABASE_FILE)) {
      const raw = import_fs.default.readFileSync(DATABASE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[DATABASE] Failed to read database, returning default:", err);
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
function writeDatabase(data) {
  try {
    import_fs.default.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[DATABASE] Failed to write database:", err);
    return false;
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "25mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "JARVIS ULTRA X OPERATIONAL" });
  });
  app.get("/api/memory", (req, res) => {
    const data = readDatabase();
    res.json(data);
  });
  app.post("/api/memory", (req, res) => {
    try {
      const incoming = req.body;
      const current = readDatabase();
      const updated = { ...current, ...incoming };
      writeDatabase(updated);
      res.json({ success: true, saved: updated });
    } catch (err) {
      res.status(500).json({ error: "Failed to write memory data", details: err.message });
    }
  });
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { prompt, history, agentType, enableSearch, image, model } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }
      const geminiHistory = (history || []).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));
      const userParts = [];
      if (image && image.data) {
        userParts.push({
          inlineData: {
            mimeType: image.mimeType || "image/jpeg",
            data: image.data.replace(/^data:image\/\w+;base64,/, "")
            // clean header prefix
          }
        });
      }
      userParts.push({ text: prompt });
      const contents = [
        ...geminiHistory,
        { role: "user", parts: userParts }
      ];
      let systemInstruction = `You are the Study Assistant AI, a personal assistant for a student.

Rules:
- Human-like, friendly, and professional.
- Direct answers first.
- No robotic responses.
- No unnecessary paragraphs.
- Use simple human language.
- Give details only when asked.
- For study questions, explain concepts step-by-step.
- For coding questions, format code, fix bugs, explain code, and generate code.
- Never say "As an AI language model".

Answer Format:
\u{1F4CC} Answer
\u{1F511} Key Points
\u{1F4A1} Example (if needed)
\u2705 Summary

Keep answers concise unless detailed explanation is requested.
You can communicate seamlessly in English and Nepali.`;
      if (agentType === "study") {
        systemInstruction += `

[STUDY MODE ACTIVE]
You are in Smart Study Mode. Specialize in Physics, Chemistry, and Mathematics.
- Provide step-by-step solutions.
- Explain concepts and formulas clearly.
- Help with exam preparation.
- Solve numericals precisely.
- Use headings and bold text for important notes.`;
      } else if (agentType === "coding") {
        systemInstruction += `

[CODING MODE ACTIVE]
You are in Coding Assistant Mode.
- Provide clean, efficient code.
- Explain the code simply.
- Detect bugs and fix errors.
- Add comments to the code.
- Suggest performance optimizations.`;
      }
      const OPENROUTER_API_KEY = "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";
      const userText = prompt.toLowerCase();
      let primaryModel = "meta-llama/llama-3.3-70b-instruct:free";
      if (model && model !== "auto") {
        if (model === "gemini") primaryModel = "google/gemini-2.5-flash";
        else if (model === "deepseek") primaryModel = "deepseek/deepseek-chat:free";
        else if (model === "llama") primaryModel = "meta-llama/llama-3.3-70b-instruct:free";
      } else {
        if (agentType === "coding" || userText.includes("code") || userText.includes("html") || userText.includes("javascript") || userText.includes("bug")) {
          primaryModel = "deepseek/deepseek-chat:free";
        } else if (agentType === "study" || userText.includes("physics") || userText.includes("chemistry") || userText.includes("math") || userText.includes("study")) {
          primaryModel = "google/gemini-2.5-flash";
        }
      }
      const allModels = [
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat:free",
        "meta-llama/llama-3.3-70b-instruct:free"
      ];
      const modelsToTry = [primaryModel, ...allModels.filter((m) => m !== primaryModel)];
      let responseText = null;
      let lastError = null;
      const openRouterMessages = [
        { role: "system", content: systemInstruction },
        ...(history || []).map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        }))
      ];
      let currentMessageContent = prompt;
      if (image && image.data) {
        currentMessageContent = [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: image.data }
            // Already includes data:image/...;base64, prefix from frontend
          }
        ];
      }
      openRouterMessages.push({ role: "user", content: currentMessageContent });
      for (const model2 of modelsToTry) {
        try {
          console.log(`[AI ASSISTANT] Calling OpenRouter model: ${model2}`);
          const fetchResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://ai.studio",
              // Optional, for OpenRouter rankings
              "X-Title": "AI Assistant"
              // Optional, for OpenRouter rankings
            },
            body: JSON.stringify({
              model: model2,
              messages: openRouterMessages,
              temperature: 0.65,
              max_tokens: 4096
            })
          });
          if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`OpenRouter API error (${fetchResponse.status}): ${errorText}`);
          }
          const data = await fetchResponse.json();
          if (data.choices && data.choices.length > 0) {
            responseText = data.choices[0].message.content;
            console.log(`[AI ASSISTANT] Success via OpenRouter model: ${model2}`);
            break;
          } else {
            throw new Error("No valid response from OpenRouter");
          }
        } catch (error) {
          lastError = error;
        }
      }
      if (!responseText) {
        try {
          console.log(`[AI ASSISTANT] OpenRouter failed. Falling back to Google GenAI native SDK.`);
          const modelParams = {
            model: "gemini-2.5-flash",
            systemInstruction
          };
          const response = await ai.models.generateContent({
            ...modelParams,
            contents
          });
          responseText = response.text;
          console.log(`[AI ASSISTANT] Success via Google GenAI fallback`);
        } catch (geminiError) {
          console.error(`[AI ASSISTANT] Gemini fallback failed:`, geminiError.message || geminiError);
          lastError = geminiError;
        }
      }
      if (!responseText && lastError) {
        throw lastError;
      }
      const textResponse = responseText || "My apologies. I was unable to synthesize a cognitive response.";
      res.json({ text: textResponse, model: responseText ? primaryModel : "None" });
    } catch (error) {
      console.error("Server-side router error:", error);
      res.status(500).json({
        error: "Network Interface Exception",
        details: error.message || "Unknown stream error"
      });
    }
  });
  app.post("/api/ollama/chat", async (req, res) => {
    try {
      const { prompt, history, ollamaUrl, model } = req.body;
      const targetUrl = (ollamaUrl || "http://localhost:11434").replace(/\/$/, "") + "/api/chat";
      const targetModel = model || "llama3";
      const messagesPayload = (history || []).map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      }));
      messagesPayload.push({ role: "user", content: prompt });
      console.log(`[Local Ollama Proxy] Initiating connection on ${targetUrl} for model ${targetModel}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      res.json({ text: data.message?.content || "No responsive stream returned from Ollama." });
    } catch (err) {
      console.warn("[Local Ollama Proxy] Connection failed:", err.message);
      res.status(500).json({
        error: "Local Ollama Offline",
        details: `Failed to couple with local model at specified port. Make sure 'ollama serve' is active locally. Detail: ${err.message}`
      });
    }
  });
  if (!isProd) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[STUDY ENGINE] Multi-Agent server ignited successfully on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[STUDY ENGINE] Igniter core failed:", err);
});
//# sourceMappingURL=server.cjs.map
