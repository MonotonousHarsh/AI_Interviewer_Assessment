import { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Clock, Play, Terminal } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function SQLTestRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sqlQueries, setSqlQueries] = useState({});
  const [executionResults, setExecutionResults] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteTest();
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
      const response = await apiClient.post(`/analyst/assessments/${assessmentId}/sql_test/start`);
      setRoundId(response.round_id);
      setTimeRemaining(response.time_limit_minutes * 60);

      const mockQuestions = [
        {
          question_id: 'sql_1',
          question_text: 'Write a query to find the second highest salary from the Employees table.',
          schema_definition: 'CREATE TABLE Employees (id INT, name VARCHAR(100), salary DECIMAL(10,2), department_id INT);',
          sample_data: 'id | name  | salary | department_id\n1  | John  | 50000 | 1\n2  | Jane  | 60000 | 1\n3  | Bob   | 70000 | 2',
        },
        {
          question_id: 'sql_2',
          question_text: 'Write a query to find departments with average salary greater than 55000.',
          schema_definition: 'CREATE TABLE Employees (id INT, name VARCHAR(100), salary DECIMAL(10,2), department_id INT);\nCREATE TABLE Departments (id INT, name VARCHAR(100));',
          sample_data: 'Employees:\nid | name  | salary | department_id\n1  | John  | 50000 | 1\n2  | Jane  | 60000 | 1\n3  | Bob   | 70000 | 2',
        },
        {
          question_id: 'sql_3',
          question_text: 'Write a query to find employees who earn more than their department average.',
          schema_definition: 'CREATE TABLE Employees (id INT, name VARCHAR(100), salary DECIMAL(10,2), department_id INT);',
          sample_data: 'id | name  | salary | department_id\n1  | John  | 50000 | 1\n2  | Jane  | 60000 | 1\n3  | Bob   | 70000 | 2',
        },
      ];

      setQuestions(mockQuestions);

      const initialQueries = {};
      mockQuestions.forEach((q) => {
        initialQueries[q.question_id] = '-- Write your SQL query here\nSELECT ';
      });
      setSqlQueries(initialQueries);

      setTestStarted(true);
    } catch (error) {
      alert('Failed to start SQL test: ' + error.message);
    }
  };

  const handleQueryChange = (questionId, query) => {
    setSqlQueries({
      ...sqlQueries,
      [questionId]: query,
    });
  };

  const handleRunQuery = async (questionId) => {
    try {
      const response = await apiClient.post(
        `/analyst/assessments/sql_test/${roundId}/submit_query`,
        {
          question_id: questionId,
          sql_query: sqlQueries[questionId],
        }
      );

      setExecutionResults({
        ...executionResults,
        [questionId]: response,
      });

      if (response.next_question) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      alert('Failed to execute query: ' + error.message);
    }
  };

  const handleCompleteTest = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/analyst/assessments/sql_test/${roundId}/complete`
      );

      setResults(response);
      if (response.next_round_started) {
        setTimeout(() => onComplete(response), 3000);
      }
    } catch (error) {
      alert('Failed to complete test: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <h2 className="text-3xl font-bold text-white mb-2">SQL Test Complete</h2>
          <p className="text-muted-white/70">
            {results.next_round_started
              ? 'Great work! Moving to case study...'
              : results.overall_score >= 60
              ? 'Good performance! Proceed to the next round.'
              : 'Review your SQL skills and try again.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall Score</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">{results.correct_answers}</div>
            <div className="text-sm text-muted-white/60">Correct Queries</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-purple-400 mb-2">{results.total_questions}</div>
            <div className="text-sm text-muted-white/60">Total Questions</div>
          </div>
        </div>

        {results.overall_score >= 60 && !results.next_round_started && (
          <button
            onClick={() => onComplete(results)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            Proceed to Case Study
          </button>
        )}
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">SQL & Data Manipulation Test</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            This test evaluates your SQL proficiency and data manipulation skills. You'll write queries to solve
            3 problems of varying difficulty. Time limit: 60 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <Database className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Query Writing</h3>
            <p className="text-sm text-muted-white/70">Write efficient SQL queries</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
            <Terminal className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Testing</h3>
            <p className="text-sm text-muted-white/70">Execute and validate queries</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Instant Feedback</h3>
            <p className="text-sm text-muted-white/70">See results immediately</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Important Instructions</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Time limit: 60 minutes</li>
                <li>• 3 SQL problems to solve</li>
                <li>• Test queries before submitting</li>
                <li>• Focus on query correctness and efficiency</li>
                <li>• Each query will be validated against test cases</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
        >
          Start SQL Test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const completedCount = Object.keys(executionResults).length;
  const currentResult = executionResults[currentQuestion?.question_id];

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Database className="w-5 h-5" />
              <span className="text-sm font-semibold">SQL Problem {currentQuestionIndex + 1}/{questions.length}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining < 600 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-blue-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-white/60">Progress</span>
            <span className="text-sm text-blue-400 font-semibold">{completedCount}/{questions.length} completed</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all"
              style={{ width: `${(completedCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <h3 className="text-2xl font-bold text-white mb-6">{currentQuestion?.question_text}</h3>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Schema Definition</h4>
            <pre className="text-sm text-muted-white/80 font-mono whitespace-pre-wrap">
              {currentQuestion?.schema_definition}
            </pre>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-green-400 mb-2">Sample Data</h4>
            <pre className="text-sm text-muted-white/80 font-mono whitespace-pre-wrap">
              {currentQuestion?.sample_data}
            </pre>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-white/80 mb-2">
            Write Your SQL Query
          </label>
          <textarea
            value={sqlQueries[currentQuestion?.question_id] || ''}
            onChange={(e) => handleQueryChange(currentQuestion.question_id, e.target.value)}
            className="w-full h-48 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
            placeholder="-- Write your SQL query here"
          />
        </div>

        <button
          onClick={() => handleRunQuery(currentQuestion.question_id)}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Run Query
        </button>

        {currentResult && (
          <div className={`mt-4 rounded-xl p-4 border ${
            currentResult.is_correct
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {currentResult.is_correct ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-400" />
              )}
              <span className={`font-semibold ${
                currentResult.is_correct ? 'text-green-400' : 'text-orange-400'
              }`}>
                {currentResult.is_correct ? 'Correct Query!' : 'Query needs improvement'}
              </span>
            </div>
            <p className="text-sm text-muted-white/70">{currentResult.feedback}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-slate-700/50 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleCompleteTest}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete SQL Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={!currentResult}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              Next Problem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
