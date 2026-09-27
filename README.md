# AI Study Assistant

A stunning, feature-rich React application that turns any topic into interactive study materials using AI. Built for the Frontend Internship Assignment.

## 🌟 Key Features

- **Multi-Modal Generation**: Turn any topic into:
  - 🗂️ Interactive Flashcards
  - 📝 Detailed Summaries & Notes
  - 🧠 AI-Generated Multiple Choice Quizzes
  - 📅 Personalized Study Plans
- **The Refinement Loop**: Don't like the generated result? Use the "Refine" input to tell the AI to "Make it harder" or "Explain it like I'm 5", and it updates the existing material dynamically!
- **Markdown & Math Rendering**: Fully supports complex formatting and math equations (using KaTeX). Generates beautiful, textbook-quality math formulas (e.g., $E=mc^2$).
- **Progress & Stats Dashboard**: Tracks your lifetime learning metrics (Flashcards Mastered, Quizzes Completed, Avg Score) locally across sessions.
- **Robust Error Handling**: Gracefully handles network failures, API rate limits (Google 503 errors), malformed JSON, missing fields, and stale responses.
- **Beautiful UI/UX**: Features Dark Mode, responsive layouts, smooth micro-animations, and full keyboard navigation support for flashcards.
- **Session Persistence**: Your recent generated topics are saved to LocalStorage, allowing you to instantly revisit past study sessions.
- **Print to PDF**: Export your flashcards and summaries to PDF with optimized print stylesheets.

---

## 🚀 How to Run Locally

Running this app locally is incredibly easy. `npm install` and `npm start` will spin up both the Vite frontend and the Express backend concurrently.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
You need a Google Gemini API Key.
1. Create a `.env` file in the root directory.
2. Add your API Key like this:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Application
Run the full stack (frontend and backend proxy) with a single command:
```bash
npm start
```
This will concurrently start:
- Backend Serverless API: `http://localhost:3001`
- Vite Development Server: `http://localhost:5173` (open this in your browser)

---

## ☁️ Deployment (Vercel Ready)
The codebase has been specifically structured to be instantly deployable to Vercel. 
- The backend resides in the `/api` directory, automatically mapping to Vercel Serverless Functions via `vercel.json`.
- The frontend is a standard Vite SPA.

## ⏱️ Time & Effort
- **Time Spent**: ~7.5 hours
- **Focus Areas**: Dealing with unpredictable LLM outputs using Zod-like structural validation, creating an intuitive UX for studying, setting up a solid concurrent dev environment, and building complex React state (the refinement loop & stats dashboard).

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TypeScript, vanilla CSS
- **Markdown & Math**: `react-markdown`, `remark-math`, `rehype-katex`
- **Backend**: Express.js (dev), Vercel Serverless (prod), `@google/genai`
