import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * Hook to manage Resume vs Job Analysis:
 * - GET /api/analysis (list all user analyses)
 * - POST /api/analysis (run AI skill match analysis on resumeId & jobId)
 * - GET /api/analysis/:analysisId (fetch single analysis detail)
 */
export default function useAnalysis() {
  const [analyses, setAnalyses] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/analysis')
      const list = res.data.analyses || []
      setAnalyses(list)
      if (list.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(list[0])
      }
      setError('')
    } catch {
      setError('Failed to load match analyses.')
    } finally {
      setLoading(false)
    }
  }, [currentAnalysis])

  useEffect(() => {
    fetchAnalyses()
  }, [fetchAnalyses])

  const runAnalysis = async (resumeId, jobId) => {
    if (!resumeId || !jobId) {
      setError('Please select both an active resume and a target job.')
      return false
    }

    setError('')
    setAnalyzing(true)

    try {
      const res = await api.post('/analysis', { resumeId, jobId })
      if (res.data.analysis) {
        const newAnalysis = res.data.analysis
        setAnalyses((prev) => [newAnalysis, ...prev])
        setCurrentAnalysis(newAnalysis)
        return newAnalysis
      }
      return false
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run analysis. Please try again.')
      return false
    } finally {
      setAnalyzing(false)
    }
  }

  const fetchAnalysis = async (analysisId) => {
    try {
      setLoading(true)
      const res = await api.get(`/analysis/${analysisId}`)
      if (res.data.analysis) {
        setCurrentAnalysis(res.data.analysis)
      }
    } catch {
      setError('Failed to load specific analysis details.')
    } finally {
      setLoading(false)
    }
  }

  return {
    analyses,
    currentAnalysis,
    setCurrentAnalysis,
    loading,
    analyzing,
    error,
    runAnalysis,
    fetchAnalyses,
    fetchAnalysis,
  }
}
