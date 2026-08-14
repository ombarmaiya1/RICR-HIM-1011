import { useState, useEffect } from 'react'
import useUser from '../frontend_logic/useUser'
import useAuth from '../frontend_logic/useAuth'

/**
 * SettingsPage — Faithful reproduction of Stitch "User Settings" screen
 * - Monolith Career System architectural minimalist theme (0px radius, 1px/2px borders)
 * - Profile Management (Change Name/Username & Email requiring Current Password)
 * - Account Security (Change Password with OTP verification)
 * - Top Navbar & Footer
 */
export default function SettingsPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Settings')
  const { user, refetchUser } = useAuth()
  const {
    loading,
    uploadingAvatar,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    uploadAvatar,
    removeAvatar,
    updateProfile,
    sendPasswordChangeOTP,
    changePasswordWithOTP,
  } = useUser()

  // Profile Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  // Password Security Form state
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navItems = ['Dashboard', 'Resumes', 'Jobs', 'Analysis', 'Interviews']

  // Prepopulate form when user profile loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleTabClick = (item) => {
    setActiveTab(item)
    if (onNavigate) onNavigate(item)
  }

  // Handle Profile Update (Requires Current Password)
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    const updatedUser = await updateProfile(
      {
        fullName,
        email,
        currentPassword,
      },
      () => {
        setCurrentPassword('')
        if (refetchUser) refetchUser()
      }
    )
  }

  // Handle Requesting OTP for Password Change
  const handleSendOTP = async () => {
    setError('')
    setSuccessMessage('')
    const ok = await sendPasswordChangeOTP()
    if (ok) {
      setOtpSent(true)
    }
  }

  // Handle Changing Password with OTP
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    const ok = await changePasswordWithOTP(
      {
        otp,
        newPassword,
      },
      () => {
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setOtpSent(false)
      }
    )
  }

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="w-full sticky top-0 bg-[#f9f9f9] border-b-2 border-black z-50">
        <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto">
          {/* Brand */}
          <div
            onClick={() => handleTabClick('Dashboard')}
            className="text-xl font-bold text-black tracking-tighter uppercase font-sans cursor-pointer"
          >
            AI CAREER PRO
          </div>

          {/* Navigation Links */}
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
              className="flex items-center justify-center p-1 ring-2 ring-black rounded-full"
            >
              <div className="w-8 h-8 rounded-full bg-[#e8e8e8] border border-[#cfc4c5] overflow-hidden flex items-center justify-center text-black">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-lg text-[#5e5e5e]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
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
        {/* Header */}
        <header className="mb-10 border-b border-[#cfc4c5] pb-6">
          <h1 className="text-3xl md:text-4xl font-semibold text-black tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-base text-[#5e5e5e]">
            Manage your personal profile, credentials, and security preferences.
          </p>
        </header>

        {/* Global Success / Error feedback */}
        {successMessage && (
          <div className="mb-8 p-4 bg-white border-2 border-black text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Settings Forms */}
          <div className="md:col-span-8 flex flex-col gap-10">
            {/* Section 1: Profile Management */}
            <section id="profile" className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-black border-b border-[#cfc4c5] pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-black">person</span>
                Profile Information
              </h2>

              <form onSubmit={handleSaveProfile} className="bg-white border border-[#cfc4c5] p-6 flex flex-col gap-6">
                {/* Visual Avatar Row with Cloudinary Upload */}
                <div className="flex items-center gap-6 pb-6 border-b border-[#cfc4c5]">
                  <div className="w-20 h-20 bg-[#e8e8e8] border border-black flex items-center justify-center text-black overflow-hidden relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl">account_circle</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="text-base font-bold text-black uppercase tracking-wider">
                        {user?.fullName || 'User Profile'}
                      </div>
                      <div className="text-xs text-[#5e5e5e] mt-0.5">{user?.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors">
                        {uploadingAvatar ? 'Uploading…' : 'Change Picture'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await uploadAvatar(file, () => {
                                if (refetchUser) refetchUser()
                              })
                            }
                          }}
                        />
                      </label>
                      {user?.avatar && (
                        <button
                          type="button"
                          onClick={async () => {
                            await removeAvatar(() => {
                              if (refetchUser) refetchUser()
                            })
                          }}
                          className="px-3 py-2 border border-[#7e7576] text-black text-xs font-semibold uppercase tracking-wider hover:border-black"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name / Username */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="settings-name"
                      className="text-xs font-semibold text-black uppercase tracking-wider"
                    >
                      Full Name / Username
                    </label>
                    <input
                      id="settings-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="settings-email"
                      className="text-xs font-semibold text-black uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email address"
                      className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Password confirmation for profile updates */}
                <div className="flex flex-col gap-2 pt-2">
                  <label
                    htmlFor="settings-current-pwd"
                    className="text-xs font-semibold text-black uppercase tracking-wider"
                  >
                    Current Password (Required to save changes)
                  </label>
                  <input
                    id="settings-current-pwd"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password to authorize"
                    className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !currentPassword}
                    className="px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* Section 2: Account Security & Password Reset (OTP Flow) */}
            <section id="security" className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-black border-b border-[#cfc4c5] pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-black">lock</span>
                Account Security (Password Reset)
              </h2>

              <div className="bg-white border border-[#cfc4c5] p-6 flex flex-col gap-6">
                {!otpSent ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-[#4c4546] leading-relaxed">
                      To change your password, an OTP verification code will be sent to your registered email address (<strong className="text-black">{user?.email}</strong>).
                    </p>
                    <div>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="px-6 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Sending OTP…' : 'Request Password Change OTP'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
                    <div className="p-3 bg-[#f3f3f3] border-l-4 border-black text-xs text-[#1b1b1b]">
                      Enter the 6-digit OTP code sent to <strong>{user?.email}</strong> along with your new password.
                    </div>

                    {/* 6-Digit OTP */}
                    <div className="flex flex-col gap-2 max-w-xs">
                      <label
                        htmlFor="security-otp"
                        className="text-xs font-semibold text-black uppercase tracking-wider"
                      >
                        6-Digit OTP Code
                      </label>
                      <input
                        id="security-otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="e.g. 123456"
                        className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-base font-bold tracking-widest text-black focus:outline-none focus:border-2 focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* New Password */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="security-new-pwd"
                          className="text-xs font-semibold text-black uppercase tracking-wider"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="security-new-pwd"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5e5e5e] hover:text-black p-1"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="security-confirm-pwd"
                          className="text-xs font-semibold text-black uppercase tracking-wider"
                        >
                          Confirm New Password
                        </label>
                        <input
                          id="security-confirm-pwd"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Repeat new password"
                          className="w-full bg-[#f9f9f9] border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-2 focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="text-xs font-semibold text-black underline hover:text-[#5e5e5e]"
                      >
                        Resend OTP
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !otp || !newPassword}
                        className="px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Guidelines / Security Overview */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-black text-white p-6 border-2 border-black flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#cfc4c5]">
                <span className="material-symbols-outlined text-sm">security</span>
                <span className="text-xs uppercase tracking-widest font-semibold">
                  Account Protection
                </span>
              </div>
              <h3 className="text-lg font-bold">Two-Layer Verification</h3>
              <p className="text-xs text-[#e2e2e2] leading-relaxed">
                Profile changes require your current password to prevent unauthorized modifications. Password resets are protected via time-limited email OTP verification codes.
              </p>
            </div>

            <div className="bg-[#f9f9f9] border border-[#cfc4c5] p-6 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#5e5e5e]">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleTabClick('Resumes')}
                  className="text-left text-xs font-semibold text-black hover:underline py-1"
                >
                  → Manage Resumes & Documents
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('Jobs')}
                  className="text-left text-xs font-semibold text-black hover:underline py-1"
                >
                  → Target Job Positions
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('Analysis')}
                  className="text-left text-xs font-semibold text-black hover:underline py-1"
                >
                  → Match & Skill Gap Analysis
                </button>
              </div>
            </div>
          </div>
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
