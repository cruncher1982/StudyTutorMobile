import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Interactive Tutor Chat API
app.post("/api/tutor/chat", async (req: any, res: any) => {
  try {
    const { messages, contextTopic } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const ai = getGenAI();

    // Set up a structured contextual tutor prompt
    const systemInstruction = `You are "Project Study Tutor", a highly encouraging, friendly, and brilliant personal tutor.
Your goal is to guide the student to master their chosen academic or coding topic.
- Use clean, beautiful Markdown for formatting. Bold key terms using **bold syntax** to establish visual rhythm.
- Avoid overly verbose text. Use concise, bite-sized explanations.
- Ask quick checks for understanding or suggest interactive practice after explaining.
- Do not make calculations or definitions overly dry; use creative, relatable analogies.
- If a subject topic is specified (${contextTopic || "general studies"}), keep your tutoring tightly focused on helping them understand and progress through that topic.`;

    // Process chat messages
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    const reply = response.text || "I was unable to generate a response. Please try reframing your study question!";
    res.json({ content: reply });
  } catch (error: any) {
    console.error("Tutor chat error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. Generate Interactive Study Materials (Flashcards & Summary)
app.post("/api/tutor/generate-flashcards", async (req: any, res: any) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "topic is required" });
    }

    const ai = getGenAI();

    const prompt = `Create a comprehensive set of 5 educational study flashcards and a summarizing overview for the study topic: "${topic}".
Generate high-yield cards for active recall.

Return a JSON object containing the overview and cards. Adhere strictly to the responseSchema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description: "A beautiful, content-rich, 2-3 sentence summary explaining the core concept.",
            },
            flashcards: {
              type: Type.ARRAY,
              description: "An array of exactly 5 flashcards representing high-weight exam topics.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The term, question, or recall challenge." },
                  answer: { type: Type.STRING, description: "The concise explanation or answer for verification." },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: ["overview", "flashcards"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI client");
    }
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Flashcard generation error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 3. Generate Multiple-Choice Quiz
app.post("/api/tutor/generate-quiz", async (req: any, res: any) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "topic is required" });
    }

    const ai = getGenAI();

    const prompt = `Generate an interactive multiple-choice test with exactly 4 high-yield multiple-choice questions on the topic "${topic}" at a "${difficulty || "medium"}" level.
Include exactly 4 options per question, specify the 0-indexed index of the correct answer, and provide a helpful explanation for why the option is correct. All questions must test core concepts.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "The list of multiple choice questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER, description: "1-indexed unique question identifier" },
                  questionText: { type: Type.STRING, description: "The conceptual question." },
                  options: {
                    type: Type.ARRAY,
                    description: "An array of exactly 4 choices.",
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER, description: "The 0-based index of the correct option." },
                  explanation: { type: Type.STRING, description: "A friendly tutor explanation of the correct choice." },
                },
                required: ["id", "questionText", "options", "correctIndex", "explanation"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI client");
    }
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Serve assets with Vite in development, static folder in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files compiled inside /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Tutor backend proxy running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
