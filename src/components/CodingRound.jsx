import { useState, useEffect } from 'react';
import { Code, Clock, CheckCircle2, XCircle, Play, Loader2, ChevronRight } from 'lucide-react';

export default function CodingRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [progress, setProgress] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    startCodingRound();
  }, []);

  useEffect(() => {
    if (roundId && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roundId, timeRemaining]);

  const startCodingRound = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/assessments/${assessmentId}/coding_round/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to start coding round');

      const data = await response.json();
      setRoundId(data.round_id);
      setQuestions(data.questions || []);
      setCode(data.questions?.[0]?.starter_code || '');
    } catch (error) {
      console.error('Error starting coding round:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    setSubmitting(true);
    setTestResults(null);
    try {
      const response = await fetch(`http://localhost:8000/assessments/coding_round/${roundId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          question_id: questions[currentQuestionIndex].question_id,
          language,
          code
        })
      });

      if (!response.ok) throw new Error('Failed to submit code');

      const result = await response.json();
      setTestResults(result);

      fetchProgress();
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assessments/coding_round/${roundId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const completeRound = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/assessments/coding_round/${roundId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to complete round');

      const result = await response.json();
      onComplete(result);
    } catch (error) {
      console.error('Error completing round:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCode(questions[currentQuestionIndex + 1]?.starter_code || '');
      setTestResults(null);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    const d = difficulty?.toLowerCase() || '';
    if (d === 'easy') return 'text-neon-green border-neon-green/30 bg-neon-green/10';
    if (d === 'medium') return 'text-cyan-glow border-cyan-glow/30 bg-cyan-glow/10';
    return 'text-red-400 border-red-400/30 bg-red-400/10';
  };

  if (loading && !roundId) {
    return (
      <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-1 animate-spin mx-auto mb-4" />
          <p className="text-muted-white/70">Preparing your coding round...</p>
        </div>
      </section>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-7xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-4">
                <Code className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-muted-white/90">Coding Round</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero">
                DSA Challenge
              </h2>
            </div>

            <div className="glass-effect rounded-xl px-6 py-3 border border-grid-blue/20 flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent-1" />
              <span className="text-2xl font-bold text-muted-white">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-accent-1'
                    : progress?.completed_questions?.includes(q.question_id)
                    ? 'bg-neon-green'
                    : 'bg-bg-darker/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-muted-white">
                Problem {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(currentQuestion?.difficulty)}`}>
                {currentQuestion?.difficulty || 'Unknown'}
              </span>
            </div>

            <h4 className="text-2xl font-bold text-muted-white mb-4">{currentQuestion?.title}</h4>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-white/80 leading-relaxed mb-4">
                {currentQuestion?.description}
              </p>

              {currentQuestion?.examples && currentQuestion.examples.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-muted-white">Examples:</h5>
                  {currentQuestion.examples.map((example, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                      <div className="mb-2">
                        <span className="text-muted-white/60 text-sm">Input:</span>
                        <code className="block text-cyan-glow mt-1">{example.input}</code>
                      </div>
                      <div>
                        <span className="text-muted-white/60 text-sm">Output:</span>
                        <code className="block text-neon-green mt-1">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div className="mt-2">
                          <span className="text-muted-white/60 text-sm">Explanation:</span>
                          <p className="text-muted-white/70 text-sm mt-1">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion?.constraints && (
                <div className="mt-4">
                  <h5 className="text-lg font-semibold text-muted-white mb-2">Constraints:</h5>
                  <ul className="list-disc list-inside text-muted-white/70 space-y-1">
                    {currentQuestion.constraints.map((constraint, idx) => (
                      <li key={idx} className="text-sm">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-muted-white">Code Editor</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-bg-darker/50 border border-grid-blue/30 text-muted-white text-sm focus:outline-none focus:border-accent-1"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 px-4 py-3 rounded-xl bg-bg-darker/70 border border-grid-blue/30 text-muted-white font-mono text-sm focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all resize-none"
                placeholder="Write your code here..."
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitCode}
                  disabled={submitting || !code.trim()}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run & Submit
                    </>
                  )}
                </button>

                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-3 rounded-xl glass-effect border border-accent-1/35 text-muted-white font-semibold hover:border-accent-1/75 transition-all flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {testResults && (
              <div className={`glass-effect rounded-2xl p-6 border shadow-card-shadow ${
                testResults.test_case_summary?.passed === testResults.test_case_summary?.total ? 'border-neon-green/20' : 'border-red-400/20'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {testResults.test_case_summary?.passed === testResults.test_case_summary?.total ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-neon-green" />
                      <h3 className="text-xl font-semibold text-neon-green">All Tests Passed!</h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-semibold text-red-400">Some Tests Failed</h3>
                    </>
                  )}
                </div>

                {testResults.test_case_summary && (
                  <div className="mb-4 p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-white/60">Tests Passed:</span>
                      <span className="text-neon-green font-semibold">{testResults.test_case_summary.passed} / {testResults.test_case_summary.total}</span>
                    </div>
                  </div>
                )}

                {testResults.evaluation && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                      <div className="text-center mb-3">
                        <div className="text-3xl font-bold text-accent-1">{testResults.evaluation.overall_score}</div>
                        <div className="text-xs text-muted-white/60">Overall Score</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-white/60">Correctness:</span>
                          <span className="text-neon-green font-semibold ml-2">{testResults.evaluation.correctness_score}</span>
                        </div>
                        <div>
                          <span className="text-muted-white/60">Optimality:</span>
                          <span className="text-cyan-glow font-semibold ml-2">{testResults.evaluation.optimality_score}</span>
                        </div>
                        <div>
                          <span className="text-muted-white/60">Code Quality:</span>
                          <span className="text-blue-400 font-semibold ml-2">{testResults.evaluation.code_quality_score}</span>
                        </div>
                        <div>
                          <span className="text-muted-white/60">Edge Cases:</span>
                          <span className="text-purple-400 font-semibold ml-2">{testResults.evaluation.edge_case_score}</span>
                        </div>
                      </div>
                    </div>

                    {testResults.evaluation.code_feedback && (
                      <div className="p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                        <h4 className="text-sm font-semibold text-muted-white mb-2">Feedback:</h4>
                        <p className="text-xs text-muted-white/70 leading-relaxed">{testResults.evaluation.code_feedback}</p>
                      </div>
                    )}

                    {testResults.evaluation.big_o_analysis && (
                      <div className="p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                        <h4 className="text-sm font-semibold text-muted-white mb-2">Complexity Analysis:</h4>
                        <div className="text-xs text-muted-white/70">
                          <div>Time: <span className="text-cyan-glow font-mono">{testResults.evaluation.big_o_analysis.time}</span></div>
                          <div>Space: <span className="text-cyan-glow font-mono">{testResults.evaluation.big_o_analysis.space}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={completeRound}
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-gradient-to-b from-neon-green to-cyan-glow text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Complete Coding Round'
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
