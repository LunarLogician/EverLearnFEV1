import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw, X, ChevronDown } from 'lucide-react'

const MODES = {
  focus:       { label: 'Focus',       duration: 25 * 60, color: 'emerald' },
  shortBreak:  { label: 'Short Break', duration:  5 * 60, color: 'sky'     },
  longBreak:   { label: 'Long Break',  duration: 15 * 60, color: 'violet'  },
}

const MODE_KEYS = ['focus', 'shortBreak', 'longBreak']
const FOCUS_ROUNDS_BEFORE_LONG = 4

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo.png' })
  }
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99] // C5 E5 G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55)
      osc.start(start)
      osc.stop(start + 0.6)
    })
  } catch (_) { /* AudioContext not available */ }
}

export default function StudyTimer() {
  const [open, setOpen] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [round, setRound] = useState(1)
  const [focusDone, setFocusDone] = useState(0) // completed focus rounds

  const intervalRef = useRef(null)
  const { color } = MODES[mode]

  const colorMap = {
    emerald: { ring: 'stroke-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500', pill: 'bg-emerald-600', btn: 'bg-emerald-500 hover:bg-emerald-400', tab: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    sky:     { ring: 'stroke-sky-500',     text: 'text-sky-500',     bg: 'bg-sky-500',     pill: 'bg-sky-600',     btn: 'bg-sky-500 hover:bg-sky-400',         tab: 'bg-sky-500/20 text-sky-400 border-sky-500/30'         },
    violet:  { ring: 'stroke-violet-500',  text: 'text-violet-500',  bg: 'bg-violet-500',  pill: 'bg-violet-600',  btn: 'bg-violet-500 hover:bg-violet-400',   tab: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  }
  const c = colorMap[color]

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
  }, [])

  const switchMode = useCallback((newMode) => {
    stop()
    setMode(newMode)
    setTimeLeft(MODES[newMode].duration)
  }, [stop])

  const handleTimerEnd = useCallback(() => {
    stop()
    playChime()
    if (mode === 'focus') {
      const newFocusDone = focusDone + 1
      setFocusDone(newFocusDone)
      if (newFocusDone % FOCUS_ROUNDS_BEFORE_LONG === 0) {
        sendNotification('Great work! 🎉', 'Time for a long break — you earned it.')
        setRound(r => r + 1)
        switchMode('longBreak')
      } else {
        sendNotification('Focus session done! ☕', 'Take a short break.')
        switchMode('shortBreak')
      }
    } else {
      sendNotification('Break over!', 'Ready to focus again?')
      switchMode('focus')
    }
  }, [mode, focusDone, stop, switchMode])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          // Use a small timeout so state updates don't conflict
          setTimeout(handleTimerEnd, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, handleTimerEnd])

  const toggleRunning = () => {
    if (!isRunning) requestNotificationPermission()
    setIsRunning(r => !r)
  }

  const reset = () => {
    stop()
    setTimeLeft(MODES[mode].duration)
  }

  const totalDuration = MODES[mode].duration
  const progress = (totalDuration - timeLeft) / totalDuration
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg text-white text-xs font-semibold ${c.pill} transition-all hover:scale-105`}
        title="Open Study Timer"
      >
        <Timer size={14} />
        <span>Timer</span>
      </button>
    )
  }

  if (minimised) {
    return (
      <button
        onClick={() => setMinimised(false)}
        className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg text-white text-xs font-bold ${c.pill} transition-all hover:scale-105`}
        title="Expand timer"
      >
        <span className={isRunning ? 'animate-pulse' : ''}>{formatTime(timeLeft)}</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 w-64 rounded-2xl shadow-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-1.5">
          <Timer size={13} className="text-white/50" />
          <span className="text-white/60 text-[11px] font-semibold uppercase tracking-wider">Study Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimised(true)}
            className="p-1 text-white/30 hover:text-white/70 transition-colors rounded"
            title="Minimise"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => { stop(); setOpen(false) }}
            className="p-1 text-white/30 hover:text-white/70 transition-colors rounded"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 px-3 pt-3">
        {MODE_KEYS.map(k => (
          <button
            key={k}
            onClick={() => switchMode(k)}
            className={`flex-1 text-[10px] font-semibold py-1 rounded-md border transition-all ${
              mode === k
                ? c.tab
                : 'bg-white/[0.04] text-white/30 border-transparent hover:text-white/50'
            }`}
          >
            {MODES[k].label}
          </button>
        ))}
      </div>

      {/* Circle clock */}
      <div className="flex flex-col items-center py-5">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="5" />
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              className={c.ring}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold tabular-nums ${c.text}`}>{formatTime(timeLeft)}</span>
            <span className="text-white/30 text-[10px] mt-0.5">{MODES[mode].label}</span>
          </div>
        </div>

        <p className="text-white/25 text-[10px] mt-1">Round {round} · {focusDone % FOCUS_ROUNDS_BEFORE_LONG} / {FOCUS_ROUNDS_BEFORE_LONG} focus blocks</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pb-4">
        <button
          onClick={reset}
          className="p-2 rounded-full text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={toggleRunning}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-md transition-all hover:scale-105 ${c.btn}`}
        >
          {isRunning ? <Pause size={15} /> : <Play size={15} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  )
}
