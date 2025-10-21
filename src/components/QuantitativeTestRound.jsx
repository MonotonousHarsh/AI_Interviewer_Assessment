import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Brain, BarChart3, Puzzle } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function QuantitativeTestRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(2700);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const handleStartTest = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/analyst/assessments/${assessmentId}/quantitative_test/start`);
      
      setRoundId(response.round_id);
      setTimeRemaining(response.time_limit_minutes * 60);

      // Fetch the actual test questions using the round_id
      await fetchTestQuestions(response.round_id);
      
      setTestStarted(true);
    } catch (error) {
      alert('Failed to start quantitative test: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestQuestions = async (testRoundId) => {
    try {
      // Since the backend doesn't have a direct endpoint to get questions by round_id,
      // we need to modify our approach. We'll get questions from the test state
      // For now, we'll use the backend's structure to understand the format
      
      // In a real implementation, you would have an endpoint like:
      // GET /analyst/assessments/quantitative_test/{round_id}/questions
      // But for now, we'll work with what we have
      
      // Since we can't get questions directly, let's structure our frontend 
      // to work with the backend's actual question format
      console.log('Round ID for questions:', testRoundId);
      
      // For now, we'll use the mock structure but note that the actual questions
      // will come from the backend when you submit
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  // Transform backend question to frontend format
  const transformBackendQuestion = (backendQuestion) => {
    return {
      question_id: backendQuestion.question_id,
      question_text: backendQuestion.question_text,
      question_type: backendQuestion.question_type,
      options: backendQuestion.options,
      data_set: backendQuestion.data_set || null,
      explanation: backendQuestion.explanation,
      difficulty: backendQuestion.difficulty,
      category: backendQuestion.category
    };
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Prepare responses in the format expected by backend
      const responses = questions.map((q) => ({
        question_id: q.question_id,
        selected_option: answers[q.question_id] ?? null,
        time_taken_seconds: 0, // You can calculate this based on actual time
      }));

      const response = await apiClient.post(
        `/analyst/assessments/quantitative_test/${roundId}/submit`,
        { responses }
      );

      setResults(response);
      if (response.next_round_started) {
        setTimeout(() => onComplete(response), 3000);
      }
    } catch (error) {
      alert('Failed to submit test: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'numerical':
        return <Brain className="w-5 h-5" />;
      case 'data_interpretation':
        return <BarChart3 className="w-5 h-5" />;
      case 'logical':
        return <Puzzle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'numerical':
        return 'from-blue-500 to-cyan-500';
      case 'data_interpretation':
        return 'from-green-500 to-emerald-500';
      case 'logical':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-white">Loading Quantitative Test...</h3>
        <p className="text-muted-white/70 mt-2">Preparing your assessment</p>
      </div>
    );
  }

  if (results) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            results.overall_score >= 65 ? 'bg-green-500/20' : 'bg-orange-500/20'
          }`}>
            {results.overall_score >= 65 ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-400" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Quantitative Test Complete</h2>
          <p className="text-muted-white/70">
            {results.next_round_started 
              ? 'Excellent! Moving to SQL test...'
              : results.overall_score >= 65
              ? 'Excellent! Click below to proceed to the SQL test.'
              : 'Score below threshold. Review your performance.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall Score</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">{results.correct_answers}</div>
            <div className="text-sm text-muted-white/60">Correct Answers</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">{results.total_questions}</div>
            <div className="text-sm text-muted-white/60">Total Questions</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Section Performance</h3>
          {results.section_scores && Object.entries(results.section_scores).map(([section, score]) => (
            <div key={section} className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium capitalize">{section.replace('_', ' ')}</span>
                <span className="text-green-400 font-semibold">{score}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getQuestionTypeColor(section)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {results.overall_score >= 65 && !results.next_round_started && (
          <button
            onClick={() => onComplete(results)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            Proceed to SQL Test
          </button>
        )}
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Quantitative & Analytical Reasoning Test</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            This test evaluates your quantitative reasoning, data interpretation, and logical thinking abilities.
            You'll have 45 minutes to complete 15 questions with real-world business scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <Brain className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Numerical Reasoning</h3>
            <p className="text-sm text-muted-white/70">Real business calculations and growth rate analysis</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Data Interpretation</h3>
            <p className="text-sm text-muted-white/70">Analyze charts, tables and business metrics</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
            <Puzzle className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Logical Puzzles</h3>
            <p className="text-sm text-muted-white/70">Statistical thinking and business logic problems</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Important Instructions</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Time limit: 45 minutes</li>
                <li>• 15 questions total (5 numerical, 5 data interpretation, 5 logical)</li>
                <li>• No negative marking</li>
                <li>• Calculator use recommended for numerical questions</li>
                <li>• Test will auto-submit when time expires</li>
                <li>• Questions are based on real business scenarios</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all"
        >
          Start Quantitative Test
        </button>
      </div>
    );
  }

  // Create mock questions that match the backend structure
  // In a real implementation, you would get these from the backend
  const mockQuestionsBasedOnBackend = [
    {
      question_id: "quant_1",
      question_text: "A company's revenue grew from $1.2M to $1.8M over 3 years. What is the compound annual growth rate (CAGR)?",
      question_type: "numerical",
      options: ["14.47%", "15.87%", "16.67%", "18.92%"],
      data_set: null
    },
    {
      question_id: "quant_2",
      question_text: "In a dataset of customer ages: [23, 45, 23, 56, 23, 45, 67, 45, 23, 34], what is the mode?",
      question_type: "numerical", 
      options: ["23", "34", "45", "56"],
      data_set: null
    },
    {
      question_id: "data_1",
      question_text: "Based on the sales data table, which product had the highest month-over-month growth in Q2?",
      question_type: "data_interpretation",
      options: ["Product A", "Product B", "Product C", "Product D"],
      data_set: `Month | Product A | Product B | Product C | Product D\nJan  | 100      | 120      | 80       | 90\nFeb  | 120      | 150      | 85       | 95\nMar  | 110      | 140      | 90       | 100\nApr  | 130      | 180      | 95       | 105\nMay  | 140      | 210      | 100      | 110\nJun  | 150      | 240      | 105      | 115`
    },
    // Add more questions as needed to reach 15
  ];

  // Use mock questions for now (in production, you'd get these from backend)
  const currentQuestions = questions.length > 0 ? questions : mockQuestionsBasedOnBackend;
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${getQuestionTypeColor(currentQuestion?.question_type)} text-white`}>
              {getQuestionTypeIcon(currentQuestion?.question_type)}
              <span className="text-sm font-semibold capitalize">{currentQuestion?.question_type?.replace('_', ' ')}</span>
            </div>
            <div className="text-sm text-muted-white/70">
              Question {currentQuestionIndex + 1} of {currentQuestions.length}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-green-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-white/60">Progress</span>
            <span className="text-sm text-green-400 font-semibold">{answeredCount}/{currentQuestions.length} answered</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
              style={{ width: `${(answeredCount / currentQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <h3 className="text-xl font-semibold text-white mb-6">{currentQuestion?.question_text}</h3>

        {currentQuestion?.data_set && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 overflow-x-auto">
            <pre className="text-sm text-muted-white/80 font-mono whitespace-pre">
              {currentQuestion.data_set}
            </pre>
          </div>
        )}

        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => {
            const isSelected = answers[currentQuestion.question_id] === index;
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.question_id, index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-green-500 bg-green-500' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-slate-700/50 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-green-500 text-white'
                    : answers[currentQuestions[index].question_id] !== undefined
                    ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                    : 'bg-slate-700/50 text-muted-white/50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === currentQuestions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(currentQuestions.length - 1, currentQuestionIndex + 1))}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}