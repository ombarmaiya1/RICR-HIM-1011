import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * Checks if the user has a valid session by hitting GET /api/users/me.
 * Provides user profile data, authentication status, and logout functionality.
 */
export default function useAuth() {
  const [user, setUser] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      setChecking(true)
      const res = await api.get('/users/me')
      if (res.data.user) {
        setUser(res.data.user)
        setAuthed(true)
      } else {
        setUser(null)
        setAuthed(false)
      }
    } catch {
      setUser(null)
      setAuthed(false)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const logout = async (onSuccess) => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setAuthed(false)
      if (onSuccess) onSuccess()
    }
  }

  return { user, authed, checking, logout, refetchUser: checkAuth }
}
