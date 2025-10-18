# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                     http://localhost:5173                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Hero     │→ │ Job Form   │→ │  Resume Upload       │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                                            ↓                  │
│                                   ┌──────────────────────┐  │
│                                   │ Screening Results    │  │
│                                   └──────────────────────┘  │
│                                            ↓                  │
│                                   ┌──────────────────────┐  │
│                                   │ Assessment Flow      │  │
│                                   └──────────────────────┘  │
│                                            ↓                  │
│               ┌────────────────────────────────────┐         │
│               │         Round Router               │         │
│               └────────────────────────────────────┘         │
│                        ↓         ↓          ↓                │
│          ┌─────────────┴──────┬──┴──────┬──┴──────────┐    │
│          │                    │         │              │    │
│   ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│   │ Coding Round │  │ Live Coding │  │ System Design    │ │
│   │              │  │   Round     │  │    Round         │ │
│   │ - 3 Problems │  │ - AI Chat   │  │ - Whiteboard     │ │
│   │ - Editor     │  │ - Editor    │  │ - AI Chat        │ │
│   │ - Judge0     │  │ - Execute   │  │ - Drawing Tools  │ │
│   │ - AI Eval    │  │ - Hints     │  │ - Components     │ │
│   └──────────────┘  └─────────────┘  └──────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│                   http://localhost:8000                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             Assessment Orchestrator                   │  │
│  │  - Create assessments                                 │  │
│  │  - Manage pipelines                                   │  │
│  │  - Track progress                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│          ↓                  ↓                 ↓              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Coding Round │  │ Live Coding  │  │ System Design│     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  │              │  │              │  │              │     │
│  │ - Questions  │  │ - Problems   │  │ - Problems   │     │
│  │ - Submit     │  │ - Chat       │  │ - Chat       │     │
│  │ - Evaluate   │  │ - Execute    │  │ - Diagram    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│          ↓                  ↓                                │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Judge0 API │  │  AI/LLM API  │                        │
│  │              │  │  (Samba Nova)│                        │
│  │ - Execute    │  │ - Evaluate   │                        │
│  │ - Validate   │  │ - Chat       │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.jsx
│
├─ Navbar
│
├─ Hero
│
├─ JobDescriptionForm
│
├─ ResumeUpload
│
├─ ScreeningResults
│
└─ AssessmentFlow
    │
    ├─ CodingRound
    │   ├─ Problem Display
    │   ├─ Code Editor (Textarea)
    │   ├─ Language Selector
    │   ├─ Submit Button
    │   ├─ Test Results Display
    │   └─ AI Evaluation Display
    │
    ├─ LiveCodingRound
    │   ├─ Chat Interface
    │   │   ├─ Message List
    │   │   ├─ Message Input
    │   │   └─ AI Avatar
    │   ├─ Code Editor
    │   ├─ Run Code Button
    │   └─ Output Display
    │
    └─ SystemDesignRound
        ├─ Whiteboard Canvas
        │   ├─ Drawing Tools
        │   │   ├─ Pen
        │   │   ├─ Rectangle
        │   │   ├─ Circle
        │   │   └─ Select
        │   ├─ Component Palette
        │   │   ├─ Server
        │   │   ├─ Database
        │   │   ├─ Cache
        │   │   └─ Load Balancer
        │   └─ Color Picker
        ├─ Problem Statement
        └─ Chat Interface
```

## Data Flow - Coding Round

```
User writes code
      ↓
Click Submit
      ↓
CodingRound component
      ↓
POST /assessments/coding_round/{roundId}/submit
{
  assessment_id: "xxx",
  question_id: "easy_1",
  language: "python",
  code: "def solution()..."
}
      ↓
Backend receives submission
      ↓
Execute code via Judge0
{
  source_code: "base64...",
  language_id: 71,
  stdin: "test input"
}
      ↓
Judge0 returns results
{
  status: "Accepted",
  stdout: "output",
  time: 0.023,
  memory: 3456
}
      ↓
Backend runs AI evaluation
      ↓
AI analyzes code
{
  correctness_score: 90,
  optimality_score: 85,
  code_quality_score: 88,
  big_o_analysis: {...},
  feedback: "..."
}
      ↓
Backend returns evaluation
{
  test_case_summary: {...},
  evaluation: {...}
}
      ↓
Frontend displays results
```

## Data Flow - Live Coding Round

```
Round starts
      ↓
POST /assessments/{assessmentId}/live_coding/start
      ↓
Backend returns problem + initial message
      ↓
User sends chat message
      ↓
POST /assessments/live_coding/{roundId}/chat
{
  message: "Can I use a hash map?"
}
      ↓
Backend forwards to AI
      ↓
AI generates context-aware response
      ↓
Backend returns AI response
      ↓
User writes code
      ↓
POST /assessments/live_coding/{roundId}/code
{
  code: "...",
  language: "python"
}
      ↓
User clicks Run
      ↓
POST /assessments/live_coding/{roundId}/run
      ↓
