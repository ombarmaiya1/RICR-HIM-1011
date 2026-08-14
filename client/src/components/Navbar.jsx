import useAuth from '../frontend_logic/useAuth'

/**
 * Shared top navbar used across all authenticated dashboard pages.
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

  const handleNav = (item) => {
    if (onNavigate) onNavigate(item)
  }

  const isSettings = activeTab === 'Settings'

  return (
    <header className="w-full sticky top-0 bg-[#f9f9f9] border-b-2 border-black z-50">
      <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto">

        {/* Brand */}
        <div
          onClick={() => handleNav('Dashboard')}
          className="text-xl font-bold text-black tracking-tighter uppercase font-sans cursor-pointer select-none"
        >
          AI CAREER PRO
        </div>

        {/* Navigation Links */}
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
        <div className="flex items-center gap-4">
          {/* Search Input */}
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
  )
}
