import { useState, useEffect } from 'react';
import { Briefcase, Upload, CheckCircle2, Loader2 } from 'lucide-react';

const PRESET_JOBS = [
  'Business Analyst',
  'Product Manager',
  'Software Engineer',
  'Data Analyst'
];

export default function JobDescriptionForm({ onJobCreated }) {
  const [step, setStep] = useState('select');
  const [jobType, setJobType] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [company, setCompany] = useState('');
  // State updated for raw text input
  const [rawJobText, setRawJobText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint;
      let payload;

      // Logic to switch between the old and new endpoint based on user choice
      if (jobType === 'preset') {
        endpoint = 'http://localhost:8000/jobs/analyze';
        payload = {
          company: company.trim(),
          job_type_preset: selectedPreset
        };
      } else { // 'custom' job type uses the new, smarter endpoint
        endpoint = 'http://localhost:8000/jobs/analyze-raw';
        payload = {
          raw_text: rawJobText.trim(),
          company_override: company.trim() // Send company name separately
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze job description');
      }

      const jobProfile = await response.json();
      onJobCreated(jobProfile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated validation logic for the new single text area
  const isFormValid = () => {
    if (!company.trim()) return false;
    if (jobType === 'preset') return selectedPreset !== '';
    return rawJobText.trim();
  };

  return (
    <section id="job-description" className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-1/30 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-6">
            <Briefcase className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Step 1: Job Profile</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            Analyze Job Description
          </h2>
          <p className="text-muted-white/70 text-lg">
            Select a preset role or provide your custom job description
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-muted-white font-semibold mb-3">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Google, Microsoft, Accenture"
                className="w-full px-4 py-3 rounded-xl bg-bg-darker/50 border border-grid-blue/30 text-muted-white placeholder-muted-white/40 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-muted-white font-semibold mb-3">Job Description Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setJobType('preset')}
                  className={`px-6 py-4 rounded-xl border-2 transition-all ${
                    jobType === 'preset'
                      ? 'border-accent-1 bg-accent-1/10 text-muted-white'
                      : 'border-grid-blue/30 bg-bg-darker/30 text-muted-white/60 hover:border-accent-1/50'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 mx-auto mb-2 ${jobType === 'preset' ? 'text-accent-1' : 'text-muted-white/40'}`} />
                  Preset Roles
                </button>
                <button
                  type="button"
                  onClick={() => setJobType('custom')}
                  className={`px-6 py-4 rounded-xl border-2 transition-all ${
                    jobType === 'custom'
                      ? 'border-accent-1 bg-accent-1/10 text-muted-white'
                      : 'border-grid-blue/30 bg-bg-darker/30 text-muted-white/60 hover:border-accent-1/50'
                  }`}
                >
                  <Upload className={`w-5 h-5 mx-auto mb-2 ${jobType === 'custom' ? 'text-accent-1' : 'text-muted-white/40'}`} />
                  Custom Description
                </button>
              </div>
            </div>

            {jobType === 'preset' ? (
              <div>
                <label className="block text-muted-white font-semibold mb-3">Select Job Role *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_JOBS.map((job) => (
                    <button
                      key={job}
                      type="button"
                      onClick={() => setSelectedPreset(job)}
                      className={`px-4 py-3 rounded-xl border transition-all text-left ${
                        selectedPreset === job
                          ? 'border-accent-1 bg-accent-1/10 text-muted-white'
                          : 'border-grid-blue/30 bg-bg-darker/30 text-muted-white/70 hover:border-accent-1/50'
                      }`}
                    >
                      {job}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // --- UI CHANGE HERE ---
              // The Job Title and Description fields are now a single text area
              <div>
                <label className="block text-muted-white font-semibold mb-3">Custom Job Posting *</label>
                <textarea
                  value={rawJobText}
                  onChange={(e) => setRawJobText(e.target.value)}
                  placeholder="Paste the entire job posting here. The AI will automatically extract the title, company, and description."
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl bg-bg-darker/50 border border-grid-blue/30 text-muted-white placeholder-muted-white/40 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all resize-none"
                  required={jobType === 'custom'}
                />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Job Profile...
                </>
              ) : (
                'Analyze & Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
