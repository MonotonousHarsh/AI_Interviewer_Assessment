import { useState, useEffect } from 'react';
import { History, Clock, Award, TrendingUp, Eye, Loader2, AlertCircle, Calendar, Briefcase } from 'lucide-react';
import { getCandidateHistory } from '../utils/supabaseClient';

export default function AssessmentHistory({ candidateId, onViewReport, onBackToHome }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [candidateId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCandidateHistory(candidateId);
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-neon-green bg-neon-green/20 border-neon-green/30';
      case 'in_progress':
        return 'text-accent-1 bg-accent-1/20 border-accent-1/30';
      case 'abandoned':
        return 'text-muted-white/50 bg-muted-white/10 border-muted-white/20';
      default:
        return 'text-muted-white bg-muted-white/20 border-muted-white/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-neon-green';
    if (score >= 60) return 'text-accent-1';
    return 'text-accent-2';
  };

  const getCompanyTypeIcon = (type) => {
    switch (type) {
      case 'product':
        return '🚀';
      case 'service':
        return '🛠️';
      case 'analyst':
        return '📊';
      default:
        return '💼';
    }
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-accent-1 animate-spin mx-auto mb-4" />
          <p className="text-muted-white text-lg">Loading your assessment history...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-accent-2 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-muted-white mb-2">Error Loading History</h3>
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

  return (
    <section className="relative min-h-screen py-20 px-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-glow/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-accent-1/30 mb-4">
            <History className="w-4 h-4 text-accent-1" />
            <span className="text-sm text-muted-white/90">Assessment History</span>
          </div>
          <h2 className="text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            Your Interview Journey
          </h2>
          <p className="text-muted-white/70 text-lg">
            Track your progress and view detailed reports from all your assessments
          </p>
        </div>

        {history.length === 0 ? (
          <div className="glass-effect rounded-2xl p-12 border border-grid-blue/20 shadow-card-shadow text-center">
            <History className="w-20 h-20 text-muted-white/30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-muted-white mb-3">No Assessments Yet</h3>
            <p className="text-muted-white/60 mb-8">
              Start your first assessment to begin tracking your progress
            </p>
            <button
              onClick={onBackToHome}
              className="px-8 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-0.5"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-effect rounded-xl p-6 border border-grid-blue/20">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-accent-1" />
                  <span className="text-muted-white/60 text-sm">Total Assessments</span>
                </div>
                <div className="text-3xl font-bold text-muted-white">{history.length}</div>
              </div>

              <div className="glass-effect rounded-xl p-6 border border-grid-blue/20">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-neon-green" />
                  <span className="text-muted-white/60 text-sm">Completed</span>
                </div>
                <div className="text-3xl font-bold text-neon-green">
                  {history.filter(h => h.status === 'completed').length}
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 border border-grid-blue/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent-1" />
                  <span className="text-muted-white/60 text-sm">Average Score</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(
                  Math.round(
                    history
                      .filter(h => h.overall_score !== null)
                      .reduce((acc, h) => acc + h.overall_score, 0) /
                    history.filter(h => h.overall_score !== null).length || 0
                  )
                )}`}>
                  {history.filter(h => h.overall_score !== null).length > 0
                    ? Math.round(
                        history
                          .filter(h => h.overall_score !== null)
                          .reduce((acc, h) => acc + h.overall_score, 0) /
                        history.filter(h => h.overall_score !== null).length
                      )
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {history.map((assessment) => (
                <div
                  key={assessment.id}
                  className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow hover:border-accent-1/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getCompanyTypeIcon(assessment.company_type)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-muted-white capitalize">
                            {assessment.company_type} Company Assessment
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(assessment.status)}`}>
                              {assessment.status.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1 text-muted-white/60 text-sm">
                              <Calendar className="w-4 h-4" />
                              {new Date(assessment.started_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="p-3 rounded-lg bg-bg-darker/30">
                          <div className="text-xs text-muted-white/60 mb-1">Started</div>
                          <div className="text-sm text-muted-white font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(assessment.started_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {assessment.completed_at && (
                          <div className="p-3 rounded-lg bg-bg-darker/30">
                            <div className="text-xs text-muted-white/60 mb-1">Completed</div>
                            <div className="text-sm text-muted-white font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(assessment.completed_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}

                        {assessment.overall_score !== null && (
                          <div className="p-3 rounded-lg bg-bg-darker/30">
                            <div className="text-xs text-muted-white/60 mb-1">Score</div>
                            <div className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                              {assessment.overall_score}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {assessment.status === 'completed' && assessment.report_id && (
                        <button
                          onClick={() => onViewReport(assessment.report_id, assessment.assessment_id)}
                          className="px-6 py-3 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          View Report
                        </button>
                      )}
                      {assessment.status === 'in_progress' && (
                        <div className="px-6 py-3 rounded-xl bg-accent-1/20 text-accent-1 font-semibold flex items-center gap-2 border border-accent-1/30">
                          <Clock className="w-4 h-4 animate-pulse" />
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onBackToHome}
                className="px-8 py-4 rounded-xl glass-effect border border-grid-blue/20 text-muted-white font-semibold hover:border-accent-1/30 transition-all"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
