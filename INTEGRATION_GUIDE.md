# AI Interview Platform - Integration Guide

## Overview

This project integrates a comprehensive AI-powered interview assessment system with three main coding rounds:
1. **Coding Round** - Solve DSA problems with automated test case execution
2. **Live Coding Round** - Interactive coding session with AI interviewer
3. **System Design Round** - Design scalable systems with integrated whiteboard

## Backend Integration

### Backend API Base URL
```bash
http://localhost:8000
```

### Environment Configuration

Add to `.env`:
```
VITE_BACKEND_API_URL=http://localhost:8000
```

## API Endpoints Used

### Assessment Creation
```
POST /assessments/create
Body: {
  "candidate_id": "candidate_xxx",
  "candidate_email": "email@example.com",
  "job_id": "job_xxx"
}
```

### Coding Round
- `POST /assessments/{assessment_id}/coding_round/start` - Start round
- `POST /assessments/coding_round/{round_id}/submit` - Submit code
- `GET /assessments/coding_round/{round_id}/progress` - Get progress
- `POST /assessments/coding_round/{round_id}/complete` - Complete round

### Live Coding Round
- `POST /assessments/{assessment_id}/live_coding/start` - Start round
- `POST /assessments/live_coding/{round_id}/chat` - Send chat message
- `POST /assessments/live_coding/{round_id}/code` - Update code
- `POST /assessments/live_coding/{round_id}/run` - Run code with Judge0
- `POST /assessments/live_coding/{round_id}/complete` - Complete round
- `GET /assessments/live_coding/{round_id}/status` - Get status
- `GET /assessments/live_coding/{round_id}/chat_history` - Get chat history

### System Design Round
- `POST /assessments/{assessment_id}/system_design/start` - Start round
- `POST /assessments/system_design/{round_id}/chat` - Send chat message
- `POST /assessments/system_design/{round_id}/diagram` - Update diagram
- `GET /assessments/system_design/{round_id}/diagram` - Get diagram
- `POST /assessments/system_design/{round_id}/complete` - Complete round
- `GET /assessments/system_design/{round_id}/status` - Get status

## Features Implemented

### 1. Coding Round (`CodingRound.jsx`)
- Displays 3 problems (Easy, Medium, Hard)
- Monaco-like code editor with syntax highlighting
- Language selection (Python, JavaScript, Java, C++)
- Real-time code execution using Judge0
- Test case validation
- AI-powered code evaluation with:
  - Overall score
  - Correctness score
  - Optimality score (Big O analysis)
  - Code quality score
  - Edge case handling score
  - Detailed feedback and suggestions
- Progress tracking
- Time tracking (90 minutes)

### 2. Live Coding Round (`LiveCodingRound.jsx`)
- Interactive chat with AI interviewer
- Shared code editor
- Real-time code execution
- Code output display
- AI provides hints and guidance
- Progressive interview phases:
  - Problem explanation
  - Clarification questions
  - Coding
  - Testing
  - Follow-up discussion

### 3. System Design Round (`SystemDesignRound.jsx`)
- **Integrated Whiteboard** with drawing capabilities:
  - Pen tool for free-hand drawing
  - Rectangle and Circle shapes
  - Pre-made components (Server, Database, Cache, Load Balancer)
  - Color picker
  - Select and move tool
  - Clear canvas
  - Grid background
  - Component connections (visual arrows)
- Real-time chat with AI interviewer
- Problem statement display with:
  - Requirements
  - Scale requirements
  - Difficulty level
- Interview phases tracking:
  - Requirements gathering
  - High-level architecture
  - Data modeling
  - Deep dive (caching, sharding, CDN)
  - Trade-off analysis

## Whiteboard Features

The system design whiteboard includes:

### Drawing Tools
- **Pen** - Free-hand drawing
- **Rectangle** - Draw rectangular components
- **Circle** - Draw circular components
- **Select** - Move and select components
- **Color Picker** - Customize colors

### Pre-made Components
- Server blocks
- Database blocks
- Cache nodes
- Load Balancer

### Canvas Features
- 1000x600 canvas with grid background
- Drag and drop components
- Component labeling
- Visual connections between components
- Auto-save to backend

### Component Structure
```javascript
{
  id: "comp_xxx",
  type: "server|database|cache|rectangle|circle",
  x: 100,
  y: 100,
  width: 120,
  height: 80,
  color: "#00ff9d",
  backgroundColor: "rgba(0, 255, 157, 0.1)",
  label: "Server",
  connections: ["comp_yyy"] // Array of connected component IDs
}
```

## Assessment Flow

