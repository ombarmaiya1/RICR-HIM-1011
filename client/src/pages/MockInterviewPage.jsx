import { useState, useEffect } from 'react'

/**
 * MockInterviewPage — Faithful reproduction of Stitch "Mock Interview Session" screen.
 * - Sharp architectural minimalist design language (0px radius, 1px/2px borders)
 * - Sidebar Context Panel (Target role, Active resume document, Live timer, Difficulty)
 * - Main Q&A Workspace (Question progress bar, AI question prompt, Textarea response box)
 * - Live word count calculation & Mic status
 * - Bottom Action Bar (Skip Question, Submit Answer)
 */
export default function MockInterviewPage({ onEndSession, onNavigate }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(2) // Question 3 of 5
  const [response, setResponse] = useState('')
  const [seconds, setSeconds] = useState(862) // 14:22 in seconds
  const [submitted, setSubmitted] = useState(false)

  const questions = [
    {
      type: 'Background & Experience',
      question:
        'Can you describe a challenging frontend architectural decision you had to make recently, and what tradeoffs were involved?',
    },
    {
      type: 'Core Competency',
      question:
        'How do you approach state management in complex client-side applications, and when do you reach for global state vs local component state?',
    },
    {
      type: 'Technical Deep Dive',
      question:
        'In your experience building large-scale React applications, what specific strategies have you employed to mitigate unnecessary re-renders in deeply nested component trees? Walk me through a concrete example where performance was critically impacted and how you resolved it.',
    },
    {
      type: 'System Design',
      question:
        'Design a real-time collaborative code editor interface. How would you handle state synchronization, optimistic UI updates, and conflict resolution?',
    },
    {
      type: 'Behavioral & Leadership',
      question:
        'Describe a situation where you disagreed with a product owner or technical lead regarding a feature specification. How did you resolve the conflict?',
    },
  ]

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainSecs = secs % 60
    return `${mins}:${remainSecs.toString().padStart(2, '0')}`
  }

  // Word count calculation
  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setResponse('')
      setSubmitted(false)
    } else {
      if (onNavigate) onNavigate('Analysis')
    }
  }

  const currentQ = questions[currentQuestionIndex]
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] h-screen w-screen overflow-hidden flex font-sans select-text">
      {/* Sidebar Context Panel (Desktop) */}
      <aside className="hidden md:flex flex-col w-80 bg-[#f3f3f3] border-r border-[#cfc4c5] h-full flex-shrink-0">
        {/* Brand / Header */}
        <div className="p-6 border-b border-[#cfc4c5]">
          <div className="text-xl font-bold text-black tracking-tighter uppercase font-sans">
            AI CAREER PRO
          </div>
          <p className="text-xs text-[#5e5e5e] mt-1 uppercase tracking-widest font-semibold">
            Interview Session
          </p>
        </div>

        {/* Session Context */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Target Role */}
          <div>
            <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
              Target Role
            </span>
            <div className="text-base font-semibold text-black">Senior Frontend Engineer</div>
            <div className="text-xs text-[#5e5e5e] mt-1">Systems Architecture Focus</div>
          </div>

          <hr className="border-t border-[#cfc4c5] w-full" />

          {/* Reference Material */}
          <div>
            <span className="text-xs text-[#5e5e5e] uppercase tracking-wider block mb-2 font-semibold">
              Active Context
            </span>
            <div className="flex items-center gap-2 p-2 bg-[#f9f9f9] border border-[#cfc4c5]">
              <span className="material-symbols-outlined text-lg text-[#5e5e5e]">description</span>
              <span className="text-sm font-semibold text-black truncate">
                J_Doe_Resume_2024_Tech.pdf
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
              <span className="text-[#5e5e5e]">Difficulty</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 bg-black"></div>
                <div className="w-2.5 h-2.5 bg-black"></div>
                <div className="w-2.5 h-2.5 bg-black"></div>
                <div className="w-2.5 h-2.5 bg-[#cfc4c5]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* End Session Button */}
        <div className="p-6 border-t border-[#cfc4c5] bg-[#f9f9f9]">
          <button
            type="button"
            onClick={onEndSession || (() => onNavigate && onNavigate('Dashboard'))}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-black text-black text-sm font-semibold uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            End Session Early
          </button>
        </div>
      </aside>

      {/* Main Interview Canvas */}
      <main className="flex-1 flex flex-col h-full relative bg-[#f9f9f9]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#cfc4c5] bg-[#f3f3f3]">
          <div>
            <h1 className="text-sm font-bold text-black tracking-tighter uppercase">AI CAREER PRO</h1>
            <p className="text-xs text-[#5e5e5e]">Senior Frontend Engineer</p>
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
        <div className="w-full bg-[#f9f9f9] border-b border-[#cfc4c5] pt-8 px-6 md:px-10 pb-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-xs font-semibold text-black uppercase tracking-widest">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <span className="text-xs text-[#5e5e5e]">{currentQ.type}</span>
            </div>
            {/* Architectural progress bar */}
            <div className="w-full h-1 bg-[#e2e2e2] overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500 ease-in-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Scrollable Q&A Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 h-full">
            {/* AI Question Area */}
            <section className="flex flex-col gap-2 fade-up">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <span className="text-xs text-[#5e5e5e] uppercase tracking-wider font-semibold">
                  Interviewer (AI)
                </span>
              </div>
              <div className="border-l-2 border-black pl-6">
                <p className="text-xl md:text-2xl font-semibold text-black leading-relaxed">
                  {currentQ.question}
                </p>
              </div>
            </section>

            {/* User Answer Input Area */}
            <section className="flex flex-col gap-2 flex-1 mt-4">
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
              <div className="relative flex-1 min-h-[280px]">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full h-full min-h-[280px] p-6 bg-[#f9f9f9] border border-[#7e7576] text-base text-black resize-none transition-all duration-200 focus:border-2 focus:border-black focus:outline-none"
                  placeholder="Structure your answer using the STAR method (Situation, Task, Action, Result)..."
                  spellCheck="false"
                ></textarea>

                {/* Word count & Mic status */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
                  <span className="text-xs text-[#5e5e5e] bg-[#f9f9f9] px-2.5 py-1 border border-[#cfc4c5] font-semibold">
                    {wordCount} words
                  </span>
                  <div className="flex items-center gap-1 text-[#5e5e5e] bg-[#f9f9f9] px-2.5 py-1 border border-[#cfc4c5] font-semibold">
                    <span className="material-symbols-outlined text-sm animate-pulse text-black">
                      mic
                    </span>
                    <span className="text-xs">Ready</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="w-full bg-[#f9f9f9] border-t border-[#cfc4c5] p-4 md:px-10 md:py-6 flex-shrink-0 z-10">
          <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-[#7e7576] text-black text-xs font-semibold uppercase tracking-wider hover:border-black transition-colors"
              >
                <span className="material-symbols-outlined text-lg">skip_next</span>
                Skip Question
              </button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(true)
                  setTimeout(handleNextQuestion, 800)
                }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#1b1b1b] transition-colors"
              >
                {submitted ? 'Submitting...' : 'Submit Answer'}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
