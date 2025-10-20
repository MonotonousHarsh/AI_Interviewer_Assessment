import { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Clock, User, Bot, Send } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function DomainInterviewRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [roundData, setRoundData] = useState(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [results, setResults] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleStartInterview = async () => {
    try {
      const response = await apiClient.post(`/analyst/assessments/${assessmentId}/domain_interview/start`);
      setRoundId(response.round_id);
      setRoundData(response);

      const initialMessage = response.initial_message ||
        "Hello! I'm excited to discuss your experience and skills for this analyst role. Let's start with your background. Tell me about a data analysis project you worked on. What was your process and what impact did it have?";

      setChatMessages([{
        role: 'interviewer',
        content: initialMessage,
        timestamp: new Date().toISOString()
      }]);

      setRoundStarted(true);
    } catch (error) {
      alert('Failed to start domain interview: ' + error.message);
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
        `/analyst/assessments/domain_interview/${roundId}/chat`,
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

  const handleCompleteInterview = async () => {
    setIsCompleting(true);

    try {
      const response = await apiClient.post(
        `/analyst/assessments/domain_interview/${roundId}/complete`
      );

      setResults(response);
      setTimeout(() => onComplete(response), 3000);
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
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Domain Interview Complete</h2>
          <p className="text-muted-white/70">
            All analyst assessment rounds completed successfully!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {results.component_scores?.technical_depth || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Technical Depth</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {results.component_scores?.business_acumen || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Business Acumen</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {results.component_scores?.communication || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Communication</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-orange-400 mb-2">
              {results.component_scores?.curiosity || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Curiosity</div>
          </div>
        </div>

        {results.key_strengths && results.key_strengths.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-green-400 font-semibold mb-2">Key Strengths</h4>
            <ul className="space-y-1">
              {results.key_strengths.map((strength, index) => (
                <li key={index} className="text-muted-white/70 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-xl text-white font-semibold">Analyst Assessment Pipeline Complete!</p>
        </div>
      </div>
    );
  }

  if (!roundStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Domain-Specific Technical Discussion</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            Final round assessing your domain knowledge, technical skills, and business curiosity through
            an interactive AI-powered conversation. Expected duration: 30-40 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Topics Covered</h3>
            <ul className="text-sm text-muted-white/70 space-y-2">
              <li>• Past projects and experience</li>
              <li>• Tools and technologies</li>
              <li>• Problem-solving approach</li>
              <li>• Business curiosity</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Evaluation Areas</h3>
            <ul className="text-sm text-muted-white/70 space-y-2">
              <li>• Technical depth</li>
              <li>• Business acumen</li>
              <li>• Communication skills</li>
              <li>• Industry knowledge</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Interview Tips</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Be specific and provide concrete examples</li>
                <li>• Explain your thought process clearly</li>
                <li>• Show curiosity about the business</li>
                <li>• Ask clarifying questions when needed</li>
                <li>• Connect technical skills to business impact</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartInterview}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
        >
          Start Domain Interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-semibold">Domain Technical Discussion</span>
            </div>
            <div className="text-sm text-muted-white/70">
              {chatMessages.length} messages
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-cyan-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">{roundData?.time_limit_minutes || 40} min</span>
          </div>
        </div>
      </div>

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
                msg.role === 'candidate' ? 'bg-cyan-500' : 'bg-green-500'
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
                    : 'bg-green-500/20 border border-green-500/30'
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
              className="flex-1 bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isSending}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <button
          onClick={handleCompleteInterview}
          disabled={isCompleting || chatMessages.length < 5}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
        >
          {isCompleting ? 'Completing...' : 'Complete Domain Interview'}
        </button>
        {chatMessages.length < 5 && (
          <p className="text-sm text-muted-white/60 text-center mt-2">
            Have a meaningful conversation (at least 5 exchanges) before completing
          </p>
        )}
      </div>
    </div>
  );
}
