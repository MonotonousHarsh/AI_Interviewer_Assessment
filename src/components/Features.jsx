import { Brain, Target, Zap, Shield, TrendingUp, Users, Code, MessageSquare, BarChart, Clock, Award, Globe } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze resumes and responses with human-level accuracy.',
      gradient: 'from-cyan-glow to-accent-1'
    },
    {
      icon: Target,
      title: 'Custom Pipelines',
      description: 'Tailored assessment flows for Product, Service, and Analyst companies with role-specific tests.',
      gradient: 'from-accent-1 to-accent-2'
    },
    {
      icon: Zap,
      title: 'Real-time Evaluation',
      description: 'Instant feedback on coding challenges, system design, and technical interviews.',
      gradient: 'from-accent-2 to-neon-green'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with GDPR compliance and data encryption.',
      gradient: 'from-neon-green to-cyan-glow'
    },
    {
      icon: MessageSquare,
      title: '3D Virtual Interviewer',
      description: 'Interactive AI avatar that conducts natural conversations with voice recognition.',
      gradient: 'from-cyan-glow to-accent-1'
    },
    {
      icon: Code,
      title: 'Multi-Language Support',
      description: 'Code evaluation in Python, JavaScript, Java, C++, and more programming languages.',
      gradient: 'from-accent-1 to-accent-2'
    },
    {
      icon: BarChart,
      title: 'Detailed Analytics',
      description: 'Comprehensive reports with STAR method analysis, skill mapping, and performance metrics.',
      gradient: 'from-accent-2 to-neon-green'
    },
    {
      icon: Clock,
      title: 'Time Efficient',
      description: 'Reduce hiring time by 70% with automated screening and parallel assessments.',
      gradient: 'from-neon-green to-cyan-glow'
    },
    {
      icon: Award,
      title: 'Fair Assessment',
      description: 'Bias-free evaluation focusing purely on skills, experience, and problem-solving ability.',
      gradient: 'from-cyan-glow to-accent-1'
    },
    {
      icon: Users,
      title: 'Candidate Experience',
      description: 'Engaging, interactive interface that showcases your company culture and professionalism.',
      gradient: 'from-accent-1 to-accent-2'
    },
    {
      icon: TrendingUp,
      title: 'Scalable Solution',
      description: 'Handle thousands of candidates simultaneously without compromising quality.',
      gradient: 'from-accent-2 to-neon-green'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Support for multiple languages and time zones with 24/7 availability.',
      gradient: 'from-neon-green to-cyan-glow'
    }
  ];

  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-green/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accent-2/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-6">
            <Zap className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Powerful Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            Everything You Need to Hire Smarter
          </h2>
          <p className="text-lg text-muted-white/70 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI with proven interview methodologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow hover:border-cyan-glow/40 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-hero-glow group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-muted-white mb-3">
                {feature.title}
              </h3>

              <p className="text-muted-white/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-effect rounded-2xl p-8 border border-accent-1/20 shadow-card-shadow inline-block">
            <p className="text-2xl font-bold text-muted-white mb-2">
              Ready to revolutionize your hiring process?
            </p>
            <p className="text-muted-white/70 mb-6">
              Join hundreds of companies using AI to find the perfect candidates.
            </p>
            <button className="px-8 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
