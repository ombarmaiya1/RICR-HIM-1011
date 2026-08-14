import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * Manages user's saved jobs:
 * - GET /api/jobs (list all saved jobs)
 * - POST /api/jobs (create new job)
 * - PUT /api/jobs/:jobId (update title & description)
 * - DELETE /api/jobs/:jobId (delete job)
 */
export default function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/jobs')
      setJobs(res.data.jobs || [])
      setError('')
    } catch {
      setError('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function saveJob(title, description) {
    if (!title?.trim() || !description?.trim()) {
      setError('Title and description are required.')
      return false
    }
    setError('')
    setSaving(true)
    try {
      const res = await api.post('/jobs', { title, description })
      setJobs((prev) => [res.data.job, ...prev])
      return res.data.job
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function updateJob(jobId, { title, description }) {
    if (!title?.trim() && !description?.trim()) {
      setError('Title or description is required.')
      return false
    }
    setError('')
    setSaving(true)
    try {
      const res = await api.put(`/jobs/${jobId}`, { title, description })
      const updated = res.data.job
      setJobs((prev) => prev.map((j) => (j._id === jobId ? updated : j)))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function deleteJob(jobId) {
    setError('')
    try {
      await api.delete(`/jobs/${jobId}`)
      setJobs((prev) => prev.filter((j) => j._id !== jobId))
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job.')
      return false
    }
  }

  return {
    jobs,
    loading,
    saving,
    error,
    saveJob,
    updateJob,
    deleteJob,
    refetch: fetchJobs,
  }
}
