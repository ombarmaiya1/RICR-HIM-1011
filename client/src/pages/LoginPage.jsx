import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useLogin from '../frontend_logic/useLogin'

/**
 * Login page — exact Stitch "Authentication" screen reproduction.
 *
 * From Stitch HTML:
 *   - <h2> "Login" — font-headline-md (20px, 600), centered
 *   - gap-stack-md (24px) between fields
 *   - Labels: font-label-md (14px, 600, 0.02em tracking, uppercase)
 *   - Inputs: minimal-input (bottom border only)
 *   - Remember me checkbox (square, 16×16) + "Forgot password?" tertiary btn
 *   - BLACK solid btn full width "LOGIN"
 *   - Divider + "New to Architect AI?" + "Create an Account" link
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const { loading, error, login } = useLogin()

  function handleSubmit(e) {
    e.preventDefault()
    login({ email, password }, () => navigate('/dashboard'))
  }

  return (
    <AuthLayout>
      {/* Section heading */}
      <h2 className="text-xl font-semibold text-primary text-center mb-6" style={{ fontWeight: 600 }}>
        Login
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '24px' }} noValidate>

        {/* Email */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <label
            htmlFor="login-email"
            className="text-primary uppercase"
            style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            className="minimal-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <label
            htmlFor="login-password"
            className="text-primary uppercase"
            style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            className="minimal-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {/* Remember me + Forgot password row */}
        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px', borderRadius: '0', accentColor: '#000000' }}
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span style={{ fontSize: '12px', color: '#4c4546' }}>Remember me</span>
          </label>
          <button
            type="button"
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: '#000000', textDecoration: 'underline',
              fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Inline error */}
        {error && (
          <p style={{ fontSize: '12px', color: '#ba1a1a', fontWeight: 600, marginTop: '-8px' }}>
            {error}
          </p>
        )}

        {/* Primary CTA */}
        <button
          type="submit"
          style={{
            backgroundColor: '#000000', color: '#ffffff', border: 'none',
            padding: '16px 24px', width: '100%', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em',
            fontFamily: 'Inter, sans-serif', textAlign: 'center',
            transition: 'background-color 0.2s ease',
            borderRadius: '0',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1b1b1b'}
          onMouseOut={(e)  => e.currentTarget.style.backgroundColor = '#000000'}
        >
          {loading ? '...' : 'LOGIN'}
        </button>
      </form>

      {/* Switch to Register */}
      <div
        className="text-center"
        style={{
          marginTop: '48px', paddingTop: '24px',
          borderTop: '1px solid #cfc4c5',
        }}
      >
        <p style={{ fontSize: '16px', color: '#4c4546', marginBottom: '8px' }}>
          New to AI Career Pro?
        </p>
        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#000000', textDecoration: 'underline',
            fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
          }}
        >
          Create an Account
        </button>
      </div>
    </AuthLayout>
  )
}
