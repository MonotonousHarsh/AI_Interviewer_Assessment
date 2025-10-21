import { Briefcase, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onGetStarted }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      scrollToSection('home');
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-grid-blue/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center shadow-hero-glow">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-muted-white">AI Interviewer & Assessment</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('home')}
              className="text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium"
            >
              Features
            </button>
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 rounded-lg bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold text-sm shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>

          <button
            className="md:hidden text-muted-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t border-grid-blue/30">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium py-2"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium py-2"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium py-2"
            >
              Features
            </button>
            <button
              onClick={handleGetStarted}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold text-sm shadow-btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
