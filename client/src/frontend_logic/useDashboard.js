import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * Hook to fetch and compute real dashboard metrics from GET /api/dashboard and GET /api/users/me:
 * - Real Career Readiness Score (computed from completed interviews & match analyses)
 * - Real Match Score & Interview Scores
 * - Real count of completed interviews
 * - Real unique skills extracted by AI
 * - Real-time activity timeline without static demo data
 */
export default function useDashboard() {
  const [data, setData] = useState({
    resumes: [],
    analyses: [],
    interviews: [],
    metrics: {
      careerReadinessScore: 0,
      completedInterviewsCount: 0,
      totalInterviewsCount: 0,
      skillsProfiledCount: 0,
      latestMatchScore: null,
      latestInterviewScore: null,
    },
    user: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const [dashRes, userRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/users/me'),
      ])

      const dashData = dashRes.status === 'fulfilled' ? dashRes.value.data : {}
      const userData = userRes.status === 'fulfilled' ? userRes.value.data.user : null

      setData({
        resumes: dashData.resumes || [],
        analyses: dashData.analyses || [],
        interviews: dashData.interviews || [],
        metrics: dashData.metrics || {
          careerReadinessScore: 0,
          completedInterviewsCount: 0,
          totalInterviewsCount: 0,
          skillsProfiledCount: 0,
          latestMatchScore: null,
          latestInterviewScore: null,
        },
        user: userData,
      })
      setError('')
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Format real merged activities
  const recentActivities = [
    ...data.analyses.map((a) => ({
      id: `analysis-${a._id}`,
      icon: 'analytics',
      name: `Match Analysis: ${a.jobId?.title || 'Target Role'}`,
      role: a.jobId?.title || 'General Position',
      date: new Date(a.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: typeof a.matchScore === 'number' ? `${a.matchScore}% Match` : 'Evaluated',
      statusColor:
        (a.matchScore || 0) >= 80
          ? 'bg-[#000000] text-white'
          : 'bg-[#e8e8e8] text-black border border-[#cfc4c5]',
      rawDate: new Date(a.createdAt),
    })),
    ...data.interviews.map((i) => ({
      id: `interview-${i._id}`,
      icon: 'mic',
      name: `Mock Interview: ${i.jobId?.title || 'Role Session'}`,
      role: i.jobId?.title || 'Target Role',
      date: new Date(i.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status:
        i.status === 'completed' && typeof i.overallScore === 'number'
          ? `${i.overallScore}% Score`
          : i.status === 'completed'
          ? 'Completed'
          : 'In Progress',
      statusColor:
        i.status === 'completed'
          ? 'bg-[#000000] text-white'
          : 'bg-[#f9f9f9] text-[#7e7576] border border-[#cfc4c5] border-dashed',
      rawDate: new Date(i.createdAt),
    })),
    ...data.resumes.map((r) => ({
      id: `resume-${r._id}`,
      icon: 'description',
      name: r.fileName || 'Resume Document',
      role: 'Profile Resume',
      date: new Date(r.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Uploaded',
      statusColor: 'bg-[#e8e8e8] text-black border border-[#cfc4c5]',
      rawDate: new Date(r.createdAt),
    })),
  ]
    .sort((a, b) => b.rawDate - a.rawDate)
    .slice(0, 5)

  return {
    ...data,
    loading,
    error,
    careerReadinessScore: data.metrics?.careerReadinessScore || 0,
    completedInterviews: data.metrics?.completedInterviewsCount || 0,
    totalMatchedSkills: data.metrics?.skillsProfiledCount || 0,
    latestMatchScore: data.metrics?.latestMatchScore,
    latestInterviewScore: data.metrics?.latestInterviewScore,
    recentActivities,
    refetch: fetchDashboard,
  }
}
