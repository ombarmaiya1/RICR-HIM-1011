import { useState } from 'react'

/**
 * DashboardPage — Faithful reproduction of Stitch "Analysis Dashboard" screen.
 * - Sharp architectural minimalist theme (0px radius, 1px/2px borders)
 * - Top Navigation Bar (Brand, Links, Search, User/Logout controls)
 * - Main Analysis Section: Job Title, Match Score (85%), Analysis Summary
 * - Skills Bento Grid (Matched Skills & Missing Skills with dashed/line-through)
 * - Actionable Suggestions list
 * - Footer
 */
export default function DashboardPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Analysis')

  const navItems = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

  const matchedSkills = [
    'React.js',
    'TypeScript',
    'Tailwind CSS',
    'REST APIs',
    'Git/GitHub',
    'Agile/Scrum',
    'Jest Testing',
  ]

  const missingSkills = ['AWS CI/CD', 'GraphQL', 'Redux Toolkit', 'Docker']

  const suggestions = [
    {
      title: 'Highlight State Management Alternatives',
      desc: 'While missing Redux Toolkit, heavily emphasize your documented experience with Context API and Zustand to prove conceptual proficiency in complex state management.',
    },
    {
      title: 'Bridge the GraphQL Gap',
      desc: 'Incorporate a recent side project utilizing Apollo Client/GraphQL into your portfolio section to demonstrate functional familiarity despite lacking commercial experience.',
    },
    {
      title: 'Reframe Deployment Experience',
      desc: 'If AWS experience is strictly required, rewrite bullet points in your previous roles to focus on any interaction with CI/CD pipelines, even if managed by DevOps teams (e.g., Vercel, Netlify).',
    },
  ]

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="w-full sticky top-0 bg-[#f9f9f9] border-b-2 border-black z-50">
        <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto">
          {/* Brand */}
          <div className="text-xl font-bold text-black tracking-tighter uppercase font-sans">
            AI CAREER PRO
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setActiveTab(item)
                  if (onNavigate) onNavigate(item)
                }}
                className={`text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
                  activeTab === item
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-[#5e5e5e] hover:text-black'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block relative border border-[#cfc4c5]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5e5e5e] text-lg pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-48 pl-9 pr-3 py-1 bg-transparent text-[#1b1b1b] text-sm focus:outline-none focus:border-black border-0"
              />
            </div>
            <button
              type="button"
              aria-label="Account"
              className="text-[#5e5e5e] hover:text-black transition-colors flex items-center justify-center p-1"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <button
              type="button"
              aria-label="Logout"
              onClick={onLogout}
              className="text-[#5e5e5e] hover:text-black transition-colors flex items-center justify-center p-1"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        {/* Header Section */}
        <div className="mb-12 border-b border-[#cfc4c5] pb-6">
          <h1 className="text-2xl md:text-[32px] font-semibold text-black mb-2 leading-tight">
            Senior Frontend Developer - Acme Corp
          </h1>
          <p className="text-base text-[#5e5e5e]">Profile vs. Job Description Analysis</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Score & Summary */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Overall Match Score */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col items-center justify-center text-center">
              <div className="text-sm font-semibold text-[#5e5e5e] tracking-widest uppercase mb-4">
                Overall Match Score
              </div>
              <div className="text-[72px] font-bold leading-none text-black mb-2">85%</div>
              <div className="text-base text-[#5e5e5e] mt-4">High Probability of Progression</div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
              <h2 className="text-xl font-semibold text-black mb-4 border-b border-[#cfc4c5] pb-2">
                Analysis Summary
              </h2>
              <p className="text-base text-[#5e5e5e] leading-relaxed">
                Your profile demonstrates a strong foundational alignment with the core
                requirements of this role. Extensive experience with React and modern JavaScript
                ecosystems anchors your high match score. However, critical gaps in cloud
                infrastructure deployment and specific state management paradigms slightly reduce
                absolute fit. Immediate remediation of highlighted missing skills will significantly
                elevate application standing.
              </p>
            </div>
          </div>

          {/* Right Column: Skills & Actions */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Skills Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-[#cfc4c5] pb-2">
                  <span className="material-symbols-outlined text-black">check_circle</span>
                  <h3 className="text-xl font-semibold text-black">Matched Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-[#e8e8e8] border border-[#cfc4c5] text-black text-xs font-semibold uppercase tracking-wider"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-[#cfc4c5] pb-2">
                  <span className="material-symbols-outlined text-[#5e5e5e]">cancel</span>
                  <h3 className="text-xl font-semibold text-black">Missing Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-[#ffffff] border border-[#7e7576] border-dashed text-[#5e5e5e] text-xs font-semibold uppercase tracking-wider line-through"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
              <h3 className="text-xl font-semibold text-black mb-1">Actionable Suggestions</h3>
              <p className="text-xs text-[#5e5e5e] mb-6 uppercase tracking-widest font-semibold">
                Targeted interventions to improve match score
              </p>
              <ul className="flex flex-col">
                {suggestions.map((item, idx) => (
                  <li
                    key={item.title}
                    className={`py-4 flex items-start gap-4 border-t border-[#cfc4c5] ${
                      idx === suggestions.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-black mt-0.5">
                      arrow_forward
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-black mb-1">{item.title}</h4>
                      <p className="text-base text-[#5e5e5e]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-12 bg-[#f3f3f3] border-t border-[#cfc4c5]">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-10 max-w-[1280px] mx-auto gap-4">
          <div className="text-xs font-bold text-black uppercase tracking-widest">
            © 2024 AI CAREER PRO. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#4c4546] hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-[#4c4546] hover:underline">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-[#4c4546] hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
