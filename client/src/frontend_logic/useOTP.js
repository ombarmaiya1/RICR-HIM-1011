import { useState } from 'react'
import api from '../api/axios'

/**
 * Handles OTP authentication and Password Reset flows:
 * - sendOTP(email) → POST /api/auth/send-otp
 * - verifyOTP(email, otp) → POST /api/auth/verify-otp
 * - resetPassword(password) → POST /api/auth/reset-password
 */
export default function useOTP() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [message, setMessage] = useState('')

  async function sendOTP(email) {
    if (!email) {
      setError('Email is required.')
      return false
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await api.post('/auth/send-otp', { email })
      setOtpSent(true)
      setMessage(res.data.message || 'OTP sent to your email.')
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP(email, otp) {
    if (!email || !otp) {
      setError('Email and OTP are required.')
      return false
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, otp })
      setOtpVerified(true)
      setMessage(res.data.message || 'OTP verified successfully.')
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(password, confirmPassword, onSuccess) {
    if (!password) {
      setError('Password is required.')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await api.post('/auth/reset-password', { password })
      setMessage(res.data.message || 'Password reset successfully.')
      if (onSuccess) onSuccess()
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    message,
    otpSent,
    otpVerified,
    sendOTP,
    verifyOTP,
    resetPassword,
  }
}
