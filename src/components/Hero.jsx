import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Hero({ onGetStarted }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 grid-background"></div>

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-glow/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-1/20 rounded-full blur-3xl"></div>
      </div>

      <div
        ref={heroRef}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center opacity-0 transition-all duration-1000"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-8">
          <Sparkles className="w-4 h-4 text-neon-green" />
          <span className="text-sm text-muted-white/90">AI-Powered Interview Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-muted-white text-shadow-hero mb-6 leading-tight">
          Transform Your Hiring<br />
          <span className="bg-gradient-to-r from-accent-1 via-cyan-glow to-accent-2 bg-clip-text text-transparent">
            With AI Precision
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-white/90 text-shadow-subtle mb-10 max-w-3xl mx-auto leading-relaxed">
          Screen resumes, conduct AI-powered interviews, and assess candidates with tailored pipelines for product, service, and analyst roles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="group px-6 py-3 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            Start Assessment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-6 py-3 rounded-xl glass-effect border border-accent-1/35 text-muted-white font-semibold hover:border-accent-1/75 transition-all hover:shadow-hero-glow">
            View Demo
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { number: '95%', label: 'Accuracy Rate', color: 'from-neon-green to-cyan-glow' },
            { number: '10K+', label: 'Candidates Assessed', color: 'from-cyan-glow to-accent-1' },
            { number: '500+', label: 'Companies Trust Us', color: 'from-accent-1 to-accent-2' }
          ].map((stat, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow hover:border-cyan-glow/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.number}
              </div>
              <div className="text-muted-white/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
