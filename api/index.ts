import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Google Gen AI with the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

function parseGenAIError(error: any): string {
  let msg = error.message || 'An unknown error occurred';
  try {
    const match = msg.match(/\{.*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.error && parsed.error.message) {
        return parsed.error.message;
      }
    }
  } catch (e) {
    // Ignore parse errors and fallback to original message
  }
  return msg;
}

// Endpoint to generate study material
app.post('/api/generate', async (req, res) => {
  const { topic, mode = 'flashcards' } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let shapeInstructions = '';
    if (mode === 'flashcards') {
      shapeInstructions = `{ 
  "type": "flashcards",
  "topic": "${topic}",
  "cards": [{ "id": "uuid", "question": "string", "answer": "string" }]
}`;
    } else if (mode === 'summary') {
      shapeInstructions = `{
  "type": "summary",
  "topic": "${topic}",
  "shortSummary": "string (1 paragraph)",
  "keyPoints": ["string"],
  "definitions": [{ "term": "string", "definition": "string" }]
}`;
    } else if (mode === 'mcq') {
      shapeInstructions = `{
  "type": "mcq",
  "topic": "${topic}",
  "questions": [{ "id": "uuid", "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": "exact string matching one of the options" }]
}`;
    } else if (mode === 'plan') {
      shapeInstructions = `{
  "type": "plan",
  "topic": "${topic}",
  "days": [{ "day": "string (e.g., Oct 12)", "sessions": [{ "topic": "string", "duration": "string", "focus": "string (e.g., revision, new concept)" }] }]
}`;
    }

    const prompt = `You are a study assistant.
User requested topic: "${topic}"
Generate appropriate study material for this topic in the requested format.

Return ONLY valid JSON matching this exact shape, no prose, no markdown code blocks formatting, just the raw JSON:
${shapeInstructions}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    const text = response.text;

    // Attempt basic cleanup just in case the model returns markdown formatting like ```json ... ```
    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7);
    }
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.slice(0, -3);
    }
    jsonString = jsonString.trim();

    // Verify it is parsable JSON before sending it to the client
    // We let the client handle structural validation, but we ensure it's not completely broken here
    // Or we just pass the text and let the frontend parse it. The requirements say:
    // "Parsing and validating unpredictable model output before it ever reaches your UI"
    // We can do it on frontend. We will just send it as raw response.

    res.json({ result: jsonString });

  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: parseGenAIError(error) });
  }
});

app.post('/api/refine', async (req, res) => {
  const { currentData, instruction } = req.body;
  if (!currentData || !instruction) {
    return res.status(400).json({ error: 'currentData and instruction are required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let shapeInstructions = '';
    if (currentData.type === 'flashcards') {
      shapeInstructions = `{ 
  "type": "flashcards",
  "topic": "string",
  "cards": [{ "id": "uuid", "question": "string", "answer": "string" }]
}`;
    } else if (currentData.type === 'summary') {
      shapeInstructions = `{
  "type": "summary",
  "topic": "string",
  "shortSummary": "string",
  "keyPoints": ["string"],
  "definitions": [{ "term": "string", "definition": "string" }]
}`;
    } else if (currentData.type === 'mcq') {
      shapeInstructions = `{
  "type": "mcq",
  "topic": "string",
  "questions": [{ "id": "uuid", "question": "string", "options": ["string"], "correctAnswer": "string" }]
}`;
    } else if (currentData.type === 'plan') {
      shapeInstructions = `{
  "type": "plan",
  "topic": "string",
  "days": [{ "day": "string", "sessions": [{ "topic": "string", "duration": "string", "focus": "string" }] }]
}`;
    }

    const prompt = `You are a study assistant that updates study materials.
Here is the existing material for topic "${currentData.topic}":
${JSON.stringify(currentData, null, 2)}

The user provided the following refinement instruction: "${instruction}"

Apply the user's instruction to the material (add, remove, or modify). 
Return ONLY valid JSON matching this exact shape, no prose, no markdown code blocks formatting, just the raw JSON:
${shapeInstructions}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    const text = response.text;

    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
    jsonString = jsonString.trim();

    res.json({ result: jsonString });

  } catch (error: any) {
    console.error('Error refining content:', error);
    res.status(500).json({ error: parseGenAIError(error) });
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
