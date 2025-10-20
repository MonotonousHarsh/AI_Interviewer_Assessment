import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Code, Play, Send, CheckCircle, AlertCircle, Clock, Terminal, User, Bot } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function TechnicalInterviewRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [roundData, setRoundData] = useState(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('java');
  const [testInput, setTestInput] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentView, setCurrentView] = useState('chat');
  const [results, setResults] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleStartInterview = async () => {
    try {
      const response = await apiClient.post(`/service/assessments/${assessmentId}/technical_interview/start`);
      setRoundId(response.round_id);
      setRoundData(response);

      if (response.initial_message) {
        setChatMessages([{
          role: 'interviewer',
          content: response.initial_message,
          timestamp: new Date().toISOString()
        }]);
      }

      setRoundStarted(true);
    } catch (error) {
      alert('Failed to start technical interview: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isSending) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    setChatMessages(prev => [...prev, {
      role: 'candidate',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await apiClient.post(
        `/service/assessments/technical_interview/${roundId}/chat`,
        { message: userMessage }
      );

      setChatMessages(prev => [...prev, {
        role: 'interviewer',
        content: response.interviewer_response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateCode = async (newCode) => {
    setCode(newCode);

    try {
      await apiClient.post(
        `/service/assessments/technical_interview/${roundId}/code`,
        { code: newCode, language }
      );
    } catch (error) {
      console.error('Failed to update code:', error);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await apiClient.post(
        `/service/assessments/technical_interview/${roundId}/run`,
        { test_input: testInput }
      );

      setExecutionResult(response.execution_result);
    } catch (error) {
      alert('Failed to execute code: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCompleteInterview = async () => {
    setIsCompleting(true);

    try {
      const response = await apiClient.post(
        `/service/assessments/technical_interview/${roundId}/complete`
      );

      setResults(response);
    } catch (error) {
      alert('Failed to complete interview: ' + error.message);
    } finally {
      setIsCompleting(false);
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
          <h2 className="text-3xl font-bold text-white mb-2">Technical Interview Complete</h2>
          <p className="text-muted-white/70">
            {results.overall_score >= 60
              ? 'Excellent! Click below to proceed to the HR interview.'
              : 'Review your performance below.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {results.component_scores?.cs_fundamentals || 0}%
            </div>
            <div className="text-sm text-muted-white/60">CS Fundamentals</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {results.component_scores?.debugging_skills || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Debugging</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {results.component_scores?.coding_skills || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Coding</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-orange-400 mb-2">
              {results.component_scores?.communication || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Communication</div>
          </div>
        </div>

        {results.overall_score >= 60 && (
          <button
            onClick={() => onComplete(results)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Proceed to HR Interview
          </button>
        )}
      </div>
    );
  }

  if (!roundStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Technical Interview Round</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            AI-powered technical interview with live chat, shared code editor, and real-time code execution.
            You'll answer questions on CS fundamentals, debug code, and solve coding problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <MessageSquare className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Interactive Chat</h3>
            <p className="text-sm text-muted-white/70">Discuss concepts with AI interviewer</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
            <Code className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Shared Editor</h3>
            <p className="text-sm text-muted-white/70">Write and debug code together</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <Play className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Live Execution</h3>
            <p className="text-sm text-muted-white/70">Run code with Judge0 API</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Interview Format</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• 5-6 questions covering CS fundamentals, debugging, and coding</li>
                <li>• Chat with AI interviewer to discuss your approach</li>
                <li>• Use shared editor for coding and debugging exercises</li>
                <li>• Test your code with custom inputs</li>
                <li>• Time limit: 45 minutes</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartInterview}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
        >
          Start Technical Interview
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
              onClick={() => setCurrentView('chat')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                currentView === 'chat'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-muted-white/70 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setCurrentView('editor')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                currentView === 'editor'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/50 text-muted-white/70 hover:bg-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
              Code Editor
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-cyan-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">{roundData?.time_limit_minutes || 45} min</span>
          </div>
        </div>
      </div>

      {currentView === 'chat' && (
        <div className="glass-effect rounded-2xl border border-cyan-glow/20 overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-slate-900/50">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.role === 'candidate' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'candidate' ? 'bg-cyan-500' : 'bg-blue-500'
                }`}>
                  {msg.role === 'candidate' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${msg.role === 'candidate' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[80%] p-4 rounded-xl ${
                    msg.role === 'candidate'
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-blue-500/20 border border-blue-500/30'
                  }`}>
                    <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="text-xs text-muted-white/50 mt-1">
                    {msg.role === 'candidate' ? 'You' : 'AI Interviewer'}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                className="flex-1 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isSending}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'editor' && (
        <div className="space-y-4">
          <div className="glass-effect rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                Shared Code Editor
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => handleUpdateCode(e.target.value)}
              className="w-full h-64 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Write your code here..."
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-white/80 mb-2">
                Test Input (optional)
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full h-20 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Enter test input..."
              />
            </div>

            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Executing...' : 'Run Code'}
            </button>

            {executionResult && (
              <div className="mt-4 bg-slate-900 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {executionResult.status === 'Accepted' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-semibold ${
                    executionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {executionResult.status}
                  </span>
                </div>

                {executionResult.stdout && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-white/70 mb-1">Output:</div>
                    <pre className="bg-slate-800/50 rounded p-2 text-sm text-white font-mono overflow-x-auto">
                      {executionResult.stdout}
                    </pre>
                  </div>
                )}

                {executionResult.stderr && (
                  <div className="mt-2">
                    <div className="text-sm text-red-400 mb-1">Error:</div>
                    <pre className="bg-red-500/10 border border-red-500/30 rounded p-2 text-sm text-red-300 font-mono overflow-x-auto">
                      {executionResult.stderr}
                    </pre>
                  </div>
                )}

                {executionResult.compile_output && (
                  <div className="mt-2">
                    <div className="text-sm text-orange-400 mb-1">Compile Output:</div>
                    <pre className="bg-orange-500/10 border border-orange-500/30 rounded p-2 text-sm text-orange-300 font-mono overflow-x-auto">
                      {executionResult.compile_output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <button
          onClick={handleCompleteInterview}
          disabled={isCompleting || chatMessages.length < 3}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
        >
          {isCompleting ? 'Completing...' : 'Complete Technical Interview'}
        </button>
        {chatMessages.length < 3 && (
          <p className="text-sm text-muted-white/60 text-center mt-2">
            Have a meaningful conversation before completing the interview
          </p>
        )}
      </div>
    </div>
  );
}
