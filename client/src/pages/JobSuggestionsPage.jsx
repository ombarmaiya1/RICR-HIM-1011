import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import useResumes from '../frontend_logic/useResumes'
import useJobSuggestions from '../frontend_logic/useJobSuggestions'

export default function JobSuggestionsPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Jobs')
  const { resumes, loading: resumesLoading } = useResumes()
  const {
    suggestions,
    loading,
    isSearching,
    error,
    generateSuggestions,
    fetchSavedSuggestions,
    clearError,
  } = useJobSuggestions()

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [targetTitle, setTargetTitle] = useState('')
  const [targetDescription, setTargetDescription] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  // Auto select first resume when resumes finish loading
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id || resumes[0].id)
    }
  }, [resumes, selectedResumeId])

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!selectedResumeId || !targetTitle.trim()) return
    generateSuggestions({
      resumeId: selectedResumeId,
      jobTitle: targetTitle.trim(),
      jobDescription: targetDescription.trim(),
    })
  }

  const filteredSuggestions = suggestions.filter((job) => {
    if (!searchFilter) return true
    const query = searchFilter.toLowerCase()
    return (
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleTabClick}
        onLogout={onLogout}
        searchValue={searchFilter}
        onSearch={(e) => setSearchFilter(e.target.value)}
        searchPlaceholder="Filter suggestions..."
      />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        {/* Page Header */}
        <header className="mb-10 border-b border-[#cfc4c5] pb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2">
            Jobs that match your profile
          </h1>
          <p className="text-base text-[#5e5e5e]">
            Find opportunities that align with your resume and target role.
          </p>
        </header>

        {/* Search Area */}
        <section className="bg-white border-2 border-black p-6 md:p-8 mb-10 shadow-sm">
          <h2 className="text-xs font-semibold text-black uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-[#cfc4c5] pb-3">
            <span className="material-symbols-outlined text-base">tune</span>
            Job Search Parameters
          </h2>

          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Job Title */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="target-title"
                  className="text-xs font-semibold text-black uppercase tracking-wider"
                >
                  Target Job Title *
                </label>
                <input
                  id="target-title"
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                  required
                />
              </div>

              {/* Resume Selector */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="resume-selector"
                  className="text-xs font-semibold text-black uppercase tracking-wider"
                >
                  Select Resume *
                </label>
                <select
                  id="resume-selector"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                  required
                  disabled={resumesLoading || resumes.length === 0}
                >
                  {resumes.length === 0 ? (
                    <option value="">No resumes found. Please upload one first.</option>
                  ) : (
                    resumes.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.originalName || r.title || r.filename || 'Resume'}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Target Job Description */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="target-description"
                className="text-xs font-semibold text-black uppercase tracking-wider"
              >
                Target Job Description (Optional)
              </label>
              <textarea
                id="target-description"
                rows={4}
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="Paste key responsibilities or tech stack (e.g. Node.js, Express, MongoDB...)"
                className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black resize-none focus:outline-none focus:border-2 focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !selectedResumeId || !targetTitle.trim()}
              className="self-start px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#1b1b1b] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Finding Jobs...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">search</span>
                  Find Jobs
                </>
              )}
            </button>
          </form>
        </section>

        {/* ERROR STATE */}
        {error && (
          <section className="p-6 bg-[#fdf2f2] border-2 border-[#ba1a1a] mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">
                error
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#ba1a1a]">Unable to find jobs right now.</h3>
                <p className="text-xs text-[#5e5e5e]">Please check your network connection or try again.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                clearError()
                fetchSavedSuggestions()
              }}
              className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#961313] transition-colors self-start md:self-auto cursor-pointer"
            >
              Try Again
            </button>
          </section>
        )}

        {/* LOADING STATE: Skeleton Job Cards */}
        {loading && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white p-6 border border-[#cfc4c5] animate-pulse flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-grow">
                    <div className="h-5 bg-[#e8e8e8] w-3/4 rounded-none" />
                    <div className="h-4 bg-[#f0f0f0] w-1/2 rounded-none" />
                  </div>
                  <div className="h-8 w-16 bg-[#e8e8e8] rounded-none" />
                </div>
                <div className="h-3 bg-[#f0f0f0] w-1/3 rounded-none" />
                <div className="space-y-2 py-2">
                  <div className="h-3 bg-[#f0f0f0] w-full rounded-none" />
                  <div className="h-3 bg-[#f0f0f0] w-5/6 rounded-none" />
                </div>
                <div className="flex gap-2 pt-2 border-t border-[#f0f0f0]">
                  <div className="h-9 w-24 bg-[#e8e8e8] rounded-none" />
                  <div className="h-9 w-24 bg-[#e8e8e8] rounded-none" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* RESULTS SECTION */}
        {!loading && !error && (
          <>
            {filteredSuggestions.length > 0 ? (
              <section className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                  <h2 className="text-xs font-semibold text-black uppercase tracking-widest">
                    Recommended Opportunities ({filteredSuggestions.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSuggestions.map((job) => (
                    <article
                      key={job._id || `${job.source}-${job.sourceJobId}`}
                      className="bg-white border-2 border-black p-6 flex flex-col justify-between hover:shadow-md transition-shadow gap-5"
                    >
                      {/* Card Top Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5e] px-2 py-0.5 bg-[#f0f0f0] border border-[#cfc4c5] inline-block mb-2">
                            {job.source || 'Public Board'}
                          </span>
                          <h3 className="text-lg font-bold text-black leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-sm font-medium text-[#4c4546]">
                            {job.company}
                          </p>
                        </div>

                        {/* Match Score Badge */}
                        <div className="flex flex-col items-center justify-center p-2.5 bg-black text-white shrink-0 min-w-[64px]">
                          <span className="text-lg font-extrabold leading-none">
                            {job.matchScore ?? 0}%
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-[#cfc4c5] mt-0.5">
                            Match
                          </span>
                        </div>
                      </div>

                      {/* Meta Badges */}
                      <div className="flex flex-wrap gap-2 text-xs text-[#5e5e5e]">
                        {job.location && (
                          <span className="flex items-center gap-1 bg-[#f9f9f9] border border-[#cfc4c5] px-2 py-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {job.location}
                          </span>
                        )}
                        {job.employmentType && (
                          <span className="flex items-center gap-1 bg-[#f9f9f9] border border-[#cfc4c5] px-2 py-1">
                            <span className="material-symbols-outlined text-xs">work</span>
                            {job.employmentType}
                          </span>
                        )}
                        {job.workplaceType && (
                          <span className="flex items-center gap-1 bg-[#f9f9f9] border border-[#cfc4c5] px-2 py-1">
                            <span className="material-symbols-outlined text-xs">laptop_mac</span>
                            {job.workplaceType}
                          </span>
                        )}
                      </div>

                      {/* Matched & Missing Skills */}
                      <div className="space-y-3 py-2 border-t border-b border-[#f0f0f0]">
                        {job.matchedSkills && job.matchedSkills.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold text-black uppercase tracking-wider block mb-1.5">
                              Matched Skills:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {job.matchedSkills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] px-2 py-0.5 font-medium"
                                >
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.missingSkills && job.missingSkills.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider block mb-1.5">
                              Missing Skills:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {job.missingSkills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] px-2 py-0.5 font-medium"
                                >
                                  ✕ {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recommendation */}
                      {job.recommendation && (
                        <div className="bg-[#f9f9f9] border-l-4 border-black p-3 text-xs text-[#1b1b1b] leading-relaxed">
                          <strong className="font-semibold block mb-0.5 text-black">
                            AI Assessment:
                          </strong>
                          {job.recommendation}
                        </div>
                      )}

                      {/* External Action Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-4 text-center border-2 border-black text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#f0f0f0] transition-colors flex items-center justify-center gap-1"
                          >
                            View Job
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </a>
                        )}

                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-4 text-center bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors flex items-center justify-center gap-1"
                          >
                            Apply Now
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              /* EMPTY STATE */
              <section className="bg-white border-2 border-black p-12 text-center flex flex-col items-center justify-center gap-4 my-6">
                <span className="material-symbols-outlined text-5xl text-[#7e7576]">
                  search_off
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-black">No matching jobs found.</h3>
                  <p className="text-sm text-[#5e5e5e]">
                    Try a different job title or broader search criteria.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTargetTitle('')
                    setTargetDescription('')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="mt-2 px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#1b1b1b] transition-colors cursor-pointer"
                >
                  Search Again
                </button>
              </section>
            )}
          </>
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
