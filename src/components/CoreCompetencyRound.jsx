import { useState, useEffect } from 'react';
import { Code, CheckCircle, AlertCircle, Clock, Play, Terminal } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function CoreCompetencyRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [testData, setTestData] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingSolutions, setCodingSolutions] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [currentTab, setCurrentTab] = useState('mcq');
  const [timeRemaining, setTimeRemaining] = useState(3600);
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
      const response = await apiClient.post(`/service/assessments/${assessmentId}/core_competency/start`);
      setRoundId(response.round_id);

      const testResponse = await apiClient.get(`/service/assessments/core_competency/${response.round_id}/test`);
      setTestData(testResponse);

      const initialSolutions = {};
      testResponse.coding_problems.forEach((problem) => {
        initialSolutions[problem.problem_id] = problem.function_signature || '';
      });
      setCodingSolutions(initialSolutions);

      setTestStarted(true);
    } catch (error) {
      alert('Failed to start core competency test: ' + error.message);
    }
  };

  const handleMcqAnswer = (questionId, optionIndex) => {
    setMcqAnswers({
      ...mcqAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleCodeChange = (problemId, code) => {
    setCodingSolutions({
      ...codingSolutions,
      [problemId]: code,
    });
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/service/assessments/core_competency/${roundId}/submit`,
        {
          mcq_answers: mcqAnswers,
          coding_solutions: codingSolutions,
          language: selectedLanguage,
        }
      );

      setResults(response);
    } catch (error) {
      alert('Failed to submit test: ' + error.message);
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
          <h2 className="text-3xl font-bold text-white mb-2">Core Competency Test Complete</h2>
          <p className="text-muted-white/70">
            {results.overall_score >= 60
              ? 'Excellent! Click below to proceed to the technical interview.'
              : 'Review your performance below.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall Score</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">{results.mcq_score}%</div>
            <div className="text-sm text-muted-white/60">MCQ Score</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">{results.coding_score}%</div>
            <div className="text-sm text-muted-white/60">Coding Score</div>
          </div>
        </div>

        {results.overall_score >= 60 && (
          <button
            onClick={() => onComplete(results)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Proceed to Technical Interview
          </button>
        )}
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Core Competency Round</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            This round tests your technical knowledge with MCQs and coding problems. You'll have 60 minutes to complete both sections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <Terminal className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">MCQ Section</h3>
            <p className="text-sm text-muted-white/70">3 technical multiple choice questions</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
            <Code className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Coding Section</h3>
            <p className="text-sm text-muted-white/70">1 coding problem to solve</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Important Instructions</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Time limit: 60 minutes</li>
                <li>• Complete both MCQ and coding sections</li>
                <li>• Test cases will be run against your code</li>
                <li>• Test will auto-submit when time expires</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-white/80 mb-2">
            Select Programming Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Start Core Competency Test
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentTab('mcq')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentTab === 'mcq'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/50 text-muted-white/70 hover:bg-slate-800'
              }`}
            >
              MCQ Section ({Object.keys(mcqAnswers).length}/{testData?.mcq_questions?.length || 0})
            </button>
            <button
              onClick={() => setCurrentTab('coding')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentTab === 'coding'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-muted-white/70 hover:bg-slate-800'
              }`}
            >
              Coding Section
            </button>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining < 600 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-cyan-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {currentTab === 'mcq' && (
        <div className="space-y-4">
          {testData?.mcq_questions?.map((question, index) => (
            <div key={question.question_id} className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-white flex-1">{question.question_text}</h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = mcqAnswers[question.question_id] === optionIndex;
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleMcqAnswer(question.question_id, optionIndex)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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
            </div>
          ))}
        </div>
      )}

      {currentTab === 'coding' && (
        <div className="space-y-4">
          {testData?.coding_problems?.map((problem, index) => (
            <div key={problem.problem_id} className="glass-effect rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">{problem.title}</h3>
              <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <p className="text-muted-white/80 whitespace-pre-wrap">{problem.problem_statement}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Example Input</h4>
                  <pre className="text-sm text-muted-white/80 font-mono">{problem.example_input}</pre>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Example Output</h4>
                  <pre className="text-sm text-muted-white/80 font-mono">{problem.example_output}</pre>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-muted-white/80 mb-2">Your Solution</label>
                <textarea
                  value={codingSolutions[problem.problem_id] || ''}
                  onChange={(e) => handleCodeChange(problem.problem_id, e.target.value)}
                  className="w-full h-64 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
                  placeholder={`Write your ${selectedLanguage} code here...`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <button
          onClick={handleSubmitTest}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </div>
  );
}
