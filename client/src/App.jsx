import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

// ponytail: hash-based routing — no react-router dep needed for simple state routing
export default function App() {
  const [page, setPage] = useState('dashboard') // Default to dashboard or login

  if (page === 'dashboard') {
    return <DashboardPage onLogout={() => setPage('login')} />
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onGoLogin={() => setPage('login')}
        onRegisterSuccess={() => setPage('dashboard')}
      />
    )
  }

  return (
    <LoginPage
      onGoRegister={() => setPage('register')}
      onLoginSuccess={() => setPage('dashboard')}
    />
  )
}
