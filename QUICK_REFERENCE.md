# Quick Reference Card

## 🚀 Quick Start

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm install
npm run dev

# Open browser
http://localhost:5173
```

## 📁 Project Structure

```
src/
├── components/
│   ├── AssessmentFlow.jsx          # Main orchestrator
│   ├── CodingRound.jsx             # DSA problems + Judge0
│   ├── LiveCodingRound.jsx         # AI interview + coding
│   └── SystemDesignRound.jsx       # Whiteboard + AI chat
├── config/
│   └── api.js                      # API endpoints
└── utils/
    └── apiClient.js                # HTTP client
```

## 🔌 Key API Endpoints

### Start Rounds
```javascript
POST /assessments/{assessmentId}/coding_round/start
POST /assessments/{assessmentId}/live_coding/start
POST /assessments/{assessmentId}/system_design/start
```

### Submit/Update
```javascript
POST /assessments/coding_round/{roundId}/submit
POST /assessments/live_coding/{roundId}/chat
POST /assessments/system_design/{roundId}/diagram
```

### Complete
```javascript
POST /assessments/coding_round/{roundId}/complete
POST /assessments/live_coding/{roundId}/complete
POST /assessments/system_design/{roundId}/complete
```

## 🎨 Component Props

### CodingRound
```jsx
<CodingRound
  assessmentId={string}
  onComplete={(result) => {}}
/>
```

### LiveCodingRound
```jsx
<LiveCodingRound
  assessmentId={string}
  onComplete={(result) => {}}
/>
```

### SystemDesignRound
```jsx
<SystemDesignRound
  assessmentId={string}
  onComplete={(result) => {}}
/>
```

## 🎯 State Structure

### Coding Round
```javascript
{
  roundId: string,
  questions: Array,
  currentQuestionIndex: number,
  code: string,
  language: 'python'|'javascript'|'java'|'cpp',
  testResults: Object,
  timeRemaining: number
}
```

### Live Coding
```javascript
{
  roundId: string,
  messages: Array<{role, content, timestamp}>,
  code: string,
  codeOutput: Object,
  status: Object
}
```

### System Design
```javascript
{
  roundId: string,
  problem: Object,
  messages: Array,
  components: Array<{id, type, x, y, width, height}>,
  currentTool: 'pen'|'rectangle'|'circle'|'select',
  currentPhase: string
}
```

## 🛠️ Whiteboard Tools

### Tools
- **pen** - Free-hand drawing
- **rectangle** - Draw boxes
- **circle** - Draw circles
- **select** - Move components

### Pre-made Components
```javascript
addComponent('server', 'API Server')
addComponent('database', 'PostgreSQL')
addComponent('cache', 'Redis')
addComponent('rectangle', 'Load Balancer')
```

### Component Structure
```javascript
{
  id: 'comp_' + timestamp,
  type: 'server'|'database'|'cache'|'rectangle'|'circle',
  x: number,
  y: number,
  width: number,
  height: number,
  color: '#00ff9d',
  label: 'Component Name',
  connections: ['comp_id1', 'comp_id2']
}
```

## 🎭 Phase Tracking

### System Design Phases
1. **requirements** - Gather requirements
2. **high_level** - Design architecture
3. **data_modeling** - Schema design
4. **deep_dive** - Technical details
5. **tradeoffs** - Analyze trade-offs

## 🎨 Color System

```css
Primary: #00d4ff    /* Accent cyan */
Success: #00ff9d    /* Neon green */
Background: #0a0f1e /* Deep blue */
Surface: #141b2d    /* Darker blue */
Text: #e6e9f0       /* Muted white */
Grid: #1a2332       /* Grid lines */
```

## 📊 Scoring System

### Coding Round
- Overall Score (0-100)
  - Correctness: 40%
  - Optimality: 30%
  - Code Quality: 20%
  - Edge Cases: 10%

### Live Coding
- Overall Score (0-100)
  - Communication: 20%
  - Problem Solving: 25%
  - Technical Depth: 25%
  - Collaboration: 15%
  - Code Quality: 15%

### System Design
- Overall Score (0-100)
  - Requirements: 20%
  - Architecture: 25%
  - Data Modeling: 20%
  - Technical Depth: 20%
  - Trade-offs: 15%

## ⚡ Auto-Transitions

```javascript
if (codingScore >= 50) {
  // Auto-start Live Coding
}

