import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UserDashboardPage from './pages/UserDashboardPage'
import DashboardPage from './pages/DashboardPage'
import MockInterviewPage from './pages/MockInterviewPage'
import ResumesPage from './pages/ResumesPage'
import JobSuggestionsPage from './pages/JobSuggestionsPage'
import SettingsPage from './pages/SettingsPage'
import useAuth from './frontend_logic/useAuth'
import { useNavigate } from 'react-router-dom'

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

  return authed ? children : <Navigate to="/login" replace />
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

  return (
    <ProtectedRoute>
      <Page
        onLogout={logout}
        onEndSession={logout}
        onNavigate={handleNavigate}
      />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected */}
      <Route path="/dashboard"  element={<DashboardShell Page={UserDashboardPage} />} />
      <Route path="/analysis"   element={<DashboardShell Page={DashboardPage} />} />
      <Route path="/interviews" element={<DashboardShell Page={MockInterviewPage} />} />
      <Route path="/resumes"    element={<DashboardShell Page={ResumesPage} />} />
      <Route path="/jobs"       element={<DashboardShell Page={JobSuggestionsPage} />} />
      <Route path="/job-suggestions" element={<DashboardShell Page={JobSuggestionsPage} />} />
      <Route path="/settings"   element={<DashboardShell Page={SettingsPage} />} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

