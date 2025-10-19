import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function TechnicalInterviewRound({ assessmentId, onComplete }) {
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

  const technicalQuestions = [
    {
      id: 'tech_1',
      question: 'Explain the difference between synchronous and asynchronous programming. When would you use each?',
      category: 'Programming Fundamentals',
      timeLimit: 180,
    },
    {
      id: 'tech_2',
      question: 'What is the difference between a stack and a queue? Can you give real-world examples of each?',
      category: 'Data Structures',
      timeLimit: 180,
    },
    {
      id: 'tech_3',
      question: 'Describe your approach to debugging a production issue. Walk me through your process.',
      category: 'Problem Solving',
      timeLimit: 180,
    },
    {
      id: 'tech_4',
      question: 'What is your experience with version control systems like Git? Explain branching strategies.',
      category: 'Tools & Practices',
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
        const currentQuestion = technicalQuestions[currentQuestionIndex];
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
    if (currentQuestionIndex < technicalQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitInterview = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onComplete({
        totalQuestions: technicalQuestions.length,
        answeredQuestions: Object.keys(responses).length,
        score: 75,
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
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Technical Interview Round</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            In this round, you'll answer technical questions via video. Each question has a 3-minute time limit.
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Interview Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Programming Fundamentals',
              'Data Structures',
              'Problem Solving',
              'Tools & Practices',
            ].map((topic, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
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
                <li>• 3 minutes per question</li>
                <li>• Record your response for each question</li>
                <li>• Speak clearly and explain your reasoning</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartRound}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
        >
          Start Technical Interview
        </button>
      </div>
    );
  }

  const currentQuestion = technicalQuestions[currentQuestionIndex];
  const hasRecordedCurrentQuestion = !!responses[currentQuestion.id];

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-white/60 mb-1">
              Question {currentQuestionIndex + 1} of {technicalQuestions.length}
            </div>
            <div className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full inline-block">
              {currentQuestion.category}
            </div>
          </div>
          <div className="text-sm text-muted-white/70">
            {Object.keys(responses).length}/{technicalQuestions.length} answered
          </div>
        </div>

        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / technicalQuestions.length) * 100}%` }}
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
            <h4 className="text-sm font-semibold text-muted-white/80 mb-3">Tips for answering:</h4>
            <ul className="text-sm text-muted-white/70 space-y-2">
              <li>• Start with a brief overview of your answer</li>
              <li>• Provide specific examples where possible</li>
              <li>• Explain your reasoning clearly</li>
              <li>• Mention any trade-offs or considerations</li>
            </ul>
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

          {currentQuestionIndex === technicalQuestions.length - 1 ? (
            <button
              onClick={handleSubmitInterview}
              disabled={isSubmitting || Object.keys(responses).length < technicalQuestions.length}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Interview'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-all"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