if (liveCodingScore >= 60) {
  // Auto-start System Design
}

if (systemDesignScore >= 60) {
  // Auto-start Behavioral (if implemented)
}
```

## 🐛 Debug Commands

```bash
# Check backend
curl http://localhost:8000/

# Check specific round
curl http://localhost:8000/assessments/{assessmentId}

# Test Judge0
curl -X POST http://localhost:8000/assessments/coding_round/{roundId}/submit \
  -H "Content-Type: application/json" \
  -d '{"assessment_id":"xxx","question_id":"easy_1","language":"python","code":"print(42)"}'

# View API docs
open http://localhost:8000/docs
```

## 🔍 Common Issues

### Backend not connecting
```bash
# Check if running
curl http://localhost:8000/

# Check CORS
# Should see Access-Control-Allow-Origin in response headers
```

### Canvas not rendering
```javascript
// Check canvas ref
console.log(canvasRef.current);

// Check canvas dimensions
console.log(canvas.width, canvas.height);

// Check drawing context
console.log(canvas.getContext('2d'));
```

### Judge0 errors
```javascript
// Check language_id mapping
const LANGUAGE_IDS = {
  'python': 71,
  'javascript': 63,
  'java': 62,
  'cpp': 54
};

// Check API response
console.log(executionResult);
```

## 📦 Environment Variables

```bash
# Frontend .env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_BACKEND_API_URL=http://localhost:8000

# Backend .env
JUDGE0_API_KEY=xxx
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
SAMBA_API_KEY=xxx
SAMBA_BASE_URL=https://api.sambanova.ai/v1
```

## 🧪 Testing Flow

```
1. Create job posting
2. Upload resume
3. View screening results
4. Start assessment
5. Complete Coding Round (3 problems)
6. Complete Live Coding Round
7. Complete System Design Round
8. View final results
```

## 📝 Code Snippets

### API Call Pattern
```javascript
const response = await fetch(`${API_BASE_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

if (!response.ok) throw new Error('API call failed');
const result = await response.json();
```

### Canvas Drawing
```javascript
const ctx = canvas.getContext('2d');
ctx.fillStyle = color;
ctx.fillRect(x, y, width, height);
ctx.strokeRect(x, y, width, height);
```

### State Update Pattern
```javascript
setComponents(prev => [...prev, newComponent]);
setComponents(prev => prev.map((comp, idx) =>
  idx === selectedIndex ? { ...comp, x: newX } : comp
));
```

## 🔐 Security Notes

- ✅ Code execution is sandboxed (Judge0)
- ✅ API keys in environment variables
- ✅ Input sanitization on backend
- ✅ CORS properly configured
- ✅ No sensitive data in frontend

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP.md` - Setup instructions
- `INTEGRATION_GUIDE.md` - Full integration docs
- `INTEGRATION_SUMMARY.md` - What was built
- `ARCHITECTURE.md` - System architecture
- `TESTING_CHECKLIST.md` - Testing guide
- `QUICK_REFERENCE.md` - This file

## 🆘 Help Commands

```bash
# Frontend logs
npm run dev --debug

# Backend logs
python main.py --log-level debug

# Check versions
node --version
python --version
npm --version

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

1. Check browser console for errors
2. Check backend logs
3. Review INTEGRATION_GUIDE.md
4. Test API with Postman
5. Check TESTING_CHECKLIST.md

---

**Tip:** Keep this reference open while developing!

## 🎯 Common Tasks

### Add new problem
```python
# In backend
coding_questions_db["easy_4"] = CodingQuestion(...)
```

### Add new whiteboard component
```javascript
addComponent('custom', 'My Component');
```

### Change scoring weights
```python
# In backend evaluate_code_with_ai()
overall_score = int(
  correctness * 0.4 +
  optimality * 0.3 +
  code_quality * 0.2 +
  edge_cases * 0.1
)
```

### Modify time limits
```javascript
// Coding Round
const [timeRemaining, setTimeRemaining] = useState(5400); // 90 mins

// Live Coding Round
time_limit_minutes: 60

// System Design Round
time_limit_minutes: 60
```

---

**Version:** 1.0.0 | **Last Updated:** 2025-10-18
