# Tefli AI Service — Dr. Lena Pediatric Assistant

FastAPI service powered by **Groq** (free) + **LLaMA 3** for the Tefli chatbot page.

## Setup (one-time)

### 1. Get a free Groq API key
1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up for a free account
3. Create a new API key and copy it

### 2. Install Python dependencies
Open a terminal inside this `ai/` folder:

```bash
pip install -r requirements.txt
```

### 3. Create your `.env` file
Copy the example and add your key:

```bash
copy .env.example .env
```

Then open `.env` and replace `your_groq_api_key_here` with your real key:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

### 4. Run the server

```bash
uvicorn main:app --reload --port 8000
```

The AI service will be available at `http://localhost:8000`.

---

## Integration

The frontend (`ChatbotPage.tsx`) automatically detects the AI server at startup:
- ✅ **Green dot** — Connected to Groq LLaMA 3 AI
- 🟡 **Amber dot** — Server offline, using local rule-based fallback
- ⚪ **Gray dot** — Checking connection...

You must run **three servers** for the full stack:
| Server | Folder | Command | Port |
|--------|--------|---------|------|
| Frontend | `Tefli/` | `npm run dev` | 5173 |
| Backend (Node.js) | `Tefli/backend/` | `npm run dev` | 5000 |
| AI Service (Python) | `Tefli/ai/` | `uvicorn main:app --reload` | 8000 |
