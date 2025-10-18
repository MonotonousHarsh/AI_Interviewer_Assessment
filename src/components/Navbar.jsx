import { Briefcase, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-grid-blue/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center shadow-hero-glow">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-muted-white">AI Interviewer & Assessment</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium">
              Home
            </a>
            <a href="#how-it-works" className="text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium">
              How It Works
            </a>
            <a href="#features" className="text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium">
              Features
            </a>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold text-sm shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-0.5">
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
            <a href="#home" className="block text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium py-2">
              Home
            </a>
            <a href="#how-it-works" className="block text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium py-2">
              How It Works
            </a>
            <a href="#features" className="block text-muted-white/80 hover:text-muted-white transition-colors text-sm font-medium py-2">
              Features
            </a>
            <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold text-sm shadow-btn-primary">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
