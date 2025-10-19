# Service Company Assessment Pipeline

## Overview

The service company assessment pipeline is a comprehensive 4-round evaluation system designed for service-based company hiring. It evaluates candidates across multiple dimensions including aptitude, technical skills, problem-solving, and communication.

## Pipeline Structure

### Round 1: Aptitude Test (30 minutes)
**Purpose:** Evaluate fundamental quantitative, logical, and verbal abilities

**Components:**
- **Quantitative Section (8 questions):**
  - Profit/Loss calculations
  - Time and Work problems
  - Percentages
  - Speed, Time, and Distance

- **Logical Reasoning (6 questions):**
  - Number series
  - Logical deductions
  - Pattern recognition
  - Blood relations

- **Verbal Ability (6 questions):**
  - Synonyms and antonyms
  - Grammar
  - Reading comprehension
  - Sentence correction

**Features:**
- Timer: 30 minutes for all 20 questions
- No negative marking
- Navigate between questions
- Auto-submit when time expires
- Real-time progress tracking

**Passing Criteria:** 60% overall score to proceed to next round

---

### Round 2: Core Competency Test (60 minutes)
**Purpose:** Assess technical knowledge and coding ability

**Components:**
1. **MCQ Section (3 questions):**
   - Programming concepts
   - Data structures
   - Algorithms
   - Best practices

2. **Coding Section (1 problem):**
   - Easy-level coding challenge
   - Multiple language support (Python, JavaScript, Java, C++)
   - Test case validation via Judge0
   - Real-time code execution

**Features:**
- Tabbed interface for MCQ and Coding sections
- Code editor with syntax highlighting
- Example inputs/outputs provided
- Automatic test case evaluation
- Time limit: 60 minutes

**Scoring:**
- MCQ: 40% weight
- Coding: 60% weight
- Passing score: 60%

---

### Round 3: Technical Interview (15-20 minutes)
**Purpose:** Evaluate technical communication and depth of knowledge

**Format:**
- Video-based interview
- 4 technical questions
- 3 minutes per question
- Categories:
  - Programming Fundamentals
  - Data Structures
  - Problem Solving
  - Tools & Practices

**Features:**
- Camera and microphone required
- Video recording for each answer
- Question navigation
- Progress tracking
- Tips provided for each question

**Evaluation Criteria:**
- Technical accuracy
- Communication clarity
- Depth of explanation
- Real-world application

---

### Round 4: HR Interview (10-15 minutes)
**Purpose:** Assess cultural fit, communication skills, and career alignment

**Format:**
- Video-based interview
- 5 behavioral questions
- 2-3 minutes per question
- Categories:
  - Introduction
  - Problem Solving
  - Self Assessment
  - Career Goals
  - Final Pitch

**Features:**
- STAR method guidance
- Question-specific tips
- Visual progress indicator
- Professional assessment of:
  - Communication skills
  - Self-awareness
  - Cultural fit
  - Career aspirations

**Evaluation:**
- Holistic assessment of candidate fit
- Communication effectiveness
- Professionalism
- Authenticity

---

## User Experience Features

### Visual Progress Tracking
- Overall pipeline progress bar
- Round-by-round completion status
- Real-time timer displays
- Question-level progress indicators

### Intuitive Navigation
- Clear section transitions
- Back/Next navigation
- Question number indicators
- Auto-progression between rounds

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts
- Touch-optimized controls
- Cross-browser compatibility

### Real-time Feedback
- Immediate score display
- Section-wise performance breakdown
- Strengths and improvement areas
- Detailed explanations

---

## Technical Implementation

### Frontend Components

1. **ServiceCompanyFlow.jsx**
   - Main orchestration component
   - Progress management
   - Round transitions

2. **AptitudeTestRound.jsx**
   - Question display
   - Timer management
   - Answer selection
   - Result presentation

3. **CoreCompetencyRound.jsx**
   - MCQ interface
   - Code editor
   - Test submission
   - Score display

4. **TechnicalInterviewRound.jsx**
   - Video capture
   - Question presentation
   - Recording management
   - Progress tracking

5. **HRInterviewRound.jsx**
   - Behavioral questions
   - STAR method guidance
   - Video recording
   - Final assessment

### API Integration

**Base URL:** `http://localhost:8000/service`

**Key Endpoints:**
```
POST /service/assessments/create
POST /service/assessments/{id}/aptitude_test/start
GET  /service/assessments/aptitude_test/{round_id}/questions
POST /service/assessments/aptitude_test/{round_id}/submit
POST /service/assessments/{id}/core_competency/start
GET  /service/assessments/core_competency/{round_id}/test
POST /service/assessments/core_competency/{round_id}/submit
```

### State Management
- React hooks for local state
- API client for server communication
- Progress persistence across rounds
- Automatic round progression

---

## Design Principles

### Visual Hierarchy
- Clear section headers
- Color-coded round indicators
- Prominent CTAs
- Consistent spacing

### Color Coding
- **Aptitude Test:** Cyan/Blue gradient
- **Core Competency:** Purple/Pink gradient
- **Technical Interview:** Blue tones
- **HR Interview:** Green tones
- **Success:** Green indicators
- **Warning:** Yellow alerts
- **Error:** Red notifications

### Accessibility
- High contrast ratios
- Clear typography
- Icon + text labels
- Keyboard navigation support

### Performance
- Optimized component rendering
- Lazy loading where applicable
- Efficient state updates
- Minimal re-renders

---

## Future Enhancements

1. **Advanced Analytics:**
   - Performance benchmarking
   - Peer comparison
   - Skill gap analysis
   - Improvement recommendations

2. **AI Enhancements:**
   - Video response analysis
   - Speech-to-text transcription
   - Sentiment analysis
   - Automated feedback generation

3. **Additional Features:**
   - Practice mode
   - Mock interviews
   - Question bank expansion
   - Multi-language support

4. **Integration Options:**
   - ATS integration
   - Calendar scheduling
   - Email notifications
   - Report generation

---

## Getting Started

1. **Start Assessment:**
   ```javascript
   // Select "Service Company" from company type selector
   // System automatically creates assessment and proceeds to Round 1
   ```

2. **Complete Rounds:**
   - Each round must be completed in sequence
   - Automatic progression on passing scores
   - Manual review for borderline cases

3. **View Results:**
   - Round-level scores
   - Overall assessment summary
   - Detailed performance breakdown
   - Next steps recommendations

---

## Support

For technical issues or questions:
- Check browser console for errors
- Verify API endpoint connectivity
- Ensure camera/microphone permissions
- Review network requests in DevTools

## Best Practices

### For Candidates:
- Test equipment before starting
- Find quiet environment
- Read instructions carefully
- Manage time effectively
- Be authentic in responses

### For Administrators:
- Monitor system performance
- Review passing criteria regularly
- Update question banks
- Analyze candidate feedback
- Refine evaluation metrics

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Status:** Production Ready
