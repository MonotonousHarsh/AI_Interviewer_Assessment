import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import CodingRound from './CodingRound';
import LiveCodingRound from './LiveCodingRound';
import SystemDesignRound from './SystemDesignRound';

export default function AssessmentFlow({ assessmentData, onComplete }) {
  const [currentStage, setCurrentStage] = useState('overview');
  const [assessmentId] = useState(assessmentData?.assessment_id);
  const [pipeline] = useState(assessmentData?.pipeline || []);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundResults, setRoundResults] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const startAssessment = () => {
    setCurrentStage('in-progress');
    setCurrentRoundIndex(0);
  };

  const handleRoundComplete = (result) => {
    setRoundResults(prev => ({
      ...prev,
      [pipeline[currentRoundIndex]]: result
    }));

    if (currentRoundIndex < pipeline.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      setCurrentStage('completed');
    }
  };

  const getCurrentRound = () => {
    const roundType = pipeline[currentRoundIndex];

    switch (roundType) {
      case 'coding_round':
        return <CodingRound assessmentId={assessmentId} onComplete={handleRoundComplete} />;
      case 'live_coding_round':
        return <LiveCodingRound assessmentId={assessmentId} onComplete={handleRoundComplete} />;
      case 'system_design_round':
        return <SystemDesignRound assessmentId={assessmentId} onComplete={handleRoundComplete} />;
      default:
        return (
          <div className="text-center py-20">
            <p className="text-muted-white/70">Round type "{roundType}" is not yet implemented.</p>
            <button
              onClick={handleRoundComplete}
              className="mt-4 px-6 py-3 rounded-xl bg-accent-1 text-white hover:bg-accent-2 transition-all"
            >
              Skip to Next Round
            </button>
          </div>
        );
    }
  };

  if (currentStage === 'in-progress') {
    return getCurrentRound();
  }

  if (currentStage === 'completed') {
    return (
      <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-neon-green/30 rounded-full blur-3xl"></div>
        </div>

        <div
          className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="glass-effect rounded-2xl p-12 border border-neon-green/20 shadow-card-shadow">
            <CheckCircle2 className="w-20 h-20 text-neon-green mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
              Assessment Complete!
            </h2>
            <p className="text-muted-white/70 text-lg mb-8">
              You have successfully completed all rounds of the assessment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {pipeline.map((round, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-bg-darker/30 border border-grid-blue/20">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-white capitalize">{round.replace('_', ' ')}</span>
                    <CheckCircle2 className="w-5 h-5 text-neon-green" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 items-center">
              <p className="text-muted-white/60 text-sm">
                Ready for the next stage?
              </p>
              <button
                onClick={() => onComplete && onComplete(roundResults)}
                className="px-8 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                Proceed to Virtual Interview
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
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
        className={`relative z-10 max-w-5xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-6">
            <CheckCircle2 className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Assessment Ready</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            Your Assessment Pipeline
          </h2>
          <p className="text-muted-white/70 text-lg">
            Company Type: <span className="text-accent-1 font-semibold">{assessmentData?.company_type}</span>
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow mb-8">
          <h3 className="text-2xl font-semibold text-muted-white mb-6">Assessment Rounds</h3>

          <div className="space-y-4">
            {pipeline.map((round, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-bg-darker/30 border border-grid-blue/20 hover:border-accent-1/50 transition-all">
                <div className="w-10 h-10 rounded-full bg-accent-1/20 border border-accent-1/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-1 font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-muted-white capitalize">
                    {round.replace('_', ' ')}
                  </h4>
                  <p className="text-muted-white/60 text-sm">
                    {getRoundDescription(round)}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-white/40" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20 shadow-card-shadow mb-8">
          <h3 className="text-xl font-semibold text-muted-white mb-3">Important Instructions</h3>
          <ul className="space-y-2 text-muted-white/70">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <span>Complete all rounds in the given sequence</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <span>Each round has a time limit, use it wisely</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <span>Your code will be evaluated for correctness and efficiency</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <span>In live coding, communicate your thought process clearly</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            onClick={startAssessment}
            className="px-8 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 flex items-center gap-2 text-lg"
          >
            Start Assessment
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}

function getRoundDescription(roundType) {
  const descriptions = {
    'coding_round': 'Solve 3 DSA problems (Easy, Medium, Hard) with time constraints',
    'live_coding_round': 'Collaborate with AI interviewer to solve a problem while discussing your approach',
    'system_design_round': 'Design scalable systems and explain architectural decisions',
    'behavioral_round': 'Discuss your experience, projects, and problem-solving approach',
    'technical_interview': 'Deep dive into technical concepts and past projects'
  };

  return descriptions[roundType] || 'Complete this assessment round';
}
