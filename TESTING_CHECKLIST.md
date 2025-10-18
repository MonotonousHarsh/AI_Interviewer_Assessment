# Testing Checklist

## Pre-Testing Setup

### Backend Setup
- [ ] Backend server is running on port 8000
- [ ] Judge0 API key is configured
- [ ] AI/LLM API key is configured
- [ ] CORS is properly configured
- [ ] API docs accessible at http://localhost:8000/docs

### Frontend Setup
- [ ] Frontend dev server is running on port 5173
- [ ] `.env` file has `VITE_BACKEND_API_URL=http://localhost:8000`
- [ ] No console errors on initial load
- [ ] All dependencies installed

## Integration Testing

### 1. Initial Flow
- [ ] Landing page loads without errors
- [ ] Hero section displays correctly
- [ ] "Get Started" button works
- [ ] Smooth scroll to job description form

### 2. Job Description & Resume Upload
- [ ] Job description form accepts input
- [ ] Job creation API call succeeds
- [ ] Resume upload section appears
- [ ] Resume file upload works
- [ ] Screening API call succeeds
- [ ] Screening results display

### 3. Assessment Creation
- [ ] "Proceed to Assessment" button visible
- [ ] Assessment creation API call succeeds
- [ ] Assessment overview page loads
- [ ] Pipeline rounds display correctly
- [ ] Company type shows (should be "product")
- [ ] "Start Assessment" button works

## Coding Round Testing

### Basic Functionality
- [ ] Round starts successfully
- [ ] 3 questions load (Easy, Medium, Hard)
- [ ] Problem details display correctly
- [ ] Code editor is functional
- [ ] Language selector works
- [ ] Timer starts counting down
- [ ] Progress bar updates

### Code Submission
- [ ] "Run & Submit" button works
- [ ] Code submits to backend
- [ ] Judge0 execution completes
- [ ] Test results display
- [ ] Pass/fail indicators show correctly

### AI Evaluation
- [ ] Overall score displays
- [ ] Component scores display:
  - [ ] Correctness score
  - [ ] Optimality score
  - [ ] Code quality score
  - [ ] Edge case score
- [ ] Big O analysis shows
- [ ] Feedback text displays
- [ ] Suggestions list appears

### Navigation
- [ ] "Next" button works to move between questions
- [ ] Progress tracking updates
- [ ] "Complete Coding Round" button works
- [ ] Round completion API call succeeds

### Error Handling
- [ ] Empty code submission shows appropriate message
- [ ] Compilation errors display
- [ ] Runtime errors display
- [ ] Network errors handled gracefully

## Live Coding Round Testing

### Basic Functionality
- [ ] Round starts automatically (if coding score >= 50)
- [ ] Problem loads correctly
- [ ] Initial AI message displays
- [ ] Chat interface is functional
- [ ] Code editor is functional

### Chat Features
- [ ] Can send messages to AI
- [ ] AI responses appear
- [ ] Message timestamps show
- [ ] User/AI avatars display
- [ ] Chat scrolls to bottom
- [ ] Loading indicator during AI response

### Code Features
- [ ] Code editor updates
- [ ] Language selector works
- [ ] "Run Code" button works
- [ ] Code execution via Judge0
- [ ] Output displays correctly
- [ ] Errors display correctly
- [ ] Execution time shows

### Interview Flow
- [ ] Interview phases progress:
  - [ ] Problem explanation
  - [ ] Clarification
  - [ ] Coding
  - [ ] Testing
- [ ] Hints trigger on keywords ("stuck", "help")
- [ ] Status updates correctly

### Round Completion
- [ ] "Complete Live Coding Round" button works
- [ ] Evaluation generates
- [ ] Scores display:
  - [ ] Communication
  - [ ] Problem solving
  - [ ] Technical depth
  - [ ] Collaboration
  - [ ] Code quality
- [ ] Automatic transition to System Design

