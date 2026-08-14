import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboardPage from './pages/UserDashboardPage'
import DashboardPage from './pages/DashboardPage'
import MockInterviewPage from './pages/MockInterviewPage'
import ResumesJobsPage from './pages/ResumesJobsPage'

export default function App() {
  // Default to User Dashboard after login
  const [page, setPage] = useState('user-dashboard')

  const handleNavigate = (tab) => {
    if (tab === 'Analysis') {
      setPage('analysis-dashboard')
    } else if (tab === 'Dashboard') {
      setPage('user-dashboard')
    } else if (tab === 'Interviews') {
      setPage('mock-interview')
    } else if (tab === 'Resumes' || tab === 'Jobs') {
      setPage('resumes-jobs')
    }
  }

  if (page === 'resumes-jobs') {
    return (
      <ResumesJobsPage
        onLogout={() => setPage('login')}
        onNavigate={handleNavigate}
      />
    )
  }

  if (page === 'mock-interview') {
    return (
      <MockInterviewPage
        onEndSession={() => setPage('user-dashboard')}
        onNavigate={handleNavigate}
      />
    )
  }

  if (page === 'user-dashboard') {
    return (
      <UserDashboardPage
        onLogout={() => setPage('login')}
        onNavigate={handleNavigate}
      />
    )
  }

  if (page === 'analysis-dashboard') {
    return (
      <DashboardPage
        onLogout={() => setPage('login')}
        onNavigate={handleNavigate}
      />
    )
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onGoLogin={() => setPage('login')}
        onRegisterSuccess={() => setPage('user-dashboard')}
      />
    )
  }

  return (
    <LoginPage
      onGoRegister={() => setPage('register')}
      onLoginSuccess={() => setPage('user-dashboard')}
    />
  )
}
