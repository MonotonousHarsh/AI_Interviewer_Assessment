import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Award, Briefcase, MessageSquare, RefreshCw, ArrowRight, Building2, Users, BarChart3 } from 'lucide-react';

export default function ScreeningResults({ screeningResult, jobProfile, onRetry, onProceedToAssessment, onDirectVirtualInterview }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPipelineSelection, setShowPipelineSelection] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const isPassed = screeningResult.match_score >= 70;

  const getRecommendedType = () => {
    const summary = screeningResult.summary?.toLowerCase() || '';
    if (summary.includes('service') || summary.includes('tcs') || summary.includes('infosys')) {
      return 'service';
    } else if (summary.includes('analyst') || summary.includes('data') || summary.includes('bi')) {
      return 'analyst';
    }
    return 'product';
  };

  const recommendedType = getRecommendedType();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-neon-green to-cyan-glow';
    if (score >= 60) return 'from-cyan-glow to-accent-1';
    return 'from-red-400 to-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-neon-green/10 border-neon-green/30';
    if (score >= 60) return 'bg-cyan-glow/10 border-cyan-glow/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  return (
    <section id="screening-results" className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-5xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border mb-6 ${
            isPassed ? 'border-neon-green/30' : 'border-red-400/30'
          }`}>
            {isPassed ? (
              <CheckCircle2 className="w-4 h-4 text-neon-green" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-muted-white/90">Screening Complete</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            {isPassed ? 'Congratulations!' : 'Resume Analysis Complete'}
          </h2>
          <p className="text-muted-white/70 text-lg">
            {isPassed
              ? 'Your resume has been shortlisted for the next round'
              : 'Review the feedback below to improve your resume'}
          </p>
        </div>

        <div className={`glass-effect rounded-2xl p-8 border shadow-card-shadow mb-8 ${
          isPassed ? 'border-neon-green/20' : 'border-red-400/20'
        }`}>
          <div className="flex flex-col items-center justify-center mb-8">
            <div className={`relative w-40 h-40 rounded-full flex items-center justify-center border-4 ${getScoreBg(screeningResult.match_score)}`}>
              <div className="text-center">
                <div className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(screeningResult.match_score)} bg-clip-text text-transparent`}>
                  {screeningResult.match_score}
                </div>
                <div className="text-muted-white/60 text-sm mt-1">Match Score</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-bg-darker/30 border border-grid-blue/20 mb-6">
            <h3 className="text-xl font-semibold text-muted-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-glow" />
              Summary
            </h3>
            <p className="text-muted-white/80 leading-relaxed">{screeningResult.summary}</p>
          </div>

          {screeningResult.component_scores && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-muted-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-glow" />
                Detailed Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(screeningResult.component_scores).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-xl bg-bg-darker/30 border border-grid-blue/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-white/80 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className={`font-bold bg-gradient-to-r ${getScoreColor(value)} bg-clip-text text-transparent`}>
                        {value}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bg-darker overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getScoreColor(value)} transition-all duration-1000`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screeningResult.skill_proficiency && Object.keys(screeningResult.skill_proficiency).length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-muted-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-glow" />
                Skill Proficiency
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(screeningResult.skill_proficiency).map(([skill, level]) => {
                  const getLevelColor = (lvl) => {
                    const l = lvl.toLowerCase();
                    if (l.includes('high')) return 'text-neon-green border-neon-green/30 bg-neon-green/10';
                    if (l.includes('medium')) return 'text-cyan-glow border-cyan-glow/30 bg-cyan-glow/10';
                    if (l.includes('low')) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
                    return 'text-red-400 border-red-400/30 bg-red-400/10';
                  };

                  return (
                    <div key={skill} className="flex items-center justify-between p-3 rounded-xl bg-bg-darker/30 border border-grid-blue/20">
                      <span className="text-muted-white/80">{skill}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getLevelColor(level)}`}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {screeningResult.red_flags && screeningResult.red_flags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-muted-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Points to Address
              </h3>
              <div className="space-y-2">
                {screeningResult.red_flags.map((flag, index) => (
                  <div key={index} className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 rounded-xl bg-accent-1/5 border border-accent-1/20">
            <h3 className="text-xl font-semibold text-muted-white mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-glow" />
              Feedback & Recommendations
            </h3>
            <div className="text-muted-white/80 leading-relaxed whitespace-pre-line">
              {screeningResult.feedback_for_candidate}
            </div>
          </div>
        </div>

        {!showPipelineSelection ? (
          <div className="flex flex-col sm:flex-row gap-4">
            {isPassed ? (
              <button
                onClick={() => setShowPipelineSelection(true)}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Proceed to Assessment
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onRetry}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Update Resume & Retry
              </button>
            )}

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-1 px-6 py-4 rounded-xl glass-effect border border-accent-1/35 text-muted-white font-semibold hover:border-accent-1/75 transition-all hover:shadow-hero-glow"
            >
              Start New Application
            </button>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">Choose Your Assessment Pipeline</h3>
              <p className="text-muted-white/70">
                Based on your resume, we recommend: <span className="text-cyan-400 font-semibold capitalize">{recommendedType} Company</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                {
                  id: 'product',
                  name: 'Product Company',
                  icon: Building2,
                  description: 'Coding, System Design, Behavioral',
                  color: 'from-blue-500 to-cyan-500',
                  borderColor: 'border-blue-500/30',
                  bgColor: 'from-blue-500/10 to-cyan-500/10'
                },
                {
                  id: 'service',
                  name: 'Service Company',
                  icon: Users,
                  description: 'Aptitude, Core Competency, Technical, HR',
                  color: 'from-purple-500 to-pink-500',
                  borderColor: 'border-purple-500/30',
                  bgColor: 'from-purple-500/10 to-pink-500/10'
                },
                {
                  id: 'analyst',
                  name: 'Analyst Role',
                  icon: BarChart3,
                  description: 'Quantitative, SQL, Case Study, Domain',
                  color: 'from-green-500 to-emerald-500',
                  borderColor: 'border-green-500/30',
                  bgColor: 'from-green-500/10 to-emerald-500/10'
                }
              ].map((pipeline) => {
                const Icon = pipeline.icon;
                const isRecommended = pipeline.id === recommendedType;
                const isSelected = selectedPipeline === pipeline.id;

                return (
                  <button
                    key={pipeline.id}
                    onClick={() => setSelectedPipeline(pipeline.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `${pipeline.borderColor} bg-gradient-to-br ${pipeline.bgColor} scale-105`
                        : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/30'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full">
                        <span className="text-xs text-white font-semibold">Recommended</span>
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pipeline.bgColor} border ${pipeline.borderColor} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{pipeline.name}</h4>
                    <p className="text-sm text-muted-white/70">{pipeline.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onProceedToAssessment(selectedPipeline)}
                disabled={!selectedPipeline}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Start {selectedPipeline ? selectedPipeline.charAt(0).toUpperCase() + selectedPipeline.slice(1) : ''} Assessment
                <ArrowRight className="w-5 h-5" />
              </button>

              {onDirectVirtualInterview && (
                <button
                  onClick={() => onDirectVirtualInterview(selectedPipeline)}
                  disabled={!selectedPipeline}
                  className="w-full px-6 py-3 rounded-xl glass-effect border border-cyan-glow/30 text-muted-white font-semibold hover:border-cyan-glow/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Skip to Virtual Interview
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
