import { useState, useEffect, useRef, useCallback } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null

/**
 * useSpeech — browser-native STT + TTS
 *
 * STT  (SpeechRecognition):
 *   startListening()   — starts continuous recognition, appends to `transcript`
 *   stopListening()    — stops recognition
 *   resetTranscript()  — clears transcript
 *   listening          — boolean
 *   transcript         — accumulated string from voice
 *   sttSupported       — false on unsupported browsers
 *
 * TTS  (SpeechSynthesis):
 *   speak(text)        — reads text aloud (cancels any current utterance)
 *   stopSpeaking()     — cancels speech
 *   speaking           — boolean
 *   ttsSupported       — false on unsupported browsers
 */
export default function useSpeech() {
  /* ── STT ─────────────────────────────────────────── */
  const sttSupported = Boolean(SpeechRecognition)
  const [listening, setListening]     = useState(false)
  const [transcript, setTranscript]   = useState('')
  const recognitionRef                = useRef(null)

  useEffect(() => {
    if (!sttSupported) return
    const rec = new SpeechRecognition()
    rec.continuous      = true
    rec.interimResults  = true
    rec.lang            = 'en-US'

    rec.onresult = (e) => {
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
      }
      if (final) setTranscript((prev) => prev + final)
    }

    rec.onend = () => {
      // Only update state; don't auto-restart — caller controls that
      setListening(false)
    }

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') setListening(false)
    }

    recognitionRef.current = rec
    return () => rec.abort()
  }, [sttSupported])

  const startListening = useCallback(() => {
    if (!sttSupported || listening) return
    setListening(true)
    recognitionRef.current?.start()
  }, [sttSupported, listening])

  const stopListening = useCallback(() => {
    if (!sttSupported) return
    setListening(false)
    recognitionRef.current?.stop()
  }, [sttSupported])

  const resetTranscript = useCallback(() => setTranscript(''), [])

  /* ── TTS ─────────────────────────────────────────── */
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text) => {
    if (!ttsSupported || !text) return
    window.speechSynthesis.cancel()
    const utterance    = new SpeechSynthesisUtterance(text)
    utterance.lang     = 'en-US'
    utterance.rate     = 0.95
    utterance.pitch    = 1
    utterance.onstart  = () => setSpeaking(true)
    utterance.onend    = () => setSpeaking(false)
    utterance.onerror  = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [ttsSupported])

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [ttsSupported])

  return {
    /* STT */
    sttSupported, listening, transcript, resetTranscript,
    startListening, stopListening,
    /* TTS */
    ttsSupported, speaking, speak, stopSpeaking,
  }
}