1. User uploads resume and gets screened
2. If qualified, assessment is created
3. Assessment pipeline shows all rounds
4. User proceeds through rounds sequentially:
   - Coding Round (solve 3 problems)
   - Live Coding Round (AI interview)
   - System Design Round (design with whiteboard)
5. After each round, automatic transition to next round (if score threshold met)

## Automatic Transitions

The backend automatically starts the next round when:
- Coding Round score ≥ 50 → Start Live Coding Round
- Live Coding Round score ≥ 60 → Start System Design Round
- System Design Round score ≥ 60 → Start Behavioral Round (if implemented)

## Judge0 Integration

The backend uses Judge0 for code execution:
- Supports multiple languages
- Sandboxed execution
- Time and memory limits
- Compilation error handling
- Test case validation

## Code Evaluation with AI

The AI evaluator (Samba LLM) provides:
- Correctness analysis
- Time complexity (Big O)
- Space complexity (Big O)
- Code quality assessment
- Best practices suggestions
- Edge case handling evaluation

## UI/UX Features

- Glassmorphism design
- Smooth transitions and animations
- Responsive layout
- Real-time updates
- Progress indicators
- Status badges
- Color-coded difficulty levels
- Time tracking
- Message timestamps
- Loading states
- Error handling

## Component Communication

```
App.jsx
  └─ AssessmentFlow.jsx
      ├─ CodingRound.jsx
      ├─ LiveCodingRound.jsx
      └─ SystemDesignRound.jsx
```

Each round component:
- Receives `assessmentId` and `onComplete` callback
- Manages its own state
- Communicates with backend
- Calls `onComplete(result)` when finished

## Error Handling

All components include:
- Try-catch blocks for API calls
- User-friendly error messages
- Loading states
- Fallback UI
- Retry mechanisms

## Next Steps

To use this integration:

1. **Start the backend server:**
   ```bash
   python main.py  # or uvicorn main:app --reload
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Environment setup:**
   - Ensure `.env` has `VITE_BACKEND_API_URL=http://localhost:8000`
   - Backend must have Judge0 API configured
   - Backend must have AI/LLM API configured

4. **Test the flow:**
   - Create job posting
   - Upload resume
   - Start assessment
   - Complete all rounds

## Known Integration Points

### Backend Expected Data Structures

**Coding Round Question:**
```json
{
  "question_id": "easy_1",
  "title": "Find Middle of Linked List",
  "description": "...",
  "difficulty": "easy",
  "category": "linked_list",
  "constraints": [],
  "sample_input": "1 2 3 4 5",
  "sample_output": "3",
  "test_cases": []
}
```

**Live Coding Problem:**
```json
{
  "problem_id": "live_1",
  "title": "Merge Intervals",
  "description": "...",
  "difficulty": "medium",
  "category": "arrays",
  "examples": [],
  "hints": []
}
```

**System Design Problem:**
```json
{
  "problem_id": "design_1",
  "title": "Design Twitter's Feed",
  "description": "...",
  "category": "social_media",
  "difficulty": "hard",
  "requirements": [],
  "scale_requirements": {},
  "evaluation_criteria": []
}
```

## Troubleshooting

### Common Issues

1. **Backend not connecting:**
   - Check if backend is running on port 8000
   - Verify CORS is enabled on backend
   - Check browser console for CORS errors

2. **Code execution failing:**
   - Verify Judge0 API is configured
   - Check Judge0 API key and base URL
   - Verify language_id mapping

3. **AI responses not working:**
   - Check AI/LLM API configuration
   - Verify API keys
   - Check rate limits

4. **Whiteboard not rendering:**
   - Check canvas ref is properly set
   - Verify canvas dimensions
   - Check for JavaScript errors in console

## Performance Optimization

- Canvas operations are optimized with requestAnimationFrame
- API calls are debounced where appropriate
- State updates are batched
- Components use React.memo where beneficial
- Lazy loading for heavy components

## Security Considerations

- All API calls use HTTPS in production
- User inputs are sanitized
- Code execution is sandboxed (Judge0)
- Session management on backend
- CORS properly configured

## Future Enhancements

Potential improvements:
- Add undo/redo for whiteboard
- Add zoom and pan for whiteboard
- Add more drawing tools (arrow, text box)
- Add diagram templates
- Add screen recording for live coding
- Add real-time collaboration
- Add voice/video integration
- Add code diff visualization
- Add more language support

## Support

For issues or questions:
- Check backend logs for API errors
- Check browser console for frontend errors
- Verify environment variables
- Test API endpoints with Postman/curl
- Review integration guide sections

---

**Last Updated:** 2025-10-18
**Version:** 1.0.0