### Error Handling
- [ ] Chat errors handled
- [ ] Code execution errors handled
- [ ] Network errors handled

## System Design Round Testing

### Basic Functionality
- [ ] Round starts automatically (if live coding score >= 60)
- [ ] Problem loads correctly
- [ ] Whiteboard canvas renders
- [ ] Initial AI message displays
- [ ] Chat interface works

### Whiteboard - Drawing Tools
- [ ] Pen tool draws
- [ ] Rectangle tool creates rectangles
- [ ] Circle tool creates circles
- [ ] Select tool works
- [ ] Color picker changes colors
- [ ] Clear canvas works

### Whiteboard - Components
- [ ] "Add Server" creates server component
- [ ] "Add Database" creates database component
- [ ] "Add Cache" creates cache component
- [ ] "Add Load Balancer" creates LB component
- [ ] Components appear at random positions
- [ ] Components have correct labels

### Whiteboard - Interaction
- [ ] Can select components
- [ ] Can drag components
- [ ] Selected component highlights
- [ ] Grid background displays
- [ ] Canvas coordinates work correctly

### Chat Features
- [ ] Can send messages
- [ ] AI responds appropriately
- [ ] Phase-aware responses
- [ ] Message history persists
- [ ] Timestamps display

### Problem Display
- [ ] Problem title shows
- [ ] Description shows
- [ ] Requirements list shows
- [ ] Scale requirements show
- [ ] Category and difficulty show

### Phase Tracking
- [ ] Current phase highlights
- [ ] Phase progression indicators
- [ ] Phase transitions work:
  - [ ] Requirements → High Level
  - [ ] High Level → Data Modeling
  - [ ] Data Modeling → Deep Dive
  - [ ] Deep Dive → Tradeoffs

### Diagram Sync
- [ ] Diagram updates save to backend
- [ ] Component count updates
- [ ] Diagram retrieval works

### Round Completion
- [ ] "Complete System Design Round" button works
- [ ] Evaluation generates
- [ ] Scores display:
  - [ ] Requirements gathering
  - [ ] Architecture
  - [ ] Data modeling
  - [ ] Technical depth
  - [ ] Trade-off analysis
- [ ] Diagram components count shows
- [ ] Time taken displays

### Error Handling
- [ ] Drawing errors handled
- [ ] Chat errors handled
- [ ] Diagram save errors handled
- [ ] Network errors handled

## Cross-Round Testing

### Round Transitions
- [ ] Coding → Live Coding transition works
- [ ] Live Coding → System Design transition works
- [ ] Score thresholds enforced:
  - [ ] Coding score < 50: no auto-transition
  - [ ] Live Coding score < 60: no auto-transition
- [ ] Transition messages display

### Data Persistence
- [ ] Round results persist
- [ ] Progress persists
- [ ] State management works
- [ ] No data loss between rounds

### Overall Assessment
- [ ] All rounds complete successfully
- [ ] Final completion screen shows
- [ ] All rounds marked complete
- [ ] Results summary accurate

## UI/UX Testing

### Visual Elements
- [ ] Glassmorphism effects display
- [ ] Gradients render correctly
- [ ] Shadows appear
- [ ] Colors match design system
- [ ] Typography is consistent
- [ ] Icons display correctly

### Animations
- [ ] Fade-in animations work
- [ ] Hover effects work
- [ ] Button press animations work
- [ ] Smooth scrolling works
- [ ] Loading spinners animate

### Responsiveness
- [ ] Desktop layout (1920x1080)
- [ ] Laptop layout (1366x768)
- [ ] Tablet landscape (1024x768)
- [ ] Tablet portrait (768x1024)
- [ ] Mobile landscape (640x360)
- [ ] Mobile portrait (375x667)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Alt text for images
- [ ] ARIA labels where needed

## Performance Testing

### Load Times
- [ ] Initial page load < 2s
- [ ] Round transitions < 1s
- [ ] API responses < 500ms
- [ ] Canvas renders at 60 FPS
- [ ] No janky animations

