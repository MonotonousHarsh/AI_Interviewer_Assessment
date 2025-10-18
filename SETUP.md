# Quick Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8+ (for backend)
- Judge0 API access (for code execution)
- AI/LLM API access (Samba Nova or similar)

## Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create/update `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_BACKEND_API_URL=http://localhost:8000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure backend environment:**
   Create `.env` in backend directory:
   ```
   JUDGE0_API_KEY=your-judge0-api-key
   JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
   SAMBA_API_KEY=your-samba-api-key
   SAMBA_BASE_URL=https://api.sambanova.ai/v1
   ```

3. **Run backend server:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Verifying Setup

### Test Backend
```bash
curl http://localhost:8000/
# Should return: {"message": "AI Interview Platform API"}
```

### Test Frontend
1. Open browser to `http://localhost:5173`
2. Create a job posting
3. Upload a resume
4. Start assessment
5. Complete rounds

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── AssessmentFlow.jsx      # Main assessment orchestrator
│   │   ├── CodingRound.jsx         # DSA coding round
│   │   ├── LiveCodingRound.jsx     # Interactive AI interview
│   │   └── SystemDesignRound.jsx   # System design with whiteboard
│   ├── config/
│   │   └── api.js                  # API configuration
│   ├── App.jsx                     # Main app component
│   └── main.jsx                    # Entry point
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── vite.config.ts                  # Vite configuration
```

## Key Features

### 1. Coding Round
- 3 problems (Easy, Medium, Hard)
- Multi-language support (Python, JavaScript, Java, C++)
- Real-time code execution via Judge0
- AI-powered evaluation
- Detailed feedback and scoring

### 2. Live Coding Round
- Interactive chat with AI interviewer
- Shared code editor
- Progressive interview phases
- Real-time hints and guidance
- Code execution and output display

### 3. System Design Round
- Integrated whiteboard with:
  - Drawing tools (pen, shapes)
  - Pre-made components (server, database, cache)
  - Drag and drop
  - Color customization
- Real-time chat with AI
- Phase-based interview flow
- Automatic diagram saving

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run linter

# Testing
npm run typecheck       # TypeScript type checking
```

## Troubleshooting

### Port Already in Use
```bash
# Frontend (default: 5173)
PORT=3000 npm run dev

# Backend (default: 8000)
uvicorn main:app --reload --port 8001
```

### CORS Issues
Ensure backend has CORS middleware:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Judge0 Connection Issues
- Verify API key is correct
- Check Judge0 base URL
- Test with Postman/curl first
- Check rate limits

### AI API Issues
- Verify API key
- Check model availability
- Monitor rate limits
- Check request/response format

## Environment Variables Explained

### Frontend (.env)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_BACKEND_API_URL` - Backend API base URL

### Backend
- `JUDGE0_API_KEY` - Judge0 RapidAPI key
- `JUDGE0_BASE_URL` - Judge0 API endpoint
- `SAMBA_API_KEY` - Samba Nova AI API key
- `SAMBA_BASE_URL` - Samba Nova API endpoint

## Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting
```

### Backend
```bash
# Using Docker
docker build -t interview-backend .
docker run -p 8000:8000 --env-file .env interview-backend

# Using systemd
sudo systemctl start interview-backend
```

## API Documentation

Once backend is running, visit:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Support & Resources

- **Frontend Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** FastAPI + Python
- **Code Execution:** Judge0
- **AI:** Samba Nova

## Next Steps

1. Start backend server
2. Start frontend dev server
3. Create a job posting
4. Upload a test resume
5. Complete assessment rounds
6. Review results and feedback

---

**Quick Start:**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.
