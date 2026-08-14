import { useState } from 'react'
import useResumes from '../frontend_logic/useResumes'
import Navbar from '../components/Navbar'

/**
 * ResumesPage — Dedicated Resume Management & Document Repository
 * - Sharp architectural minimalist theme (0px radius, 1px/2px black borders)
 * - Top Navbar: Dashboard, Resumes (Active), Jobs, Analysis, Interviews
 * - Document Upload Dropzone & Document Repository List (Connected to backend API)
 * - Extracted Profile / Skills Preview Modal or Drawer
 * - Footer
 */
export default function ResumesPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Resumes')
  const { resumes, loading, uploading, error, uploadResume, deleteResumeLocal } = useResumes()
  const [selectedResume, setSelectedResume] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadResume(file)
      e.target.value = ''
    }
  }

  const filteredResumes = resumes.filter((doc) => {
    const name = doc.fileName || doc.name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleTabClick}
        onLogout={onLogout}
        searchValue={searchQuery}
        onSearch={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search resumes..."
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12">
        {/* Header Section */}
        <header className="mb-12 border-b border-[#cfc4c5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2">
              Resume Management
            </h1>
            <p className="text-base text-[#5e5e5e]">
              Upload, parse, and organize your foundational career documents and profiles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('Analysis')}
              className="px-4 py-2 border border-black text-xs font-semibold uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors"
            >
              Run Match Analysis
            </button>
          </div>
        </header>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Upload Dropzone & Guidelines */}
          <section className="md:col-span-5 flex flex-col gap-6">
            {/* Upload Dropzone */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col gap-4">
              <div className="border-b border-[#cfc4c5] pb-3">
                <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-black">upload_file</span>
                  Upload New Resume
                </h2>
              </div>

              <label className="bg-white p-8 border border-[#cfc4c5] border-dashed flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:border-black hover:bg-[#f3f3f3] transition-all group">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[48px] text-[#7e7576] mb-3 group-hover:text-black transition-colors">
                  {uploading ? 'hourglass_top' : 'cloud_upload'}
                </span>
                <h3 className="text-lg font-semibold text-black text-center">
                  {uploading ? 'Extracting & Parsing with AI…' : 'Click to Upload or Drag & Drop'}
                </h3>
                <p className="text-xs text-[#5e5e5e] mt-1 text-center">
                  Supports PDF or DOCX format (Max 5MB)
                </p>
              </label>

              {error && (
                <div className="p-3 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}
            </div>

            {/* Resume Tips / Parsing Info */}
            <div className="bg-black text-white p-6 border-2 border-black flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#cfc4c5]">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="text-xs uppercase tracking-widest font-semibold">
                  AI Parsing Engine
                </span>
              </div>
              <h3 className="text-lg font-bold">Automatic Skill & Experience Extraction</h3>
              <p className="text-xs text-[#e2e2e2] leading-relaxed">
                When you upload a document, our LLM parser structures your skills, work history, and education to match against target job requirements and power your mock interview questions.
              </p>
            </div>
          </section>

          {/* Right Column: Document Repository List */}
          <section className="md:col-span-7 flex flex-col gap-6">
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] flex flex-col">
              <div className="p-4 border-b border-[#cfc4c5] bg-[#f3f3f3] flex justify-between items-center">
                <h3 className="text-xs font-semibold text-black tracking-widest uppercase">
                  Document Repository ({filteredResumes.length})
                </h3>
                {loading && <span className="text-xs text-[#5e5e5e]">Loading…</span>}
              </div>

              <ul className="flex flex-col">
                {filteredResumes.map((doc, idx) => {
                  const docId = doc._id || doc.id
                  const docName = doc.fileName || doc.name || 'Untitled Document'
                  const uploadDate = doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })
                    : doc.date || 'Recently'
                  const parsedSkills = doc.parsedData?.skills || []

                  return (
                    <li
                      key={docId || idx}
                      className={`p-4 border-b border-[#cfc4c5] hover:bg-[#eeeeee] transition-colors ${
                        idx === filteredResumes.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#e8e8e8] border border-[#cfc4c5] flex items-center justify-center text-black flex-shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-xl">description</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-black break-all">
                              {docName}
                            </span>
                            <span className="text-xs text-[#5e5e5e] mt-0.5">
                              Uploaded: {uploadDate}
                            </span>

                            {/* Extracted Skills Pills */}
                            {parsedSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {parsedSkills.slice(0, 5).map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 bg-white border border-[#cfc4c5] text-[11px] font-medium text-black"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {parsedSkills.length > 5 && (
                                  <span className="px-1.5 py-0.5 text-[11px] text-[#5e5e5e]">
                                    +{parsedSkills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {doc.fileUrl && (
                            <a
                              href={
                                doc.fileUrl.includes("/image/upload/") && !doc.fileUrl.includes("fl_attachment")
                                  ? doc.fileUrl.replace("/image/upload/", "/image/upload/fl_attachment/") + (doc.fileUrl.endsWith(".pdf") ? "" : ".pdf")
                                  : doc.fileUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-xs bg-[#e8e8e8] border border-[#cfc4c5] hover:border-black text-black font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                              title="Open Cloudinary Document"
                            >
                              <span className="material-symbols-outlined text-xs">open_in_new</span>
                              PDF
                            </a>
                          )}
                          {doc.parsedData && (
                            <button
                              type="button"
                              onClick={() => setSelectedResume(doc)}
                              className="px-2.5 py-1 text-xs border border-[#cfc4c5] hover:border-black text-black font-semibold uppercase tracking-wider transition-colors"
                            >
                              View Data
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label="Delete"
                            onClick={() => deleteResumeLocal(docId)}
                            className="text-[#5e5e5e] hover:text-[#ba1a1a] transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}

                {!loading && filteredResumes.length === 0 && (
                  <li className="p-10 text-center text-sm text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-[#7e7576]">
                      folder_open
                    </span>
                    <span>No resumes found. Upload your first resume above to get started.</span>
                  </li>
                )}
              </ul>
            </div>
          </section>
        </div>

        {/* Modal / Parsed Data Viewer */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-lg font-semibold text-black">
                  Parsed Resume: {selectedResume.fileName}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedResume(null)}
                  className="p-1 text-[#5e5e5e] hover:text-black"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {selectedResume.parsedData?.summary && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#5e5e5e] mb-1">
                    Summary
                  </h4>
                  <p className="text-sm text-[#1b1b1b] bg-white p-3 border border-[#cfc4c5]">
                    {selectedResume.parsedData.summary}
                  </p>
                </div>
              )}

              {selectedResume.parsedData?.skills && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#5e5e5e] mb-1">
                    Extracted Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.parsedData.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-[#cfc4c5] text-xs font-medium text-black"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#cfc4c5] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedResume(null)}
                  className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b]"
                >
                  Close
                </button>
              </div>
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