### Resource Usage
- [ ] Memory usage reasonable
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] No memory leaks
- [ ] Efficient re-renders

## Edge Cases

### User Behavior
- [ ] Empty code submission
- [ ] Very long code submission
- [ ] Rapid button clicking
- [ ] Browser back button
- [ ] Browser refresh (state loss expected)
- [ ] Multiple tabs (undefined behavior)

### Network Issues
- [ ] Slow network simulation
- [ ] Network disconnection
- [ ] API timeout handling
- [ ] Partial response handling
- [ ] Retry mechanisms

### Data Edge Cases
- [ ] Special characters in code
- [ ] Unicode in messages
- [ ] Very long messages
- [ ] Empty messages
- [ ] Malformed API responses

## Security Testing

### Input Validation
- [ ] Code injection attempts blocked
- [ ] XSS attempts handled
- [ ] SQL injection irrelevant (no direct DB access)
- [ ] Malicious file uploads rejected

### API Security
- [ ] CORS properly configured
- [ ] No sensitive data in URLs
- [ ] No API keys in frontend code
- [ ] Proper error messages (no stack traces)

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## API Testing (via Postman/curl)

### Coding Round APIs
```bash
# Start round
curl -X POST http://localhost:8000/assessments/{assessment_id}/coding_round/start

# Submit code
curl -X POST http://localhost:8000/assessments/coding_round/{round_id}/submit \
  -H "Content-Type: application/json" \
  -d '{"assessment_id":"xxx","question_id":"easy_1","language":"python","code":"..."}'

# Get progress
curl http://localhost:8000/assessments/coding_round/{round_id}/progress

# Complete round
curl -X POST http://localhost:8000/assessments/coding_round/{round_id}/complete
```

### Live Coding APIs
```bash
# Start round
curl -X POST http://localhost:8000/assessments/{assessment_id}/live_coding/start

# Send chat
curl -X POST http://localhost:8000/assessments/live_coding/{round_id}/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Can I use a hash map?"}'

# Update code
curl -X POST http://localhost:8000/assessments/live_coding/{round_id}/code \
  -H "Content-Type: application/json" \
  -d '{"code":"def solution():...","language":"python"}'

# Run code
curl -X POST http://localhost:8000/assessments/live_coding/{round_id}/run

# Complete round
curl -X POST http://localhost:8000/assessments/live_coding/{round_id}/complete
```

### System Design APIs
```bash
# Start round
curl -X POST http://localhost:8000/assessments/{assessment_id}/system_design/start

# Send chat
curl -X POST http://localhost:8000/assessments/system_design/{round_id}/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Should I use Redis?"}'

# Update diagram
curl -X POST http://localhost:8000/assessments/system_design/{round_id}/diagram \
  -H "Content-Type: application/json" \
  -d '{"components":[...]}'

# Complete round
curl -X POST http://localhost:8000/assessments/system_design/{round_id}/complete
```

## Bug Tracking Template

```markdown
### Bug Report

**Component:** [Coding Round / Live Coding / System Design / Other]

**Severity:** [Critical / High / Medium / Low]

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Console Errors:**
[Copy-paste any errors]

**Environment:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Frontend version: [commit hash]
- Backend version: [commit hash]
```

## Test Result Summary

### Round Completion Status
- [ ] Coding Round: ✅ / ❌
- [ ] Live Coding Round: ✅ / ❌
- [ ] System Design Round: ✅ / ❌

### Critical Issues Found
```
[List any critical issues here]
```

### Non-Critical Issues Found
```
[List any minor issues here]
```

### Overall Status
- [ ] ✅ Ready for production
- [ ] ⚠️ Ready with known issues
- [ ] ❌ Not ready - major issues found

### Notes
```
[Any additional notes or observations]
```

---

**Testing Date:** _____________
**Tester:** _____________
**Environment:** Development / Staging / Production
**Sign-off:** _____________
