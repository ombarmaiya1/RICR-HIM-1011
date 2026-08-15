import { useState, useEffect } from 'react'
import useAnalysis from '../frontend_logic/useAnalysis'
import useResumes from '../frontend_logic/useResumes'
import useJobs from '../frontend_logic/useJobs'
import useATS from '../frontend_logic/useATS'
import Navbar from '../components/Navbar'

/**
 * DashboardPage (Analysis) — AI Match Scoring, Skill Gap Analysis & ATS Compatibility
 * - Connected to backend /api/analysis & /api/ats/check
 * - Dynamic ATS document health score, section parsing, keyword coverage, and format warnings
 * - Interactive Resume + Job selector to trigger real-time AI skill match
 */
export default function DashboardPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Analysis')
  const {
    analyses,
    currentAnalysis,
    setCurrentAnalysis,
    loading,
    analyzing,
    runAnalysis,
  } = useAnalysis()
  const { resumes } = useResumes()
  const { jobs } = useJobs()
  const { atsData, loading: atsLoading, runATSCheck } = useATS()

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false)

  // Auto-prefill selected resume and job
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const activeRes = localStorage.getItem('activeResumeId')
      if (activeRes && resumes.some((r) => (r._id || r.id) === activeRes)) {
        setSelectedResumeId(activeRes)
      } else {
        setSelectedResumeId(resumes[0]._id || resumes[0].id)
      }
    }

    if (jobs.length > 0 && !selectedJobId) {
      const activeJ = localStorage.getItem('activeJobId')
      if (activeJ && jobs.some((j) => (j._id || j.id) === activeJ)) {
        setSelectedJobId(activeJ)
      } else {
        setSelectedJobId(jobs[0]._id || jobs[0].id)
      }
    }
  }, [resumes, jobs, selectedResumeId, selectedJobId])

  // Automatically trigger backend ATS check when active analysis changes
  useEffect(() => {
    if (currentAnalysis) {
      const rId = currentAnalysis.resumeId?._id || currentAnalysis.resumeId?.id || currentAnalysis.resumeId
      const jId = currentAnalysis.jobId?._id || currentAnalysis.jobId?.id || currentAnalysis.jobId
      if (rId) {
        runATSCheck(rId, jId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnalysis?._id])

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleRunAnalysis = async (e) => {
    e.preventDefault()
    const res = await runAnalysis(selectedResumeId, selectedJobId)
    if (res) {
      setShowNewAnalysisModal(false)
      const rId = res.resumeId?._id || res.resumeId?.id || res.resumeId || selectedResumeId
      const jId = res.jobId?._id || res.jobId?.id || res.jobId || selectedJobId
      runATSCheck(rId, jId)
      setSelectedResumeId('')
      setSelectedJobId('')
    }
  }

  const matchedSkills = currentAnalysis?.matchedSkills || []
  const missingSkills = currentAnalysis?.missingSkills || []
  const suggestions = currentAnalysis?.suggestions || []
  const matchScore = currentAnalysis?.matchScore ?? 0
  const summary = currentAnalysis?.summary || ''
  const jobTitle = currentAnalysis?.jobId?.title || 'Target Role Analysis'
  const resumeFileName = currentAnalysis?.resumeId?.fileName || 'Resume Document'

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleTabClick}
        onLogout={onLogout}
        searchPlaceholder="Search analyses..."
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        {/* Header Section */}
        <div className="mb-12 border-b border-[#cfc4c5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-[32px] font-semibold text-black mb-2 leading-tight">
              {currentAnalysis ? jobTitle : 'Match & ATS Compatibility Analysis'}
            </h1>
            <p className="text-base text-[#5e5e5e]">
              {currentAnalysis
                ? `Resume: ${resumeFileName} vs. Job Description Alignment & ATS Parsing Verification`
                : 'Evaluate alignment between your resume and target job requirements using AI.'}
            </p>
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
              className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Match Analysis
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl animate-spin text-black">
              progress_activity
            </span>
            <span className="text-sm font-semibold text-[#5e5e5e]">
              Loading match analysis and ATS compatibility records…
            </span>
          </div>
        )}

        {/* Active Analysis Dashboard Grid */}
        {!loading && currentAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Match Score, ATS Summary & Practice CTA */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Overall Match Score */}
              <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-semibold text-[#5e5e5e] tracking-widest uppercase mb-4">
                  Overall Match Score
                </div>
                <div className="text-[72px] font-bold leading-none text-black mb-2">
                  {matchScore}%
                </div>
                <div className="text-base text-[#5e5e5e] mt-4">
                  {matchScore >= 80
                    ? 'High Probability of Progression'
                    : matchScore >= 60
                    ? 'Moderate Alignment — Address Gap Areas'
                    : 'Low Match Score — Targeted Skills Needed'}
                </div>
              </div>

              {/* ATS Compatibility Badge Card */}
              {atsData && (
                <div className="bg-white border-2 border-black p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                    <span className="text-xs font-bold text-[#5e5e5e] uppercase tracking-widest">
                      ATS System Compatibility
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      atsData.score >= 80
                        ? 'bg-black text-white'
                        : atsData.score >= 60
                        ? 'bg-[#e8e8e8] border border-black text-black'
                        : 'bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a]'
                    }`}>
                      {atsData.status || 'Evaluated'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-3xl font-bold text-black">{atsData.score ?? 0}%</span>
                    <span className="text-xs text-[#5e5e5e] font-semibold">Parser Pass Index</span>
                  </div>

                  {/* 5-Dimension Progress Meters */}
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#cfc4c5]">
                    {[
                      { label: 'Readability', val: atsData.breakdown?.document },
                      { label: 'Section Structure', val: atsData.breakdown?.structure },
                      { label: 'Format Compliance', val: atsData.breakdown?.formatting },
                      { label: 'Keyword Coverage', val: atsData.breakdown?.keywords },
                      { label: 'Content Depth', val: atsData.breakdown?.content },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px] font-semibold text-[#1b1b1b]">
                          <span>{item.label}</span>
                          <span>{item.val ?? 0}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#e8e8e8] overflow-hidden">
                          <div
                            className="h-full bg-black transition-all duration-500"
                            style={{ width: `${item.val ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Summary */}
              <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
                <h2 className="text-xl font-semibold text-black mb-4 border-b border-[#cfc4c5] pb-2">
                  Analysis Summary
                </h2>
                <p className="text-base text-[#5e5e5e] leading-relaxed">
                  {summary || 'No summary generated for this analysis.'}
                </p>
              </div>

              {/* Practice CTA */}
              <div className="bg-black text-white p-6 border-2 border-black flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#cfc4c5]">
                  <span className="material-symbols-outlined text-sm">mic</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    Targeted Practice
                  </span>
                </div>
                <h3 className="text-lg font-bold">Interview for this Position</h3>
                <p className="text-xs text-[#e2e2e2] leading-relaxed">
                  Practice responding to technical and behavioral questions specifically tailored to this job description.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabClick('Interviews')}
                  className="w-full bg-white text-black py-3 mt-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors cursor-pointer"
                >
                  Start Mock Interview
                </button>
              </div>
            </div>

            {/* Right Column: Skills, Actionable Suggestions & ATS Issues */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Skills Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#cfc4c5] pb-2">
                    <span className="material-symbols-outlined text-black">check_circle</span>
                    <h3 className="text-xl font-semibold text-black">
                      Matched Skills ({matchedSkills.length})
                    </h3>
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
                    {matchedSkills.length === 0 && (
                      <span className="text-xs text-[#5e5e5e]">No direct matched skills found.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#cfc4c5] pb-2">
                    <span className="material-symbols-outlined text-[#5e5e5e]">cancel</span>
                    <h3 className="text-xl font-semibold text-black">
                      Missing Skills ({missingSkills.length})
                    </h3>
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
                    {missingSkills.length === 0 && (
                      <span className="text-xs text-[#5e5e5e]">
                        No major missing skill gaps identified!
                      </span>
                    )}
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
                  {suggestions.map((suggestionText, idx) => (
                    <li
                      key={idx}
                      className={`py-4 flex items-start gap-4 border-t border-[#cfc4c5] ${
                        idx === suggestions.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-black mt-0.5">
                        arrow_forward
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-black mb-1">
                          Recommendation #{idx + 1}
                        </h4>
                        <p className="text-base text-[#5e5e5e] leading-relaxed">
                          {suggestionText}
                        </p>
                      </div>
                    </li>
                  ))}
                  {suggestions.length === 0 && (
                    <li className="py-6 text-center text-xs text-[#5e5e5e]">
                      No actionable suggestions generated.
                    </li>
                  )}
                </ul>
              </div>

              {/* ATS Document Health & Issues Panel */}
              <div className="bg-[#f9f9f9] border-2 border-black p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black uppercase tracking-tight flex items-center gap-2">
                      <span className="material-symbols-outlined text-black">rule</span>
                      ATS Document Health & Parser Audit
                    </h3>
                    <p className="text-xs text-[#5e5e5e] mt-1">
                      Automated audit of document formatting, contact information, and ATS section headers
                    </p>
                  </div>
                  {atsLoading && (
                    <span className="material-symbols-outlined animate-spin text-black">sync</span>
                  )}
                </div>

                {/* Detected ATS Issues */}
                {atsData && atsData.issues && atsData.issues.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#5e5e5e]">
                      Detected Formatting & Content Warnings ({atsData.issues.length})
                    </h4>
                    <div className="flex flex-col gap-3">
                      {atsData.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#cfc4c5] p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-black flex items-center gap-2">
                              <span className="material-symbols-outlined text-base">
                                {issue.severity === 'high' ? 'error' : 'warning'}
                              </span>
                              {issue.title}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              issue.severity === 'high'
                                ? 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]'
                                : issue.severity === 'medium'
                                ? 'bg-[#fff8ed] text-[#a36800] border border-[#e6a817]'
                                : 'bg-[#e8e8e8] text-black border border-[#cfc4c5]'
                            }`}>
                              {issue.severity} priority
                            </span>
                          </div>
                          <p className="text-xs text-[#4c4546]">{issue.description}</p>
                          <div className="mt-1 pt-2 border-t border-[#f0f0f0] text-xs font-semibold text-black flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">lightbulb</span>
                            <span>Fix: {issue.suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white border border-[#cfc4c5] text-xs text-[#5e5e5e] font-semibold text-center">
                    ✓ Clean document audit! No high-priority ATS parsing formatting issues detected.
                  </div>
                )}

                {/* ATS Keyword Breakdown */}
                {atsData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#cfc4c5] pt-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-2">
                        Matched ATS Keywords ({atsData.matchedKeywords?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsData.matchedKeywords && atsData.matchedKeywords.length > 0 ? (
                          atsData.matchedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold px-2 py-1 bg-white border border-[#cfc4c5] text-black lowercase"
                            >
                              ✓ {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#5e5e5e]">No specific keywords matched.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#5e5e5e] mb-2">
                        Missing ATS Keywords ({atsData.missingKeywords?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsData.missingKeywords && atsData.missingKeywords.length > 0 ? (
                          atsData.missingKeywords.slice(0, 12).map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold px-2 py-1 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] lowercase"
                            >
                              ✕ {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#5e5e5e]">All key terms matched!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no analysis records exist */}
        {!loading && !currentAnalysis && (
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto gap-6 my-8">
            <div className="w-16 h-16 bg-[#e8e8e8] border border-[#cfc4c5] flex items-center justify-center text-black">
              <span className="material-symbols-outlined text-3xl">analytics</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">No Match Analyses Yet</h2>
              <p className="text-sm text-[#5e5e5e] leading-relaxed">
                Upload your resume and select a target job position to generate a detailed AI match score, ATS compatibility audit, and actionable recommendations.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowNewAnalysisModal(true)}
                className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors cursor-pointer"
              >
                Run First Analysis
              </button>
            </div>
          </div>
        )}

        {/* Modal: New Analysis Launcher */}
        {showNewAnalysisModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-md w-full p-6 flex flex-col gap-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-xl font-bold text-black">New Match & ATS Analysis</h3>
                <button
                  type="button"
                  onClick={() => setShowNewAnalysisModal(false)}
                  className="p-1 text-[#5e5e5e] hover:text-black cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleRunAnalysis} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Select Resume Document *
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose Resume --</option>
                    {resumes.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.fileName || r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Select Target Job Role *
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose Job Description --</option>
                    {jobs.map((j) => (
                      <option key={j._id || j.id} value={j._id || j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAnalysisModal(false)}
                    className="px-4 py-3 border border-[#7e7576] text-black text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={analyzing || !selectedResumeId || !selectedJobId}
                    className="flex-1 bg-black text-white text-xs font-semibold uppercase tracking-wider py-3 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {analyzing ? 'Analyzing Match & ATS…' : 'RUN ATS ANALYSIS'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f3f3] w-full mt-16 border-t border-[#cfc4c5]">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-10 max-w-[1280px] mx-auto gap-4 text-xs">
          <div className="text-[#4c4546] uppercase font-bold tracking-widest">
            © 2024 ARCHITECT AI. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[#4c4546] hover:text-black hover:underline transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[#4c4546] hover:text-black hover:underline transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-[#4c4546] hover:text-black hover:underline transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
