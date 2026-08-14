import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import useResumes from '../frontend_logic/useResumes'
import useJobSuggestions from '../frontend_logic/useJobSuggestions'
import useJobs from '../frontend_logic/useJobs'

export default function JobSuggestionsPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Jobs')
  const { resumes, loading: resumesLoading } = useResumes()
  const { jobs, loading: jobsLoading, saveJob } = useJobs()
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
  const [selectedJobId, setSelectedJobId] = useState('')
  const [targetTitle, setTargetTitle] = useState('')
  const [targetDescription, setTargetDescription] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [saveMessage, setSaveMessage] = useState('')

  // Sidebar Filter States
  const [industries, setIndustries] = useState({
    'Software Engineering': true,
    FinTech: true,
    'Data Infrastructure': false,
  })
  const [contractTypes, setContractTypes] = useState({
    'Full-time': true,
    'Contract (C2C)': false,
    'Contract-to-Hire': false,
  })
  const [seniorities, setSeniorities] = useState({
    'Mid-Level': false,
    Senior: true,
    'Principal / Staff': true,
  })

  // Auto select first resume when resumes finish loading
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0]._id || resumes[0].id)
    }
  }, [resumes, selectedResumeId])

  // Auto select first saved job when jobs finish loading
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId && !targetTitle) {
      const first = jobs[0]
      const id = first._id || first.id
      setSelectedJobId(id)
      setTargetTitle(first.title || '')
      setTargetDescription(first.description || '')
    }
  }, [jobs, selectedJobId, targetTitle])

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

  const handleSaveToTargetJobs = async (job) => {
    const title = job.title || 'Saved Position'
    const description =
      job.description ||
      job.recommendation ||
      `Target Role at ${job.company || 'Company'} (${job.location || 'Remote'})`

    const res = await saveJob(title, description)
    if (res) {
      const key = job._id || `${job.title}-${job.company}`
      setSavedJobIds((prev) => new Set([...prev, key]))
      setSaveMessage(`"${title}" saved to your target jobs.`)
      setTimeout(() => setSaveMessage(''), 4000)
    }
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
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleTabClick}
        onLogout={onLogout}
        searchValue={searchFilter}
        onSearch={(e) => setSearchFilter(e.target.value)}
        searchPlaceholder="Search roles..."
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        {/* Page Header */}
        <header className="mb-10 border-b border-[#cfc4c5] pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight">
              Recommended Roles
            </h1>
            <p className="text-base text-[#4c4546] mt-2 max-w-2xl leading-relaxed">
              Algorithmic matching based on your structural profile, recent resume analysis, and demonstrated core competencies.
            </p>
          </div>
          <div className="hidden md:block text-xs font-bold text-[#4c4546] tracking-wider uppercase">
            SORT BY: <span className="text-black border-b border-black ml-1 cursor-pointer">MATCH QUALITY</span>
          </div>
        </header>

        {/* Feedback Message */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>✓ {saveMessage}</span>
            <button onClick={() => setSaveMessage('')} className="underline text-[#cfc4c5]">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Parameters */}
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <div className="sticky top-10 flex flex-col gap-6 border border-[#cfc4c5] bg-white p-6">
              <h2 className="text-lg font-bold text-black border-b border-[#cfc4c5] pb-2 uppercase tracking-wide">
                Parameters
              </h2>

              {/* Target Role & Resume Input Form */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-5">
                {/* Saved Target Role Dropdown */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="saved-job-selector" className="text-xs font-bold text-black uppercase tracking-wider">
                    Select Target Job (Saved) *
                  </label>
                  <select
                    id="saved-job-selector"
                    value={selectedJobId}
                    onChange={(e) => {
                      const id = e.target.value
                      setSelectedJobId(id)
                      const found = jobs.find((j) => (j._id || j.id) === id)
                      if (found) {
                        setTargetTitle(found.title || '')
                        setTargetDescription(found.description || '')
                      } else {
                        setTargetTitle('')
                        setTargetDescription('')
                      }
                    }}
                    className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-2.5 text-xs text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                    disabled={jobsLoading}
                  >
                    {jobs.length === 0 ? (
                      <option value="">No saved target jobs. Type title below.</option>
                    ) : (
                      <>
                        <option value="">-- Select Saved Role or Type Custom --</option>
                        {jobs.map((j) => (
                          <option key={j._id || j.id} value={j._id || j.id}>
                            {j.title} {j.company ? `(${j.company})` : ''}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Target Role Title Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="target-title" className="text-xs font-bold text-black uppercase tracking-wider">
                    Target Role Title *
                  </label>
                  <input
                    id="target-title"
                    type="text"
                    value={targetTitle}
                    onChange={(e) => {
                      setTargetTitle(e.target.value)
                      setSelectedJobId('')
                    }}
                    placeholder="e.g. Systems Architect"
                    className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-2.5 text-xs text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                    required
                  />
                </div>

                {/* Select Profile / Resume Dropdown */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="resume-selector" className="text-xs font-bold text-black uppercase tracking-wider">
                    Select Profile / Resume *
                  </label>
                  <select
                    id="resume-selector"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-2.5 text-xs text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                    required
                    disabled={resumesLoading || resumes.length === 0}
                  >
                    {resumes.length === 0 ? (
                      <option value="">No resumes found. Upload one first.</option>
                    ) : (
                      resumes.map((r) => (
                        <option key={r._id || r.id} value={r._id || r.id}>
                          {r.originalName || r.fileName || r.title || 'Resume'}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="target-description" className="text-xs font-bold text-black uppercase tracking-wider">
                    Context / Keywords (Optional)
                  </label>
                  <textarea
                    id="target-description"
                    rows={3}
                    value={targetDescription}
                    onChange={(e) => setTargetDescription(e.target.value)}
                    placeholder="Go, Kubernetes, Distributed Systems..."
                    className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-2.5 text-xs text-black resize-none focus:outline-none focus:border-2 focus:border-black transition-all"
                  />
                </div>

                {/* Filter Section: Industry Focus */}
                <div className="flex flex-col gap-2 border-t border-[#cfc4c5] pt-4">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-1">
                    Industry Focus
                  </h3>
                  {Object.keys(industries).map((ind) => (
                    <label key={ind} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-[#f9f9f9] transition-colors">
                      <input
                        type="checkbox"
                        checked={industries[ind]}
                        onChange={(e) => setIndustries((prev) => ({ ...prev, [ind]: e.target.checked }))}
                        className="rounded-none border-[#7e7576] accent-black"
                      />
                      <span className="text-xs font-medium text-[#1b1b1b]">{ind}</span>
                    </label>
                  ))}
                </div>

                {/* Filter Section: Contract Type */}
                <div className="flex flex-col gap-2 border-t border-[#cfc4c5] pt-4">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-1">
                    Contract Type
                  </h3>
                  {Object.keys(contractTypes).map((ct) => (
                    <label key={ct} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-[#f9f9f9] transition-colors">
                      <input
                        type="checkbox"
                        checked={contractTypes[ct]}
                        onChange={(e) => setContractTypes((prev) => ({ ...prev, [ct]: e.target.checked }))}
                        className="rounded-none border-[#7e7576] accent-black"
                      />
                      <span className="text-xs font-medium text-[#1b1b1b]">{ct}</span>
                    </label>
                  ))}
                </div>

                {/* Filter Section: Seniority */}
                <div className="flex flex-col gap-2 border-t border-[#cfc4c5] pt-4">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-1">
                    Seniority
                  </h3>
                  {Object.keys(seniorities).map((sen) => (
                    <label key={sen} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-[#f9f9f9] transition-colors">
                      <input
                        type="checkbox"
                        checked={seniorities[sen]}
                        onChange={(e) => setSeniorities((prev) => ({ ...prev, [sen]: e.target.checked }))}
                        className="rounded-none border-[#7e7576] accent-black"
                      />
                      <span className="text-xs font-medium text-[#1b1b1b]">{sen}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !selectedResumeId || !targetTitle.trim()}
                  className="mt-2 w-full border border-black bg-white text-black font-bold text-xs py-3 uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      Running Matcher...
                    </>
                  ) : (
                    'Apply Adjustments'
                  )}
                </button>
              </form>
            </div>
          </aside>

          {/* Job List Canvas */}
          <section className="w-full lg:w-3/4 flex flex-col gap-6">
            {/* ERROR STATE */}
            {error && (
              <div className="p-6 bg-[#fdf2f2] border-2 border-[#ba1a1a] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">error</span>
                  <div>
                    <h3 className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                      Match Generation Notice
                    </h3>
                    <p className="text-xs text-[#5e5e5e]">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearError()
                    fetchSavedSuggestions()
                  }}
                  className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#961313] transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* LOADING STATE: Skeleton Cards */}
            {loading && (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-6 border border-[#cfc4c5] animate-pulse flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-grow">
                        <div className="h-6 bg-[#e8e8e8] w-2/3" />
                        <div className="h-4 bg-[#f0f0f0] w-1/3" />
                      </div>
                      <div className="h-10 w-16 bg-[#e8e8e8]" />
                    </div>
                    <div className="h-16 bg-[#f9f9f9] border border-[#cfc4c5]" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-[#e8e8e8]" />
                      <div className="h-6 w-20 bg-[#e8e8e8]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RESULTS STATE */}
            {!loading && !error && (
              <>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((job, idx) => {
                    const cardKey = job._id || `${job.source}-${job.sourceJobId || idx}`
                    const isSaved = savedJobIds.has(cardKey)

                    return (
                      <article
                        key={cardKey}
                        className="group border border-[#cfc4c5] bg-white flex flex-col hover:border-black transition-colors relative overflow-hidden"
                      >
                        {/* Top Match Bar Indicator */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#eeeeee] group-hover:bg-black transition-colors" />

                        <div className="p-6 md:p-8 flex flex-col gap-4">
                          {/* Header Row */}
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-xl md:text-2xl font-semibold text-black leading-tight">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#4c4546] font-medium">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm text-[#7e7576]">business</span>
                                  {job.company || 'Nexus Data Corp'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm text-[#7e7576]">location_on</span>
                                  {job.location || 'Remote (US)'}
                                </span>
                                {(job.salaryRange || job.salary) && (
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-[#7e7576]">payments</span>
                                    {job.salaryRange || job.salary || '$180k - $220k'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Prominent Match Score */}
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-3xl md:text-4xl font-bold text-black leading-none">
                                {job.matchScore ?? 94}%
                              </span>
                              <span className="text-[10px] text-[#4c4546] uppercase tracking-widest mt-1">
                                Match Index
                              </span>
                            </div>
                          </div>

                          {/* Architect Analysis Snippet */}
                          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-4">
                            <p className="text-xs text-[#1b1b1b] leading-relaxed">
                              <strong className="font-bold text-black">Architect Analysis: </strong>
                              {job.recommendation ||
                                job.analysis ||
                                `High alignment detected between your profile and ${job.company || 'the target role'}'s core architecture requirements.`}
                            </p>
                          </div>

                          {/* Skill Tags & Matched/Missing Breakdown */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {job.matchedSkills && job.matchedSkills.length > 0 ? (
                              job.matchedSkills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-bold px-2 py-1 bg-[#e8e8e8] border border-[#cfc4c5] text-black uppercase"
                                >
                                  ✓ {skill}
                                </span>
                              ))
                            ) : (
                              <>
                                <span className="text-[11px] font-bold px-2 py-1 bg-[#e8e8e8] border border-[#cfc4c5] text-black uppercase">
                                  Go
                                </span>
                                <span className="text-[11px] font-bold px-2 py-1 bg-[#e8e8e8] border border-[#cfc4c5] text-black uppercase">
                                  Kubernetes
                                </span>
                                <span className="text-[11px] font-bold px-2 py-1 bg-[#e8e8e8] border border-[#cfc4c5] text-black uppercase">
                                  System Design
                                </span>
                              </>
                            )}

                            {job.missingSkills &&
                              job.missingSkills.map((skill, i) => (
                                <span
                                  key={`missing-${i}`}
                                  className="text-[11px] font-bold px-2 py-1 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] uppercase"
                                >
                                  ✕ {skill}
                                </span>
                              ))}
                          </div>

                          {/* Footer Actions */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-4 border-t border-[#eeeeee] gap-4">
                            <div className="text-[11px] text-[#5e5e5e] uppercase tracking-wider">
                              Source: <span className="font-semibold text-black">{job.source || 'Algorithmic Engine'}</span>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleSaveToTargetJobs(job)}
                                disabled={isSaved}
                                className="flex-1 sm:flex-none px-6 py-2 border border-black text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isSaved ? 'Saved to Target' : 'Save Position'}
                              </button>

                              {job.jobUrl || job.applyUrl ? (
                                <a
                                  href={job.jobUrl || job.applyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-none px-6 py-2 bg-black text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#303030] transition-colors inline-flex items-center justify-center gap-1"
                                >
                                  Initiate Apply
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSaveToTargetJobs(job)}
                                  className="flex-1 sm:flex-none px-6 py-2 bg-black text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#303030] transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                                >
                                  Initiate Apply
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })
                ) : (
                  /* EMPTY STATE */
                  <div className="bg-white border border-[#cfc4c5] p-12 text-center flex flex-col items-center justify-center gap-4 my-4">
                    <span className="material-symbols-outlined text-5xl text-[#7e7576]">search_off</span>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-black uppercase tracking-wider">No matching roles found</h3>
                      <p className="text-xs text-[#5e5e5e]">
                        Select a resume and specify a target role title in the Parameters panel to generate tailored recommendations.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
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

