import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'

/**
 * Register page — same Monolith Career System theme as LoginPage.
 * Same exact styling tokens from Stitch: 14px/600/uppercase labels,
 * minimal-input, solid black btn, 0px radius, Inter font.
 */
export default function RegisterPage({ onGoLogin, onRegisterSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (onRegisterSuccess) onRegisterSuccess()
    }, 600) // ponytail: wire to backend
  }

  const fields = [
    { id: 'reg-name',     label: 'Full Name',       key: 'name',    type: 'text',     placeholder: 'Enter your full name', autocomplete: 'name' },
    { id: 'reg-email',    label: 'Email Address',   key: 'email',   type: 'email',    placeholder: 'Enter your email',     autocomplete: 'email' },
    { id: 'reg-password', label: 'Password',        key: 'password',type: 'password', placeholder: 'Create a password',    autocomplete: 'new-password' },
    { id: 'reg-confirm',  label: 'Confirm Password',key: 'confirm', type: 'password', placeholder: 'Repeat your password', autocomplete: 'new-password' },
  ]

  return (
    <AuthLayout>
      {/* Section heading */}
      <h2 className="text-xl font-semibold text-primary text-center mb-6" style={{ fontWeight: 600 }}>
        Sign Up
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '24px' }} noValidate>

        {fields.map(({ id, label, key, type, placeholder, autocomplete }) => (
          <div key={id} className="flex flex-col" style={{ gap: '8px' }}>
            <label
              htmlFor={id}
              className="text-primary uppercase"
              style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}
            >
              {label}
            </label>
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              className="minimal-input"
              value={form[key]}
              onChange={set(key)}
              required
              autoComplete={autocomplete}
            />
          </div>
        ))}

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
          {loading ? '...' : 'SIGN UP'}
        </button>
      </form>

      {/* Switch to Login */}
      <div
        className="text-center"
        style={{
          marginTop: '48px', paddingTop: '24px',
          borderTop: '1px solid #cfc4c5',
        }}
      >
        <p style={{ fontSize: '16px', color: '#4c4546', marginBottom: '8px' }}>
          Already have an account?
        </p>
        <button
          type="button"
          onClick={onGoLogin}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#000000', textDecoration: 'underline',
            fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
          }}
        >
          Return to Login
        </button>
      </div>
    </AuthLayout>
  )
}
