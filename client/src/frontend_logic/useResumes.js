import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * Hook to manage user resumes:
 * - GET /api/resumes (fetch all uploaded resumes)
 * - POST /api/resumes/upload (upload PDF / DOCX resume to Cloudinary)
 * - DELETE /api/resumes/:resumeId (delete resume and Cloudinary asset)
 */
export default function useResumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/resumes')
      setResumes(res.data.resumes || [])
      setError('')
    } catch {
      setError('Failed to load resumes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const uploadResume = async (file) => {
    if (!file) {
      setError('Please select a file to upload.')
      return false
    }

    const formData = new FormData()
    formData.append('resume', file)

    setError('')
    setUploading(true)

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (res.data.resume) {
        setResumes((prev) => [res.data.resume, ...prev])
      } else {
        await fetchResumes()
      }
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume.')
      return false
    } finally {
      setUploading(false)
    }
  }

  const deleteResume = async (id) => {
    try {
      await api.delete(`/resumes/${id}`)
      setResumes((prev) => prev.filter((r) => r._id !== id && r.id !== id))
      return true
    } catch {
      setError('Failed to delete resume.')
      return false
    }
  }

  return {
    resumes,
    loading,
    uploading,
    error,
    uploadResume,
    deleteResume,
    deleteResumeLocal: deleteResume,
    refetch: fetchResumes,
  }
}
