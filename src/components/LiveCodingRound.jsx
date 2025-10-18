import { useState, useEffect, useRef } from 'react';
import { Video, MessageSquare, Code2, Play, Send, Loader2, CheckCircle2, User, Bot } from 'lucide-react';

export default function LiveCodingRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    startLiveCoding();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (roundId) {
      const interval = setInterval(() => {
        fetchStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [roundId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startLiveCoding = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/assessments/${assessmentId}/live_coding/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to start live coding round');

      const data = await response.json();
      setRoundId(data.round_id);

      if (data.initial_message) {
        setMessages([{ role: 'assistant', content: data.initial_message, timestamp: new Date() }]);
      }

      fetchChatHistory(data.round_id);
    } catch (error) {
      console.error('Error starting live coding:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/assessments/live_coding/${id || roundId}/chat_history`);
      if (!response.ok) throw new Error('Failed to fetch chat history');

      const data = await response.json();
      if (data.chat_history && data.chat_history.length > 0) {
        setMessages(data.chat_history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assessments/live_coding/${roundId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSendingMessage(true);

    try {
      const response = await fetch(`http://localhost:8000/assessments/live_coding/${roundId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (data.ai_response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.ai_response,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateCode = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assessments/live_coding/${roundId}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      if (!response.ok) throw new Error('Failed to update code');
    } catch (error) {
      console.error('Error updating code:', error);
    }
  };

  const runCode = async () => {
    setRunningCode(true);
    setCodeOutput(null);

    await updateCode();

    try {
      const response = await fetch(`http://localhost:8000/assessments/live_coding/${roundId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to run code');

      const result = await response.json();
      setCodeOutput(result);
    } catch (error) {
      console.error('Error running code:', error);
      setCodeOutput({ error: error.message });
    } finally {
      setRunningCode(false);
    }
  };

  const completeRound = async () => {
    setLoading(true);
    try {
      await updateCode();

      const response = await fetch(`http://localhost:8000/assessments/live_coding/${roundId}/complete`, {
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

  if (loading && !roundId) {
    return (
      <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-1 animate-spin mx-auto mb-4" />
          <p className="text-muted-white/70">Connecting to AI interviewer...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-7xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-4">
            <Video className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Live Coding Round</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            AI Interview Session
          </h2>
          <p className="text-muted-white/70 text-lg">
            Collaborate with the AI interviewer to solve the problem
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-muted-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-glow" />
                  Chat with AI Interviewer
                </h3>
                {status?.status === 'active' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-neon-green text-sm">Active</span>
                  </div>
                )}
              </div>

              <div
                ref={chatContainerRef}
                className="h-96 overflow-y-auto mb-4 space-y-3 p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20"
              >
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-accent-1' : 'bg-neon-green/20 border border-neon-green/30'
                      }`}>
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-neon-green" />
                        )}
                      </div>
                      <div className={`rounded-xl p-3 ${
                        msg.role === 'user'
                          ? 'bg-accent-1 text-white'
                          : 'bg-bg-darker/70 border border-grid-blue/30 text-muted-white'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-xs opacity-60 mt-1 block">
                          {msg.timestamp?.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {sendingMessage && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-neon-green/20 border border-neon-green/30">
                      <Bot className="w-4 h-4 text-neon-green" />
                    </div>
                    <div className="bg-bg-darker/70 border border-grid-blue/30 rounded-xl p-3">
                      <Loader2 className="w-4 h-4 text-cyan-glow animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question or discuss your approach..."
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-darker/50 border border-grid-blue/30 text-muted-white placeholder-muted-white/40 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sendingMessage}
                  className="px-6 py-3 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {codeOutput && (
              <div className={`glass-effect rounded-2xl p-6 border shadow-card-shadow ${
                codeOutput.error ? 'border-red-400/20' : 'border-neon-green/20'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {codeOutput.error ? (
                    <>
                      <Code2 className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-semibold text-red-400">Execution Error</h3>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-neon-green" />
                      <h3 className="text-xl font-semibold text-neon-green">Code Executed</h3>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-bg-darker/70 border border-grid-blue/20">
                  <pre className={`text-sm font-mono whitespace-pre-wrap ${
                    codeOutput.error ? 'text-red-400' : 'text-muted-white'
                  }`}>
                    {codeOutput.error || codeOutput.output || codeOutput.result || 'No output'}
                  </pre>
                </div>

                {codeOutput.execution_time && (
                  <div className="mt-3 text-sm text-muted-white/60">
                    Execution time: <span className="text-cyan-glow font-semibold">{codeOutput.execution_time}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-muted-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-glow" />
                  Shared Code Editor
                </h3>
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
                onBlur={updateCode}
                className="w-full h-96 px-4 py-3 rounded-xl bg-bg-darker/70 border border-grid-blue/30 text-muted-white font-mono text-sm focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all resize-none"
                placeholder="Start coding here... The AI can see your code in real-time"
              />

              <button
                onClick={runCode}
                disabled={runningCode || !code.trim()}
                className="w-full mt-4 px-6 py-3 rounded-xl bg-gradient-to-b from-neon-green to-cyan-glow text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {runningCode ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Code...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={completeRound}
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Complete Live Coding Round
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
