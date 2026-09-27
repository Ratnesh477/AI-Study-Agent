# AI Study Assistant

A React application that turns any topic into interactive flashcards using AI. Built as a Frontend Internship Assignment.

## Features
- **Free-form text input**: Enter any topic to generate flashcards.
- **AI Integration**: Uses Gemini AI via a secure backend proxy to generate structured JSON data.
- **Robust Error Handling**: Gracefully handles network failures, malformed JSON, missing fields, empty results, and stale responses.
- **Interactive UI**: Flip through flashcards and test your knowledge.
- **Retest Mode**: Collects incorrect answers and allows you to retest them immediately.
- **Responsive Design**: Works on desktop and mobile viewports seamlessly.

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables**
   Create a \`.env\` file in the root directory by copying \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Add your Google Gemini API Key to the \`.env\` file:
   \`\`\`
   GEMINI_API_KEY=your_api_key_here
   \`\`\`

3. **Start the Application**
   Run the full stack (frontend and backend proxy) with a single command:
   \`\`\`bash
   npm start
   \`\`\`
   This will start:
   - Backend API Proxy: \`http://localhost:3001\`
   - Vite Development Server: \`http://localhost:3000\` (or default port)

## AI-Usage Note
For the development of this assignment, I used Google Gemini as the LLM to provide the structured API data. I also utilized an AI coding assistant (Google Antigravity) to help scaffold the Vite project, create component structures, generate CSS styling, and ensure robust error handling patterns. All code logic and architectural decisions have been verified and thoroughly understood by me.

## Known Limitations
- The LLM can occasionally return markdown blocks wrapping the JSON (e.g. \`\`\`json ... \`\`\`). The server attempts a basic cleanup, but if the LLM completely disregards the formatting instructions, it falls back to a structural parsing error on the frontend.
- While the user interface is completely local state-driven, refreshing the page will lose the currently active flashcard deck. (Session persistence was considered as a stretch goal).

## Future Enhancements
If time permitted beyond the 8-hour constraint, the following features would be fantastic additions:
- **Previous Question Paper Analyzer**: Allow users to upload PDFs of past papers, using a server-side parser or Vision API to extract patterns and frequently asked questions.
- **Weak Topic Detection**: Persist user scores across quizzes and automatically flag topics that require spaced repetition.
- **Advanced Spaced Repetition**: Implement a true Leitner system for flashcard testing over weeks/months instead of single sessions.

## Time Spent
Total time spent: ~3 hours.
- Planning & API Shape: 30 mins
- Setup & Backend Proxy: 30 mins
- React Frontend & Components: 1 hour
- Failure Handling & Validation: 30 mins
- Styling & Polish: 30 mins
