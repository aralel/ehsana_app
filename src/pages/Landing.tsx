import { useNavigate } from 'react-router-dom';
import {
  Heart, Shield, Users, FileText, Share2, Lock,
  ChevronRight, Activity, Stethoscope, TreePine,
  ArrowRight, CheckCircle2, Star
} from 'lucide-react';

const features = [
  {
    icon: TreePine,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Visual Family Tree',
    desc: 'Build an interactive family tree and connect medical histories across generations. See health patterns at a glance.'
  },
  {
    icon: FileText,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    title: 'Medical Records Hub',
    desc: 'Securely store lab results, prescriptions, diagnoses, imaging reports, and more — all in one organized place.'
  },
  {
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Granular Privacy',
    desc: 'You decide who sees what. Share specific documents with family members, doctors, or keep them completely private.'
  },
  {
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    title: 'Family Collaboration',
    desc: 'Siblings can share parents\' records, parents can manage children\'s health. Merge accounts when family members sign up.'
  },
  {
    icon: Stethoscope,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    title: 'Doctor & Caretaker Access',
    desc: 'Invite physicians and caretakers to view specific records. They can leave clinical notes and comments.'
  },
  {
    icon: Share2,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Smart Invitations',
    desc: 'Send invitations via email. When a family member already has an account, seamlessly merge your family trees.'
  },
];

const testimonials = [
  { name: 'Maria K.', role: 'Mother of 3', text: 'Finally I can share my father\'s prescriptions with my siblings instantly. No more panicked calls during emergencies.', stars: 5 },
  { name: 'Dr. James R.', role: 'Family Physician', text: 'Being able to see a patient\'s complete family health history in one view has genuinely changed how I approach care.', stars: 5 },
  { name: 'Tom B.', role: 'Caretaker', text: 'Managing health records for elderly parents across three siblings used to be chaos. Now it\'s one app.', stars: 5 },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-white text-lg">Ehsana</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth?mode=login')} className="btn-ghost text-sm">Sign in</button>
          <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary text-sm">Get started free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Activity className="w-3.5 h-3.5" />
            Family health, connected
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
            One family tree,<br />
            <span className="gradient-text">all your health.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ehsana brings your family's medical history together — securely shared between family members,
            accessible to your doctors, and always under your control.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="btn-primary flex items-center gap-2 text-base px-7 py-3.5 group"
            >
              Start your family tree
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="btn-secondary flex items-center gap-2 text-base px-7 py-3.5"
            >
              View demo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-500 text-sm mt-4">Free forever for families · No credit card required</p>
        </div>

        {/* Hero visual */}
        <div className="relative max-w-4xl mx-auto mt-16 animate-fade-in">
          <div className="glass-card p-6 shadow-2xl shadow-black/50">
            {/* Mini tree preview */}
            <div className="text-left mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-300 font-medium">Johnson Family Health</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="tag bg-emerald-500/10 text-emerald-300">5 members</span>
                <span className="tag bg-indigo-500/10 text-indigo-300">12 records</span>
                <span className="tag bg-purple-500/10 text-purple-300">1 doctor</span>
              </div>
            </div>

            {/* Simplified tree nodes */}
            <div className="relative h-48 flex flex-col items-center justify-center gap-2">
              {/* Generation 0 */}
              <div className="flex gap-8">
                {['Robert J.', 'Mary J.'].map(name => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg">
                      {name[0]}
                    </div>
                    <span className="text-xs text-slate-400">{name}</span>
                  </div>
                ))}
              </div>
              {/* Connector */}
              <div className="w-px h-6 bg-indigo-500/30" />
              {/* Generation 1 */}
              <div className="flex gap-12">
                {[
                  { name: 'Alex J.', docs: 3, color: 'from-indigo-500/30 to-indigo-600/20 border-indigo-500/30' },
                  { name: 'Sarah J.', docs: 2, color: 'from-purple-500/30 to-purple-600/20 border-purple-500/30' }
                ].map(({ name, docs, color }) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} border flex items-center justify-center text-lg relative`}>
                      {name[0]}
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">{docs}</span>
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{name}</span>
                  </div>
                ))}
              </div>
              {/* Connector */}
              <div className="w-px h-6 bg-indigo-500/30" />
              {/* Generation 2 */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-lg">
                  E
                </div>
                <span className="text-xs text-slate-400">Emma J.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything your family needs</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">A complete health management platform designed around the way families actually work.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="glass-card p-6 hover:border-white/15 transition-all duration-300 group hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">Up and running in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up and instantly create your family tree. Add yourself as the first member.' },
              { step: '02', title: 'Add family members', desc: 'Add parents, children, siblings and spouses. Upload or enter their medical records.' },
              { step: '03', title: 'Share & collaborate', desc: 'Invite family members, doctors and caretakers. Set privacy on every document.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-400 font-bold text-sm">{step}</span>
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by families & doctors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="glass-card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-emerald-500/5 pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Ready to connect your family's health?</h2>
              <p className="text-slate-400 mb-8">Join thousands of families already using Ehsana to manage their health history together.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary flex items-center justify-center gap-2 text-base px-7 py-3.5">
                  Get started free <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/auth?mode=login')} className="btn-secondary text-base px-7 py-3.5">
                  Sign in
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                {['Free forever', 'Privacy-first', 'No ads'].map(item => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="text-sm text-slate-400">Ehsana — Family Health Platform</span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Ehsana. Built with care.</p>
        </div>
      </footer>
    </div>
  );
}
