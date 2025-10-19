import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AnalystCompanyFlow({ assessmentId }) {
  const [currentRound, setCurrentRound] = useState('quantitative_test');
  const [completedRounds, setCompletedRounds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [roundData, setRoundData] = useState({});

  const rounds = [
    { id: 'quantitative_test', name: 'Quantitative Test' },
    { id: 'sql_test', name: 'SQL Test' },
    { id: 'case_study', name: 'Case Study' },
    { id: 'domain_interview', name: 'Domain Interview' },
  ];

  const handleRoundComplete = (roundId, data) => {
    setCompletedRounds([...completedRounds, roundId]);
    setRoundData({ ...roundData, [roundId]: data });

    const currentIndex = rounds.findIndex(r => r.id === roundId);
    if (currentIndex < rounds.length - 1) {
      setCurrentRound(rounds[currentIndex + 1].id);
    }

    setProgress(((completedRounds.length + 1) / rounds.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h1 className="text-3xl font-bold text-white mb-6">Analyst Role Assessment Pipeline</h1>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-white/80">Overall Progress</span>
                <span className="text-sm font-semibold text-cyan-glow">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {rounds.map((round, index) => {
                const isCompleted = completedRounds.includes(round.id);
                const isCurrent = currentRound === round.id;
                const isUpcoming = !isCompleted && !isCurrent;

                return (
                  <div
                    key={round.id}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-green-500/10 border-green-500/50'
                        : isCurrent
                        ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500'
                            : isCurrent
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm ${
                          isCompleted ? 'text-green-400' : isCurrent ? 'text-green-400' : 'text-muted-white/60'
                        }`}>
                          {round.name}
                        </h3>
                        <p className="text-xs text-muted-white/50 mt-1">
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-yellow-500/30 bg-yellow-500/10 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analyst Pipeline Coming Soon!</h2>
          <p className="text-muted-white/70 mb-6">
            The analyst assessment pipeline is currently under development. This will include:
          </p>
          <ul className="text-left max-w-2xl mx-auto text-muted-white/80 space-y-2 mb-6">
            <li>• Quantitative & Analytical Reasoning Test</li>
            <li>• SQL & Data Manipulation Challenges</li>
            <li>• Business Case Study Analysis</li>
            <li>• Domain-Specific Technical Discussion</li>
          </ul>
          <p className="text-sm text-muted-white/60">
            Please check back soon or try the Service Company or Product Company pipelines.
          </p>
        </div>

        {completedRounds.length === rounds.length && (
          <div className="glass-effect rounded-2xl p-8 border border-green-500/30 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h2>
            <p className="text-muted-white/70 mb-6">
              You've successfully completed all rounds of the analyst assessment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              View Final Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
