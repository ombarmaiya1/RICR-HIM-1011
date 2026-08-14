import { useState } from 'react'
import useJobs from '../frontend_logic/useJobs'
import useAuth from '../frontend_logic/useAuth'

/**
 * JobsPage — Dedicated Target Position & Job Description Management
 * - Sharp architectural minimalist theme (0px radius, 1px/2px black borders)
 * - Top Navbar: Dashboard, Resumes, Jobs (Active), Analysis, Interviews
 * - Target Position Form (Create & Edit Mode: Title, Description, Save/Update/Delete CTA)
 * - Saved Jobs Repository List (Select, Preview, Edit, and Delete Target Roles)
 * - Footer
 */
export default function JobsPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Jobs')
  const { user } = useAuth()
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { jobs, saving, error: jobError, saveJob, updateJob, deleteJob } = useJobs()
  const [selectedJob, setSelectedJob] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const navItems = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleSaveOrUpdateJob = async (e) => {
    e.preventDefault()
    setSuccessMsg('')

    if (selectedJob) {
      // Update existing job
      const updated = await updateJob(selectedJob._id, {
        title: jobTitle,
        description: jobDescription,
      })
      if (updated) {
        setSuccessMsg('Target job updated successfully.')
        setSelectedJob(updated)
      }
    } else {
      // Create new job
      const created = await saveJob(jobTitle, jobDescription)
      if (created) {
        setSuccessMsg('New target job created successfully.')
        setJobTitle('')
        setJobDescription('')
      }
    }
  }

  const handleDeleteJob = async (jobId, e) => {
    if (e) e.stopPropagation()
    setSuccessMsg('')
    const ok = await deleteJob(jobId)
    if (ok) {
      setSuccessMsg('Job deleted successfully.')
      if (selectedJob?._id === jobId) {
        setSelectedJob(null)
        setJobTitle('')
        setJobDescription('')
      }
    }
  }

  const handleSelectSavedJob = (j) => {
    setJobTitle(j.title)
    setJobDescription(j.description)
    setSelectedJob(j)
    setSuccessMsg('')
  }

  const handleClearSelection = () => {
    setSelectedJob(null)
    setJobTitle('')
    setJobDescription('')
    setSuccessMsg('')
  }

  const filteredJobs = jobs.filter((j) => {
    const title = j.title || ''
    const desc = j.description || ''
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="w-full sticky top-0 bg-[#f9f9f9] border-b-2 border-black z-50">
        <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto">
          {/* Brand */}
          <div
            onClick={() => onNavigate && onNavigate('Dashboard')}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-48 pl-9 pr-3 py-1 bg-transparent text-[#1b1b1b] text-sm focus:outline-none focus:border-black border-0"
              />
            </div>
            <button
              type="button"
              aria-label="Account"
              onClick={() => handleTabClick('Settings')}
              className="flex items-center justify-center p-1 cursor-pointer hover:opacity-75 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#e8e8e8] border border-[#cfc4c5] overflow-hidden flex items-center justify-center text-black">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-lg text-[#5e5e5e]">account_circle</span>
                )}
              </div>
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
        <header className="mb-12 border-b border-[#cfc4c5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2">
              Job & Target Role Management
            </h1>
            <p className="text-base text-[#5e5e5e]">
              Define, edit, and organize target job listings and qualifications for AI evaluation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('Interviews')}
              className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors"
            >
              Start Mock Interview
            </button>
          </div>
        </header>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 bg-white border-2 border-black text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Target Position Context Form */}
          <section className="md:col-span-6 bg-[#f9f9f9] p-6 border border-[#cfc4c5] flex flex-col gap-6">
            <div className="border-b border-[#cfc4c5] pb-3 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                <span className="material-symbols-outlined text-black">work</span>
                {selectedJob ? 'Edit Target Position' : 'New Target Position'}
              </h2>
              {selectedJob && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs text-[#5e5e5e] hover:text-black uppercase tracking-wider font-semibold underline"
                >
                  + New Job
                </button>
              )}
            </div>

            <form onSubmit={handleSaveOrUpdateJob} className="flex flex-col gap-6 flex-grow">
              <div className="flex flex-col gap-2">
                <label htmlFor="job-title" className="text-xs font-semibold text-black uppercase tracking-wider">
                  Job Title / Target Role
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-white border border-[#cfc4c5] p-3 text-base text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 flex-grow">
                <label htmlFor="job-description" className="text-xs font-semibold text-black uppercase tracking-wider">
                  Job Description & Requirements
                </label>
                <textarea
                  id="job-description"
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description, required technical qualifications, and expectations..."
                  className="w-full bg-white border border-[#cfc4c5] p-3 text-base text-black resize-none focus:outline-none focus:border-2 focus:border-black transition-all flex-grow min-h-[220px]"
                  required
                ></textarea>
              </div>

              {jobError && (
                <div className="p-3 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {jobError}
                </div>
              )}

              <div className="flex gap-3">
                {selectedJob ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeleteJob(selectedJob._id)}
                      className="px-4 py-4 border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold uppercase tracking-widest hover:bg-[#ba1a1a] hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'UPDATING...' : 'UPDATE TARGET POSITION'}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'SAVING...' : 'SAVE TARGET POSITION'}
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Right Column: Saved Target Roles / Jobs List */}
          <section className="md:col-span-6 flex flex-col gap-6">
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] flex flex-col">
              <div className="p-4 border-b border-[#cfc4c5] bg-[#f3f3f3] flex justify-between items-center">
                <h3 className="text-xs font-semibold text-black tracking-widest uppercase">
                  Saved Job Descriptions ({filteredJobs.length})
                </h3>
              </div>

              <div className="flex flex-col">
                {filteredJobs.map((j, idx) => {
                  const jobId = j._id || j.id || idx
                  const isSelected = selectedJob?._id === j._id

                  return (
                    <div
                      key={jobId}
                      className={`p-4 border-b border-[#cfc4c5] hover:bg-[#eeeeee] transition-colors flex flex-col gap-2 cursor-pointer ${
                        isSelected ? 'bg-[#e8e8e8] border-l-4 border-l-black' : ''
                      } ${idx === filteredJobs.length - 1 ? 'border-b-0' : ''}`}
                      onClick={() => handleSelectSavedJob(j)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-black">
                            work_outline
                          </span>
                          <span className="text-base font-semibold text-black">{j.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {j.createdAt && (
                            <span className="text-[11px] text-[#5e5e5e]">
                              {new Date(j.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                          <button
                            type="button"
                            title="Delete Job"
                            onClick={(e) => handleDeleteJob(j._id, e)}
                            className="text-[#7e7576] hover:text-[#ba1a1a] p-0.5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#5e5e5e] line-clamp-3 leading-relaxed">
                        {j.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#cfc4c5]/50">
                        <span className="text-[11px] font-semibold text-black uppercase tracking-wider">
                          {isSelected ? 'Active in editor' : 'Click to edit'}
                        </span>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onNavigate && onNavigate('Analysis')}
                            className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider border border-[#cfc4c5] hover:border-black text-black bg-white"
                          >
                            Analyze
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate && onNavigate('Interviews')}
                            className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-black text-white hover:bg-[#1b1b1b]"
                          >
                            Interview
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredJobs.length === 0 && (
                  <div className="p-10 text-center text-sm text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-[#7e7576]">
                      assignment
                    </span>
                    <span>No saved jobs found. Use the form on the left to save a target position.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Context Card */}
            <div className="bg-black text-white p-6 border-2 border-black flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#cfc4c5]">
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span className="text-xs uppercase tracking-widest font-semibold">
                  Tailored Simulations
                </span>
              </div>
              <h3 className="text-lg font-bold">Role Alignment Context</h3>
              <p className="text-xs text-[#e2e2e2] leading-relaxed">
                Updating your job descriptions dynamically synchronizes with AI gap evaluations and mock interview scenario generators.
              </p>
            </div>
          </section>
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
