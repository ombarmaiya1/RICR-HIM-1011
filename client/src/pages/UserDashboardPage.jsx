import { useState } from 'react'
import useDashboard from '../frontend_logic/useDashboard'
import Navbar from '../components/Navbar'

/**
 * UserDashboardPage — Recreates the Stitch "User Dashboard" overview UI/UX
 * fully adapted to the AI Career Pro "Monolith Career System" brand theme:
 * - Pure dynamic real career readiness metrics (NO static mock data)
 * - Sharp architectural minimalist theme (0px radius, 1px/2px black borders)
 * - Top Navbar: Dashboard (Active), Resumes, Jobs, Analysis, Interviews
 * - Dynamic Welcome greeting with real user profile
 * - Live Metrics: Career Readiness Score, Mock Sessions Completed, Skills Profiled
 * - Real-time Recent Activity Table & Dynamic Recommendation Card
 * - Footer
 */
export default function UserDashboardPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const {
    user,
    careerReadinessScore,
    completedInterviews,
    totalMatchedSkills,
    recentActivities,
    loading,
  } = useDashboard()

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Professional'

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleTabClick}
        onLogout={onLogout}
        showSearch={false}
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10 flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#cfc4c5] pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e8e8e8] border border-[#cfc4c5] overflow-hidden flex items-center justify-center text-black shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-[#5e5e5e]">account_circle</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-black leading-tight">
                Good day, {firstName}.
              </h1>
              <p className="text-base text-[#5e5e5e] mt-1">
                Your preparation status is synced with the Monolith Career Engine.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTabClick('Resumes')}
              className="px-4 py-2 border border-[#cfc4c5] hover:border-black text-black text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Upload Resume
            </button>
            <button
              type="button"
              onClick={() => handleTabClick('Interviews')}
              className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors"
            >
              Start Interview
            </button>
          </div>
        </section>

        {/* Top Metrics Grid (3 Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric Card 1: Real Career Readiness Score */}
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col justify-between items-center text-center relative">
            <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase w-full text-left mb-4">
              Career Readiness Score
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e8e8e8"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#000000"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (careerReadinessScore || 0)) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-black">{careerReadinessScore}%</span>
              </div>
            </div>
            <div className="mt-2 px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>{' '}
              {careerReadinessScore > 0 ? 'AI Aggregate Score' : 'Awaiting Activity'}
            </div>
          </div>

          {/* Metric Card 2: Interviews Completed */}
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col justify-between items-start">
            <div className="flex items-center gap-3 w-full mb-4">
              <div className="w-10 h-10 bg-[#e8e8e8] text-black flex items-center justify-center border border-[#cfc4c5]">
                <span className="material-symbols-outlined">mic</span>
              </div>
              <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase">
                Mock Sessions
              </h3>
            </div>
            <div className="mt-auto">
              <span className="text-4xl font-bold text-black block mb-1">
                {completedInterviews}
              </span>
              <p className="text-xs text-[#5e5e5e]">Completed & AI Evaluated</p>
            </div>
          </div>

          {/* Metric Card 3: Skills Profiled */}
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col justify-between items-start">
            <div className="flex items-center gap-3 w-full mb-4">
              <div className="w-10 h-10 bg-[#e8e8e8] text-black flex items-center justify-center border border-[#cfc4c5]">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase">
                Skills Profiled
              </h3>
            </div>
            <div className="mt-auto">
              <span className="text-4xl font-bold text-black block mb-1">
                {totalMatchedSkills}
              </span>
              <p className="text-xs text-[#5e5e5e]">Extracted from match analyses</p>
            </div>
          </div>
        </section>

        {/* Bento Area (Recent Activity & Recommendations) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Activity Table (8 cols) */}
          <div className="lg:col-span-8 bg-[#f9f9f9] border border-[#cfc4c5] flex flex-col">
            <div className="px-6 py-4 border-b border-[#cfc4c5] flex justify-between items-center bg-[#f3f3f3]">
              <h3 className="text-lg font-semibold text-black">Recent Activity</h3>
              <button
                type="button"
                onClick={() => handleTabClick('Analysis')}
                className="text-black font-semibold text-xs uppercase tracking-wider hover:underline flex items-center gap-1"
              >
                View Analyses <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#e8e8e8] border-b border-[#cfc4c5] text-xs font-semibold text-black uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Activity</th>
                    <th className="px-6 py-3 font-semibold">Role Target</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#1b1b1b]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-xs text-[#5e5e5e]">
                        Loading recent activities…
                      </td>
                    </tr>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((act) => (
                      <tr
                        key={act.id}
                        className="border-b border-[#cfc4c5] hover:bg-[#eeeeee] transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#e8e8e8] border border-[#cfc4c5] flex items-center justify-center text-black">
                            <span className="material-symbols-outlined text-base">
                              {act.icon}
                            </span>
                          </div>
                          <span className="font-semibold text-black">{act.name}</span>
                        </td>
                        <td className="px-6 py-4 text-[#5e5e5e]">{act.role}</td>
                        <td className="px-6 py-4 text-[#5e5e5e]">{act.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${act.statusColor}`}
                          >
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-xs text-[#5e5e5e]">
                        No activities recorded yet. Upload a resume or run an interview to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Recommendation & Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Recommendation Card */}
            <div className="bg-black text-white p-6 border-2 border-black flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#cfc4c5]">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    AI Recommendation
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {careerReadinessScore >= 80
                    ? 'Senior Readiness Benchmark'
                    : 'Target Practice Recommended'}
                </h3>
                <p className="text-sm text-[#e2e2e2] leading-relaxed mb-6">
                  {careerReadinessScore >= 80
                    ? 'Your career readiness index indicates high preparedness. Keep practicing technical mock interviews to maintain sharpness.'
                    : 'Run a match analysis between your resume and a target job to uncover skill gaps and test your interview responses against real role criteria.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabClick('Interviews')}
                className="w-full bg-white text-black py-3 font-semibold text-xs uppercase tracking-widest hover:bg-[#e2e2e2] transition-colors flex items-center justify-center gap-2"
              >
                Start Mock Interview
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>

            {/* Quick Links Card */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase">
                Quick Shortcuts
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleTabClick('Jobs')}
                  className="text-left text-xs font-semibold text-black hover:underline py-1"
                >
                  → Add or Edit Target Jobs
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('Analysis')}
                  className="text-left text-xs font-semibold text-black hover:underline py-1"
                >
                  → View Match Gap Analysis
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('Settings')}
                  className="text-left text-xs font-semibold text-black hover:underline py-1"
                >
                  → Account & Security Settings
                </button>
              </div>
            </div>
          </div>
        </section>
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
