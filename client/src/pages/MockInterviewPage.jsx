import { useState, useEffect } from 'react'
import useInterview from '../frontend_logic/useInterview'
import useResumes from '../frontend_logic/useResumes'
import useJobs from '../frontend_logic/useJobs'
import useSpeech from '../frontend_logic/useSpeech'

/**
 * MockInterviewPage — Complete AI Mock Interview Session & Scorecard
 * - Connected to backend /api/interviews (start, answer evaluation, completion summary)
 * - Sharp architectural minimalist design language (0px radius, 1px/2px borders)
 * - Setup launcher when no active session is loaded (Choose Resume & Job)
 * - Sidebar Context Panel (Target role, Active resume document, Live timer, Session progress)
 * - Main Q&A Workspace (Progress bar, AI question prompt, Textarea response box, AI Feedback)
 * - Real performance scorecard (100% computed from AI evaluations and answers)
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  const QUESTION_TIME = 120 // seconds per question
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME)

  const {
    sttSupported, listening, transcript, resetTranscript,
    startListening, stopListening,
    ttsSupported, speaking, speak, stopSpeaking,
  } = useSpeech()

  // Append new voice transcript into the response textarea
  useEffect(() => {
    if (transcript) setResponse((prev) => prev + transcript)
    resetTranscript()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  // Auto-read each new question aloud when it appears
  useEffect(() => {
    if (currentQ?.question) speak(currentQ.question)
    return () => stopSpeaking()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, interview?._id])

  const toggleMic = () => {
    if (listening) stopListening()
    else startListening()
  }

  const activeQuestions = interview?.questions || []
  const currentQ = activeQuestions[currentQuestionIndex] || null
  const isLastQuestion =
    activeQuestions.length > 0 && currentQuestionIndex === activeQuestions.length - 1

  // Live session timer (counts up)
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Per-question countdown — resets every time the question index changes
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

  // Real calculated score from current question state
  const answeredScores = activeQuestions
    .map((q) => q.score)
    .filter((s) => typeof s === 'number')
  const calculatedLiveScore =
    answeredScores.length > 0
      ? Math.round(answeredScores.reduce((a, b) => a + b, 0) / activeQuestions.length)
      : interview?.overallScore ?? 0

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
            Mock Interview Session
          </p>
        </div>

        {/* Session Context */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
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

          {/* Past Sessions Drawer */}
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
                      {item.status === 'completed' && typeof item.overallScore === 'number'
                        ? `Score: ${item.overallScore}%`
                        : item.status === 'completed'
                        ? 'Completed'
                        : 'In Progress'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* End Session Button */}
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

      {/* Main Interview Canvas */}
      <main className="flex-1 flex flex-col h-full relative bg-[#f9f9f9]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#cfc4c5] bg-[#f3f3f3]">
          <div>
            <h1 className="text-sm font-bold text-black tracking-tighter uppercase">AI CAREER PRO</h1>
            <p className="text-xs text-[#5e5e5e]">
              {interview?.jobId?.title || 'Mock Interview Simulation'}
            </p>
          </div>
          <button
            type="button"
            onClick={onEndSession || (() => onNavigate && onNavigate('Dashboard'))}
            className="p-2 border border-[#cfc4c5] text-black hover:bg-[#e8e8e8] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Progress Indicator Bar */}
        {activeQuestions.length > 0 && (
          <div className="w-full bg-[#f9f9f9] border-b border-[#cfc4c5] pt-6 px-6 md:px-10 pb-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-semibold text-black uppercase tracking-widest">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5e5e5e] font-semibold">{currentQ?.type || 'Technical'}</span>
                  {/* Per-question countdown */}
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
              {/* Question progress bar */}
              <div className="w-full h-1 bg-[#e2e2e2] overflow-hidden mb-1">
                <div
                  className="h-full bg-black transition-all duration-500 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {/* Per-question time bar */}
              <div className="w-full h-1 bg-[#e2e2e2] overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(questionTimeLeft / QUESTION_TIME) * 100}%`,
                    backgroundColor:
                      questionTimeLeft > 60 ? '#000000'
                      : questionTimeLeft > 30 ? '#e6a817'
                      : '#ba1a1a',
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Q&A Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          {activeQuestions.length > 0 ? (
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 h-full">
              {/* AI Question Area */}
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

              {/* AI Previous Feedback If already answered */}
              {currentQ?.feedback && (
                <div className="p-4 bg-[#f3f3f3] border-l-4 border-black">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      AI Evaluation & Score
                    </span>
                    <span className="px-2 py-0.5 bg-black text-white text-xs font-bold">
                      {typeof currentQ.score === 'number' ? `${currentQ.score}/100` : 'Evaluated'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4c4546]">{currentQ.feedback}</p>
                </div>
              )}

              {/* User Answer Input Area */}
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
                  {/* Formatting Tools */}
                  <div className="hidden md:flex gap-2">
                    <button
                      type="button"
                      className="p-1 text-[#5e5e5e] hover:text-black transition-colors"
                      title="Format Code"
                      onClick={() => setResponse((r) => r + '\n```js\n// Code snippet\n```\n')}
                    >
                      <span className="material-symbols-outlined text-lg">code</span>
                    </button>
                    <button
                      type="button"
                      className="p-1 text-[#5e5e5e] hover:text-black transition-colors"
                      title="Bullet List"
                      onClick={() => setResponse((r) => r + '\n- ')}
                    >
                      <span className="material-symbols-outlined text-lg">
                        format_list_bulleted
                      </span>
                    </button>
                  </div>
                </div>

                {/* Textarea Container */}
                <div className="relative flex-1 min-h-[260px]">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full h-full min-h-[260px] p-6 bg-[#f9f9f9] border border-[#7e7576] text-base text-black resize-none transition-all duration-200 focus:border-2 focus:border-black focus:outline-none"
                    placeholder="Structure your response clearly using the STAR method (Situation, Task, Action, Result)..."
                    spellCheck="false"
                  ></textarea>

                  {/* Word count & Mic toggle */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="text-xs text-[#5e5e5e] bg-[#f9f9f9] px-2.5 py-1 border border-[#cfc4c5] font-semibold pointer-events-none">
                      {wordCount} words
                    </span>
                    {sttSupported ? (
                      <button
                        type="button"
                        title={listening ? 'Stop voice input' : 'Start voice input'}
                        onClick={toggleMic}
                        className={`flex items-center gap-1 px-2.5 py-1 border font-semibold text-xs transition-all ${
                          listening
                            ? 'border-black bg-black text-white'
                            : 'border-[#cfc4c5] bg-[#f9f9f9] text-[#5e5e5e] hover:border-black hover:text-black'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-sm ${
                          listening ? 'animate-pulse' : ''
                        }`}>
                          {listening ? 'mic' : 'mic_off'}
                        </span>
                        <span>{listening ? 'Listening…' : 'Voice'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[#5e5e5e] bg-[#f9f9f9] px-2.5 py-1 border border-[#cfc4c5] font-semibold text-xs pointer-events-none">
                        <span className="material-symbols-outlined text-sm">mic_off</span>
                        <span>No mic</span>
                      </div>
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
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <span className="text-sm text-[#5e5e5e]">
                No active interview session loaded. Please start a new session below.
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

        {/* Modal: Start New Custom AI Mock Interview */}
        {!interview && (
          <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="bg-[#f9f9f9] border-2 border-black max-w-md w-full p-6 flex flex-col gap-6 shadow-2xl">
              <div>
                <h3 className="text-xl font-bold text-black">Start AI Mock Interview</h3>
                <p className="text-xs text-[#5e5e5e] mt-1">
                  Select your active resume and target role to generate tailor-made interview questions.
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
                    <option value="">-- Choose Resume --</option>
                    {resumes.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.fileName || r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black">
                    Target Job Description
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    className="w-full bg-white border border-[#cfc4c5] p-3 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Choose Job --</option>
                    {jobs.map((j) => (
                      <option key={j._id || j.id} value={j._id || j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
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
                    {starting ? 'Generating AI Questions…' : 'START INTERVIEW'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Interview Performance Scorecard */}
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
                    {calculatedLiveScore}% Career Readiness Score
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
                            {typeof q.score === 'number' ? `${q.score}/100` : 'Skipped'}
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
