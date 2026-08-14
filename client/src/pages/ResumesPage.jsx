import { useState, useEffect } from 'react'
import useResumes from '../frontend_logic/useResumes'
import useJobs from '../frontend_logic/useJobs'
import Navbar from '../components/Navbar'

export default function ResumesPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Resumes')
  const { resumes, loading: resumesLoading, uploading, error: resumeError, uploadResume, deleteResumeLocal } = useResumes()
  const { jobs, loading: jobsLoading, saving: jobsSaving, saveJob, updateJob, deleteJob } = useJobs()

  const [activeResumeId, setActiveResumeId] = useState('')
  const [activeJobId, setActiveJobId] = useState('')

  const [targetJobTitle, setTargetJobTitle] = useState('')
  const [targetJobDescription, setTargetJobDescription] = useState('')

  const [selectedResumeModal, setSelectedResumeModal] = useState(null)
  const [selectedJobModal, setSelectedJobModal] = useState(null)

  const [editingJobModal, setEditingJobModal] = useState(null)
  const [editJobTitle, setEditJobTitle] = useState('')
  const [editJobDescription, setEditJobDescription] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Load active context from localStorage or set initial default
  useEffect(() => {
    const savedActiveResume = localStorage.getItem('activeResumeId')
    const savedActiveJob = localStorage.getItem('activeJobId')

    if (savedActiveResume && resumes.some((r) => (r._id || r.id) === savedActiveResume)) {
      setActiveResumeId(savedActiveResume)
    } else if (resumes.length > 0) {
      const firstId = resumes[0]._id || resumes[0].id
      setActiveResumeId(firstId)
      localStorage.setItem('activeResumeId', firstId)
    }

    if (savedActiveJob && jobs.some((j) => (j._id || j.id) === savedActiveJob)) {
      setActiveJobId(savedActiveJob)
    } else if (jobs.length > 0) {
      const firstId = jobs[0]._id || jobs[0].id
      setActiveJobId(firstId)
      localStorage.setItem('activeJobId', firstId)
    }
  }, [resumes, jobs])

  // Sync inputs with currently selected active job
  useEffect(() => {
    const current = jobs.find((j) => (j._id || j.id) === activeJobId)
    if (current) {
      setTargetJobTitle(current.title || '')
      setTargetJobDescription(current.description || '')
    }
  }, [activeJobId, jobs])

  // Populate edit modal fields when selected
  useEffect(() => {
    if (editingJobModal) {
      setEditJobTitle(editingJobModal.title || '')
      setEditJobDescription(editingJobModal.description || '')
    }
  }, [editingJobModal])

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const uploaded = await uploadResume(file)
      if (uploaded) {
        const newId = uploaded._id || uploaded.id
        setActiveResumeId(newId)
        localStorage.setItem('activeResumeId', newId)
        setStatusMessage(`Uploaded and set "${file.name}" as active foundational document.`)
        setTimeout(() => setStatusMessage(''), 4000)
      }
      e.target.value = ''
    }
  }

  const handleSetActiveResume = (docId, docName) => {
    setActiveResumeId(docId)
    localStorage.setItem('activeResumeId', docId)
    setStatusMessage(`"${docName}" set as active document.`)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const handleSetActiveJob = (jobId, jobTitle) => {
    setActiveJobId(jobId)
    localStorage.setItem('activeJobId', jobId)
    setStatusMessage(`"${jobTitle}" set as active target role.`)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const filteredResumes = resumes.filter((doc) => {
    const name = doc.fileName || doc.originalName || doc.title || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredJobs = jobs.filter((job) => {
    const title = job.title || ''
    const company = job.company || job.description || ''
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const activeResumeObj = resumes.find((r) => (r._id || r.id) === activeResumeId)
  const activeJobObj = jobs.find((j) => (j._id || j.id) === activeJobId)

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleTabClick}
        onLogout={onLogout}
        searchValue={searchQuery}
        onSearch={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search history..."
      />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        {/* Header Section */}
        <header className="mb-10 border-b border-[#cfc4c5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight">
              Active Context
            </h1>
            <p className="text-base text-[#4c4546] mt-2 max-w-2xl leading-relaxed">
              Set the current target role and foundational document for analysis and AI career evaluation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('Analysis')}
              className="px-5 py-2.5 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-[#303030] transition-colors cursor-pointer"
            >
              Run Match Analysis
            </button>
          </div>
        </header>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="mb-6 p-4 bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="underline text-[#cfc4c5] cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. ACTIVE CONTEXT PANELS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Active Target Role Card with Inputs */}
          <div className="bg-white border-2 border-black p-6 flex flex-col justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black" />
            <div className="flex items-center justify-between border-b border-[#cfc4c5] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5e5e5e]">
                <span className="material-symbols-outlined text-base text-black">work</span>
                Active Target Role
              </div>
              {activeJobObj && (
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                  Active Context
                </span>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!targetJobTitle.trim()) return
                const res = await saveJob(targetJobTitle.trim(), targetJobDescription.trim())
                if (res) {
                  const newId = res._id || res.id
                  setActiveJobId(newId)
                  localStorage.setItem('activeJobId', newId)
                  setStatusMessage(`Saved and set "${res.title}" as active target role.`)
                  setTimeout(() => setStatusMessage(''), 4000)
                }
              }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="active-job-title" className="text-xs font-bold text-black uppercase tracking-wider">
                  Target Job Title *
                </label>
                <input
                  id="active-job-title"
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-2.5 text-xs text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="active-job-desc" className="text-xs font-bold text-black uppercase tracking-wider">
                  Job Description / Requirements (Optional)
                </label>
                <textarea
                  id="active-job-desc"
                  rows={3}
                  value={targetJobDescription}
                  onChange={(e) => setTargetJobDescription(e.target.value)}
                  placeholder="Paste job responsibilities or key tech stack..."
                  className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-2.5 text-xs text-black resize-none focus:outline-none focus:border-2 focus:border-black transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={jobsSaving || !targetJobTitle.trim()}
                className="mt-1 w-full bg-black text-white font-bold text-xs py-2.5 uppercase tracking-wider hover:bg-[#303030] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {jobsSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Saving Role...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Save & Set Active Role
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#eeeeee] flex justify-between items-center text-xs">
              <span className="text-[#5e5e5e]">
                {jobs.length} Saved Roles Available
              </span>
            </div>
          </div>

          {/* Foundational Document (Active Resume) Card */}
          <div className="bg-white border-2 border-black p-6 flex flex-col justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black" />
            <div className="flex items-center justify-between border-b border-[#cfc4c5] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5e5e5e]">
                <span className="material-symbols-outlined text-base text-black">description</span>
                Foundational Document
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                PDF, DOCX up to 5MB
              </span>
            </div>

            {activeResumeObj ? (
              <div className="flex items-start justify-between gap-4 py-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-black break-all">
                      {activeResumeObj.fileName || activeResumeObj.originalName || activeResumeObj.title || 'Resume.pdf'}
                    </h3>
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest shrink-0">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#5e5e5e] mt-1">
                    Uploaded: {activeResumeObj.createdAt ? new Date(activeResumeObj.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-[#5e5e5e]">
                No document selected as active.
              </div>
            )}

            {/* Quick Upload Dropzone */}
            <label className="border border-[#cfc4c5] border-dashed bg-[#f9f9f9] p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-[#e8e8e8] transition-colors">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="material-symbols-outlined text-xl text-black">
                {uploading ? 'hourglass_top' : 'cloud_upload'}
              </span>
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                {uploading ? 'Uploading & Extracting...' : 'Upload New Document'}
              </span>
            </label>

            {resumeError && (
              <div className="p-2 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-bold">
                {resumeError}
              </div>
            )}
          </div>
        </section>

        {/* 2. MANAGEMENT HISTORY SECTION */}
        <section className="mb-10">
          <div className="mb-6 border-b border-[#cfc4c5] pb-3 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-black tracking-tight">
                Management History
              </h2>
              <p className="text-xs text-[#5e5e5e] mt-1">
                Manage your past resumes and target jobs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume History List */}
            <div className="bg-white border border-[#cfc4c5] flex flex-col">
              <div className="p-4 border-b border-[#cfc4c5] bg-[#f3f3f3] flex justify-between items-center">
                <h3 className="text-xs font-bold text-black tracking-widest uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">description</span>
                  Resume Management ({filteredResumes.length})
                </h3>
                {resumesLoading && <span className="text-xs text-[#5e5e5e]">Loading…</span>}
              </div>

              <ul className="flex flex-col divide-y divide-[#cfc4c5]">
                {filteredResumes.map((doc, idx) => {
                  const docId = doc._id || doc.id
                  const docName = doc.fileName || doc.originalName || doc.title || 'Untitled Resume'
                  const isActive = docId === activeResumeId
                  const uploadDate = doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })
                    : 'Recently'

                  return (
                    <li key={docId || idx} className="p-4 hover:bg-[#f9f9f9] transition-colors flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-[#f0f0f0] border border-[#cfc4c5] flex items-center justify-center text-black shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-lg">description</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-black break-all block">
                              {docName}
                            </span>
                            <span className="text-xs text-[#5e5e5e]">
                              Extracted: {uploadDate}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Action buttons matching Stitch spec */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                        <button
                          type="button"
                          onClick={() => setSelectedResumeModal(doc)}
                          className="px-3 py-1 text-xs border border-[#cfc4c5] hover:border-black text-black font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          View
                        </button>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSetActiveResume(docId, docName)}
                            className="px-3 py-1 text-xs bg-black text-white font-semibold uppercase tracking-wider flex items-center gap-1 hover:bg-[#303030] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Set Active
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteResumeLocal(docId)}
                          className="px-3 py-1 text-xs border border-[#ba1a1a] text-[#ba1a1a] font-semibold uppercase tracking-wider flex items-center gap-1 hover:bg-[#ffdad6] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                })}

                {!resumesLoading && filteredResumes.length === 0 && (
                  <li className="p-8 text-center text-xs text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-[#7e7576]">folder_open</span>
                    <span>No resume history found.</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Job Title Management List */}
            <div className="bg-white border border-[#cfc4c5] flex flex-col">
              <div className="p-4 border-b border-[#cfc4c5] bg-[#f3f3f3] flex justify-between items-center">
                <h3 className="text-xs font-bold text-black tracking-widest uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">business_center</span>
                  Job Title Management ({filteredJobs.length})
                </h3>
                {jobsLoading && <span className="text-xs text-[#5e5e5e]">Loading…</span>}
              </div>

              <ul className="flex flex-col divide-y divide-[#cfc4c5]">
                {filteredJobs.map((job, idx) => {
                  const jobId = job._id || job.id
                  const jobTitle = job.title || 'Untitled Target Role'
                  const isActive = jobId === activeJobId
                  const addedDate = job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })
                    : 'Recently'

                  return (
                    <li key={jobId || idx} className="p-4 hover:bg-[#f9f9f9] transition-colors flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-[#f0f0f0] border border-[#cfc4c5] flex items-center justify-center text-black shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-lg">work</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-black break-all block">
                              {jobTitle}
                            </span>
                            <span className="text-xs text-[#5e5e5e]">
                              {job.company ? `${job.company} - ` : ''}Added: {addedDate}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest shrink-0">
                            Active Role
                          </span>
                        )}
                      </div>

                      {/* Action buttons matching Stitch spec */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                        <button
                          type="button"
                          onClick={() => setSelectedJobModal(job)}
                          className="px-3 py-1 text-xs border border-[#cfc4c5] hover:border-black text-black font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingJobModal(job)}
                          className="px-3 py-1 text-xs border border-[#cfc4c5] hover:border-black text-black font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                          Edit
                        </button>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSetActiveJob(jobId, jobTitle)}
                            className="px-3 py-1 text-xs bg-black text-white font-semibold uppercase tracking-wider flex items-center gap-1 hover:bg-[#303030] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Set Active
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteJob(jobId)}
                          className="px-3 py-1 text-xs border border-[#ba1a1a] text-[#ba1a1a] font-semibold uppercase tracking-wider flex items-center gap-1 hover:bg-[#ffdad6] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                })}

                {!jobsLoading && filteredJobs.length === 0 && (
                  <li className="p-8 text-center text-xs text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-[#7e7576]">work_outline</span>
                    <span>No job titles saved.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* RESUME VIEWER MODAL */}
        {selectedResumeModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-lg font-bold text-black">
                  Resume Details: {selectedResumeModal.fileName || selectedResumeModal.originalName}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedResumeModal(null)}
                  className="p-1 text-[#5e5e5e] hover:text-black cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {selectedResumeModal.fileUrl && (
                <div>
                  <a
                    href={selectedResumeModal.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    View Resume PDF
                  </a>
                </div>
              )}

              {selectedResumeModal.parsedData?.summary && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-[#5e5e5e] mb-1">
                    Summary
                  </h4>
                  <p className="text-xs text-[#1b1b1b] bg-white p-3 border border-[#cfc4c5] leading-relaxed">
                    {selectedResumeModal.parsedData.summary}
                  </p>
                </div>
              )}

              {selectedResumeModal.parsedData?.skills && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-[#5e5e5e] mb-1">
                    Extracted Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResumeModal.parsedData.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-[#cfc4c5] text-xs font-semibold text-black"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResumeModal.extractedText && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-[#5e5e5e] mb-1">
                    Extracted Text Preview
                  </h4>
                  <div className="text-xs text-[#4c4546] bg-white p-3 border border-[#cfc4c5] max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                    {selectedResumeModal.extractedText}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#cfc4c5] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedResumeModal(null)}
                  className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#303030] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JOB VIEWER MODAL */}
        {selectedJobModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-lg font-bold text-black">
                  Job Role: {selectedJobModal.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedJobModal(null)}
                  className="p-1 text-[#5e5e5e] hover:text-black cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-[#5e5e5e] mb-1">
                  Job Description / Scope
                </h4>
                <p className="text-xs text-[#1b1b1b] bg-white p-4 border border-[#cfc4c5] leading-relaxed whitespace-pre-wrap">
                  {selectedJobModal.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#cfc4c5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingJobModal(selectedJobModal)
                    setSelectedJobModal(null)
                  }}
                  className="px-4 py-2 border border-black text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#e8e8e8] cursor-pointer"
                >
                  Edit Job
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJobModal(null)}
                  className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#303030] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JOB EDIT MODAL */}
        {editingJobModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Target Role: {editingJobModal.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingJobModal(null)}
                  className="p-1 text-[#5e5e5e] hover:text-black cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!editJobTitle.trim()) return
                  const updated = await updateJob(editingJobModal._id || editingJobModal.id, {
                    title: editJobTitle.trim(),
                    description: editJobDescription.trim(),
                  })
                  if (updated) {
                    setStatusMessage(`Updated job title to "${updated.title}".`)
                    setEditingJobModal(null)
                    setTimeout(() => setStatusMessage(''), 4000)
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-job-title" className="text-xs font-bold text-black uppercase tracking-wider">
                    Job Title *
                  </label>
                  <input
                    id="edit-job-title"
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    placeholder="e.g. Lead Fullstack Engineer"
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-xs text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-job-desc" className="text-xs font-bold text-black uppercase tracking-wider">
                    Job Description / Scope (Optional)
                  </label>
                  <textarea
                    id="edit-job-desc"
                    rows={5}
                    value={editJobDescription}
                    onChange={(e) => setEditJobDescription(e.target.value)}
                    placeholder="Paste job description or requirements..."
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-xs text-black resize-none focus:outline-none focus:border-2 focus:border-black transition-all"
                  />
                </div>

                <div className="mt-2 pt-4 border-t border-[#cfc4c5] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingJobModal(null)}
                    className="px-5 py-2 border border-black text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#e8e8e8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={jobsSaving || !editJobTitle.trim()}
                    className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#303030] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    {jobsSaving ? 'Saving...' : 'Save Changes'}
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
            © 2024 ARCHITECT AI. ALL RIGHTS RESERVED.
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

