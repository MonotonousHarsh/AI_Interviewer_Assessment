import { Building2, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function CompanyTypeSelector({ onSelectType }) {
  const companyTypes = [
    {
      id: 'product',
      name: 'Product Company',
      icon: Building2,
      description: 'Full-stack technical assessment with coding, system design, and behavioral rounds',
      rounds: ['Coding Round', 'Live Coding', 'System Design', 'Behavioral Interview'],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'service',
      name: 'Service Company',
      icon: Users,
      description: 'Comprehensive evaluation including aptitude, core competency, and interview rounds',
      rounds: ['Aptitude Test', 'Core Competency', 'Technical Interview', 'HR Interview'],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      id: 'analyst',
      name: 'Analyst Role',
      icon: BarChart3,
      description: 'Data-focused assessment with analytics, SQL, and business intelligence tests',
      rounds: ['Analytics Test', 'SQL Challenge', 'Case Study', 'Technical Discussion'],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      comingSoon: false,
    },
  ];

  return (
    <section id="company-type" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-50"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white mb-4">
            Choose Your Assessment Pipeline
          </h2>
          <p className="text-lg text-muted-white/70 max-w-2xl mx-auto">
            Select the company type that matches your hiring needs. Each pipeline is tailored for specific roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {companyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className={`relative glass-effect rounded-2xl p-8 border ${type.borderColor} hover:border-opacity-70 transition-all duration-300 hover:-translate-y-2 ${
                  type.comingSoon ? 'opacity-60' : ''
                }`}
              >
                {type.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                    <span className="text-xs text-yellow-400 font-semibold">Coming Soon</span>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.bgColor} border ${type.borderColor} flex items-center justify-center mb-6`}>
                  <Icon className={`w-8 h-8 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                  <Icon className={`w-8 h-8 text-${type.color.split('-')[1]}-400`} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{type.name}</h3>
                <p className="text-muted-white/70 mb-6 min-h-[3rem]">{type.description}</p>

                <div className="space-y-2 mb-8">
                  <h4 className="text-sm font-semibold text-muted-white/80 mb-3">Assessment Rounds:</h4>
                  {type.rounds.map((round, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-white/70">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.color}`}></div>
                      <span>{round}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => !type.comingSoon && onSelectType(type.id)}
                  disabled={type.comingSoon}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    type.comingSoon
                      ? 'bg-slate-700/50 text-muted-white/50 cursor-not-allowed'
                      : `bg-gradient-to-r ${type.color} text-white hover:shadow-lg`
                  }`}
                >
                  {type.comingSoon ? 'Coming Soon' : 'Select Pipeline'}
                  {!type.comingSoon && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
