import { useState } from 'react'

/**
 * UserDashboardPage — Recreates the Stitch "User Dashboard" overview UI/UX
 * fully adapted to the AI Career Pro "Monolith Career System" brand theme:
 * - Sharp architectural minimalist theme (0px radius, 1px/2px black borders)
 * - Top Navbar: Dashboard (Active), Resumes, Jobs, Analysis, Interviews
 * - Welcome greeting header
 * - Metrics grid (Resume Score 92%, Interviews Completed, Skills Improved)
 * - Recent Activity Table & Recommended Next Step Card
 * - 30-Day Improvement Trend graph
 * - Footer
 */
export default function UserDashboardPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Dashboard')

  const navItems = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

  const recentActivities = [
    {
      icon: 'description',
      name: 'Resume Scan V3',
      role: 'Senior Frontend Engineer',
      date: 'Today, 9:41 AM',
      status: 'Excellent',
      statusColor: 'bg-[#000000] text-white',
    },
    {
      icon: 'mic',
      name: 'Mock Interview',
      role: 'Product Manager',
      date: 'Yesterday',
      status: 'Good',
      statusColor: 'bg-[#e8e8e8] text-black border border-[#cfc4c5]',
    },
    {
      icon: 'description',
      name: 'Cover Letter Gen',
      role: 'UX Designer',
      date: 'Oct 12, 2024',
      status: 'Needs Work',
      statusColor: 'bg-[#f9f9f9] text-[#7e7576] border border-[#cfc4c5] border-dashed',
    },
  ]

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
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
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10 flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-1 border-b border-[#cfc4c5] pb-6">
          <h1 className="text-3xl font-semibold text-black leading-tight">
            Good morning, Alex.
          </h1>
          <p className="text-base text-[#5e5e5e]">
            Your career progress is looking strong. Let&apos;s keep the momentum going.
          </p>
        </section>

        {/* Top Metrics Grid (3 Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric Card 1: Latest Resume Score */}
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col justify-between items-center text-center relative">
            <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase w-full text-left mb-4">
              Latest Resume Score
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
                  strokeDashoffset="20.1"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-black">92</span>
              </div>
            </div>
            <div className="mt-2 px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +5 PTS
            </div>
          </div>

          {/* Metric Card 2: Interviews Completed */}
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col justify-between items-start">
            <div className="flex items-center gap-3 w-full mb-4">
              <div className="w-10 h-10 bg-[#e8e8e8] text-black flex items-center justify-center border border-[#cfc4c5]">
                <span className="material-symbols-outlined">mic</span>
              </div>
              <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase">
                Interviews Completed
              </h3>
            </div>
            <div className="mt-auto">
              <span className="text-4xl font-bold text-black block mb-1">8</span>
              <p className="text-xs text-[#5e5e5e]">Last 30 days</p>
            </div>
          </div>

          {/* Metric Card 3: Skills Improved */}
          <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col justify-between items-start">
            <div className="flex items-center gap-3 w-full mb-4">
              <div className="w-10 h-10 bg-[#e8e8e8] text-black flex items-center justify-center border border-[#cfc4c5]">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase">
                Skills Improved
              </h3>
            </div>
            <div className="mt-auto">
              <span className="text-4xl font-bold text-black block mb-1">12</span>
              <p className="text-xs text-[#5e5e5e]">Based on feedback</p>
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
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
                  {recentActivities.map((act, i) => (
                    <tr
                      key={i}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Recommendation & Trend Chart (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Recommendation Card */}
            <div className="bg-black text-white p-6 border-2 border-black flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#cfc4c5]">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">
                    Recommendation
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Sharpen Your Delivery</h3>
                <p className="text-sm text-[#e2e2e2] leading-relaxed mb-6">
                  Your behavioral question responses are improving. Let&apos;s do a focused mock interview for the &apos;Senior Frontend Engineer&apos; role.
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

            {/* Improvement Trend Chart */}
            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col">
              <h3 className="text-xs font-semibold text-[#5e5e5e] tracking-widest uppercase mb-4">
                Improvement Trend (30 Days)
              </h3>
              <div className="h-32 w-full mt-auto relative flex items-end justify-between px-2 pb-4">
                {/* SVG Line Chart */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#e8e8e8" strokeDasharray="2,2" strokeWidth="0.5" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#e8e8e8" strokeDasharray="2,2" strokeWidth="0.5" />
                  <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#e8e8e8" strokeDasharray="2,2" strokeWidth="0.5" />
                  {/* The Line */}
                  <path
                    d="M 0,40 Q 20,35 40,25 T 70,15 T 100,5"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="40" cy="25" r="2.5" fill="#000000" />
                  <circle cx="70" cy="15" r="2.5" fill="#000000" />
                  <circle cx="100" cy="5" r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                </svg>
                {/* Labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-[#5e5e5e] px-2">
                  <span>Oct 1</span>
                  <span>Oct 15</span>
                  <span>Today</span>
                </div>
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
