# AI InterviewHub - Frontend

An AI-powered interview platform with resume screening and technical assessment capabilities.

## Features

### Resume Screening
- Job description analysis (preset roles or custom descriptions)
- AI-powered resume evaluation
- Detailed scoring and feedback

### Assessment Pipeline
- **Coding Round**: Solve 3 DSA problems (Easy, Medium, Hard) with Judge0 integration
  - Real-time code editor with syntax highlighting
  - Multiple language support (Python, JavaScript, Java, C++)
  - Instant test case execution and feedback
  - Progress tracking across questions

- **Live Coding Round**: Interactive AI interviewer session
  - Real-time chat with AI interviewer
  - Shared code editor
  - Live code execution
  - Collaborative problem-solving

### Pipeline Types
- **Product-based**: Coding Round → Live Coding
- **Service-based**: Behavioral → Technical Interview
- **Analyst**: Case Study → Data Analysis

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

## Backend API Integration

The frontend connects to the backend API at `http://localhost:8000` with the following endpoints:

### Assessment Creation
- `POST /assessments/create`

### Coding Round
- `POST /assessments/{assessment_id}/coding_round/start`
- `POST /assessments/coding_round/{round_id}/submit`
- `GET /assessments/coding_round/{round_id}/progress`
- `POST /assessments/coding_round/{round_id}/complete`

### Live Coding Round
- `POST /assessments/{assessment_id}/live_coding/start`
- `POST /assessments/live_coding/{round_id}/chat`
- `POST /assessments/live_coding/{round_id}/code`
- `POST /assessments/live_coding/{round_id}/run`
- `POST /assessments/live_coding/{round_id}/complete`
- `GET /assessments/live_coding/{round_id}/status`
- `GET /assessments/live_coding/{round_id}/chat_history`
