import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * Manages the complete AI Mock Interview lifecycle:
 *  1. fetchInterviews()           → GET /api/interviews
 *  2. start(resumeId, jobId)      → POST /api/interviews/start
 *  3. submitAnswer(index, answer) → POST /api/interviews/:id/answer
 *  4. complete()                  → POST /api/interviews/:id/complete
 *  5. fetchInterview(id)          → GET /api/interviews/:id
 */
export default function useInterview() {
  const [interviews, setInterviews] = useState([])
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/interviews')
      setInterviews(res.data.interviews || [])
    } catch {
      // Non-blocking error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInterviews()
  }, [fetchInterviews])

  async function start(resumeId, jobId) {
    if (!resumeId || !jobId) {
      setError('Please select both a resume and a target job.')
      return null
    }

    setError('')
    setStarting(true)
    try {
      const res = await api.post('/interviews/start', { resumeId, jobId })
      const newInterview = res.data.interview
      setInterview(newInterview)
      setInterviews((prev) => [newInterview, ...prev])
      return newInterview
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start AI interview.')
      return null
    } finally {
      setStarting(false)
    }
  }

  async function submitAnswer(questionIndex, answer) {
    if (!interview?._id) return false
    if (!answer?.trim()) {
      setError('Please provide an answer before submitting.')
      return false
    }

    setError('')
    setSubmitting(true)
    try {
      const res = await api.post(`/interviews/${interview._id}/answer`, {
        questionIndex,
        answer,
      })

      // Update question with AI evaluation in state
      setInterview((prev) => {
        if (!prev) return prev
        const updatedQuestions = [...prev.questions]
        updatedQuestions[questionIndex] = res.data.question
        return { ...prev, questions: updatedQuestions }
      })
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  async function complete() {
    if (!interview?._id) return false
    setError('')
    setCompleting(true)
    try {
      const res = await api.post(`/interviews/${interview._id}/complete`)
      const completedInterview = res.data.interview
      setInterview(completedInterview)
      setInterviews((prev) =>
        prev.map((item) => (item._id === completedInterview._id ? completedInterview : item))
      )
      return completedInterview
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete interview.')
      return false
    } finally {
      setCompleting(false)
    }
  }

  async function fetchInterview(id) {
    try {
      setLoading(true)
      const res = await api.get(`/interviews/${id}`)
      setInterview(res.data.interview)
    } catch {
      setError('Failed to load interview details.')
    } finally {
      setLoading(false)
    }
  }

  return {
    interview,
    setInterview,
    interviews,
    loading,
    starting,
    submitting,
    completing,
    error,
    start,
    submitAnswer,
    complete,
    fetchInterviews,
    fetchInterview,
  }
}
