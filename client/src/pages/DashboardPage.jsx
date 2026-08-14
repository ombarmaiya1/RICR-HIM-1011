import { useState } from 'react'
import useAnalysis from '../frontend_logic/useAnalysis'
import useResumes from '../frontend_logic/useResumes'
import useJobs from '../frontend_logic/useJobs'

/**
 * DashboardPage (Analysis) — Match Scoring & Skill Gap Analysis
 * - Connected to backend /api/analysis
 * - Sharp architectural minimalist theme (0px radius, 1px/2px borders)
 * - Interactive Resume + Job selector to trigger real-time AI skill match
 * - Match score circle / counter, Matched Skills, Missing Skills, Actionable Suggestions
 * - Past analyses switcher
 * - Footer
 */
export default function DashboardPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Analysis')
  const { analyses, currentAnalysis, setCurrentAnalysis, analyzing, error: analysisError, runAnalysis } = useAnalysis()
  const { resumes } = useResumes()
  const { jobs } = useJobs()

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false)

  const navItems = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleRunAnalysis = async (e) => {
    e.preventDefault()
    const res = await runAnalysis(selectedResumeId, selectedJobId)
    if (res) {
      setShowNewAnalysisModal(false)
    }
  }

  const defaultMatchedSkills = [
    'React.js',
    'TypeScript',
    'Tailwind CSS',
    'REST APIs',
    'Git/GitHub',
    'Agile/Scrum',
    'Jest Testing',
  ]

  const defaultMissingSkills = ['AWS CI/CD', 'GraphQL', 'Redux Toolkit', 'Docker']

  const defaultSuggestions = [
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

  const activeMatchScore = currentAnalysis ? currentAnalysis.matchScore : 85
  const activeMatchedSkills = currentAnalysis?.matchedSkills?.length ? currentAnalysis.matchedSkills : defaultMatchedSkills
  const activeMissingSkills = currentAnalysis?.missingSkills?.length ? currentAnalysis.missingSkills : defaultMissingSkills
  const activeSuggestions = currentAnalysis?.suggestions?.length
    ? currentAnalysis.suggestions.map((s, idx) => ({
        title: `Strategic Recommendation ${idx + 1}`,
        desc: s,
      }))
    : defaultSuggestions
  const activeSummary =
    currentAnalysis?.summary ||
    'Your profile demonstrates a strong foundational alignment with the core requirements of this role. Extensive experience with modern JavaScript ecosystems anchors your match score. Immediate remediation of highlighted missing skills will significantly elevate application standing.'

  const activeTitle = currentAnalysis?.jobId?.title || 'Senior Frontend Developer - Acme Corp'
  const activeSubtitle = currentAnalysis?.resumeId?.fileName
    ? `Profile: ${currentAnalysis.resumeId.fileName} vs. Job Description Analysis`
    : 'Profile vs. Job Description Analysis'

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="w-full sticky top-0 bg-[#f9f9f9] border-b-2 border-black z-50">
        <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto">
          {/* Brand */}
          <div
            onClick={() => handleTabClick('Dashboard')}
            className="text-xl font-bold text-black tracking-tighter uppercase font-sans cursor-pointer"
          >
            AI CAREER PRO
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleTabClick(item)}
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
        <div className="mb-12 border-b border-[#cfc4c5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-[32px] font-semibold text-black mb-2 leading-tight">
              {activeTitle}
            </h1>
            <p className="text-base text-[#5e5e5e]">{activeSubtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {analyses.length > 1 && (
              <select
                value={currentAnalysis?._id || ''}
                onChange={(e) => {
                  const target = analyses.find((a) => a._id === e.target.value)
                  if (target) setCurrentAnalysis(target)
                }}
                className="px-3 py-2 bg-white border border-[#cfc4c5] text-xs font-semibold text-black focus:outline-none focus:border-black"
              >
                {analyses.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.jobId?.title || 'Target Job'} ({a.matchScore}%)
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setShowNewAnalysisModal(true)}
              className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Match Analysis
            </button>
          </div>
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
              <div className="text-[72px] font-bold leading-none text-black mb-2">
                {activeMatchScore}%
              </div>
              <div className="text-base text-[#5e5e5e] mt-4">
                {activeMatchScore >= 80 ? 'High Probability of Progression' : 'Moderate Alignment — Focus on Gap Areas'}
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
              <h2 className="text-xl font-semibold text-black mb-4 border-b border-[#cfc4c5] pb-2">
                Analysis Summary
              </h2>
              <p className="text-base text-[#5e5e5e] leading-relaxed">
                {activeSummary}
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
                  {activeMatchedSkills.map((skill) => (
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
                  {activeMissingSkills.map((skill) => (
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
                {activeSuggestions.map((item, idx) => (
                  <li
                    key={idx}
                    className={`py-4 flex items-start gap-4 border-t border-[#cfc4c5] ${
                      idx === activeSuggestions.length - 1 ? 'border-b' : ''
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

        {/* Modal: Create New Match Analysis */}
        {showNewAnalysisModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-lg w-full p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-lg font-semibold text-black">Run New Match Analysis</h3>
                <button
                  type="button"
                  onClick={() => setShowNewAnalysisModal(false)}
                  className="p-1 text-[#5e5e5e] hover:text-black"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleRunAnalysis} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Select Active Resume
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose Resume Document --</option>
                    {resumes.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.fileName || r.name}
                      </option>
                    ))}
                  </select>
                  {resumes.length === 0 && (
                    <span className="text-[11px] text-[#ba1a1a]">
                      No resumes uploaded. Please upload a resume first.
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Select Target Job
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose Target Job --</option>
                    {jobs.map((j) => (
                      <option key={j._id || j.id} value={j._id || j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                  {jobs.length === 0 && (
                    <span className="text-[11px] text-[#ba1a1a]">
                      No saved jobs. Please save a job in Job Management first.
                    </span>
                  )}
                </div>

                {analysisError && (
                  <div className="p-3 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold">
                    {analysisError}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-[#cfc4c5]">
                  <button
                    type="button"
                    onClick={() => setShowNewAnalysisModal(false)}
                    className="px-4 py-3 border border-[#7e7576] text-black text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={analyzing || resumes.length === 0 || jobs.length === 0}
                    className="flex-1 bg-black text-white text-xs font-semibold uppercase tracking-wider py-3 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                  >
                    {analyzing ? 'Evaluating Alignment with AI…' : 'RUN ANALYSIS'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
