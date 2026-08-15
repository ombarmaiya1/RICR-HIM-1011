import { useState } from 'react'
import api from '../api/axios'

/**
 * Hook to execute and manage ATS Document & Keyword Compatibility analysis
 * Calls POST /api/ats/check
 */
export default function useATS() {
  const [atsData, setAtsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runATSCheck = async (resumeId, jobId) => {
    if (!resumeId) {
      setError('Please select a resume for ATS analysis.')
      return null
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/ats/check', { resumeId, jobId })
      const data = res.data.data
      setAtsData(data)
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run ATS check.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    atsData,
    setAtsData,
    loading,
    error,
    runATSCheck,
  }
}
