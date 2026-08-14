import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useOTP from '../frontend_logic/useOTP'

/**
 * ForgotPasswordPage — Faithful reproduction of Stitch "OTP Verification" & "Reset Password" screens
 * - Brand: AI CAREER PRO (Architectural Minimalist theme)
 * - 3-Step Guided Transactional Flow:
 *    Step 1: Enter Email & Request OTP (POST /api/auth/send-otp)
 *    Step 2: 6-Digit OTP Code Verification (POST /api/auth/verify-otp)
 *    Step 3: New Password & Confirmation Entry (POST /api/auth/reset-password)
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { loading, error, message, sendOTP, verifyOTP, resetPassword } = useOTP()

  const [step, setStep] = useState('request') // 'request' | 'verify' | 'reset' | 'success'
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const digitRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  // Focus first OTP input when transitioning to verify step
  useEffect(() => {
    if (step === 'verify') {
      digitRefs[0].current?.focus()
    }
  }, [step])

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    const ok = await sendOTP(email)
    if (ok) {
      setStep('verify')
    }
  }

  // Step 2: Handle 6-Digit input changes
  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Paste handling
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('')
      const nextDigits = [...otpDigits]
      pasted.forEach((char, i) => {
        if (i < 6) nextDigits[i] = char
      })
      setOtpDigits(nextDigits)
      const nextFocus = Math.min(pasted.length, 5)
      digitRefs[nextFocus].current?.focus()
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = value.replace(/\D/g, '')
    setOtpDigits(nextDigits)

    if (value && index < 5) {
      digitRefs[index + 1].current?.focus()
    }
  }

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus()
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const fullOtp = otpDigits.join('')
    const ok = await verifyOTP(email, fullOtp)
    if (ok) {
      setStep('reset')
    }
  }

  const handleResendCode = async () => {
    setOtpDigits(['', '', '', '', '', ''])
    await sendOTP(email)
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    const ok = await resetPassword(password, confirmPassword, () => {
      setStep('success')
    })
  }

  return (
    <AuthLayout>
      {/* Step 1: Enter Email */}
      {step === 'request' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-black tracking-tight" style={{ fontWeight: 600 }}>
              Forgot Password
            </h2>
            <p className="text-sm text-[#4c4546] mt-2">
              Enter your registered email address to receive a 6-digit recovery code.
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="forgot-email"
                className="text-black uppercase text-xs font-semibold tracking-wider"
              >
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                className="minimal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] -mt-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
            >
              {loading ? 'SENDING CODE…' : 'SEND RECOVERY CODE'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#cfc4c5] text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-black hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Login
            </button>
          </div>
        </>
      )}

      {/* Step 2: OTP Verification (Faithful to Stitch screen) */}
      {step === 'verify' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-black tracking-tight" style={{ fontWeight: 600 }}>
              Verification Required
            </h2>
            <p className="text-sm text-[#4c4546] mt-2 leading-relaxed">
              Enter the 6-digit code sent to <br />
              <span className="font-semibold text-black">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-2 my-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={digitRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-[#f9f9f9] border border-[#cfc4c5] text-black focus:outline-none focus:border-2 focus:border-black transition-all"
                />
              ))}
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] text-center -mt-2">
                {error}
              </p>
            )}

            {message && !error && (
              <p className="text-xs font-semibold text-[#006e4b] text-center -mt-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otpDigits.some((d) => !d)}
              className="w-full bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
            >
              {loading ? 'VERIFYING…' : 'VERIFY & PROCEED'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-[#5e5e5e]">Didn&apos;t receive the code? </span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-xs font-semibold text-black underline hover:text-[#5e5e5e]"
            >
              Resend Code
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#cfc4c5] text-center">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-xs font-semibold text-black hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Change Email
            </button>
          </div>
        </>
      )}

      {/* Step 3: Reset Password (Faithful to Stitch screen) */}
      {step === 'reset' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-black tracking-tight" style={{ fontWeight: 600 }}>
              Reset Password
            </h2>
            <p className="text-sm text-[#4c4546] mt-2">
              Choose a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-6" noValidate>
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="reset-password"
                className="text-black uppercase text-xs font-semibold tracking-wider"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="minimal-input pr-8"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5e5e5e] hover:text-black transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="reset-confirm"
                className="text-black uppercase text-xs font-semibold tracking-wider"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="minimal-input pr-8"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#5e5e5e] hover:text-black transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] -mt-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
            >
              {loading ? 'RESETTING PASSWORD…' : 'RESET PASSWORD'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#cfc4c5] text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-black hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Login
            </button>
          </div>
        </>
      )}

      {/* Step 4: Success Confirmation */}
      {step === 'success' && (
        <div className="text-center flex flex-col items-center gap-4 py-4">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check</span>
          </div>
          <h2 className="text-xl font-semibold text-black tracking-tight" style={{ fontWeight: 600 }}>
            Password Reset Complete
          </h2>
          <p className="text-sm text-[#4c4546] leading-relaxed">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full bg-black text-white text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#1b1b1b] transition-colors mt-4"
          >
            LOG IN NOW
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
