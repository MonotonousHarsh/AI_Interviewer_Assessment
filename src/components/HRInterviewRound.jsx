import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, CheckCircle, AlertCircle, Users, Clock } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function HRInterviewRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [roundData, setRoundData] = useState(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

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
    try {
      const response = await apiClient.post(`/service/assessments/${assessmentId}/hr_interview/start`);
      setRoundId(response.round_id);
      setRoundData(response);

      await startMediaCapture();
      setRoundStarted(true);
    } catch (error) {
      alert('Failed to start HR interview: ' + error.message);
    }
  };

  const startRecording = () => {
    if (!mediaStream) return;

    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm',
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const currentQuestion = roundData.first_question || roundData.questions?.[currentQuestionIndex];

      const audioBlob = new Blob(chunks, { type: 'audio/webm' });

      try {
        const formData = new FormData();
        formData.append('question_id', currentQuestion.question_id);
        formData.append('audio_data', audioBlob, 'audio.webm');
        if (blob.size > 0) {
          formData.append('video_data', blob, 'video.webm');
        }

        const response = await apiClient.post(
          `/service/assessments/hr_interview/${roundId}/submit_response`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setResponses(prev => ({
          ...prev,
          [currentQuestion.question_id]: {
            blob,
            timestamp: new Date().toISOString(),
            evaluation: response.evaluation
          }
        }));

        if (response.next_question) {
          setCurrentQuestionIndex(prev => prev + 1);
        }

        if (response.all_questions_answered) {
          handleCompleteInterview();
        }
      } catch (error) {
        alert('Failed to submit response: ' + error.message);
      }
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordedChunks([]);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (roundData?.total_questions || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleCompleteInterview = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/service/assessments/hr_interview/${roundId}/complete`
      );

      setResults(response);
    } catch (error) {
      alert('Failed to complete interview: ' + error.message);
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

  if (results) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">HR Interview Complete</h2>
          <p className="text-muted-white/70">
            All assessment rounds completed successfully!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {results.component_scores?.communication || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Communication</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {results.component_scores?.attitude || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Attitude</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {results.component_scores?.teamwork || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Teamwork</div>
          </div>
        </div>

        {results.cultural_fit_recommendation && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-green-400 font-semibold mb-2">Cultural Fit</h4>
            <p className="text-muted-white/70">{results.cultural_fit_recommendation}</p>
          </div>
        )}

        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-xl text-white font-semibold">Assessment Pipeline Complete!</p>
        </div>
      </div>
    );
  }

  if (!roundStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">HR Interview Round</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            Final round assessing communication skills, cultural fit, and career aspirations through video responses.
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
                <li>• 2 minutes per question</li>
                <li>• Be honest and authentic in your responses</li>
                <li>• Maintain professional demeanor throughout</li>
                <li>• Questions will be evaluated for communication and cultural fit</li>
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

  const currentQuestion = roundData?.first_question || roundData?.questions?.[currentQuestionIndex];
  const hasRecordedCurrentQuestion = currentQuestion && !!responses[currentQuestion.question_id];
  const totalQuestions = roundData?.total_questions || 0;

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-white/60 mb-1">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            <div className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full inline-block">
              {currentQuestion?.category || 'HR Question'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-white/70">
              {Object.keys(responses).length}/{totalQuestions} answered
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-cyan-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">{currentQuestion?.time_limit_seconds ? `${currentQuestion.time_limit_seconds / 60} min` : '2 min'}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion?.question_text}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-white/60">
              <AlertCircle className="w-4 h-4" />
              <span>Time limit: {currentQuestion?.time_limit_seconds ? `${currentQuestion.time_limit_seconds / 60} minutes` : '2 minutes'}</span>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h4 className="text-sm font-semibold text-muted-white/80 mb-3">Tips for answering:</h4>
            <ul className="text-sm text-muted-white/70 space-y-2">
              <li>• Be concise and relevant</li>
              <li>• Provide specific examples</li>
              <li>• Speak clearly and confidently</li>
              <li>• Maintain eye contact with camera</li>
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

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleCompleteInterview}
              disabled={isSubmitting || Object.keys(responses).length < totalQuestions}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Completing...' : 'Complete Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={!hasRecordedCurrentQuestion}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
