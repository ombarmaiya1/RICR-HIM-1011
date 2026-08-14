import { useState } from 'react'
import api from '../api/axios'

/**
 * Handles register form submission.
 * Maps form field `name` → backend field `fullName`.
 * Returns { loading, error, register }.
 */
export default function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function register({ name, email, password, confirm }, onSuccess) {
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', { fullName: name, email, password })
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, register }
}
