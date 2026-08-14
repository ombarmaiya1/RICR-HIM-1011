import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export default function useJobSuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const fetchSavedSuggestions = useCallback(async () => {
    try {
      setInitialLoading(true)
      const res = await api.get('/job-suggestions')
      setSuggestions(res.data.data || [])
      setError('')
    } catch {
      setError('Unable to find jobs right now.')
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSavedSuggestions()
  }, [fetchSavedSuggestions])

  const generateSuggestions = async ({ resumeId, jobTitle, jobDescription }) => {
    if (!resumeId || !jobTitle) {
      setError('Please select a resume and enter a target job title.')
      return false
    }

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const res = await api.post('/job-suggestions/suggest', {
        resumeId,
        jobTitle,
        jobDescription,
      })
      const results = res.data.data || []
      setSuggestions(results)
      return true
    } catch {
      setError('Unable to find jobs right now.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    suggestions,
    loading: loading || initialLoading,
    isSearching: loading,
    error,
    hasSearched,
    generateSuggestions,
    fetchSavedSuggestions,
    clearError: () => setError(''),
  }
}
