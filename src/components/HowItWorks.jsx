import { FileText, Users, Bot, CheckCircle, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: 'Create Job Profile',
      description: 'Define your requirements, skills needed, and choose between Product, Service, or Analyst company types.',
      color: 'from-cyan-glow to-accent-1'
    },
    {
      icon: Users,
      title: 'Screen Candidates',
      description: 'Upload resumes and let our AI analyze qualifications, experience, and match with job requirements.',
      color: 'from-accent-1 to-accent-2'
    },
    {
      icon: Bot,
      title: 'Automated Assessment',
      description: 'Candidates complete tailored assessment pipelines including coding, system design, and domain-specific tests.',
      color: 'from-accent-2 to-neon-green'
    },
    {
      icon: CheckCircle,
      title: 'Virtual Interview',
      description: 'Conduct AI-powered interviews with a 3D avatar that speaks, listens, and evaluates using STAR methodology.',
      color: 'from-neon-green to-cyan-glow'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-1/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-6">
            <Bot className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Simple & Efficient Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-white/70 max-w-2xl mx-auto">
            From job posting to final interview, our AI streamlines every step of your hiring process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow hover:border-cyan-glow/40 transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-hero-glow`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-1/20 border border-accent-1/30 flex items-center justify-center">
                      <span className="text-accent-1 font-bold text-sm">{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-muted-white">{step.title}</h3>
                  </div>

                  <p className="text-muted-white/70 text-sm leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-accent-1/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 glass-effect rounded-2xl p-8 border border-cyan-glow/20 shadow-card-shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-1 mb-2">4-Stage</div>
              <p className="text-muted-white/70 text-sm">Comprehensive Pipeline</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-glow mb-2">AI-Powered</div>
              <p className="text-muted-white/70 text-sm">Intelligent Evaluation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">Real-time</div>
              <p className="text-muted-white/70 text-sm">Instant Feedback</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
