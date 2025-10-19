import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, CheckCircle, AlertCircle, Users } from 'lucide-react';

export default function HRInterviewRound({ assessmentId, onComplete }) {
  const [roundStarted, setRoundStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const hrQuestions = [
    {
      id: 'hr_1',
      question: 'Tell me about yourself and why you are interested in this position.',
      category: 'Introduction',
      timeLimit: 120,
    },
    {
      id: 'hr_2',
      question: 'Describe a challenging situation at work and how you handled it.',
      category: 'Problem Solving',
      timeLimit: 180,
    },
    {
      id: 'hr_3',
      question: 'What are your strengths and weaknesses?',
      category: 'Self Assessment',
      timeLimit: 120,
    },
    {
      id: 'hr_4',
      question: 'Where do you see yourself in 5 years?',
      category: 'Career Goals',
      timeLimit: 120,
    },
    {
      id: 'hr_5',
      question: 'Why should we hire you? What makes you the best fit for this role?',
      category: 'Final Pitch',
      timeLimit: 180,
    },
  ];

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const startMediaCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoEnabled(true);
      setAudioEnabled(true);
    } catch (error) {
      alert('Failed to access camera/microphone: ' + error.message);
    }
  };

  const handleStartRound = async () => {
    await startMediaCapture();
    setRoundStarted(true);
  };

  const startRecording = () => {
    if (!mediaStream) return;

    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const currentQuestion = hrQuestions[currentQuestionIndex];
        setResponses({
          ...responses,
          [currentQuestion.id]: {
            blob,
            timestamp: new Date().toISOString(),
          },
        });
        setRecordedChunks([]);
      };
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < hrQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitInterview = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onComplete({
        totalQuestions: hrQuestions.length,
        answeredQuestions: Object.keys(responses).length,
        score: 85,
        completed: true,
      });
    } catch (error) {
      alert('Failed to submit interview: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (!roundStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">HR Interview Round</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            This is the final round where we assess your communication skills, cultural fit, and career aspirations.
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Interview Focus Areas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Communication Skills',
              'Cultural Fit',
              'Career Goals',
              'Problem-Solving Approach',
              'Self-Awareness',
              'Professional Attitude',
            ].map((topic, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-muted-white/80">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Important Instructions</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Camera and microphone access required</li>
                <li>• 2-3 minutes per question</li>
                <li>• Be honest and authentic in your responses</li>
                <li>• Maintain professional demeanor throughout</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartRound}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all"
        >
          Start HR Interview
        </button>
      </div>
    );
  }

  const currentQuestion = hrQuestions[currentQuestionIndex];
  const hasRecordedCurrentQuestion = !!responses[currentQuestion.id];

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-white/60 mb-1">
              Question {currentQuestionIndex + 1} of {hrQuestions.length}
            </div>
            <div className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full inline-block">
              {currentQuestion.category}
            </div>
          </div>
          <div className="text-sm text-muted-white/70">
            {Object.keys(responses).length}/{hrQuestions.length} answered
          </div>
        </div>

        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / hrQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-white/60">
              <AlertCircle className="w-4 h-4" />
              <span>Time limit: {currentQuestion.timeLimit / 60} minutes</span>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h4 className="text-sm font-semibold text-muted-white/80 mb-3">Tips for this question:</h4>
            <ul className="text-sm text-muted-white/70 space-y-2">
              {currentQuestion.category === 'Introduction' && (
                <>
                  <li>• Keep it concise and relevant</li>
                  <li>• Highlight your key achievements</li>
                  <li>• Connect your experience to the role</li>
                </>
              )}
              {currentQuestion.category === 'Problem Solving' && (
                <>
                  <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                  <li>• Be specific with examples</li>
                  <li>• Focus on your contributions</li>
                </>
              )}
              {currentQuestion.category === 'Self Assessment' && (
                <>
                  <li>• Be honest but positive</li>
                  <li>• Turn weaknesses into growth opportunities</li>
                  <li>• Provide concrete examples</li>
                </>
              )}
              {currentQuestion.category === 'Career Goals' && (
                <>
                  <li>• Show ambition and direction</li>
                  <li>• Align goals with company growth</li>
                  <li>• Be realistic and grounded</li>
                </>
              )}
              {currentQuestion.category === 'Final Pitch' && (
                <>
                  <li>• Summarize your unique value</li>
                  <li>• Show enthusiasm for the role</li>
                  <li>• Be confident and authentic</li>
                </>
              )}
            </ul>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
            <h4 className="text-sm font-semibold text-green-400 mb-3">Your Progress</h4>
            <div className="space-y-2">
              {hrQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    index === currentQuestionIndex
                      ? 'bg-green-500/20'
                      : responses[q.id]
                      ? 'bg-green-500/10'
                      : 'bg-slate-800/30'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      responses[q.id]
                        ? 'bg-green-500'
                        : index === currentQuestionIndex
                        ? 'bg-green-500/50'
                        : 'bg-slate-700'
                    }`}
                  >
                    {responses[q.id] ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm text-muted-white/70">{q.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-effect rounded-2xl overflow-hidden border border-cyan-glow/20">
            <div className="relative bg-slate-900 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <VideoOff className="w-16 h-16 text-muted-white/40" />
                </div>
              )}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">Recording</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800/50 flex items-center justify-center gap-4">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition-all ${
                  videoEnabled
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                {videoEnabled ? (
                  <Video className="w-5 h-5 text-white" />
                ) : (
                  <VideoOff className="w-5 h-5 text-red-400" />
                )}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-xl transition-all ${
                  audioEnabled
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                {audioEnabled ? (
                  <Mic className="w-5 h-5 text-white" />
                ) : (
                  <MicOff className="w-5 h-5 text-red-400" />
                )}
              </button>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={hasRecordedCurrentQuestion}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasRecordedCurrentQuestion ? 'Recorded' : 'Start Recording'}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all animate-pulse"
                >
                  Stop Recording
                </button>
              )}
            </div>
          </div>

          {hasRecordedCurrentQuestion && (
            <div className="glass-effect rounded-xl p-4 border border-green-500/30 bg-green-500/10">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Response recorded successfully</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-slate-700/50 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
          >
            Previous
          </button>

          {currentQuestionIndex === hrQuestions.length - 1 ? (
            <button
              onClick={handleSubmitInterview}
              disabled={isSubmitting || Object.keys(responses).length < hrQuestions.length}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
