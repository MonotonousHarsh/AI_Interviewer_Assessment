import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MessageSquare, Award, AlertTriangle, Target, BookOpen, CheckCircle2, XCircle, Loader2, FileText, Download } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { saveComprehensiveReport, updateAssessmentStatus } from '../utils/supabaseClient';

export default function ComprehensiveReport({ assessmentId, candidateId, onBackToHome }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    generateAndFetchReport();
  }, [assessmentId]);

  const generateAndFetchReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/generate-comprehensive-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_id: assessmentId, include_recording: true })
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const reportData = await response.json();
      setReport(reportData);

      await saveComprehensiveReport({
        ...reportData,
        company_type: 'product'
      });

      await updateAssessmentStatus(
        assessmentId,
        'completed',
        new Date().toISOString(),
        reportData.overall_scorecard.overall_score,
        reportData.report_id
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-neon-green';
    if (score >= 60) return 'text-accent-1';
    return 'text-accent-2';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-neon-green/20 border-neon-green/30';
    if (score >= 60) return 'bg-accent-1/20 border-accent-1/30';
    return 'bg-accent-2/20 border-accent-2/30';
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-accent-1 animate-spin mx-auto mb-4" />
          <p className="text-muted-white text-lg">Generating comprehensive analysis...</p>
          <p className="text-muted-white/60 text-sm mt-2">This may take a few moments</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-accent-2 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-muted-white mb-2">Error Generating Report</h3>
          <p className="text-muted-white/70 mb-6">{error}</p>
          <button
            onClick={onBackToHome}
            className="px-6 py-3 rounded-lg bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold"
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  if (!report) return null;

  return (
    <section className="relative min-h-screen py-20 px-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-neon-green/30 mb-4">
            <CheckCircle2 className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Assessment Complete</span>
          </div>
          <h2 className="text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            Comprehensive Analysis Report
          </h2>
          <p className="text-muted-white/70 text-lg">
            Generated on {new Date(report.generated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-bg-darker/30">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(report.overall_scorecard.overall_score)}`}>
                {report.overall_scorecard.overall_score}
              </div>
              <div className="text-muted-white/60 text-sm">Overall Score</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-bg-darker/30">
              <div className="text-3xl font-bold mb-2 text-neon-green">
                {report.overall_scorecard.strength_areas.length}
              </div>
              <div className="text-muted-white/60 text-sm">Strength Areas</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-bg-darker/30">
              <div className="text-3xl font-bold mb-2 text-accent-2">
                {report.overall_scorecard.development_areas.length}
              </div>
              <div className="text-muted-white/60 text-sm">Development Areas</div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {['overview', 'scorecard', 'performance', 'communication', 'improvement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-b from-accent-1 to-accent-2 text-white shadow-btn-primary'
                  : 'glass-effect border border-grid-blue/20 text-muted-white/70 hover:text-muted-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-accent-1" />
                <h3 className="text-2xl font-bold text-muted-white">AI-Generated Summary</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-white/80 leading-relaxed whitespace-pre-line">
                  {report.ai_generated_summary}
                </p>
              </div>
            </div>

            {report.bias_check.potential_bias_detected && (
              <div className="glass-effect rounded-2xl p-8 border border-accent-2/30 shadow-card-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-accent-2" />
                  <h3 className="text-2xl font-bold text-muted-white">Bias Check Alert</h3>
                </div>
                <p className="text-muted-white/70 mb-4">
                  Potential bias detected with {report.bias_check.confidence_score}% confidence
                </p>
                <div className="space-y-3">
                  {report.bias_check.bias_types.map((biasType, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-accent-2/10 border border-accent-2/20">
                      <span className="text-accent-2 font-semibold">{biasType.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-white/60 mb-2">Mitigation Suggestions:</p>
                  <ul className="space-y-2">
                    {report.bias_check.mitigation_suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-muted-white/70 text-sm flex items-start gap-2">
                        <span className="text-accent-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {report.key_moments.length > 0 && (
              <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-neon-green" />
                  <h3 className="text-2xl font-bold text-muted-white">Key Moments</h3>
                </div>
                <div className="space-y-4">
                  {report.key_moments.map((moment, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-bg-darker/30 border border-grid-blue/10">
                      <div className="flex items-start gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          moment.type === 'strength' ? 'bg-neon-green/20 text-neon-green' : 'bg-accent-1/20 text-accent-1'
                        }`}>
                          {moment.timestamp}
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-white font-semibold mb-1">{moment.description}</p>
                          <p className="text-muted-white/60 text-sm">{moment.evidence}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scorecard' && (
          <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-accent-1" />
              <h3 className="text-2xl font-bold text-muted-white">Competency Scorecard</h3>
            </div>
            <div className="space-y-6">
              {report.overall_scorecard.competency_scores.map((competency, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-bg-darker/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-muted-white capitalize">
                      {competency.competency.replace(/_/g, ' ')}
                    </h4>
                    <div className={`text-2xl font-bold ${getScoreColor(competency.score)}`}>
                      {competency.score}/100
                    </div>
                  </div>
                  <div className="w-full h-3 bg-bg-deeper rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        competency.score >= 80 ? 'bg-neon-green' : competency.score >= 60 ? 'bg-accent-1' : 'bg-accent-2'
                      }`}
                      style={{ width: `${competency.score}%` }}
                    ></div>
                  </div>
                  {competency.evidence.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-white/60 mb-2">Evidence:</p>
                      <ul className="space-y-1">
                        {competency.evidence.map((ev, i) => (
                          <li key={i} className="text-sm text-muted-white/70 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {competency.improvement_suggestions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-white/60 mb-2">Improvement Suggestions:</p>
                      <ul className="space-y-1">
                        {competency.improvement_suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-white/70 flex items-start gap-2">
                            <Target className="w-4 h-4 text-accent-1 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-accent-1" />
              <h3 className="text-2xl font-bold text-muted-white">Performance Breakdown</h3>
            </div>
            <div className="space-y-6">
              {report.detailed_performance_breakdown.map((performance, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-bg-darker/30 border border-grid-blue/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-muted-white mb-2">
                        {performance.question_text}
                      </h4>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(performance.evaluation_score)}`}>
                        <span className={`text-sm font-bold ${getScoreColor(performance.evaluation_score)}`}>
                          Score: {performance.evaluation_score}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {performance.candidate_response && (
                    <div className="mb-4 p-4 rounded-lg bg-bg-deeper/50">
                      <p className="text-xs text-muted-white/60 mb-2">Your Response:</p>
                      <p className="text-sm text-muted-white/80 line-clamp-3">{performance.candidate_response}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {performance.strengths_demonstrated.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-neon-green mb-2">Strengths:</p>
                        <ul className="space-y-1">
                          {performance.strengths_demonstrated.map((strength, i) => (
                            <li key={i} className="text-sm text-muted-white/70 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {performance.improvement_areas.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-accent-2 mb-2">Areas to Improve:</p>
                        <ul className="space-y-1">
                          {performance.improvement_areas.map((area, i) => (
                            <li key={i} className="text-sm text-muted-white/70 flex items-start gap-2">
                              <Target className="w-4 h-4 text-accent-2 mt-0.5 flex-shrink-0" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-accent-1/10 border border-accent-1/20">
                    <p className="text-sm font-semibold text-accent-1 mb-2">Detailed Feedback:</p>
                    <p className="text-sm text-muted-white/80">{performance.specific_feedback}</p>
                  </div>

                  {performance.recommended_resources.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-muted-white/70 mb-2">Recommended Resources:</p>
                      <div className="flex flex-wrap gap-2">
                        {performance.recommended_resources.map((resource, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-accent-1/10 text-accent-1 text-xs">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-accent-1" />
              <h3 className="text-2xl font-bold text-muted-white">Communication Analytics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-bg-darker/30">
                <div className="text-sm text-muted-white/60 mb-2">Speech Clarity</div>
                <div className={`text-4xl font-bold mb-3 ${getScoreColor(report.communication_analytics.speech_clarity_score)}`}>
                  {report.communication_analytics.speech_clarity_score}/100
                </div>
                <div className="w-full h-2 bg-bg-deeper rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-1"
                    style={{ width: `${report.communication_analytics.speech_clarity_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-bg-darker/30">
                <div className="text-sm text-muted-white/60 mb-2">Articulation Score</div>
                <div className={`text-4xl font-bold mb-3 ${getScoreColor(report.communication_analytics.articulation_score)}`}>
                  {report.communication_analytics.articulation_score}/100
                </div>
                <div className="w-full h-2 bg-bg-deeper rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-green"
                    style={{ width: `${report.communication_analytics.articulation_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-bg-darker/30">
                <div className="text-sm text-muted-white/60 mb-2">Speaking Pace</div>
                <div className="text-2xl font-bold text-muted-white capitalize">
                  {report.communication_analytics.pace_analysis.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-bg-darker/30">
                <div className="text-sm text-muted-white/60 mb-2">Confidence Level</div>
                <div className="text-2xl font-bold text-muted-white capitalize">
                  {report.communication_analytics.confidence_level}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-bg-darker/30">
                <div className="text-sm text-muted-white/60 mb-2">Filler Words/Minute</div>
                <div className="text-2xl font-bold text-muted-white">
                  {report.communication_analytics.filler_words_per_minute.toFixed(1)}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-bg-darker/30">
                <div className="text-sm text-muted-white/60 mb-2">Vocal Energy</div>
                <div className={`text-2xl font-bold ${getScoreColor(report.communication_analytics.vocal_energy)}`}>
                  {report.communication_analytics.vocal_energy}/100
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'improvement' && (
          <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-accent-1" />
              <h3 className="text-2xl font-bold text-muted-white">Personalized Improvement Plan</h3>
            </div>

            <div className="mb-8 p-6 rounded-xl bg-accent-1/10 border border-accent-1/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-white/60 mb-1">Estimated Timeline</p>
                  <p className="text-3xl font-bold text-accent-1">
                    {report.improvement_plan.estimated_timeline_weeks} Weeks
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-white/60 mb-1">Focus Areas</p>
                  <p className="text-3xl font-bold text-neon-green">
                    {report.improvement_plan.focus_areas.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-semibold text-muted-white mb-4">Focus Areas</h4>
                <div className="flex flex-wrap gap-3">
                  {report.improvement_plan.focus_areas.map((area, idx) => (
                    <div key={idx} className="px-4 py-2 rounded-lg bg-accent-1/20 border border-accent-1/30">
                      <span className="text-accent-1 font-semibold capitalize">{area.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-muted-white mb-4">Learning Resources</h4>
                <div className="space-y-4">
                  {Object.entries(report.improvement_plan.learning_resources).map(([area, resources], idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-bg-darker/30">
                      <h5 className="text-lg font-semibold text-muted-white mb-3 capitalize">
                        {area.replace(/_/g, ' ')}
                      </h5>
                      <ul className="space-y-2">
                        {resources.map((resource, i) => (
                          <li key={i} className="text-muted-white/70 flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-accent-1 mt-1 flex-shrink-0" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-muted-white mb-4">Practice Exercises</h4>
                <div className="space-y-2">
                  {report.improvement_plan.practice_exercises.map((exercise, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-bg-darker/30 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                      <span className="text-muted-white/80">{exercise}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-muted-white mb-4">Milestones</h4>
                <div className="space-y-3">
                  {report.improvement_plan.milestones.map((milestone, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-bg-darker/30 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-1/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent-1 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <span className="text-muted-white/80">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onBackToHome}
            className="px-8 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-0.5"
          >
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
}
