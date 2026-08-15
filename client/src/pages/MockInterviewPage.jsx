import { useState, useEffect } from 'react'
import useInterview from '../frontend_logic/useInterview'
import useResumes from '../frontend_logic/useResumes'
import useJobs from '../frontend_logic/useJobs'
import useSpeech from '../frontend_logic/useSpeech'

/**
 * MockInterviewPage — AI Mock Interview Session & Scorecard
 * - Choice of Text Interview or Voice Interview Session mode (Stitch AI Career Pro inspired)
 * - Dynamic real-time Audio Waveform visualization for Voice mode
 * - Connected strictly to backend /api/interviews (real score calculation, fallback score 00)
 */
export default function MockInterviewPage({ onEndSession, onNavigate }) {
  const {
    interview,
    interviews,
    starting,
    submitting,
    completing,
    error,
    start,
    submitAnswer,
    complete,
    setInterview,
  } = useInterview()
  const { resumes } = useResumes()
  const { jobs } = useJobs()

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [formatMode, setFormatMode] = useState('text') // 'text' | 'voice'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  const QUESTION_TIME = 120 // seconds per question
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME)

  const {
    sttSupported,
    listening,
    transcript,
    resetTranscript,
    startListening,
    stopListening,
    ttsSupported,
    speaking,
    speak,
    stopSpeaking,
  } = useSpeech()

  // Append voice transcript to response
  useEffect(() => {
    if (transcript) setResponse((prev) => prev + transcript)
    resetTranscript()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  // Auto-read question aloud when it changes or in Voice Mode
  useEffect(() => {
    if (currentQ?.question) {
      speak(currentQ.question)
    }
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, interview?._id, formatMode])

  const toggleMic = () => {
    if (listening) stopListening()
    else startListening()
  }

  const activeQuestions = interview?.questions || []
  const currentQ = activeQuestions[currentQuestionIndex] || null
  const isLastQuestion =
    activeQuestions.length > 0 && currentQuestionIndex === activeQuestions.length - 1

  // Live session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Per-question countdown
  useEffect(() => {
    if (!interview) return
    setQuestionTimeLeft(QUESTION_TIME)
    const interval = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSkipQuestion()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, interview?._id])

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainSecs = secs % 60
    return `${mins}:${remainSecs.toString().padStart(2, '0')}`
  }

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0

  const handleStartSession = async (e) => {
    e.preventDefault()
    const newSession = await start(selectedResumeId, selectedJobId)
    if (newSession) {
      setCurrentQuestionIndex(0)
      setResponse('')
      setSeconds(0)
      if (formatMode === 'voice' && sttSupported) {
        startListening()
      }
    }
  }

  const handleSubmitAnswer = async () => {
    if (!response.trim() || !interview?._id) return
    stopListening()
    stopSpeaking()

    await submitAnswer(currentQuestionIndex, response)

    if (isLastQuestion) {
      const completedSession = await complete()
      if (completedSession) {
        setShowSummaryModal(true)
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setResponse('')
      if (formatMode === 'voice' && sttSupported) {
        startListening()
      }
    }
  }

  const handleSkipQuestion = async () => {
    stopListening()
    stopSpeaking()
    if (isLastQuestion) {
      if (interview?._id) {
        await complete()
      }
      setShowSummaryModal(true)
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setResponse('')
    }
  }

  const progressPercent =
    activeQuestions.length > 0
      ? ((currentQuestionIndex + 1) / activeQuestions.length) * 100
      : 0

  // Real calculated score from evaluated answers
  const answeredScores = activeQuestions
    .map((q) => q.score)
    .filter((s) => typeof s === 'number')
  
  const rawScore =
    answeredScores.length > 0
      ? Math.round(answeredScores.reduce((a, b) => a + b, 0) / activeQuestions.length)
      : interview?.overallScore ?? 0

  const formattedLiveScore = String(rawScore).padStart(2, '0')

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] h-screen w-screen overflow-hidden flex font-sans select-text">
      {/* Sidebar Context Panel (Desktop) */}
      <aside className="hidden md:flex flex-col w-80 bg-[#f3f3f3] border-r border-[#cfc4c5] h-full flex-shrink-0">
        {/* Brand / Header */}
        <div className="p-6 border-b border-[#cfc4c5]">
          <div
            onClick={() => onNavigate && onNavigate('Dashboard')}
            className="text-xl font-bold text-black tracking-tighter uppercase font-sans cursor-pointer"
          >
            AI CAREER PRO
          </div>
          <p className="text-xs text-[#5e5e5e] mt-1 uppercase tracking-widest font-semibold">
            {formatMode === 'voice' ? 'Voice Interview Session' : 'Text Interview Session'}
          </p>
        </div>

        {/* Session Context */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Format Selector Toggle */}
          <div>
            <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
              Interview Format
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#e2e2e2] border border-[#cfc4c5]">
              <button
                type="button"
                onClick={() => setFormatMode('text')}
                className={`py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  formatMode === 'text'
                    ? 'bg-black text-white'
                    : 'text-[#5e5e5e] hover:text-black'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormatMode('voice')
                  if (sttSupported && !listening) startListening()
                }}
                className={`py-1.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  formatMode === 'voice'
                    ? 'bg-black text-white'
                    : 'text-[#5e5e5e] hover:text-black'
                }`}
              >
                <span className="material-symbols-outlined text-sm">graphic_eq</span>
                Voice
              </button>
            </div>
          </div>

          <hr className="border-t border-[#cfc4c5] w-full" />

          {/* Target Role */}
          <div>
            <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
              Target Role
            </span>
            <div className="text-base font-semibold text-black">
              {interview?.jobId?.title || 'Target Job Simulation'}
            </div>
            <div className="text-xs text-[#5e5e5e] mt-1">AI Evaluated Simulation</div>
          </div>

          <hr className="border-t border-[#cfc4c5] w-full" />

          {/* Reference Material */}
          <div>
            <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
              Active Resume Context
            </span>
            <div className="flex items-center gap-2 p-2 bg-[#f9f9f9] border border-[#cfc4c5]">
              <span className="material-symbols-outlined text-lg text-[#5e5e5e]">description</span>
              <span className="text-sm font-semibold text-black truncate">
                {interview?.resumeId?.fileName || 'Resume Profile'}
              </span>
            </div>
          </div>

          <hr className="border-t border-[#cfc4c5] w-full" />

          {/* Session Metrics */}
          <div>
            <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
              Session Metrics
            </span>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-[#5e5e5e]">Elapsed Time</span>
              <span className="font-semibold text-black">{formatTime(seconds)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5e5e5e]">Progress</span>
              <span className="font-semibold text-black">
                {activeQuestions.length > 0
                  ? `${currentQuestionIndex + 1} of ${activeQuestions.length}`
                  : '0 of 0'}
              </span>
            </div>
          </div>

          {/* Past Sessions */}
          {interviews.length > 0 && (
            <div>
              <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
                Saved Sessions ({interviews.length})
              </span>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {interviews.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      setInterview(item)
                      setCurrentQuestionIndex(0)
                      setResponse('')
                    }}
                    className={`text-left p-2 border text-xs ${
                      interview?._id === item._id
                        ? 'border-black bg-white font-semibold'
                        : 'border-[#cfc4c5] hover:border-black'
                    }`}
                  >
                    <div className="truncate font-semibold">{item.jobId?.title || 'Mock Session'}</div>
                    <div className="text-[10px] text-[#5e5e5e]">
                      {item.status === 'completed'
                        ? `Score: ${String(item.overallScore ?? 0).padStart(2, '0')}%`
                        : 'In Progress'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exit Session Button */}
        <div className="p-6 border-t border-[#cfc4c5] bg-[#f9f9f9]">
          <button
            type="button"
            onClick={onEndSession || (() => onNavigate && onNavigate('Dashboard'))}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-black text-black text-sm font-semibold uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Exit Interview
          </button>
        </div>
      </aside>

      {/* Main Canvas Workspace */}
      <main className="flex-1 flex flex-col h-full relative bg-[#f9f9f9]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#cfc4c5] bg-[#f3f3f3]">
          <div>
            <h1 className="text-sm font-bold text-black tracking-tighter uppercase">AI CAREER PRO</h1>
            <p className="text-xs text-[#5e5e5e]">
              {formatMode === 'voice' ? 'Voice Session' : 'Text Session'} • {interview?.jobId?.title || 'Simulation'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormatMode((m) => (m === 'voice' ? 'text' : 'voice'))}
              className="px-2 py-1 border border-black text-xs font-semibold uppercase"
            >
              {formatMode === 'voice' ? 'Text Mode' : 'Voice Mode'}
            </button>
            <button
              type="button"
              onClick={onEndSession || (() => onNavigate && onNavigate('Dashboard'))}
              className="p-1 border border-[#cfc4c5] text-black"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Header */}
        {activeQuestions.length > 0 && (
          <div className="w-full bg-[#f9f9f9] border-b border-[#cfc4c5] pt-6 px-6 md:px-10 pb-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-semibold text-black uppercase tracking-widest flex items-center gap-2">
                  <span>Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
                  {formatMode === 'voice' && (
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] uppercase font-bold tracking-wider">
                      VOICE SESSION
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5e5e5e] font-semibold">{currentQ?.type || 'Technical'}</span>
                  <span
                    className={`text-xs font-bold tabular-nums px-2 py-0.5 border ${
                      questionTimeLeft > 60
                        ? 'border-[#cfc4c5] text-[#1b1b1b]'
                        : questionTimeLeft > 30
                        ? 'border-[#e6a817] text-[#a36800] bg-[#fff8ed]'
                        : 'border-[#ba1a1a] text-[#ba1a1a] bg-[#fdf2f2] animate-pulse'
                    }`}
                  >
                    {formatTime(questionTimeLeft)}
                  </span>
                </div>
              </div>
              <div className="w-full h-1 bg-[#e2e2e2] overflow-hidden mb-1">
                <div
                  className="h-full bg-black transition-all duration-500 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Body: Voice Mode vs Text Mode */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          {activeQuestions.length > 0 ? (
            formatMode === 'voice' ? (
              /* VOICE INTERVIEW SESSION UI (Stitch AI Career Pro Inspired) */
              <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-between h-full py-4">
                {/* AI Status Badge */}
                <div className="flex items-center gap-2 px-4 py-2 border border-black bg-white shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    speaking
                      ? 'bg-blue-600 animate-ping'
                      : listening
                      ? 'bg-emerald-600 animate-pulse'
                      : submitting
                      ? 'bg-amber-600 animate-bounce'
                      : 'bg-black'
                  }`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-black">
                    {speaking
                      ? 'AI Interviewer Speaking…'
                      : submitting
                      ? 'Evaluating Voice Response…'
                      : listening
                      ? 'Listening to Candidate Voice…'
                      : 'Mic Muted / Standby'}
                  </span>
                </div>

                {/* AI Audio Wave Visualizer Container */}
                <div className="my-6 w-full flex flex-col items-center justify-center py-8 bg-[#f3f3f3] border-2 border-black relative">
                  {/* Dynamic Soundwave Frequency Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-20 w-full px-8">
                    {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35, 75, 65, 85, 55, 30, 90, 60].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 bg-black transition-all duration-150 ${
                          speaking || listening ? 'animate-pulse' : 'opacity-30'
                        }`}
                        style={{
                          height: (speaking || listening) ? `${Math.max(12, (h * (i % 3 + 1)) % 80)}px` : '12px',
                        }}
                      />
                    ))}
                  </div>

                  {/* Mic Orb Action */}
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`mt-4 w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                      listening
                        ? 'bg-black text-white border-black scale-105 shadow-lg'
                        : 'bg-white text-black border-black hover:bg-[#e8e8e8]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {listening ? 'mic' : 'mic_off'}
                    </span>
                  </button>
                  <span className="text-[11px] text-[#5e5e5e] uppercase tracking-wider font-semibold mt-2">
                    {listening ? 'Voice Input Active' : 'Click Mic to Speak'}
                  </span>
                </div>

                {/* Current Question Display */}
                <div className="w-full text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#5e5e5e]">
                      AI Question Prompt
                    </span>
                    {ttsSupported && (
                      <button
                        type="button"
                        onClick={() => speaking ? stopSpeaking() : speak(currentQ?.question)}
                        className="text-xs underline font-semibold text-black hover:opacity-75"
                      >
                        {speaking ? 'Stop Audio' : 'Replay Voice'}
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-black leading-relaxed">
                    "{currentQ?.question}"
                  </h3>
                </div>

                {/* Real-time Voice Transcript Box */}
                <div className="w-full bg-white border border-[#7e7576] p-4 flex flex-col gap-2 min-h-[120px]">
                  <div className="flex justify-between items-center text-xs text-[#5e5e5e]">
                    <span className="font-semibold uppercase tracking-wider">Live Transcript</span>
                    <span>{wordCount} words</span>
                  </div>
                  <p className="text-sm text-black font-medium leading-normal italic min-h-[50px]">
                    {response || 'Start speaking to record your answer automatically via voice recognition…'}
                  </p>
                </div>

                {error && (
                  <div className="w-full mt-2 p-3 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              /* TEXT INTERVIEW SESSION UI */
              <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 h-full">
                {/* AI Question Section */}
                <section className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                    <span className="text-xs text-[#5e5e5e] uppercase tracking-wider font-semibold">
                      AI Interviewer
                    </span>
                    {ttsSupported && (
                      <button
                        type="button"
                        title={speaking ? 'Stop reading' : 'Read question aloud'}
                        onClick={() => speaking ? stopSpeaking() : speak(currentQ?.question)}
                        className={`ml-auto p-1 transition-colors ${
                          speaking ? 'text-black' : 'text-[#5e5e5e] hover:text-black'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {speaking ? 'stop_circle' : 'volume_up'}
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="border-l-2 border-black pl-6">
                    <p className="text-xl md:text-2xl font-semibold text-black leading-relaxed">
                      {currentQ?.question}
                    </p>
                  </div>
                </section>

                {/* AI Previous Feedback If Evaluated */}
                {currentQ?.feedback && (
                  <div className="p-4 bg-[#f3f3f3] border-l-4 border-black">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black">
                        AI Evaluation & Score
                      </span>
                      <span className="px-2 py-0.5 bg-black text-white text-xs font-bold">
                        {typeof currentQ.score === 'number'
                          ? `${String(currentQ.score).padStart(2, '0')}/100`
                          : '00/100'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4c4546]">{currentQ.feedback}</p>
                  </div>
                )}

                {/* Text Response Area */}
                <section className="flex flex-col gap-2 flex-1 mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border border-black text-black flex items-center justify-center bg-[#f9f9f9]">
                        <span className="material-symbols-outlined text-sm">person</span>
                      </div>
                      <span className="text-xs text-[#5e5e5e] uppercase tracking-wider font-semibold">
                        Your Response
                      </span>
                    </div>
                  </div>

                  <div className="relative flex-1 min-h-[260px]">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="w-full h-full min-h-[260px] p-6 bg-[#f9f9f9] border border-[#7e7576] text-base text-black resize-none transition-all duration-200 focus:border-2 focus:border-black focus:outline-none"
                      placeholder="Type your response or use voice dictation..."
                      spellCheck="false"
                    ></textarea>

                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <span className="text-xs text-[#5e5e5e] bg-[#f9f9f9] px-2.5 py-1 border border-[#cfc4c5] font-semibold pointer-events-none">
                        {wordCount} words
                      </span>
                      {sttSupported && (
                        <button
                          type="button"
                          onClick={toggleMic}
                          className={`flex items-center gap-1 px-2.5 py-1 border font-semibold text-xs transition-all ${
                            listening
                              ? 'border-black bg-black text-white'
                              : 'border-[#cfc4c5] bg-[#f9f9f9] text-[#5e5e5e] hover:border-black'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {listening ? 'mic' : 'mic_off'}
                          </span>
                          <span>{listening ? 'Listening…' : 'Voice'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold">
                      {error}
                    </div>
                  )}
                </section>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <span className="text-sm text-[#5e5e5e]">
                No active interview session loaded. Please select options to start below.
              </span>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        {activeQuestions.length > 0 && (
          <div className="w-full bg-[#f9f9f9] border-t border-[#cfc4c5] p-4 md:px-10 md:py-6 flex-shrink-0 z-10">
            <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-[#7e7576] text-black text-xs font-semibold uppercase tracking-wider hover:border-black transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">skip_next</span>
                  Skip Question
                </button>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-2">
                <button
                  type="button"
                  disabled={submitting || completing || starting || !response.trim()}
                  onClick={handleSubmitAnswer}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? 'Evaluating with AI…'
                    : completing
                    ? 'Generating Scorecard…'
                    : isLastQuestion
                    ? 'Complete & View Scorecard'
                    : 'Submit Answer & Next'}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Choose Resume, Job & Interview Format */}
        {!interview && (
          <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-md w-full p-6 flex flex-col gap-6 shadow-2xl">
              <div>
                <h3 className="text-xl font-bold text-black">Start AI Mock Interview</h3>
                <p className="text-xs text-[#5e5e5e] mt-1">
                  Select your resume, target role, and interview format to generate tailor-made questions.
                </p>
              </div>

              <form onSubmit={handleStartSession} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Resume Document
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose PDF Resume --</option>
                    {resumes.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.fileName || r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Target Job Role
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose Job Description --</option>
                    {jobs.map((j) => (
                      <option key={j._id || j.id} value={j._id || j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format Selection Card Options */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Interview Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormatMode('text')}
                      className={`p-3 border text-left flex flex-col justify-between transition-all ${
                        formatMode === 'text'
                          ? 'border-2 border-black bg-white font-bold'
                          : 'border-[#cfc4c5] bg-[#f3f3f3] text-[#5e5e5e] hover:border-black'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-sm text-black">
                        <span className="material-symbols-outlined text-base">edit_note</span>
                        <span>Text Interview</span>
                      </div>
                      <span className="text-[10px] text-[#5e5e5e] mt-2">
                        Written response Q&A workspace with optional audio assist
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormatMode('voice')}
                      className={`p-3 border text-left flex flex-col justify-between transition-all ${
                        formatMode === 'voice'
                          ? 'border-2 border-black bg-white font-bold'
                          : 'border-[#cfc4c5] bg-[#f3f3f3] text-[#5e5e5e] hover:border-black'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-sm text-black">
                        <span className="material-symbols-outlined text-base">graphic_eq</span>
                        <span>Voice Session</span>
                      </div>
                      <span className="text-[10px] text-[#5e5e5e] mt-2">
                        Live audio voice simulation inspired by AI Career Pro
                      </span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-[#fdf2f2] border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('Dashboard')}
                    className="px-4 py-3 border border-[#7e7576] text-black text-xs font-semibold uppercase tracking-wider"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    type="submit"
                    disabled={starting || resumes.length === 0 || jobs.length === 0}
                    className="flex-1 bg-black text-white text-xs font-semibold uppercase tracking-wider py-3 hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                  >
                    {starting ? 'Generating AI Session…' : `START ${formatMode.toUpperCase()} INTERVIEW`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scorecard Modal */}
        {showSummaryModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#cfc4c5] pb-3">
                <h3 className="text-xl font-bold text-black">Interview Performance Scorecard</h3>
                <button
                  type="button"
                  onClick={() => setShowSummaryModal(false)}
                  className="p-1 text-[#5e5e5e] hover:text-black"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="bg-black text-white p-6 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#cfc4c5] font-semibold">
                    Overall Performance
                  </span>
                  <h4 className="text-2xl font-bold mt-1">
                    {formattedLiveScore}% Career Readiness Score
                  </h4>
                </div>
                <div className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">
                  {interview?.status === 'completed' ? 'Completed' : 'Evaluated'}
                </div>
              </div>

              {interview?.summary && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#5e5e5e] mb-2">
                    Executive AI Summary
                  </h4>
                  <p className="text-sm text-[#1b1b1b] bg-white p-4 border border-[#cfc4c5] leading-relaxed">
                    {interview.summary}
                  </p>
                </div>
              )}

              {/* Individual Question Score Breakdown */}
              {activeQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-[#5e5e5e] mb-2">
                    Question Breakdown ({activeQuestions.length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {activeQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#cfc4c5] p-3 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex justify-between items-center font-semibold text-black">
                          <span>
                            Q{idx + 1}: {q.type || 'Question'}
                          </span>
                          <span className="px-2 py-0.5 bg-[#e8e8e8] border border-[#cfc4c5]">
                            {typeof q.score === 'number'
                              ? `${String(q.score).padStart(2, '0')}/100`
                              : '00/100'}
                          </span>
                        </div>
                        <p className="text-[#5e5e5e] truncate">{q.question}</p>
                        {q.feedback && <p className="text-[#1b1b1b] mt-1 italic">{q.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#cfc4c5]">
                <button
                  type="button"
                  onClick={() => {
                    setShowSummaryModal(false)
                    if (onNavigate) onNavigate('Analysis')
                  }}
                  className="px-4 py-2 border border-black text-xs font-semibold uppercase tracking-wider hover:bg-[#e8e8e8]"
                >
                  View Match Analysis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSummaryModal(false)
                    if (onNavigate) onNavigate('Dashboard')
                  }}
                  className="px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b]"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
