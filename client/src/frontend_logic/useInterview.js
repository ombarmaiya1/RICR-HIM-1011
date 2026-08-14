import { useState } from 'react'
import api from '../api/axios'

/**
 * Manages the full interview lifecycle:
 *  1. start(resumeId, jobId)   → fetches AI questions
 *  2. submitAnswer(index, txt) → evaluates + moves to next question
 *  3. complete()               → generates summary
 */
export default function useInterview() {
  const [interview, setInterview] = useState(null)   // full interview doc
  const [starting, setStarting]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  async function start(resumeId, jobId) {
    setError('')
    setStarting(true)
    try {
      const res = await api.post('/interviews/start', { resumeId, jobId })
      setInterview(res.data.interview)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview.')
    } finally {
      setStarting(false)
    }
  }

  async function submitAnswer(questionIndex, answer) {
    if (!answer.trim()) return
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post(`/interviews/${interview._id}/answer`, {
        questionIndex,
        answer,
      })
      // Patch the answered question in local state
      setInterview((prev) => {
        const updated = { ...prev, questions: [...prev.questions] }
        updated.questions[questionIndex] = res.data.question
        return updated
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer.')
    } finally {
      setSubmitting(false)
    }
  }

  async function complete() {
    setError('')
    try {
      const res = await api.post(`/interviews/${interview._id}/complete`)
      setInterview(res.data.interview)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete interview.')
    }
  }

  return { interview, starting, submitting, error, start, submitAnswer, complete }
}
