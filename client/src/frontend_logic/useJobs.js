import { useState, useEffect } from 'react'
import api from '../api/axios'

/**
 * Fetches the user's saved jobs and provides a saveJob function.
 * Backend: GET/POST /api/jobs
 */
export default function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jobs')
      .then((res) => setJobs(res.data.jobs))
      .catch(() => setError('Failed to load jobs.'))
      .finally(() => setLoading(false))
  }, [])

  async function saveJob(title, description) {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      return false
    }
    setError('')
    setSaving(true)
    try {
      const res = await api.post('/jobs', { title, description })
      setJobs((prev) => [res.data.job, ...prev])
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { jobs, loading, saving, error, saveJob }
}
