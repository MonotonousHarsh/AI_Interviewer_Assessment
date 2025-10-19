import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Brain, Zap, BookOpen } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function AptitudeTestRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState(null);

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
      const response = await apiClient.post(`/service/assessments/${assessmentId}/aptitude_test/start`);
      setRoundId(response.round_id);

      const questionsResponse = await apiClient.get(`/service/assessments/aptitude_test/${response.round_id}/questions`);
      setQuestions(questionsResponse.questions);
      setTestStarted(true);
    } catch (error) {
      alert('Failed to start aptitude test: ' + error.message);
    }
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
      const responses = questions.map((q) => ({
        question_id: q.question_id,
        selected_option: answers[q.question_id] ?? null,
        time_taken_seconds: 0,
      }));

      const response = await apiClient.post(
        `/service/assessments/aptitude_test/${roundId}/submit`,
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
      case 'quantitative':
        return <Brain className="w-5 h-5" />;
      case 'logical':
        return <Zap className="w-5 h-5" />;
      case 'verbal':
        return <BookOpen className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'quantitative':
        return 'from-blue-500 to-cyan-500';
      case 'logical':
        return 'from-purple-500 to-pink-500';
      case 'verbal':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (results) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            results.overall_score >= 60 ? 'bg-green-500/20' : 'bg-orange-500/20'
          }`}>
            {results.overall_score >= 60 ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-400" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Aptitude Test Complete</h2>
          <p className="text-muted-white/70">
            {results.next_round_started
              ? 'Great job! Moving to the next round...'
              : results.overall_score >= 60
              ? 'Good performance! Proceed to the next round.'
              : 'Score below threshold. Review your performance.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{results.overall_score}%</div>
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
          <h3 className="text-xl font-semibold text-white mb-4">Section-wise Performance</h3>
          {Object.entries(results.section_scores).map(([section, score]) => (
            <div key={section} className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium capitalize">{section}</span>
                <span className="text-cyan-400 font-semibold">{score}%</span>
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

        {results.overall_score >= 60 && !results.next_round_started && (
          <button
            onClick={() => onComplete(results)}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Proceed to Next Round
          </button>
        )}
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Aptitude Test</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            This test evaluates your quantitative, logical, and verbal abilities. You'll have 30 minutes to complete 20 questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <Brain className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Quantitative</h3>
            <p className="text-sm text-muted-white/70">8 questions on math, percentages, and calculations</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
            <Zap className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Logical</h3>
            <p className="text-sm text-muted-white/70">6 questions on patterns and reasoning</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <BookOpen className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Verbal</h3>
            <p className="text-sm text-muted-white/70">6 questions on vocabulary and grammar</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Important Instructions</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Time limit: 30 minutes</li>
                <li>• No negative marking</li>
                <li>• You can navigate between questions</li>
                <li>• Test will auto-submit when time expires</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
        >
          Start Aptitude Test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${getQuestionTypeColor(currentQuestion?.question_type)} text-white`}>
              {getQuestionTypeIcon(currentQuestion?.question_type)}
              <span className="text-sm font-semibold capitalize">{currentQuestion?.question_type}</span>
            </div>
            <div className="text-sm text-muted-white/70">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-cyan-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-white/60">Progress</span>
            <span className="text-sm text-cyan-400 font-semibold">{answeredCount}/{questions.length} answered</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <h3 className="text-xl font-semibold text-white mb-6">{currentQuestion?.question_text}</h3>

        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => {
            const isSelected = answers[currentQuestion.question_id] === index;
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.question_id, index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
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
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-cyan-500 text-white'
                    : answers[questions[index].question_id] !== undefined
                    ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                    : 'bg-slate-700/50 text-muted-white/50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-all"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
