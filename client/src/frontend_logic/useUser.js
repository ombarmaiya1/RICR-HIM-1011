import { useState } from 'react'
import api from '../api/axios'

/**
 * Hook to manage user profile and security updates:
 * - updateProfile({ fullName, username, email, currentPassword }) -> PUT /api/users/profile
 * - sendPasswordChangeOTP() -> POST /api/users/password/send-otp
 * - changePasswordWithOTP({ otp, newPassword }) -> PUT /api/users/password
 */
export default function useUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const updateProfile = async ({ fullName, username, email, currentPassword }, onSuccess) => {
    if (!currentPassword) {
      setError('Current password is required to update your profile.')
      return false
    }

    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const res = await api.put('/users/profile', {
        fullName,
        username,
        email,
        currentPassword,
      })
      setSuccessMessage(res.data.message || 'Profile updated successfully.')
      if (onSuccess) onSuccess(res.data.user)
      return res.data.user
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const sendPasswordChangeOTP = async () => {
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const res = await api.post('/users/password/send-otp')
      setSuccessMessage(res.data.message || 'OTP sent to your registered email.')
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP for password change.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const changePasswordWithOTP = async ({ otp, newPassword }, onSuccess) => {
    if (!otp || !newPassword) {
      setError('OTP code and new password are required.')
      return false
    }

    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const res = await api.put('/users/password', {
        otp,
        newPassword,
      })
      setSuccessMessage(res.data.message || 'Password changed successfully.')
      if (onSuccess) onSuccess()
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    updateProfile,
    sendPasswordChangeOTP,
    changePasswordWithOTP,
  }
}
