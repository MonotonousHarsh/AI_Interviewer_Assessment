import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Send, MessageSquare, User, Volume2, VolumeX, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { saveAssessmentHistory } from '../utils/supabaseClient';

export default function VirtualInterview({ assessmentId, candidateId, companyType, onComplete }) {
  const [sessionId, setSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentPhase, setCurrentPhase] = useState('introduction');
  const [transcript, setTranscript] = useState([]);
  const [userResponse, setUserResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarState, setAvatarState] = useState('idle');
  const [conversationTurns, setConversationTurns] = useState(0);
  const [starAnalysis, setStarAnalysis] = useState(null);

  const transcriptRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    startInterview();
    saveInitialHistory();
  }, []);

  const saveInitialHistory = async () => {
    try {
      await saveAssessmentHistory({
        candidate_id: candidateId || `candidate_${Date.now()}`,
        assessment_id: assessmentId || `assessment_${Date.now()}`,
        company_type: companyType || 'product',
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save assessment history:', error);
    }
  };

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (currentQuestion && audioEnabled) {
      speakText(currentQuestion);
    }
  }, [currentQuestion]);

  const startInterview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/virtual_interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: `candidate_${Date.now()}`,
          job_id: 'default_job',
          resume_text: 'Sample resume text for demonstration purposes.'
        })
      });

      if (!response.ok) throw new Error('Failed to start interview');

      const data = await response.json();
      setSessionId(data.session_id);
      setCurrentQuestion(data.initial_question);
      setCurrentPhase(data.interview_phase);
      setIsSessionActive(true);
      setAvatarState('speaking');

      setTranscript([{
        role: 'interviewer',
        content: data.initial_question,
        timestamp: new Date().toISOString(),
        context: data.question_context
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window && audioEnabled) {
      setIsSpeaking(true);
      setAvatarState('speaking');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState('listening');
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleVoiceResponse(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAvatarState('listening');
    } catch (err) {
      setError('Microphone access denied. Please enable microphone or use text input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAvatarState('thinking');
    }
  };

  const handleVoiceResponse = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio_data', audioBlob, 'recording.wav');

      const response = await fetch(`${API_BASE_URL}/virtual_interview/${sessionId}/respond_voice`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process voice response');

      const data = await response.json();
      handleInterviewResponse(data);
    } catch (err) {
      setError(err.message);
      setAvatarState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextResponse = async () => {
    if (!userResponse.trim()) return;

    const candidateMessage = {
      role: 'candidate',
      content: userResponse,
      timestamp: new Date().toISOString()
    };

    setTranscript(prev => [...prev, candidateMessage]);
    setIsLoading(true);
    setAvatarState('thinking');

    try {
      const response = await fetch(`${API_BASE_URL}/virtual_interview/${sessionId}/respond_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: userResponse })
      });

      if (!response.ok) throw new Error('Failed to send response');

      const data = await response.json();
      handleInterviewResponse(data);
      setUserResponse('');
    } catch (err) {
      setError(err.message);
      setAvatarState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewResponse = (data) => {
    setCurrentQuestion(data.next_question);
    setCurrentPhase(data.current_phase);
    setConversationTurns(data.conversation_turns);

    if (data.star_analysis) {
      setStarAnalysis(data.star_analysis);
    }

    const interviewerMessage = {
      role: 'interviewer',
      content: data.next_question,
      timestamp: new Date().toISOString(),
      context: data.question_context
    };

    setTranscript(prev => [...prev, interviewerMessage]);
    setAvatarState('speaking');
  };

  const completeInterview = async () => {
    setIsLoading(true);
    setAvatarState('thinking');

    try {
      const response = await fetch(`${API_BASE_URL}/virtual_interview/${sessionId}/complete`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to complete interview');

      const data = await response.json();
      setIsSessionActive(false);
      setAvatarState('idle');

      if (onComplete) {
        onComplete(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'introduction': return 'text-cyan-glow';
      case 'behavioral': return 'text-accent-1';
      case 'technical': return 'text-accent-2';
      default: return 'text-muted-white';
    }
  };

  const getAvatarAnimation = () => {
    switch (avatarState) {
      case 'speaking':
        return 'scale-105 shadow-[0_0_50px_rgba(0,255,255,0.5)]';
      case 'listening':
        return 'scale-100 shadow-[0_0_30px_rgba(0,255,150,0.5)]';
      case 'thinking':
        return 'scale-95 shadow-[0_0_40px_rgba(255,100,200,0.5)]';
      default:
        return 'scale-100 shadow-[0_0_20px_rgba(100,150,255,0.3)]';
    }
  };

  if (isLoading && !sessionId) {
    return (
      <section className="relative min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-accent-1 animate-spin mx-auto mb-4" />
          <p className="text-muted-white text-lg">Initializing Virtual Interview...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-20 px-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-glow/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-4">
            <Video className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Virtual AI Interview</span>
          </div>
          <h2 className="text-4xl font-bold text-muted-white text-shadow-hero mb-2">
            AI Interviewer Session
          </h2>
          <p className={`text-lg font-semibold ${getPhaseColor()}`}>
            Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="relative aspect-square mb-6">
                <div className={`w-full h-full rounded-2xl bg-gradient-to-br from-accent-1/20 to-accent-2/20 flex items-center justify-center transition-all duration-500 ${getAvatarAnimation()}`}>
                  {videoEnabled ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-32 h-32 text-cyan-glow opacity-80" />
                      </div>

                      {avatarState === 'speaking' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-40 h-40 rounded-full border-4 border-cyan-glow/50 animate-ping"></div>
                        </div>
                      )}

                      {avatarState === 'listening' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-40 h-40 rounded-full border-4 border-neon-green/50 animate-pulse"></div>
                        </div>
                      )}

                      {avatarState === 'thinking' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-12 h-12 text-accent-2 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <VideoOff className="w-32 h-32 text-muted-white/30" />
                  )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={`p-2 rounded-lg ${videoEnabled ? 'bg-accent-1/20 text-accent-1' : 'bg-red-500/20 text-red-400'} transition-all`}
                  >
                    {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2 rounded-lg ${audioEnabled ? 'bg-accent-1/20 text-accent-1' : 'bg-red-500/20 text-red-400'} transition-all`}
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-bg-darker/30">
                  <div className="text-xs text-muted-white/60 mb-1">Status</div>
                  <div className="text-sm font-semibold text-muted-white capitalize">{avatarState}</div>
                </div>
                <div className="p-3 rounded-lg bg-bg-darker/30">
                  <div className="text-xs text-muted-white/60 mb-1">Conversation Turns</div>
                  <div className="text-sm font-semibold text-accent-1">{conversationTurns}</div>
                </div>
                {starAnalysis && (
                  <div className="p-3 rounded-lg bg-bg-darker/30">
                    <div className="text-xs text-muted-white/60 mb-1">STAR Method Score</div>
                    <div className="text-sm font-semibold text-neon-green">{starAnalysis.completeness_score}%</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-muted-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent-1" />
                  Conversation
                </h3>
                <button
                  onClick={completeInterview}
                  disabled={isLoading || !isSessionActive}
                  className="px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  Complete Interview
                </button>
              </div>

              <div
                ref={transcriptRef}
                className="h-96 overflow-y-auto space-y-4 mb-6 p-4 rounded-xl bg-bg-darker/30 scrollbar-thin scrollbar-thumb-accent-1/30 scrollbar-track-transparent"
              >
                {transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${
                        message.role === 'candidate'
                          ? 'bg-accent-1/20 border border-accent-1/30'
                          : 'bg-cyan-glow/10 border border-cyan-glow/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold ${
                          message.role === 'candidate' ? 'text-accent-1' : 'text-cyan-glow'
                        }`}>
                          {message.role === 'candidate' ? 'You' : 'AI Interviewer'}
                        </span>
                        <span className="text-xs text-muted-white/40">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-muted-white/90 text-sm leading-relaxed">{message.content}</p>
                      {message.context && (
                        <div className="mt-2 pt-2 border-t border-muted-white/10">
                          <p className="text-xs text-muted-white/50 italic">{message.context}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-cyan-glow/10 border border-cyan-glow/30 p-4 rounded-xl">
                      <Loader2 className="w-5 h-5 text-cyan-glow animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTextResponse();
                      }
                    }}
                    placeholder="Type your response here... (Press Enter to send)"
                    disabled={isLoading || !isSessionActive || isSpeaking}
                    className="flex-1 p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/30 text-muted-white placeholder-muted-white/40 focus:border-accent-1/50 focus:outline-none transition-all resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleTextResponse}
                    disabled={isLoading || !userResponse.trim() || !isSessionActive || isSpeaking}
                    className="px-6 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading || !isSessionActive || isSpeaking}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                      isRecording
                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 animate-pulse'
                        : 'bg-cyan-glow/20 text-cyan-glow border-2 border-cyan-glow/30 hover:bg-cyan-glow/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Voice Response
                      </>
                    )}
                  </button>
                </div>

                {starAnalysis && starAnalysis.missing_components.length > 0 && (
                  <div className="p-4 rounded-xl bg-accent-2/10 border border-accent-2/30">
                    <div className="text-sm font-semibold text-accent-2 mb-2">Tip: Improve your response</div>
                    <p className="text-xs text-muted-white/70 mb-2">Missing STAR components:</p>
                    <ul className="text-xs text-muted-white/60 space-y-1">
                      {starAnalysis.missing_components.map((component, idx) => (
                        <li key={idx}>• {component}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
