import { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Clock, Lightbulb, TrendingUp } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export default function CaseStudyRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [caseStudy, setCaseStudy] = useState(null);
  const [response, setResponse] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(2700);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitResponse();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const handleStartCaseStudy = async () => {
    try {
      const apiResponse = await apiClient.post(`/analyst/assessments/${assessmentId}/case_study/start`);
      setRoundId(apiResponse.round_id);
      setTimeRemaining(apiResponse.time_limit_minutes * 60);

      const mockCaseStudy = {
        case_id: 'case_1',
        title: 'User Engagement Drop Analysis',
        problem_statement: 'Our social media app noticed a 15% drop in daily active users last month. How would you investigate this?',
        background: 'We\'re a social media platform with 10M daily active users. The drop occurred suddenly and seems to be affecting all user segments.',
        available_data: [
          'Daily active users by region',
          'User retention cohorts',
          'Feature usage metrics',
          'App store reviews and ratings',
          'Competitor activity data'
        ],
        evaluation_criteria: [
          'Structured problem decomposition',
          'Hypothesis generation and prioritization',
          'Data analysis plan',
          'Actionable recommendations'
        ]
      };

      setCaseStudy(mockCaseStudy);
      setTestStarted(true);
    } catch (error) {
      alert('Failed to start case study: ' + error.message);
    }
  };

  const handleSubmitResponse = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const apiResponse = await apiClient.post(
        `/analyst/assessments/case_study/${roundId}/submit`,
        { analysis: response }
      );

      setResults(apiResponse);
    } catch (error) {
      alert('Failed to submit response: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (results) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            results.overall_score >= 60 ? 'bg-green-500/20' : 'bg-orange-500/20'
          }`}>
            {results.overall_score >= 60 ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-400" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Case Study Complete</h2>
          <p className="text-muted-white/70">
            {results.overall_score >= 60
              ? 'Excellent analysis! Click below to proceed to the domain interview.'
              : 'Review your approach and try again.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-green-400 mb-2">{results.overall_score}%</div>
            <div className="text-sm text-muted-white/60">Overall Score</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {results.component_scores?.structure || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Structure</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {results.component_scores?.analysis || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Analysis</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-4xl font-bold text-orange-400 mb-2">
              {results.component_scores?.recommendations || 0}%
            </div>
            <div className="text-sm text-muted-white/60">Recommendations</div>
          </div>
        </div>

        {results.overall_score >= 60 && (
          <button
            onClick={() => onComplete(results)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            Proceed to Domain Interview
          </button>
        )}
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="glass-effect rounded-2xl p-8 border border-cyan-glow/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Business Case Study Analysis</h2>
          <p className="text-muted-white/70 max-w-2xl mx-auto mb-6">
            This round evaluates your analytical thinking and problem-solving approach through a real-world
            business scenario. You'll have 45 minutes to analyze the case and provide recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
            <Lightbulb className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Problem Analysis</h3>
            <p className="text-sm text-muted-white/70">Break down complex problems</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Data-Driven Insights</h3>
            <p className="text-sm text-muted-white/70">Generate actionable insights</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Recommendations</h3>
            <p className="text-sm text-muted-white/70">Provide clear next steps</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-1">Important Instructions</h4>
              <ul className="text-sm text-muted-white/70 space-y-1">
                <li>• Time limit: 45 minutes</li>
                <li>• Read the case study carefully</li>
                <li>• Structure your analysis clearly</li>
                <li>• Use a framework (e.g., hypothesis-driven approach)</li>
                <li>• Provide specific, actionable recommendations</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartCaseStudy}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Start Case Study
        </button>
      </div>
    );
  }

  const wordCount = response.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-semibold">Case Study Analysis</span>
            </div>
            <div className="text-sm text-muted-white/70">
              {wordCount} words
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-purple-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h3 className="text-2xl font-bold text-white mb-4">{caseStudy?.title}</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Problem Statement</h4>
                <p className="text-muted-white/80">{caseStudy?.problem_statement}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Background</h4>
                <p className="text-muted-white/80">{caseStudy?.background}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">Available Data</h4>
                <ul className="space-y-2">
                  {caseStudy?.available_data?.map((data, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {data}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5">
            <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Evaluation Criteria
            </h4>
            <ul className="space-y-2">
              {caseStudy?.evaluation_criteria?.map((criteria, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-white/70 text-sm">
                  <CheckCircle className="w-4 h-4 text-yellow-400" />
                  {criteria}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <h4 className="text-lg font-semibold text-white mb-4">Your Analysis</h4>

            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full h-[500px] bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Write your analysis here...

Suggested structure:
1. Problem Definition
2. Hypothesis Generation
3. Data Analysis Plan
4. Key Insights
5. Recommendations
6. Next Steps"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
              <div className="text-sm text-muted-white/60">
                Minimum 200 words recommended
              </div>
              <div className={`text-sm font-semibold ${
                wordCount >= 200 ? 'text-green-400' : 'text-orange-400'
              }`}>
                {wordCount} / 200+ words
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-cyan-glow/20">
            <button
              onClick={handleSubmitResponse}
              disabled={isSubmitting || wordCount < 50}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Analysis'}
            </button>
            {wordCount < 50 && (
              <p className="text-sm text-orange-400 text-center mt-2">
                Please write at least 50 words
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
