import { useState } from 'react'
import useJobs from '../frontend_logic/useJobs'
import useAuth from '../frontend_logic/useAuth'

/**
 * ResumesJobsPage — Faithful reproduction of Stitch "Job & Resume Management" (Context & Assets) screen.
 * - Sharp architectural minimalist theme (0px radius, 1px/2px black borders)
 * - Top Navbar: Dashboard, Resumes (Active), Jobs, Analysis, Interviews
 * - Target Position Card (Job Title, Job Description, Lock Context CTA)
 * - Document Upload Dropzone & Document Repository List (with delete functionality)
 * - Footer
 */
export default function ResumesJobsPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Resumes')
  const { user } = useAuth()
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const { jobs, saving, error: jobError, saveJob } = useJobs()

  const [documents, setDocuments] = useState([])

  const navItems = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        date: `Extracted: ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })}`,
      }
      setDocuments((prev) => [newDoc, ...prev])
    }
  }

  const handleLockContext = async (e) => {
    e.preventDefault()
    await saveJob(jobTitle, jobDescription)
  }

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
        <header className="mb-12 border-b border-[#cfc4c5] pb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2">
            Context & Assets
          </h1>
          <p className="text-base text-[#5e5e5e]">
            Define your target role and manage your foundational documents.
          </p>
        </header>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Target Position Context */}
          <section className="md:col-span-6 bg-[#f9f9f9] p-6 border border-[#cfc4c5] flex flex-col gap-6">
            <div className="border-b border-[#cfc4c5] pb-3">
              <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                <span className="material-symbols-outlined text-black">work</span>
                Target Position
              </h2>
            </div>

            <form onSubmit={handleLockContext} className="flex flex-col gap-6 flex-grow">
              <div className="flex flex-col gap-2">
                <label htmlFor="job-title" className="text-sm font-semibold text-black">
                  Job Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-white border border-[#cfc4c5] p-3 text-base text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 flex-grow">
                <label htmlFor="job-description" className="text-sm font-semibold text-black">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full bg-white border border-[#cfc4c5] p-3 text-base text-black resize-none focus:outline-none focus:border-2 focus:border-black transition-all flex-grow min-h-[220px]"
                ></textarea>
              </div>

                {jobError && (
                  <p style={{ fontSize: '12px', color: '#ba1a1a', fontWeight: 600 }}>{jobError}</p>
                )}

              <button
                type="submit"
                className="w-full bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors"
              >
                {saving ? 'SAVING...' : 'SAVE JOB'}
              </button>
            </form>

            {/* Saved jobs list */}
            {jobs.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#5e5e5e]">Saved Jobs</p>
                {jobs.map((j) => (
                  <button
                    key={j._id}
                    type="button"
                    onClick={() => { setJobTitle(j.title); setJobDescription(j.description) }}
                    className="text-left border border-[#cfc4c5] p-3 hover:border-black transition-colors"
                  >
                    <span className="text-sm font-semibold text-black">{j.title}</span>
                    <span className="block text-xs text-[#5e5e5e] mt-0.5 truncate">{j.description.slice(0, 80)}…</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Resume Upload & Document Repository */}
          <section className="md:col-span-6 flex flex-col gap-6">
            {/* Upload Dropzone */}
            <label className="bg-[#f9f9f9] p-8 border border-[#cfc4c5] border-dashed flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:border-black hover:bg-[#e8e8e8] transition-all group">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="material-symbols-outlined text-[48px] text-[#7e7576] mb-3 group-hover:text-black transition-colors">
                upload_file
              </span>
              <h3 className="text-xl font-semibold text-black">Upload Document</h3>
              <p className="text-xs text-[#5e5e5e] mt-1">PDF, DOCX up to 5MB</p>
            </label>

            {/* Document Repository */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] flex flex-col">
              <div className="p-4 border-b border-[#cfc4c5] bg-[#f3f3f3]">
                <h3 className="text-xs font-semibold text-black tracking-widest uppercase">
                  Document Repository
                </h3>
              </div>
              <ul className="flex flex-col">
                {documents.map((doc, idx) => (
                  <li
                    key={doc.id}
                    className={`flex items-center justify-between p-4 border-b border-[#cfc4c5] hover:bg-[#eeeeee] transition-colors group ${
                      idx === documents.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#7e7576] group-hover:text-black transition-colors">
                        description
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-black">{doc.name}</span>
                        <span className="text-xs text-[#5e5e5e]">{doc.date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-[#5e5e5e] hover:text-[#ba1a1a] transition-colors p-1"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </li>
                ))}
                {documents.length === 0 && (
                  <li className="p-6 text-center text-sm text-[#5e5e5e]">
                    No documents uploaded yet.
                  </li>
                )}
              </ul>
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
