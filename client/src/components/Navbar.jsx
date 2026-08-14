import { useState, useEffect } from 'react'
import useAuth from '../frontend_logic/useAuth'

/**
 * Shared top navbar used across all authenticated dashboard pages.
 * Includes a collapsible slide-in sidebar for mobile navigation.
 *
 * Props:
 * - activeTab         {string}   — Currently active nav item (highlights it)
 * - onNavigate        {Function} — Called with the tab name when a nav item is clicked
 * - onLogout          {Function} — Called when the logout button is clicked
 * - searchValue       {string}   — Controlled value for the search input (optional)
 * - onSearch          {Function} — onChange handler for search input (optional)
 * - searchPlaceholder {string}   — Placeholder text for the search input
 * - showSearch        {boolean}  — Whether to show the search input (default true)
 */

const NAV_ITEMS = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

const NAV_ICONS = {
  Dashboard: 'space_dashboard',
  Resumes: 'description',
  Jobs: 'work',
  Analysis: 'analytics',
  Interviews: 'record_voice_over',
  Settings: 'settings',
}

export default function Navbar({
  activeTab,
  onNavigate,
  onLogout,
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Search...',
  showSearch = true,
}) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isSettings = activeTab === 'Settings'

  const handleNav = (item) => {
    setSidebarOpen(false)
    if (onNavigate) onNavigate(item)
  }

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* ─── Top Navbar ─── */}
      <header className="w-full sticky top-0 bg-[#f9f9f9] border-b-2 border-black z-50">
        <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto">

          {/* Left: Hamburger (mobile) + Brand */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex flex-col justify-center gap-[5px] p-1 cursor-pointer"
            >
              <span className="block w-5 h-0.5 bg-black transition-all" />
              <span className="block w-5 h-0.5 bg-black transition-all" />
              <span className="block w-3.5 h-0.5 bg-black transition-all" />
            </button>

            {/* Brand */}
            <div
              onClick={() => handleNav('Dashboard')}
              className="text-xl font-bold text-black tracking-tighter uppercase font-sans cursor-pointer select-none"
            >
              AI CAREER PRO
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleNav(item)}
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
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search Input — desktop only */}
            {showSearch && (
              <div className="hidden md:block relative border border-[#cfc4c5]">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5e5e5e] text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchValue}
                  onChange={onSearch}
                  placeholder={searchPlaceholder}
                  className="w-48 pl-9 pr-3 py-1 bg-transparent text-[#1b1b1b] text-sm focus:outline-none focus:border-black border-0"
                />
              </div>
            )}

            {/* Avatar / Account Button */}
            <button
              type="button"
              aria-label="Go to Settings"
              onClick={() => handleNav('Settings')}
              className={`flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity ${
                isSettings ? 'ring-2 ring-black rounded-full p-0.5' : 'p-1'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#e8e8e8] border border-[#cfc4c5] overflow-hidden flex items-center justify-center text-black shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="material-symbols-outlined text-lg text-[#5e5e5e]"
                    style={isSettings ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    account_circle
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-black">
                {user?.fullName || 'My Account'}
              </span>
            </button>

            {/* Logout Button */}
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

      {/* ─── Mobile Sidebar Overlay ─── */}
      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black z-[60] md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#f9f9f9] border-r-2 border-black z-[70] md:hidden flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black">
          <div className="text-base font-bold text-black tracking-tighter uppercase">
            AI CAREER PRO
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="text-black hover:opacity-60 transition-opacity"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* User Profile Strip */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#cfc4c5] bg-white">
          <div className="w-10 h-10 rounded-full bg-[#e8e8e8] border border-[#cfc4c5] overflow-hidden flex items-center justify-center shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-xl text-[#5e5e5e]">account_circle</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-black truncate">{user?.fullName || 'My Account'}</div>
            <div className="text-xs text-[#5e5e5e] truncate">{user?.email}</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col flex-grow py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleNav(item)}
                className={`flex items-center gap-4 px-6 py-3.5 text-sm font-semibold tracking-wide text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-[#1b1b1b] hover:bg-[#e8e8e8]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {NAV_ICONS[item]}
                </span>
                {item}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col border-t border-[#cfc4c5] pb-safe">
          <button
            type="button"
            onClick={() => handleNav('Settings')}
            className={`flex items-center gap-4 px-6 py-3.5 text-sm font-semibold tracking-wide text-left transition-colors cursor-pointer ${
              isSettings ? 'bg-black text-white' : 'text-[#1b1b1b] hover:bg-[#e8e8e8]'
            }`}
          >
            <span
              className="material-symbols-outlined text-xl shrink-0"
              style={isSettings ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              settings
            </span>
            Settings
          </button>
          <button
            type="button"
            onClick={() => { setSidebarOpen(false); if (onLogout) onLogout() }}
            className="flex items-center gap-4 px-6 py-3.5 text-sm font-semibold tracking-wide text-left text-[#ba1a1a] hover:bg-[#fdf2f2] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
