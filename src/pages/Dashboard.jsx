import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { SEOHelmet } from '../components/SEOHelmet'
import { quizService, flashcardService, chatService, subscriptionService, mcqService, documentService, examPaperService } from '../services'
import AuthModal from '../components/AuthModal'
import { ExamPaperGeneratorModal, ExamPaperViewModal } from './ExamPaperPage'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  MessageSquare, BookOpen, Layers, FileText, LogOut, Plus,
  ChevronRight, Trophy, Zap, Target, X, Loader2, CheckCircle,
  AlertCircle, BarChart2, Clock, Star, Upload, Paperclip, Trash2,
  ClipboardList, GraduationCap, Brain, Sparkles, Calendar,
  TrendingUp, Award, Flame, Eye
} from 'lucide-react'

// ── Quiz Generator Modal ──────────────────────────────────────────────────────
function QuizModal({ onClose, onCreated, onStartQuiz }) {
  const [mode, setMode] = useState('topic')
  const [topic, setTopic] = useState('')
  const [file, setFile] = useState(null)
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (mode === 'topic' && !topic.trim()) return
    if (mode === 'topic' && topic.length > 2000) return
    if (mode === 'file' && !file) return
    setLoading(true); setError(null)
    try {
      let data
      if (mode === 'file') {
        data = await quizService.generateFromFile(file, count, difficulty)
      } else {
        data = await quizService.generateFromText(topic.trim(), count, difficulty, topic.trim())
      }
      setResult(data.quiz)
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-emerald-300" />
            <h2 className="text-white font-bold text-base">Generate Quiz</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-700" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-1">{result.quizTitle}</h3>
            <p className="text-slate-500 text-sm mb-6">{result.totalQuestions} questions · {difficulty}</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              {result.questions?.slice(0, 3).map((q, i) => (
                <p key={i} className="text-xs text-slate-600 truncate">
                  <span className="font-semibold text-emerald-700 mr-1">{i + 1}.</span>{q.question}
                </p>
              ))}
              {result.totalQuestions > 3 && (
                <p className="text-xs text-slate-400">+ {result.totalQuestions - 3} more questions</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Generate Another
              </button>
              <button
                onClick={() => { onStartQuiz(result); onClose() }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap size={13} /> Take Quiz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => { setMode('topic'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'topic' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Zap size={13} /> Topic
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'file' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Paperclip size={13} /> File
              </button>
            </div>

            {mode === 'topic' ? (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. World War II, Photosynthesis, Algebra..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder-slate-400 ${topic.length > 2000 ? 'border-red-400' : 'border-gray-200'}`}
                  autoFocus
                />
                {topic.length > 1600 && (
                  <p className={`text-xs mt-1 text-right ${topic.length > 2000 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                    {topic.length.toLocaleString()}/2,000
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Upload File</label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-slate-50'}`}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.pptx"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files[0] || null
                      if (f && f.size > 10 * 1024 * 1024) {
                        setError('File must be under 10 MB')
                        return
                      }
                      setFile(f); setError(null)
                    }}
                  />
                  {file ? (
                    <>
                      <CheckCircle size={22} className="text-emerald-600 mb-1" />
                      <p className="text-sm font-semibold text-emerald-700 truncate max-w-[220px]">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB · click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500">PDF, DOCX, DOC, PPTX</p>
                      <p className="text-xs text-slate-400">up to 10 MB</p>
                    </>
                  )}
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Questions</label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || (mode === 'topic' ? !topic.trim() || topic.length > 2000 : !file)}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Zap size={16} /> Generate Quiz</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

// ── Quiz Take Modal ───────────────────────────────────────────────────────────
function shuffleQuizOptions(questions) {
  return questions.map(q => {
    let correctIdx = 0
    const ca = q.correctAnswer
    if (typeof ca === 'number') {
      correctIdx = ca
    } else if (typeof ca === 'string') {
      const upper = ca.trim().toUpperCase()
      if (['A','B','C','D'].includes(upper)) {
        correctIdx = upper.charCodeAt(0) - 65
      } else {
        const found = q.options.findIndex(o => o.trim().toLowerCase() === ca.trim().toLowerCase())
        correctIdx = found >= 0 ? found : 0
      }
    }
    const opts = [...q.options]
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]]
    }
    const newCorrectIdx = opts.indexOf(q.options[correctIdx])
    return { ...q, options: opts, correctAnswer: newCorrectIdx }
  })
}

function QuizTakeModal({ quiz, onClose }) {
  const [questions] = useState(() => shuffleQuizOptions(quiz.questions))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [selections, setSelections] = useState([])
  const [answered, setAnswered] = useState([])
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [aiFeedback, setAiFeedback] = useState(null)

  const q = questions[current]
  const score = answered.filter(a => a.correct).length
  const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = idx === correctIdx
    setAnswered(prev => [...prev, {
      correct: isCorrect,
      questionText: q.question,
      yourAnswer: q.options[idx],
      correctAnswer: q.options[correctIdx],
      explanation: q.explanation,
    }])
    setSelections(prev => [...prev, String(idx)])
  }

  const handleNext = async () => {
    const isLast = current + 1 >= questions.length
    if (isLast) {
      setDone(true)
      const quizId = quiz._id || quiz.id
      if (quizId) {
        setSubmitting(true)
        try {
          const data = await quizService.submitQuiz(quizId, [...selections, String(selected)])
          setAiFeedback(data.result?.feedback || null)
        } catch { /* ignore */ }
        finally { setSubmitting(false) }
      }
      return
    }
    setCurrent(c => c + 1)
    setSelected(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm truncate max-w-[260px]">{quiz.quizTitle}</h2>
            {!done && <p className="text-emerald-300 text-xs mt-0.5">{current + 1} / {questions.length}</p>}
          </div>
          <button onClick={onClose} disabled={submitting} className="text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><X size={18} /></button>
        </div>

        {!done && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((current) / questions.length) * 100}%` }}
            />
          </div>
        )}

        {done ? (
          <div className="overflow-y-auto max-h-[80vh]">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy size={28} className="text-emerald-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-1">{score}/{questions.length}</h3>
              <p className="text-slate-500 text-sm">
                {Math.round((score / questions.length) * 100)}% correct
                {score === questions.length ? ' 🎉 Perfect!' : score >= questions.length * 0.7 ? ' 👍 Great job!' : ' 📚 Keep studying!'}
              </p>
            </div>

            {submitting && (
              <div className="mx-4 mt-4 bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-emerald-300 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold">Analysing your performance…</p>
                  <p className="text-emerald-400 text-[11px] mt-0.5">Saving results &amp; generating AI feedback</p>
                </div>
              </div>
            )}

            {aiFeedback && (
              <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Zap size={11} /> AI Feedback
                </p>
                <div className="prose prose-xs prose-emerald max-w-none text-slate-600 text-xs leading-relaxed
                  [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-slate-800 [&_h1]:mt-2 [&_h1]:mb-1
                  [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mt-2 [&_h2]:mb-1
                  [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-slate-700 [&_h3]:mt-1.5
                  [&_p]:mb-1.5 [&_p]:leading-relaxed
                  [&_ul]:pl-4 [&_ul]:mb-1.5 [&_ul]:space-y-0.5
                  [&_ol]:pl-4 [&_ol]:mb-1.5 [&_ol]:space-y-0.5
                  [&_li]:text-xs [&_li]:text-slate-600
                  [&_strong]:text-slate-800 [&_strong]:font-semibold
                  [&_hr]:border-emerald-200 [&_hr]:my-2">
                  <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                </div>
              </div>
            )}
            {submitting && !aiFeedback && (
              <div className="mx-4 mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-slate-500">Generating AI feedback…</p>
              </div>
            )}

            {answered.filter(a => !a.correct).length > 0 && (
              <div className="px-4 mt-4 mb-2">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Review — {answered.filter(a => !a.correct).length} wrong answer{answered.filter(a => !a.correct).length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {answered.filter(a => !a.correct).map((a, i) => (
                    <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2 leading-snug">{a.questionText}</p>
                      <div className="flex items-start gap-1.5 mb-1">
                        <span className="flex-shrink-0 text-[10px] font-bold text-red-500 bg-red-100 rounded px-1 py-0.5 mt-0.5">YOUR</span>
                        <p className="text-xs text-red-600">{a.yourAnswer}</p>
                      </div>
                      <div className="flex items-start gap-1.5 mb-2">
                        <span className="flex-shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-100 rounded px-1 py-0.5 mt-0.5">CORRECT</span>
                        <p className="text-xs text-emerald-700 font-medium">{a.correctAnswer}</p>
                      </div>
                      {a.explanation && (
                        <p className="text-[11px] text-slate-500 leading-relaxed border-t border-red-200 pt-2 mt-1">
                          {a.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {score === quiz.questions.length && (
              <p className="text-center text-xs text-emerald-600 font-semibold mt-4">🏆 Perfect score — all answers correct!</p>
            )}

            <div className="p-4">
              <button
                onClick={onClose}
                disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Analysing…
                  </span>
                ) : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-slate-800 font-semibold text-base leading-relaxed mb-5">{q.question}</p>
            <div className="space-y-2.5 mb-5">
              {q.options.map((opt, i) => {
                let style = 'border-gray-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                if (selected !== null) {
                  if (i === correctIdx) style = 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  else if (i === selected && selected !== correctIdx) style = 'border-red-400 bg-red-50 text-red-700'
                  else style = 'border-gray-100 text-slate-400'
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${style} ${selected === null ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className="font-bold mr-2 text-xs">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div className={`text-xs rounded-xl p-3 mb-4 ${selected === correctIdx ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <strong>{selected === correctIdx ? '✓ Correct!' : '✗ Incorrect.'}</strong> {q.explanation}
              </div>
            )}
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
            >
              {current + 1 === questions.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Flashcard Generator Modal ─────────────────────────────────────────────────
function FlashcardGeneratorModal({ onClose, onCreated, onStudyNow }) {
  const [mode, setMode] = useState('topic')
  const [topic, setTopic] = useState('')
  const [file, setFile] = useState(null)
  const [count, setCount] = useState(10)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (mode === 'topic' && !topic.trim()) return
    if (mode === 'topic' && topic.length > 2000) return
    if (mode === 'file' && !file) return
    setLoading(true); setError(null)
    try {
      let data
      if (mode === 'file') {
        data = await flashcardService.generateFromFile(file, count, difficulty)
      } else {
        data = await flashcardService.generateFromText(topic.trim(), count, difficulty)
      }
      setResult(data.flashcard)
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate flashcards. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-amber-300" />
            <h2 className="text-white font-bold text-base">Generate Flashcards</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-amber-700" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-1">{result.setTitle}</h3>
            <p className="text-slate-500 text-sm mb-6">{result.totalCards} cards · {difficulty}</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              {result.cards?.slice(0, 3).map((c, i) => (
                <p key={i} className="text-xs text-slate-600 truncate">
                  <span className="font-semibold text-amber-700 mr-1">{i + 1}.</span>{c.front}
                </p>
              ))}
              {result.totalCards > 3 && (
                <p className="text-xs text-slate-400">+ {result.totalCards - 3} more cards</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Generate Another
              </button>
              <button
                onClick={() => { onStudyNow(result); onClose() }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Layers size={13} /> Study Now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => { setMode('topic'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'topic' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Zap size={13} /> Topic
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'file' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Paperclip size={13} /> File
              </button>
            </div>

            {mode === 'topic' ? (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, French Revolution, Calculus..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-slate-400 ${topic.length > 2000 ? 'border-red-400' : 'border-gray-200'}`}
                  autoFocus
                />
                {topic.length > 1600 && (
                  <p className={`text-xs mt-1 text-right ${topic.length > 2000 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                    {topic.length.toLocaleString()}/2,000
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Upload File</label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-400 hover:bg-slate-50'}`}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.pptx"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files[0] || null
                      if (f && f.size > 10 * 1024 * 1024) {
                        setError('File must be under 10 MB')
                        return
                      }
                      setFile(f); setError(null)
                    }}
                  />
                  {file ? (
                    <>
                      <CheckCircle size={22} className="text-amber-600 mb-1" />
                      <p className="text-sm font-semibold text-amber-700 truncate max-w-[220px]">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB · click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500">PDF, DOCX, DOC, PPTX</p>
                      <p className="text-xs text-slate-400">up to 10 MB</p>
                    </>
                  )}
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Cards</label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n} cards</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || (mode === 'topic' ? !topic.trim() || topic.length > 2000 : !file)}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Layers size={16} /> Generate Flashcards</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

// ── Flashcard Viewer Modal ────────────────────────────────────────────────────
function FlashcardModal({ set, onClose }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = set.cards[idx]

  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => Math.min(i + 1, set.cards.length - 1)), 150) }
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => Math.max(i - 1, 0)), 150) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm truncate max-w-[260px]">{set.setTitle}</h2>
            <p className="text-emerald-300 text-xs mt-0.5">{idx + 1} / {set.cards.length}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((idx + 1) / set.cards.length) * 100}%` }} />
        </div>
        <div className="p-6">
          <div className="flip-scene">
            <div
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              onClick={() => setFlipped(f => !f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setFlipped(f => !f)
                }
              }}
              className={`flip-card ${flipped ? 'is-flipped' : ''}`}
            >
              <div className="flip-face flip-front bg-slate-50 border-slate-200 hover:border-emerald-300">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-400">
                  Question — tap to flip
                </p>
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-800">
                  {card.front}
                </p>
              </div>
              <div className="flip-face flip-back bg-gradient-to-r from-emerald-700 to-emerald-800 border-emerald-700">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-emerald-400">
                  Answer
                </p>
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-white">
                  {card.back}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5">
            <button onClick={prev} disabled={idx === 0} className="px-4 py-2 rounded-xl border border-gray-200 text-slate-500 text-sm hover:bg-gray-50 disabled:opacity-30 transition-colors">← Prev</button>
            <button onClick={() => setFlipped(f => !f)} className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors">Flip</button>
            <button onClick={next} disabled={idx === set.cards.length - 1} className="px-4 py-2 rounded-xl border border-gray-200 text-slate-500 text-sm hover:bg-gray-50 disabled:opacity-30 transition-colors">Next →</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── MCQ Generator Modal ───────────────────────────────────────────────────────
function MCQGeneratorModal({ onClose, onCreated, onStartMCQ }) {
  const [mode, setMode] = useState('text');
  const [sourceText, setSourceText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (mode === 'document' && documents.length === 0) {
      loadDocuments();
    }
  }, [mode]);

  const loadDocuments = async () => {
    try {
      const data = await documentService.getUserDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (mode === 'text' && !sourceText.trim()) return;
    if (mode === 'file' && !selectedFile) return;
    if (mode === 'document' && !selectedDocument) return;

    setLoading(true); setError(null);
    try {
      let data;
      if (mode === 'document') {
        data = await mcqService.generateFromDocument(
          selectedDocument,
          parseInt(numQuestions),
          title
        );
      } else if (mode === 'file') {
        data = await mcqService.generateFromFile(
          selectedFile,
          parseInt(numQuestions),
          title || `MCQ from ${selectedFile.name}`
        );
      } else {
        data = await mcqService.generateFromText(
          sourceText,
          parseInt(numQuestions),
          title || `MCQ Set - ${new Date().toLocaleDateString()}`
        );
      }
      setResult(data);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate MCQs. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-purple-300" />
            <h2 className="text-white font-bold text-base">Generate MCQs</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-purple-700" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-1">{result.title}</h3>
            <p className="text-slate-500 text-sm mb-6">{result.questions?.length || numQuestions} questions</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              {result.questions?.slice(0, 3).map((q, i) => (
                <p key={i} className="text-xs text-slate-600 truncate">
                  <span className="font-semibold text-purple-700 mr-1">{i + 1}.</span>{q.question}
                </p>
              ))}
              {result.questions?.length > 3 && (
                <p className="text-xs text-slate-400">+ {result.questions.length - 3} more questions</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Generate Another
              </button>
              <button
                onClick={() => { onStartMCQ(result); onClose() }}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap size={13} /> Take MCQ
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('text'); setError(null) }}
                className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === 'text' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Zap size={13} /> Text
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null); setSelectedFile(null) }}
                className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === 'file' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Upload size={13} /> File
              </button>
              <button
                type="button"
                onClick={() => { setMode('document'); setError(null) }}
                className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === 'document' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Paperclip size={13} /> Document
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Biology Chapter 3"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 placeholder-slate-400"
              />
            </div>

            {mode === 'text' ? (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Source Text</label>
                <textarea
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="Paste your study material here..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 placeholder-slate-400 h-24 resize-none ${sourceText.length > 50000 ? 'border-red-400' : 'border-gray-200'}`}
                  autoFocus
                />
                {sourceText.length > 40000 && (
                  <p className={`text-xs mt-1 text-right ${sourceText.length > 50000 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                    {sourceText.length.toLocaleString()}/50,000
                  </p>
                )}
              </div>
            ) : mode === 'file' ? (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Upload File (PDF, DOCX, DOC, PPTX)</label>
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.pptx"
                    onChange={e => {
                      const f = e.target.files?.[0] || null
                      if (f && f.size > 10 * 1024 * 1024) {
                        setError('File must be under 10 MB')
                        return
                      }
                      setSelectedFile(f); setError(null)
                    }}
                    className="hidden"
                    id="mcq-file-input"
                  />
                  <label htmlFor="mcq-file-input" className="cursor-pointer block">
                    <Upload size={20} className="mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, DOC, or PPTX (max 10MB)</p>
                    {selectedFile && (
                      <p className="text-xs text-purple-600 font-semibold mt-2">✓ {selectedFile.name}</p>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Select Document</label>
                <select
                  value={selectedDocument}
                  onChange={e => setSelectedDocument(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                >
                  <option value="">Choose a document...</option>
                  {documents.map(doc => (
                    <option key={doc._id} value={doc._id}>{doc.title}</option>
                  ))}
                </select>
                {documents.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">No documents found. Upload one first!</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Questions</label>
              <select
                value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
              >
                {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || (mode === 'text' ? !sourceText.trim() || sourceText.length > 50000 : mode === 'file' ? !selectedFile : !selectedDocument)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Zap size={16} /> Generate MCQs</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── MCQ Take Modal ────────────────────────────────────────────────────────────
function MCQTakeModal({ mcq, onClose, onComplete }) {
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const answeredCount = Object.keys(selections).length;
  const total = mcq.questions.length;
  const score = results ? results.filter(r => r.isCorrect).length : 0;

  const handleSelect = (questionIdx, option) => {
    if (submitted) return;
    setSelections(prev => ({ ...prev, [questionIdx]: option }));
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const userAnswers = mcq.questions.map((_, idx) => selections[idx] || null);
      const res = await mcqService.submitAnswers(mcq._id || mcq.mcqId, userAnswers);
      setResults(res.results);
      setSubmitted(true);
      onComplete?.({ score: res.score, total: res.totalQuestions });
    } catch (err) {
      setError('Failed to submit answers. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full sm:rounded-2xl sm:my-6 sm:mx-4 shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]"
      >
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-white font-bold text-sm sm:text-base truncate">{mcq.title}</h2>
            <p className="text-purple-300 text-xs mt-0.5">{total} Questions</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-white/50 hover:text-white disabled:opacity-30 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {!submitted && (
          <div className="h-1 bg-purple-100 flex-shrink-0">
            <div className="h-full bg-purple-400 transition-all duration-300" style={{ width: `${(answeredCount / total) * 100}%` }} />
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
          {mcq.questions.map((q, questionIdx) => {
            const userAnswer = selections[questionIdx];
            const correctAnswer = results?.[questionIdx]?.correctAnswer?.toUpperCase();
            const isCorrect = results?.[questionIdx]?.isCorrect;
            const explanation = results?.[questionIdx]?.explanation;

            return (
              <div key={questionIdx} className="border-b border-gray-100 pb-6 sm:pb-8 last:border-b-0">
                <div className="mb-3 sm:mb-4">
                  <span className="inline-block text-[10px] sm:text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mb-2">Q{questionIdx + 1}</span>
                  <p className="text-slate-800 font-semibold text-sm sm:text-base leading-relaxed">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const optionLabel = String.fromCharCode(65 + optIdx);
                    const isSelected = userAnswer === optionLabel;
                    let style = 'border-gray-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50';
                    if (submitted) {
                      if (optionLabel === correctAnswer) style = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                      else if (isSelected && !isCorrect) style = 'border-red-400 bg-red-50 text-red-700';
                      else style = 'border-gray-100 text-slate-400';
                    } else if (isSelected) {
                      style = 'border-purple-500 bg-purple-50 text-purple-800';
                    }
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(questionIdx, optionLabel)}
                        disabled={submitted}
                        className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-2 ${style} ${!submitted ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
                      >
                        <span className="font-bold text-xs flex-shrink-0 mt-0.5">{optionLabel}.</span>
                        <span className="flex-1">{opt}</span>
                        {submitted && optionLabel === correctAnswer && <span className="text-emerald-600 flex-shrink-0">✓</span>}
                        {submitted && isSelected && !isCorrect && <span className="text-red-500 flex-shrink-0">✗</span>}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`mt-3 text-xs rounded-xl p-3 ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <strong>{isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong>
                    {explanation && <span className="ml-1">{explanation}</span>}
                  </div>
                )}
              </div>
            );
          })}

          {submitted && (
            <div className="text-center pt-2 pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-3">
                <CheckCircle size={30} className="text-purple-600" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800">{score}/{total}</h3>
              <p className="text-slate-500 text-sm mt-1">
                {Math.round((score / total) * 100)}% correct
                {score === total ? '🎉' : score >= total * 0.7 ? '👍' : '📚'}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 flex-shrink-0 bg-white">
          {error && <p className="text-xs text-red-500 flex items-center gap-1 justify-center"><AlertCircle size={12} /> {error}</p>}
          <div className="flex gap-2 sm:gap-3">
            {submitted ? (
              <button onClick={onClose} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold text-sm transition-all">
                Close
              </button>
            ) : (
              <>
                <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount === 0 || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : `Submit${answeredCount > 0 ? ` (${answeredCount}/${total})` : ''}`}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="flex-1 pr-5">
          <div className="h-3.5 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-2.5 bg-slate-100 rounded w-20" />
        <div className="h-2.5 bg-slate-100 rounded w-16" />
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout, streak } = useAuth()
  const { chatCount, tokenCount, hasUnlimitedChats, userPlan: chatUserPlan, fetchChatCount, statsLoading } = useChat()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [quizzes, setQuizzes] = useState([])
  const [flashcardSets, setFlashcardSets] = useState([])
  const [mcqs, setMcqs] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [showFlashcardModal, setShowFlashcardModal] = useState(false)
  const [showMCQModal, setShowMCQModal] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [activeFlashSet, setActiveFlashSet] = useState(null)
  const [activeMCQ, setActiveMCQ] = useState(null)
  const [loadingFlashSet, setLoadingFlashSet] = useState(null)
  const [deletingFlashSetId, setDeletingFlashSetId] = useState(null)
  const [loadingQuizId, setLoadingQuizId] = useState(null)
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [loadingMCQId, setLoadingMCQId] = useState(null)
  const [deletingMcqId, setDeletingMcqId] = useState(null)
  const [examPapers, setExamPapers] = useState([])
  const [loadingExamPaperId, setLoadingExamPaperId] = useState(null)
  const [deletingExamPaperId, setDeletingExamPaperId] = useState(null)
  const [activeExamPaper, setActiveExamPaper] = useState(null)
  const [showExamPaperModal, setShowExamPaperModal] = useState(false)
  const [userPlan, setUserPlan] = useState('free')

  const progressRef = useRef(null)

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ME'

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const getCacheKey = () => `dashboard_data_${user?._id || ''}`
  const invalidateCache = () => { try { localStorage.removeItem(getCacheKey()) } catch {} }

  const loadData = async (force = false) => {
    if (!force) {
      try {
        const cached = localStorage.getItem(getCacheKey())
        if (cached) {
          const { data, ts } = JSON.parse(cached)
          setQuizzes(data.quizzes || [])
          setFlashcardSets(data.flashcards || [])
          setMcqs(data.mcqs || [])
          setExamPapers(data.examPapers || [])
          setUserPlan(data.userPlan || 'free')
          fetchChatCount()
          if (Date.now() - ts < 5 * 60 * 1000) return
          loadData(true)
          return
        }
      } catch {}
    }
    setDataLoading(true)
    fetchChatCount()
    try {
      const [qData, fData, mData, subData, epData] = await Promise.all([
        quizService.getUserQuizzes(),
        flashcardService.getUserFlashcards(),
        mcqService.getMCQs().catch(() => ({ mcqs: [] })),
        subscriptionService.getSubscription().catch(() => null),
        examPaperService.list().catch(() => ({})),
      ])
      const quizzes = qData.quizzes || []
      const flashcards = fData.flashcards || []
      const mcqs = mData.mcqs || []
      const examPapers = epData.exams || epData.examPapers || epData.papers || []
      const userPlan = subData?.subscription?.plan || 'free'
      setQuizzes(quizzes)
      setFlashcardSets(flashcards)
      setMcqs(mcqs)
      setExamPapers(examPapers)
      setUserPlan(userPlan)
      try {
        localStorage.setItem(getCacheKey(), JSON.stringify({
          data: { quizzes, flashcards, mcqs, examPapers, userPlan },
          ts: Date.now(),
        }))
      } catch {}
    } catch { /* silently ignore */ }
    finally { setDataLoading(false) }
  }

  const openFlashcardSet = async (id) => {
    setLoadingFlashSet(id)
    try {
      const data = await flashcardService.getFlashcardSet(id)
      setActiveFlashSet(data.flashcard)
    } catch { /* ignore */ }
    finally { setLoadingFlashSet(null) }
  }

  const deleteFlashcardSet = async (e, setId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this flashcard set? This cannot be undone.')) return
    setDeletingFlashSetId(setId)
    try {
      await flashcardService.deleteFlashcardSet(setId)
      setFlashcardSets(prev => prev.filter(s => s._id !== setId))
      invalidateCache()
    } catch { /* ignore */ }
    finally { setDeletingFlashSetId(null) }
  }

  const deleteQuiz = async (e, quizId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return
    setDeletingQuizId(quizId)
    try {
      await quizService.deleteQuiz(quizId)
      setQuizzes(prev => prev.filter(q => q._id !== quizId))
      invalidateCache()
    } catch { /* ignore */ }
    finally { setDeletingQuizId(null) }
  }

  const deleteMCQ = async (e, mcqId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this MCQ? This cannot be undone.')) return
    setDeletingMcqId(mcqId)
    try {
      await mcqService.deleteMCQ(mcqId)
      setMcqs(prev => prev.filter(m => m._id !== mcqId))
      invalidateCache()
    } catch { /* ignore */ }
    finally { setDeletingMcqId(null) }
  }

  const openExamPaper = async (paperOrObj) => {
    if (paperOrObj.questions) { setActiveExamPaper(paperOrObj); return }
    const id = paperOrObj._id
    setLoadingExamPaperId(id)
    try {
      const data = await examPaperService.getExamPaper(id)
      setActiveExamPaper(data.exam || data.examPaper)
    } catch { /* ignore */ }
    finally { setLoadingExamPaperId(null) }
  }

  const deleteExamPaper = async (e, examId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this exam paper? This cannot be undone.')) return
    setDeletingExamPaperId(examId)
    try {
      await examPaperService.deleteExamPaper(examId)
      setExamPapers(prev => prev.filter(p => p._id !== examId))
      invalidateCache()
    } catch { /* ignore */ }
    finally { setDeletingExamPaperId(null) }
  }

  const openQuiz = async (quizOrId) => {
    if (quizOrId.questions) { setActiveQuiz(quizOrId); return }
    const id = quizOrId._id || quizOrId
    setLoadingQuizId(id)
    try {
      const data = await quizService.getQuiz(id)
      setActiveQuiz(data.quiz)
    } catch { /* ignore */ }
    finally { setLoadingQuizId(null) }
  }

  const openMCQ = async (mcqOrId) => {
    if (mcqOrId.questions) { setActiveMCQ(mcqOrId); return }
    const id = mcqOrId._id || mcqOrId
    setLoadingMCQId(id)
    try {
      const data = await mcqService.getMCQ(id)
      setActiveMCQ(data.mcq)
    } catch { /* ignore */ }
    finally { setLoadingMCQId(null) }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  const featureCards = [
    {
      icon: <MessageSquare size={22} />,
      label: 'AI Chat',
      description: 'Ask anything — homework, concepts, exam prep',
      color: 'from-blue-600 to-blue-700',
      light: 'bg-blue-50 border-blue-100',
      textColor: 'text-blue-700',
      action: () => navigate('/chat'),
      actionLabel: 'Open Chat',
      stat: '24/7 AI Tutor',
    },
    {
      icon: <Target size={22} />,
      label: 'Quiz Generator',
      description: 'AI-generated quizzes from any topic instantly',
      color: 'from-violet-600 to-violet-700',
      light: 'bg-violet-50 border-violet-100',
      textColor: 'text-violet-700',
      stat: `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} created`,
      action: () => {
        if (!user) { setShowAuthModal(true); return }
        if (userPlan !== 'pro') {
          window.dispatchEvent(new CustomEvent('upgrade:required', { detail: { requiredPlan: 'pro', currentPlan: userPlan } }))
          return
        }
        setShowQuizModal(true)
      },
      actionLabel: userPlan === 'pro' ? 'Generate Quiz' : 'Upgrade to Pro',
    },
    {
      icon: <Layers size={22} />,
      label: 'Flashcards',
      description: 'AI-generated flashcard sets from any topic or file',
      color: 'from-amber-600 to-amber-700',
      light: 'bg-amber-50 border-amber-100',
      textColor: 'text-amber-700',
      stat: `${flashcardSets.length} set${flashcardSets.length !== 1 ? 's' : ''} created`,
      action: () => {
        if (!user) { setShowAuthModal(true); return }
        if (userPlan !== 'pro') {
          window.dispatchEvent(new CustomEvent('upgrade:required', { detail: { requiredPlan: 'pro', currentPlan: userPlan } }))
          return
        }
        setShowFlashcardModal(true)
      },
      actionLabel: userPlan === 'pro' ? 'Generate Flashcards' : 'Upgrade to Pro',
    },
    {
      icon: <BookOpen size={22} />,
      label: 'MCQ Generator',
      description: 'Generate multiple-choice questions from any text',
      color: 'from-indigo-600 to-indigo-700',
      light: 'bg-indigo-50 border-indigo-100',
      textColor: 'text-indigo-700',
      stat: `${mcqs.length} mcq${mcqs.length !== 1 ? 's' : ''} created`,
      action: () => {
        if (!user) { setShowAuthModal(true); return }
        if (userPlan !== 'pro') {
          window.dispatchEvent(new CustomEvent('upgrade:required', { detail: { requiredPlan: 'pro', currentPlan: userPlan } }))
          return
        }
        setShowMCQModal(true)
      },
      actionLabel: userPlan === 'pro' ? 'Create MCQs' : 'Upgrade to Pro',
    },
    {
      icon: <FileText size={22} />,
      label: 'Assignment Help',
      description: 'Generate and rewrite assignments with AI',
      color: 'from-rose-600 to-rose-700',
      light: 'bg-rose-50 border-rose-100',
      textColor: 'text-rose-700',
      stat: 'AI-powered writing',
      action: () => navigate('/chat'),
      actionLabel: 'Get Help',
    },
    {
      icon: <GraduationCap size={22} />,
      label: 'Document Q&A',
      description: 'Upload PDFs, DOCX, PPTX and chat with them',
      color: 'from-emerald-600 to-emerald-700',
      light: 'bg-emerald-50 border-emerald-100',
      textColor: 'text-emerald-700',
      stat: 'PDF, DOCX, PPTX',
      action: () => navigate('/chat'),
      actionLabel: 'Upload & Chat',
    },
    {
      icon: <ClipboardList size={22} />,
      label: 'Exam Papers',
      description: 'Generate full exam papers with MCQs, short & long answers',
      color: 'from-teal-600 to-teal-700',
      light: 'bg-teal-50 border-teal-100',
      textColor: 'text-teal-700',
      stat: `${examPapers.length} paper${examPapers.length !== 1 ? 's' : ''} created`,
      action: () => {
        if (!user) { setShowAuthModal(true); return }
        if (userPlan !== 'pro') {
          window.dispatchEvent(new CustomEvent('upgrade:required', { detail: { requiredPlan: 'pro', currentPlan: userPlan } }))
          return
        }
        navigate('/exam-papers')
      },
      actionLabel: userPlan === 'pro' ? 'Open Exam Papers' : 'Upgrade to Pro',
    },
    {
      icon: <BarChart2 size={22} />,
      label: 'Progress',
      description: 'Track your study streaks and activity across all tools',
      color: 'from-cyan-600 to-cyan-700',
      light: 'bg-cyan-50 border-cyan-100',
      textColor: 'text-cyan-700',
      stat: streak > 0 ? `🔥 ${streak} day streak` : 'View stats',
      action: user ? () => progressRef.current?.scrollIntoView({ behavior: 'smooth' }) : null,
      actionLabel: user ? 'View Progress' : 'Sign in to track',
    },
  ]

  // CSS for flip cards
  const flipStyles = `
    .flip-scene {
      perspective: 1000px;
    }
    .flip-card {
      position: relative;
      width: 100%;
      height: 280px;
      text-align: center;
      transition: transform 0.6s;
      transform-style: preserve-3d;
      cursor: pointer;
    }
    .flip-card.is-flipped {
      transform: rotateY(180deg);
    }
    .flip-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .flip-front {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .flip-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #065f46, #047857);
      color: white;
    }
  `

  return (
    <>
      <style>{flipStyles}</style>
      <SEOHelmet 
        title="Student Dashboard - Track Progress - EverlearnAI"
        description="Track your study progress, token usage, and quiz scores in one place. Monitor your learning journey."
        url="https://everlearn.ai/dashboard"
        keywords="dashboard, progress tracking, study stats, performance analytics"
      />
      <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-500/20">

      {/* ── Top Navbar ── */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-emerald-50 flex items-center justify-center p-1.5">
            <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-sm leading-none mb-0.5">Everlearn</p>
            <p className="text-emerald-600 font-semibold tracking-wider text-[9px] uppercase leading-none">AI Study Hub</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-slate-700 text-xs font-semibold rounded-lg bg-emerald-50 border border-emerald-200"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/exam-papers')}
            className="px-4 py-2 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            Exam Papers
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            AI Chat
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-gray-200">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{userInitials}</span>
                </div>
                <span className="text-slate-700 text-xs font-medium pr-1">{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-8 py-8 md:py-12">

        {/* Welcome Section with Stats */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-[34px] font-extrabold text-slate-900 tracking-tight">
                {user ? (
                  <>Welcome back, <span className="bg-gradient-to-r from-emerald-700 to-emerald-800 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span> 👋</>
                ) : (
                  'Welcome to Everlearn 👋'
                )}
              </h1>
              <p className="text-slate-500 text-[15px] mt-1.5 font-medium max-w-xl">
                {user ? 'Your intelligent study hub is ready. Pick a tool below to continue learning.' : 'Sign in to unlock all features and start studying smarter.'}
              </p>
            </div>
            {user && streak > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Flame size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-700">{streak}</p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Day Streak</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats row - Student Focused */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-10"
          >
            {[
              { label: 'Study Sessions', value: tokenCount, icon: <Brain size={16} strokeWidth={2.5}/>, color: 'text-blue-600', iconBg: 'bg-blue-100', hoverBorder: 'hover:border-blue-200', loading: statsLoading },
              { label: 'Quizzes Taken', value: quizzes.length, icon: <Target size={16} strokeWidth={2.5}/>, color: 'text-violet-600', iconBg: 'bg-violet-100', hoverBorder: 'hover:border-violet-200' },
              { label: 'Flashcards', value: flashcardSets.length, icon: <Layers size={16} strokeWidth={2.5}/>, color: 'text-amber-600', iconBg: 'bg-amber-100', hoverBorder: 'hover:border-amber-200' },
              { label: 'Practice MCQs', value: mcqs.length, icon: <BookOpen size={16} strokeWidth={2.5}/>, color: 'text-indigo-600', iconBg: 'bg-indigo-100', hoverBorder: 'hover:border-indigo-200' },
              { label: 'Exam Preps', value: examPapers.length, icon: <Award size={16} strokeWidth={2.5}/>, color: 'text-teal-700', iconBg: 'bg-teal-100', hoverBorder: 'hover:border-teal-200' },
            ].map((s, i) => (
              <div key={i} className={`group bg-white rounded-2xl border border-slate-200/60 px-5 py-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${s.hoverBorder}`}>
                <div className={`h-11 w-11 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0 ${s.color} group-hover:scale-105 transition-transform duration-300`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800 leading-none tracking-tight">{(dataLoading || s.loading) ? '—' : s.value.toLocaleString()}</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Feature cards grid - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + (0.04 * i), duration: 0.4 }}
              className="group relative bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="relative z-10 flex items-start justify-between mb-5">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${card.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${card.light} ${card.textColor} uppercase tracking-wider`}>
                  {card.stat.split(' ')[0]}
                </span>
              </div>
              <h3 className="relative z-10 text-slate-900 font-extrabold text-[17px] tracking-tight mb-2 group-hover:text-emerald-700 transition-colors">{card.label}</h3>
              <p className="relative z-10 text-slate-500 font-medium text-[13px] leading-relaxed flex-1 mb-6">{card.description}</p>
              
              <button
                onClick={card.action || undefined}
                disabled={!card.action}
                className={`relative z-10 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all
                  ${card.action
                    ? 'bg-slate-900 hover:bg-gradient-to-r hover:from-emerald-700 hover:to-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {card.actionLabel} {card.action && <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── Progress Dashboard (Enhanced Student Focus) ── */}
        {user && (
          <motion.div
            ref={progressRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-12 bg-white rounded-3xl border border-slate-200/70 p-6 md:p-8 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h2 className="text-slate-900 font-extrabold text-[18px] tracking-tight flex items-center gap-2.5">
                  <div className="bg-emerald-100 p-1.5 rounded-lg"><TrendingUp size={18} className="text-emerald-600 stroke-[2.5px]" /></div> Your Learning Analytics
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Sparkles size={12} className="text-emerald-500" />
                  <span>AI-powered insights</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Streak Module - Enhanced */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center text-center relative group hover:shadow-lg transition-all">
                  <p className="text-amber-600 text-[11px] font-bold uppercase tracking-widest mb-5">Current Study Streak</p>
                  <div className="relative mb-3">
                    <span className="text-6xl font-black text-slate-800 tracking-tighter">
                      {streak || 0}
                    </span>
                    <span className="absolute -right-8 -top-1 text-3xl group-hover:scale-125 transition-transform duration-300">🔥</span>
                  </div>
                  <p className="text-amber-600 font-semibold text-[13px] bg-amber-100 px-3 py-1 rounded-full">
                    {streak >= 7 ? 'Unstoppable! Keep going! 🏆' : streak >= 3 ? 'Building momentum! 💪' : 'Start your streak today! ✨'}
                  </p>
                  <div className="mt-4 text-xs text-amber-500">
                    {streak >= 7 ? '+50 bonus XP tomorrow' : streak >= 3 ? '+20 XP tomorrow' : 'Study today for +10 XP'}
                  </div>
                </div>

                {/* Activity Bars */}
                <div className="lg:col-span-2">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-5 border-b border-slate-100 pb-3">Your Study Materials</p>
                  {(() => {
                    const items = [
                      { label: 'Quizzes', count: quizzes.length, color: 'bg-violet-500', icon: <Target size={12} /> },
                      { label: 'Flashcards', count: flashcardSets.length, color: 'bg-amber-500', icon: <Layers size={12} /> },
                      { label: 'MCQs', count: mcqs.length, color: 'bg-indigo-500', icon: <BookOpen size={12} /> },
                      { label: 'Exam Papers', count: examPapers.length, color: 'bg-teal-500', icon: <ClipboardList size={12} /> },
                    ]
                    const max = Math.max(...items.map(i => i.count), 1)
                    return (
                      <div className="space-y-5">
                        {items.map(item => (
                          <div key={item.label} className="flex items-center gap-4 group">
                            <div className="flex items-center gap-1.5 w-28">
                              <span className="text-slate-500">{item.icon}</span>
                              <span className="text-slate-700 font-bold text-[13px] tracking-tight">{item.label}</span>
                            </div>
                            <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full ${item.color} relative overflow-hidden transition-all duration-1000 ease-out`}
                                style={{ width: `${Math.max((item.count / max) * 100, 2)}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 w-1/2 skew-x-12 animate-[shimmer_2s_infinite]"></div>
                              </div>
                            </div>
                            <span className="text-slate-800 font-bold text-[14px] w-8 text-right bg-slate-50 py-0.5 rounded px-1 border border-slate-100">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                  
                  {/* Quick tip */}
                  <div className="mt-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                      <Zap size={12} />
                      <span className="font-semibold">Study Tip:</span>
                      <span>Create 3 quizzes this week to boost retention by 40%!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Recent Modules with Student Focus ── */}
        <div className="space-y-10">
          {/* Recent Quizzes */}
          {user && (quizzes.length > 0 || dataLoading) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <h2 className="text-slate-800 font-bold text-[16px] flex items-center gap-2">
                  <div className="bg-violet-100 p-1 rounded-md"><Target size={14} className="text-violet-600 stroke-[2.5px]"/></div> Recent Quizzes
                </h2>
                <button onClick={() => setShowQuizModal(true)} className="text-[12px] bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 hover:text-violet-700 px-3 py-1.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-1.5">
                  <Plus size={14} strokeWidth={2.5} /> New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataLoading && quizzes.length === 0 ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />) : quizzes.slice(0, 3).map((quiz) => (
                  <div key={quiz._id} onClick={() => !loadingQuizId && !deletingQuizId && openQuiz(quiz)} className="group cursor-pointer bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md rounded-2xl p-4 transition-all duration-300 relative">
                    <button onClick={(e) => deleteQuiz(e, quiz._id)} disabled={!!deletingQuizId} className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:hidden">
                      {deletingQuizId === quiz._id ? <Loader2 size={14} className="animate-spin text-red-500" /> : <Trash2 size={14} />}
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-500 group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-violet-700 group-hover:text-white transition-all duration-300">
                        {loadingQuizId === quiz._id ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} strokeWidth={2.5} />}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-slate-800 font-bold text-sm truncate group-hover:text-violet-700 transition-colors">{quiz.quizTitle}</p>
                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">{quiz.totalQuestions} questions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {quizzes.length === 0 && !dataLoading && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <Target size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No quizzes yet. Generate your first quiz!</p>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Recent Flashcards */}
          {user && (flashcardSets.length > 0 || dataLoading) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <h2 className="text-slate-800 font-bold text-[16px] flex items-center gap-2">
                  <div className="bg-amber-100 p-1 rounded-md"><Layers size={14} className="text-amber-600 stroke-[2.5px]"/></div> Flashcard Sets
                </h2>
                <button onClick={() => setShowFlashcardModal(true)} className="text-[12px] bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-600 hover:text-amber-700 px-3 py-1.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-1.5">
                  <Plus size={14} strokeWidth={2.5} /> New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataLoading && flashcardSets.length === 0 ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />) : flashcardSets.slice(0, 3).map((set) => (
                  <div key={set._id} onClick={() => !loadingFlashSet && !deletingFlashSetId && openFlashcardSet(set._id)} className="group cursor-pointer bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md rounded-2xl p-4 transition-all duration-300 relative">
                    <button onClick={(e) => deleteFlashcardSet(e, set._id)} disabled={!!deletingFlashSetId} className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:hidden">
                      {deletingFlashSetId === set._id ? <Loader2 size={14} className="animate-spin text-red-500" /> : <Trash2 size={14} />}
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-amber-700 group-hover:text-white transition-all duration-300">
                        {loadingFlashSet === set._id ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} strokeWidth={2.5} />}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-slate-800 font-bold text-sm truncate group-hover:text-amber-700 transition-colors">{set.setTitle}</p>
                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">{set.totalCards} cards</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {flashcardSets.length === 0 && !dataLoading && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <Layers size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No flashcards yet. Create your first set!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Exam Papers Section */}
          {user && (examPapers.length > 0 || dataLoading) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <h2 className="text-slate-800 font-bold text-[16px] flex items-center gap-2">
                  <div className="bg-teal-100 p-1 rounded-md"><ClipboardList size={14} className="text-teal-600 stroke-[2.5px]"/></div> Exam Papers
                </h2>
                <button onClick={() => setShowExamPaperModal(true)} className="text-[12px] bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-1.5">
                  <Plus size={14} strokeWidth={2.5} /> New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataLoading && examPapers.length === 0 ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />) : examPapers.slice(0, 3).map((paper) => (
                  <div key={paper._id} onClick={() => !loadingExamPaperId && !deletingExamPaperId && openExamPaper(paper)} className="group cursor-pointer bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md rounded-2xl p-4 transition-all duration-300 relative">
                    <button onClick={(e) => deleteExamPaper(e, paper._id)} disabled={!!deletingExamPaperId} className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:hidden">
                      {deletingExamPaperId === paper._id ? <Loader2 size={14} className="animate-spin text-red-500" /> : <Trash2 size={14} />}
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500 group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-teal-700 group-hover:text-white transition-all duration-300">
                        {loadingExamPaperId === paper._id ? <Loader2 size={18} className="animate-spin" /> : <ClipboardList size={18} strokeWidth={2.5} />}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-slate-800 font-bold text-sm truncate group-hover:text-teal-700 transition-colors">{paper.title}</p>
                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">{paper.totalMarks || '—'} marks total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Empty state when logged out */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <GraduationCap size={36} className="text-emerald-700" />
            </div>
            <h3 className="text-slate-800 font-extrabold text-2xl mb-3">Ready to study smarter?</h3>
            <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">Access AI chat, generate quizzes on the fly, and track your unstoppable study streak.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              Sign In To Begin
            </button>
          </motion.div>
        )}
      </main>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showQuizModal && (
          <QuizModal
            onClose={() => setShowQuizModal(false)}
            onCreated={() => loadData(true)}
            onStartQuiz={(quiz) => { setShowQuizModal(false); openQuiz(quiz) }}
          />
        )}
        {activeQuiz && (
          <QuizTakeModal
            quiz={activeQuiz}
            onClose={() => setActiveQuiz(null)}
          />
        )}
        {showMCQModal && (
          <MCQGeneratorModal
            onClose={() => setShowMCQModal(false)}
            onCreated={() => loadData(true)}
            onStartMCQ={(mcq) => { setShowMCQModal(false); openMCQ(mcq) }}
          />
        )}
        {activeMCQ && (
          <MCQTakeModal
            mcq={activeMCQ}
            onClose={() => setActiveMCQ(null)}
          />
        )}
        {showFlashcardModal && (
          <FlashcardGeneratorModal
            onClose={() => setShowFlashcardModal(false)}
            onCreated={() => loadData(true)}
            onStudyNow={(set) => { setShowFlashcardModal(false); setActiveFlashSet(set) }}
          />
        )}
        {activeFlashSet && (
          <FlashcardModal
            set={activeFlashSet}
            onClose={() => setActiveFlashSet(null)}
          />
        )}
        {showExamPaperModal && (
          <ExamPaperGeneratorModal
            onClose={() => setShowExamPaperModal(false)}
            onCreated={() => loadData(true)}
            onView={(paper) => { setShowExamPaperModal(false); setActiveExamPaper(paper) }}
          />
        )}
        {activeExamPaper && (
          <ExamPaperViewModal
            paper={activeExamPaper}
            onClose={() => setActiveExamPaper(null)}
          />
        )}
      </AnimatePresence>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
    </>
  )
}