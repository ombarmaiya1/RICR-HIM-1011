import { useNavigate } from 'react-router-dom'

const STATS = [
  { value: '10,000+', label: 'Active Users' },
  { value: '95%', label: 'Interview Success Rate' },
  { value: '500+', label: 'Partner Companies' },
  { value: '4.9/5', label: 'User Rating' },
]

const FEATURES = [
  {
    icon: 'rule',
    title: 'ATS Score Analysis',
    desc: 'Audit your resume against real ATS parsers. Get a 5-dimension readability score covering structure, formatting, keywords, and content depth.',
  },
  {
    icon: 'mic',
    title: 'Voice Mock Interviews',
    desc: 'Practice with real-time voice recognition. Speak your answers, receive STAR-method scoring, and build interview confidence before the real thing.',
  },
  {
    icon: 'description',
    title: 'Intelligent Resume Parsing',
    desc: 'Upload PDF or DOCX. Our parser extracts skills, experience, and education with high accuracy — across tables, columns, and custom layouts.',
  },
  {
    icon: 'work',
    title: 'Smart Job Matching',
    desc: 'Real job opportunities from Greenhouse and Lever with direct apply links. Personalized to your resume and target role with instant seeding.',
  },
  {
    icon: 'analytics',
    title: 'Skill Gap Detection',
    desc: 'Side-by-side resume vs. job description comparison. Matched skills, missing requirements, and an actionable improvement roadmap.',
  },
  {
    icon: 'record_voice_over',
    title: 'Text Interview Mode',
    desc: 'Prefer typing? Get the full structured mock interview experience in text mode with the same AI evaluation and detailed feedback.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Resume',
    desc: 'Upload your PDF or DOCX resume. Our AI parser extracts your skills, experience, and education instantly.',
  },
  {
    number: '02',
    title: 'Get AI Analysis',
    desc: 'Receive your ATS compatibility score, match analysis against job descriptions, and a detailed skill gap report.',
  },
  {
    number: '03',
    title: 'Practice & Apply',
    desc: 'Run AI mock interviews tailored to your target role, then apply to real openings with a single click.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Stripe',
    quote: 'The voice mock interview feature is incredible. It gave me confidence for my Stripe interview. The STAR-method feedback was incredibly specific.',
    initials: 'PS',
  },
  {
    name: 'Marcus Chen',
    role: 'Product Manager at Figma',
    quote: 'My ATS score went from 42% to 87% in a single session. The keyword gap analysis showed me exactly what to add. Got 3 callbacks the following week.',
    initials: 'MC',
  },
  {
    name: 'Aisha Rahman',
    role: 'Data Scientist at Scale AI',
    quote: 'The skill gap analysis compared my resume against the actual job description. Found 11 missing keywords I never would have caught on my own.',
    initials: 'AR',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] font-sans min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="w-full border-b border-[#cfc4c5] bg-[#f9f9f9] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">psychology</span>
            <span className="text-base font-bold text-black uppercase tracking-[0.12em]">AI Career Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-semibold text-[#5e5e5e] hover:text-black transition-colors uppercase tracking-wider"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-black text-white hover:bg-[#303030] transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="w-full border-b border-[#cfc4c5]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-24 md:py-36 grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 border border-[#cfc4c5] px-3 py-1.5 w-fit">
              <span className="w-2 h-2 bg-black inline-block" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e5e5e]">AI-Powered Career Acceleration</span>
            </div>
            <h1 className="text-[40px] md:text-[56px] font-bold text-black leading-[1.08] tracking-[-0.02em]">
              Land Your Dream Job with AI-Powered Precision
            </h1>
            <p className="text-lg text-[#5e5e5e] leading-relaxed max-w-lg">
              Resume parsing, ATS compatibility audits, skill gap analysis, AI mock interviews, and real job matching — all in one platform built for serious candidates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-[#303030] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                Get Started Free
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-8 py-4 border border-black text-black text-sm font-semibold uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors cursor-pointer"
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="bg-white border-2 border-black p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#cfc4c5] pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5e5e5e]">ATS Compatibility Score</span>
                <span className="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider">Excellent</span>
              </div>
              <div className="text-[56px] font-bold text-black leading-none">87%</div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Readability', val: 100 },
                  { label: 'Section Structure', val: 100 },
                  { label: 'Keyword Coverage', val: 74 },
                  { label: 'Content Depth', val: 90 },
                ].map(row => (
                  <div key={row.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#1b1b1b]">
                      <span>{row.label}</span><span>{row.val}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#e8e8e8]">
                      <div className="h-full bg-black" style={{ width: `${row.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#cfc4c5] p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-[#5e5e5e] mb-2">Match Score</div>
                <div className="text-3xl font-bold text-black">92%</div>
                <div className="text-xs text-[#5e5e5e] mt-1">vs. Target Role</div>
              </div>
              <div className="bg-black text-white p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-[#cfc4c5] mb-2">Interview Ready</div>
                <div className="text-3xl font-bold">8.4/10</div>
                <div className="text-xs text-[#cfc4c5] mt-1">AI Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <section className="w-full border-b border-[#cfc4c5] bg-black">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#303030]">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-black flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
              <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#cfc4c5]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className="w-full border-b border-[#cfc4c5]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#5e5e5e] mb-4">Platform Capabilities</div>
            <h2 className="text-3xl md:text-[40px] font-bold text-black leading-tight tracking-[-0.01em] max-w-xl">
              Every tool you need to win your next role
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#cfc4c5]">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-[#f9f9f9] p-8 flex flex-col gap-5 group hover:bg-black transition-colors duration-300"
              >
                <div className="w-10 h-10 border border-[#cfc4c5] group-hover:border-[#303030] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-black group-hover:text-white text-xl transition-colors">{f.icon}</span>
                </div>
                <h3 className="text-base font-bold text-black group-hover:text-white uppercase tracking-wider transition-colors">{f.title}</h3>
                <p className="text-sm text-[#5e5e5e] group-hover:text-[#cfc4c5] leading-relaxed transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="w-full border-b border-[#cfc4c5] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="mb-14 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#5e5e5e] mb-4">Process</div>
            <h2 className="text-3xl md:text-[40px] font-bold text-black leading-tight tracking-[-0.01em]">
              Three steps to your next offer
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#cfc4c5]">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white p-10 flex flex-col gap-6">
                <div className="text-[64px] font-bold text-[#e8e8e8] leading-none">{step.number}</div>
                <h3 className="text-lg font-bold text-black uppercase tracking-wider">{step.title}</h3>
                <p className="text-sm text-[#5e5e5e] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section id="testimonials" className="w-full border-b border-[#cfc4c5]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#5e5e5e] mb-4">Success Stories</div>
            <h2 className="text-3xl md:text-[40px] font-bold text-black leading-tight tracking-[-0.01em] max-w-xl">
              Candidates who landed their target roles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-[#cfc4c5] p-8 flex flex-col gap-6 hover:border-black transition-colors">
                <div className="text-4xl text-[#e8e8e8] font-serif leading-none">&ldquo;</div>
                <p className="text-base text-[#1b1b1b] leading-relaxed flex-grow">{t.quote}</p>
                <div className="flex items-center gap-3 border-t border-[#cfc4c5] pt-4">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black">{t.name}</div>
                    <div className="text-xs text-[#5e5e5e]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section className="w-full bg-black border-b border-[#303030]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-4 max-w-xl">
            <h2 className="text-3xl md:text-[44px] font-bold text-white leading-tight tracking-[-0.02em]">
              Ready to transform your career?
            </h2>
            <p className="text-base text-[#cfc4c5] leading-relaxed">
              Join 10,000+ professionals using AI Career Pro to land higher-quality roles faster. Free to start — no credit card required.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              Create Free Account
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="w-full bg-[#f9f9f9] border-t border-[#cfc4c5]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">psychology</span>
            <span className="text-sm font-bold text-black uppercase tracking-[0.12em]">AI Career Pro</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {['Features', 'How It Works', 'Login', 'Register'].map(link => (
              <a
                key={link}
                href={link === 'Login' ? '/login' : link === 'Register' ? '/register' : `#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs font-semibold uppercase tracking-wider text-[#5e5e5e] hover:text-black transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="text-xs text-[#5e5e5e] uppercase tracking-widest">
            © 2024 AI Career Pro. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
