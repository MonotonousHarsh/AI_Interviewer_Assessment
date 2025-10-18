import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import JobDescriptionForm from './components/JobDescriptionForm';
import ResumeUpload from './components/ResumeUpload';
import ScreeningResults from './components/ScreeningResults';
import AssessmentFlow from './components/AssessmentFlow';

function App() {
  const [currentStep, setCurrentStep] = useState('hero');
  const [jobProfile, setJobProfile] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    setCurrentStep('job-description');
    setTimeout(() => {
      document.getElementById('job-description')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleJobCreated = (profile) => {
    setJobProfile(profile);
    setCurrentStep('resume-upload');
    setTimeout(() => {
      document.getElementById('resume-upload')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScreeningComplete = (result) => {
    setScreeningResult(result);
    setCurrentStep('screening-results');
    setTimeout(() => {
      document.getElementById('screening-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRetry = () => {
    setScreeningResult(null);
    setCurrentStep('resume-upload');
    setTimeout(() => {
      document.getElementById('resume-upload')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleProceedToAssessment = async () => {
    try {
      const response = await fetch('http://localhost:8000/assessments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: `candidate_${Date.now()}`,
          candidate_email: 'candidate@example.com',
          job_id: jobProfile.job_id,
          preferred_language: 'python'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      const assessment = await response.json();
      setAssessmentData(assessment);
      setCurrentStep('assessment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const resetApp = () => {
    setCurrentStep('hero');
    setJobProfile(null);
    setScreeningResult(null);
    setAssessmentData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentStep === 'assessment' && assessmentData) {
    return (
      <div className="min-h-screen bg-bg-deep text-muted-white overflow-x-hidden">
        <Navbar />
        <AssessmentFlow assessmentData={assessmentData} />
        <footer className="relative z-10 py-12 border-t border-grid-blue/20 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <span className="text-muted-white font-semibold">AI InterviewHub</span>
              </div>

              <div className="text-muted-white/60 text-sm text-center md:text-left">
                © 2025 AI InterviewHub. Powered by Advanced AI Technology.
              </div>

              <div className="flex gap-6">
                <a href="#" className="text-muted-white/60 hover:text-muted-white transition-colors text-sm">
                  Privacy
                </a>
                <a href="#" className="text-muted-white/60 hover:text-muted-white transition-colors text-sm">
                  Terms
                </a>
                <a href="#" className="text-muted-white/60 hover:text-muted-white transition-colors text-sm">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep text-muted-white overflow-x-hidden">
      <Navbar />

      <div
        style={{
          transform: `translateY(${scrollY * 0.05}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Hero onGetStarted={handleGetStarted} />
      </div>

      {(currentStep === 'job-description' || currentStep === 'resume-upload' || currentStep === 'screening-results') && (
        <div
          style={{
            transform: `translateY(${Math.max(0, (scrollY - 400) * 0.02)}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <JobDescriptionForm onJobCreated={handleJobCreated} />
        </div>
      )}

      {(currentStep === 'resume-upload' || currentStep === 'screening-results') && jobProfile && (
        <div
          style={{
            transform: `translateY(${Math.max(0, (scrollY - 800) * 0.02)}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <ResumeUpload jobProfile={jobProfile} onScreeningComplete={handleScreeningComplete} />
        </div>
      )}

      {currentStep === 'screening-results' && screeningResult && (
        <div
          style={{
            transform: `translateY(${Math.max(0, (scrollY - 1200) * 0.02)}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <ScreeningResults
            screeningResult={screeningResult}
            jobProfile={jobProfile}
            onRetry={handleRetry}
            onProceedToAssessment={handleProceedToAssessment}
          />
        </div>
      )}

      <footer className="relative z-10 py-12 border-t border-grid-blue/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="text-muted-white font-semibold">AI InterviewHub</span>
            </div>

            <div className="text-muted-white/60 text-sm text-center md:text-left">
              © 2025 AI InterviewHub. Powered by Advanced AI Technology.
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-muted-white/60 hover:text-muted-white transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-muted-white/60 hover:text-muted-white transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-muted-white/60 hover:text-muted-white transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
