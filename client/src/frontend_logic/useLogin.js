import { useState } from 'react'
import api from '../api/axios'

/**
 * Handles login form submission.
 * Returns { loading, error, login }.
 */
export default function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login({ email, password }, onSuccess) {
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/login', { email, password })
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, login }
}