Backend executes via Judge0
      ↓
Returns execution results
      ↓
Display in UI
```

## Data Flow - System Design Round

```
Round starts
      ↓
POST /assessments/{assessmentId}/system_design/start
      ↓
Backend returns problem + initial message
      ↓
User draws on whiteboard
      ↓
Canvas state updates locally
{
  components: [
    {
      id: "comp_1",
      type: "server",
      x: 100, y: 100,
      width: 120, height: 80,
      label: "API Server"
    }
  ]
}
      ↓
On significant change
      ↓
POST /assessments/system_design/{roundId}/diagram
{
  components: [...]
}
      ↓
Backend stores diagram state
      ↓
User sends chat message
      ↓
POST /assessments/system_design/{roundId}/chat
{
  message: "Should I use Redis or Memcached?"
}
      ↓
AI analyzes current phase + context
      ↓
Returns phase-appropriate response
      ↓
Display in chat
```

## State Management

### Assessment Flow State
```javascript
{
  currentStage: 'overview' | 'in-progress' | 'completed',
  assessmentId: 'string',
  pipeline: ['coding_round', 'live_coding_round', 'system_design_round'],
  currentRoundIndex: 0,
  roundResults: {
    coding_round: {...},
    live_coding_round: {...},
    system_design_round: {...}
  }
}
```

### Coding Round State
```javascript
{
  roundId: 'string',
  questions: [...],
  currentQuestionIndex: 0,
  code: 'string',
  language: 'python',
  testResults: null,
  progress: {...},
  timeRemaining: 3600
}
```

### Live Coding State
```javascript
{
  roundId: 'string',
  messages: [...],
  code: 'string',
  language: 'python',
  codeOutput: {...},
  status: {...}
}
```

### System Design State
```javascript
{
  roundId: 'string',
  problem: {...},
  messages: [...],
  currentPhase: 'requirements',
  components: [...],
  drawingElements: [...],
  currentTool: 'pen',
  selectedElement: null
}
```

## API Endpoints Map

### Assessments
```
POST   /assessments/create
GET    /assessments/{assessment_id}
GET    /assessments/start/{assessment_id}
GET    /assessments/{assessment_id}/progress
POST   /assessments/{assessment_id}/submit
```

### Coding Round
```
POST   /assessments/{assessment_id}/coding_round/start
POST   /assessments/coding_round/{round_id}/submit
GET    /assessments/coding_round/{round_id}/progress
POST   /assessments/coding_round/{round_id}/complete
```

### Live Coding Round
```
POST   /assessments/{assessment_id}/live_coding/start
POST   /assessments/live_coding/{round_id}/chat
POST   /assessments/live_coding/{round_id}/code
POST   /assessments/live_coding/{round_id}/run
POST   /assessments/live_coding/{round_id}/complete
GET    /assessments/live_coding/{round_id}/status
GET    /assessments/live_coding/{round_id}/chat_history
```

### System Design Round
```
POST   /assessments/{assessment_id}/system_design/start
POST   /assessments/system_design/{round_id}/chat
POST   /assessments/system_design/{round_id}/diagram
GET    /assessments/system_design/{round_id}/diagram
POST   /assessments/system_design/{round_id}/complete
GET    /assessments/system_design/{round_id}/status
```

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Fetch API
- **Canvas:** HTML5 Canvas API

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.8+
- **Code Execution:** Judge0 API
- **AI/LLM:** Samba Nova API
- **Data Storage:** In-memory (for demo)

### External Services
- **Judge0:** Code execution engine
- **Samba Nova:** AI/LLM for evaluation and chat
- **Supabase:** (Optional) Database and auth

## Security Considerations

### Frontend
- ✅ No sensitive data in localStorage
- ✅ API keys in environment variables
- ✅ Input sanitization
- ✅ Error boundary components

### Backend
- ✅ Sandboxed code execution (Judge0)
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS configuration
- ✅ API key authentication

### Code Execution
- ✅ Isolated sandbox environment
- ✅ Time limits (prevent infinite loops)
- ✅ Memory limits
- ✅ No network access for user code

## Performance Metrics

### Target Performance
- **Page Load:** < 2 seconds
- **Code Execution:** < 5 seconds
- **AI Response:** < 3 seconds
- **Canvas Rendering:** 60 FPS
- **API Response:** < 500ms

### Optimization Strategies
- Lazy loading for heavy components
- Code splitting
- Canvas operations batching
- API request debouncing
- State update optimization

## Scalability Considerations

### Frontend
- Static hosting (CDN)
- Code splitting
- Lazy loading
- Asset optimization

### Backend
- Horizontal scaling
- Load balancing
- Caching layer
- Database connection pooling
- Queue system for long tasks

## Monitoring & Logging

### Frontend
- Browser console errors
- API call tracking
- User interaction analytics
- Performance monitoring

### Backend
- API request logging
- Error tracking
- Performance metrics
- Resource utilization

---

**Architecture Version:** 1.0.0
**Last Updated:** 2025-10-18
