import { Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UserDashboardPage from './pages/UserDashboardPage'
import DashboardPage from './pages/DashboardPage'
import MockInterviewPage from './pages/MockInterviewPage'
import ResumesPage from './pages/ResumesPage'
import JobSuggestionsPage from './pages/JobSuggestionsPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import useAuth from './frontend_logic/useAuth'

/** Redirects to /login if the session check fails */
function ProtectedRoute({ children }) {
  const { authed, checking } = useAuth()

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4c4546' }}>Loading…</span>
      </div>
    )
  }

  return authed ? children : <Navigate to="/" replace />
}

/** Redirects logged-in users away from auth pages to /dashboard */
function PublicOnlyRoute({ children }) {
  const { authed, checking } = useAuth()

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4c4546' }}>Loading…</span>
      </div>
    )
  }

  return authed ? <Navigate to="/dashboard" replace /> : children
}

/** Shared nav + logout handler used by all dashboard pages */
function DashboardShell({ Page }) {
  const navigate = useNavigate()
  const { logout: authLogout } = useAuth()

  const handleNavigate = (tab) => {
    const map = {
      Dashboard: '/dashboard',
      Analysis: '/analysis',
      Interviews: '/interviews',
      Resumes: '/resumes',
      Jobs: '/jobs',
      Settings: '/settings',
    }
    if (map[tab]) navigate(map[tab])
  }

  const logout = () => {
    authLogout(() => navigate('/login'))
  }

  const handleEndSession = () => {
    navigate('/dashboard')
  }

  return (
    <ProtectedRoute>
      <Page
        onLogout={logout}
        onEndSession={handleEndSession}
        onNavigate={handleNavigate}
      />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />

      {/* Public Auth Routes (Redirect to /dashboard if logged in) */}
      <Route path="/login"           element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register"        element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard"  element={<DashboardShell Page={UserDashboardPage} />} />
      <Route path="/analysis"   element={<DashboardShell Page={DashboardPage} />} />
      <Route path="/interviews" element={<DashboardShell Page={MockInterviewPage} />} />
      <Route path="/resumes"    element={<DashboardShell Page={ResumesPage} />} />
      <Route path="/jobs"       element={<DashboardShell Page={JobSuggestionsPage} />} />
      <Route path="/job-suggestions" element={<DashboardShell Page={JobSuggestionsPage} />} />
      <Route path="/settings"   element={<DashboardShell Page={SettingsPage} />} />

      {/* Fallback → landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

