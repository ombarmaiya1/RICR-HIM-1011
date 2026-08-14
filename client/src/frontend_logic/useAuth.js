import { useState, useEffect } from 'react'
import api from '../api/axios'

/**
 * Checks if the user has a valid session by hitting GET /users/me.
 * Returns { authed: bool, checking: bool }.
 */
export default function useAuth() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    api.get('/users/me')
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false))
  }, [])

  return { authed, checking }
}
