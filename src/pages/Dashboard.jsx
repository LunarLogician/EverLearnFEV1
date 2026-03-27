import { useState, useEffect } from 'react'
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
  ClipboardList,
} from 'lucide-react'

// ── Quiz Generator Modal ──────────────────────────────────────────────────────
function QuizModal({ onClose, onCreated, onStartQuiz }) {
  const [mode, setMode] = useState('topic') // 'topic' | 'file'
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
        <div className="bg-emerald-900 px-6 py-4 flex items-center justify-between">
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
                className="flex-1 py-2.5 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap size={13} /> Take Quiz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            {/* Mode tabs */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => { setMode('topic'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'topic' ? 'bg-emerald-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Zap size={13} /> Topic
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'file' ? 'bg-emerald-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
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
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 placeholder-slate-400 ${topic.length > 2000 ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-emerald-600 focus:ring-emerald-600/20'}`}
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
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-slate-50'}`}>
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
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-600 bg-white"
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
              className="w-full py-3 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
// Shuffle options client-side so correctAnswer is never always at index 0,
// even for quizzes already stored in the DB with old data.
function shuffleQuizOptions(questions) {
  return questions.map(q => {
    // Normalize correctAnswer to a numeric index
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
    // Fisher-Yates shuffle
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
  // Shuffle options once on mount so correct answer isn't always at index 0
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
        <div className="bg-emerald-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm truncate max-w-[260px]">{quiz.quizTitle}</h2>
            {!done && <p className="text-emerald-300 text-xs mt-0.5">{current + 1} / {questions.length}</p>}
          </div>
          <button onClick={onClose} disabled={submitting} className="text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><X size={18} /></button>
        </div>

        {/* Progress bar */}
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
            {/* Score header */}
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

            {/* Analysing banner */}
            {submitting && (
              <div className="mx-4 mt-4 bg-emerald-900 rounded-xl px-4 py-3 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-emerald-300 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold">Analysing your performance…</p>
                  <p className="text-emerald-400 text-[11px] mt-0.5">Saving results &amp; generating AI feedback</p>
                </div>
              </div>
            )}

            {/* AI Overall Feedback */}
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

            {/* Wrong answers review */}
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
                className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40"
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
        <div className="bg-amber-700 px-6 py-4 flex items-center justify-between">
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
                className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Layers size={13} /> Study Now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            {/* Mode tabs */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => { setMode('topic'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'topic' ? 'bg-amber-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Zap size={13} /> Topic
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null) }}
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${mode === 'file' ? 'bg-amber-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
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
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 placeholder-slate-400 ${topic.length > 2000 ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-amber-600 focus:ring-amber-600/20'}`}
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
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-400 hover:bg-slate-50'}`}>
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
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-amber-600 bg-white"
                >
                  {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n} cards</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-amber-600 bg-white"
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
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="bg-emerald-900 px-6 py-4 flex items-center justify-between">
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
          {/* Card flip area */}
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
              <div className="flip-face flip-back bg-emerald-900 border-emerald-700">
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
  const [mode, setMode] = useState('text'); // 'text' | 'file' | 'document'
  const [sourceText, setSourceText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Load documents when mode changes to 'document'
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
      console.error('Failed to load documents:', err);
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
        <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
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
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap size={13} /> Take MCQ
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            {/* Mode tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('text'); setError(null) }}
                className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === 'text' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Zap size={13} /> Text
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null); setSelectedFile(null) }}
                className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === 'file' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Upload size={13} /> File
              </button>
              <button
                type="button"
                onClick={() => { setMode('document'); setError(null) }}
                className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === 'document' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Paperclip size={13} /> Document
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Biology Chapter 3"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 placeholder-slate-400"
              />
            </div>

            {mode === 'text' ? (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Source Text</label>
                <textarea
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="Paste your study material here..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 placeholder-slate-400 h-24 resize-none ${sourceText.length > 50000 ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-600 focus:ring-purple-600/20'}`}
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 bg-white"
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
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-600 bg-white"
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
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="bg-purple-600 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
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
              <button onClick={onClose} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors">
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
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
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

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ME'

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
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
      setQuizzes(qData.quizzes || [])
      setFlashcardSets(fData.flashcards || [])
      setMcqs(mData.mcqs || [])
      setExamPapers(epData.exams || epData.examPapers || epData.papers || [])
      setUserPlan(subData?.subscription?.plan || 'free')
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
    } catch { /* ignore */ }
    finally { setDeletingExamPaperId(null) }
  }

  const openQuiz = async (quizOrId) => {
    // If already has questions, open directly (freshly generated quiz)
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
    // If already has questions, open directly (freshly generated MCQ)
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
      color: 'bg-blue-500',
      light: 'bg-blue-50 border-blue-100',
      textColor: 'text-blue-700',
      // Removed FREE_LIMIT stat
      action: () => navigate('/chat'),
      actionLabel: 'Open Chat',
    },
    {
      icon: <Target size={22} />,
      label: 'Quiz Generator',
      description: 'AI-generated quizzes from any topic instantly',
      color: 'bg-violet-500',
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
      color: 'bg-amber-500',
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
      color: 'bg-indigo-500',
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
      color: 'bg-rose-500',
      light: 'bg-rose-50 border-rose-100',
      textColor: 'text-rose-700',
      stat: 'AI-powered writing',
      action: () => navigate('/chat'),
      actionLabel: 'Get Help',
    },
    {
      icon: <BookOpen size={22} />,
      label: 'Document Q&A',
      description: 'Upload PDFs, DOCX, PPTX and chat with them',
      color: 'bg-emerald-600',
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
      color: 'bg-teal-600',
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
      description: 'Track your study streaks and quiz scores',
      color: 'bg-cyan-500',
      light: 'bg-cyan-50 border-cyan-100',
      textColor: 'text-cyan-700',
      stat: 'Coming soon',
      action: null,
      actionLabel: 'Coming Soon',
    },
  ]

  return (
  return (
    <>
      <SEOHelmet 
        title="Student Dashboard - Track Progress - EverlearnAI"
        description="Track your study progress, token usage, and quiz scores in one place. Monitor your learning journey."
        url="https://everlearn.ai/dashboard"
        keywords="dashboard, progress tracking, study stats, performance analytics"
      />
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">

      {/* ── Top Navbar ── */}
      <header className="bg-[#111111] px-4 md:px-8 py-3.5 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Everlearn</p>
            <p className="text-white/40 text-[10px]">AI </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg bg-white/10"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/exam-papers')}
            className="px-3 py-1.5 text-white/60 text-xs font-medium rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            Exam Papers
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-3 py-1.5 text-white/60 text-xs font-medium rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            AI Chat
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06]">
                <div className="h-6 w-6 rounded-full bg-emerald-900 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{userInitials}</span>
                </div>
                <span className="text-white text-xs font-medium">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            {user ? `Welcome back, ${user.name.split(' ')[0]} 👋` : 'Welcome to StudentApp 👋'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user ? 'Pick a tool below and start studying smarter.' : 'Sign in to unlock all features.'}
          </p>
        </motion.div>

        {/* Stats row */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
          >
            {[
              { label: 'Tokens Used', value: tokenCount, icon: <MessageSquare size={15} />, color: 'text-blue-600', bg: 'bg-blue-50', loading: statsLoading },
              { label: 'Quizzes', value: quizzes.length, icon: <Target size={15} />, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Flashcard Sets', value: flashcardSets.length, icon: <Layers size={15} />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'MCQs Created', value: mcqs.length, icon: <BookOpen size={15} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Exam Papers', value: examPapers.length, icon: <ClipboardList size={15} />, color: 'text-teal-700', bg: 'bg-teal-50' },
              // Removed Free Chats Left stat
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800 leading-none">{(dataLoading || s.loading) ? '—' : s.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl ${card.color} text-white flex items-center justify-center flex-shrink-0`}>
                  {card.icon}
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${card.light} ${card.textColor}`}>
                  {card.stat}
                </span>
              </div>
              <h3 className="text-slate-800 font-bold text-base mb-1">{card.label}</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">{card.description}</p>
              <button
                onClick={card.action || undefined}
                disabled={!card.action}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${card.action
                    ? 'bg-emerald-900 hover:bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {card.actionLabel} {card.action && <ChevronRight size={14} />}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Recent Quizzes */}
        {user && quizzes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-700 font-bold text-base flex items-center gap-2">
                <Target size={16} className="text-violet-500" /> Recent Quizzes
              </h2>
              <button
                onClick={() => setShowQuizModal(true)}
                className="flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:text-emerald-600 transition-colors"
              >
                <Plus size={13} /> New Quiz
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quizzes.slice(0, 6).map((quiz) => (
                <div
                  key={quiz._id}
                  onClick={() => !loadingQuizId && !deletingQuizId && openQuiz(quiz)}
                  className={`relative bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all group ${loadingQuizId === quiz._id || deletingQuizId === quiz._id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteQuiz(e, quiz._id)}
                    disabled={!!deletingQuizId || !!loadingQuizId}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 disabled:hidden"
                    title="Delete quiz"
                  >
                    {deletingQuizId === quiz._id
                      ? <Loader2 size={13} className="animate-spin text-red-400" />
                      : <Trash2 size={13} />}
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 transition-colors">
                      {loadingQuizId === quiz._id
                        ? <Loader2 size={16} className="text-violet-600 animate-spin" />
                        : <Target size={16} className="text-violet-600" />
                      }
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <p className="text-slate-800 font-semibold text-sm truncate">{quiz.quizTitle}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{quiz.totalQuestions} questions</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock size={11} />
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[11px] text-violet-600 font-semibold group-hover:underline">Take quiz →</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Flashcard Sets */}
        {user && flashcardSets.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-700 font-bold text-base flex items-center gap-2">
                <Layers size={16} className="text-amber-500" /> Flashcard Sets
              </h2>
              <button onClick={() => setShowFlashcardModal(true)} className="flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:text-emerald-600 transition-colors">
                <Plus size={13} /> New Set
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {flashcardSets.slice(0, 6).map((set) => (
                <div
                  key={set._id}
                  onClick={() => !deletingFlashSetId && openFlashcardSet(set._id)}
                  className={`relative bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group ${deletingFlashSetId === set._id || loadingFlashSet === set._id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteFlashcardSet(e, set._id)}
                    disabled={!!deletingFlashSetId || !!loadingFlashSet}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 disabled:hidden"
                    title="Delete set"
                  >
                    {deletingFlashSetId === set._id
                      ? <Loader2 size={13} className="animate-spin text-red-400" />
                      : <Trash2 size={13} />}
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                      {loadingFlashSet === set._id
                        ? <Loader2 size={16} className="text-amber-600 animate-spin" />
                        : <Layers size={16} className="text-amber-600" />
                      }
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <p className="text-slate-800 font-semibold text-sm truncate">{set.setTitle}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{set.totalCards} cards</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Star size={11} />
                      <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[11px] text-amber-600 font-semibold group-hover:underline">Study →</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent MCQs */}
        {user && mcqs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-700 font-bold text-base flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500" /> Recent MCQs
              </h2>
              <button onClick={() => setShowMCQModal(true)} className="flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:text-emerald-600 transition-colors">
                <Plus size={13} /> New MCQ
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mcqs.slice(0, 6).map((mcq) => (
                <div
                  key={mcq._id}
                  onClick={() => !deletingMcqId && !loadingMCQId && openMCQ(mcq)}
                  className={`relative bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group ${deletingMcqId === mcq._id || loadingMCQId === mcq._id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteMCQ(e, mcq._id)}
                    disabled={!!deletingMcqId || !!loadingMCQId}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 disabled:hidden"
                    title="Delete MCQ"
                  >
                    {deletingMcqId === mcq._id
                      ? <Loader2 size={13} className="animate-spin text-red-400" />
                      : <Trash2 size={13} />}
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                      {loadingMCQId === mcq._id
                        ? <Loader2 size={16} className="text-indigo-600 animate-spin" />
                        : <BookOpen size={16} className="text-indigo-600" />
                      }
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <p className="text-slate-800 font-semibold text-sm truncate">{mcq.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{mcq.totalQuestions || mcq.questions?.length || 0} questions</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock size={11} />
                      <span>{new Date(mcq.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">Take MCQ →</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Exam Papers */}
        {user && examPapers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-700 font-bold text-base flex items-center gap-2">
                <ClipboardList size={16} className="text-teal-600" /> Recent Exam Papers
              </h2>
              <button onClick={() => setShowExamPaperModal(true)} className="flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:text-emerald-600 transition-colors">
                <Plus size={13} /> New Paper
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {examPapers.slice(0, 6).map((paper) => (
                <div
                  key={paper._id}
                  onClick={() => !loadingExamPaperId && !deletingExamPaperId && openExamPaper(paper)}
                  className={`relative bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-teal-200 transition-all group ${loadingExamPaperId === paper._id || deletingExamPaperId === paper._id ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <button
                    onClick={(e) => deleteExamPaper(e, paper._id)}
                    disabled={!!deletingExamPaperId || !!loadingExamPaperId}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 disabled:hidden"
                    title="Delete exam paper"
                  >
                    {deletingExamPaperId === paper._id
                      ? <Loader2 size={13} className="animate-spin text-red-400" />
                      : <Trash2 size={13} />}
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                      {loadingExamPaperId === paper._id
                        ? <Loader2 size={16} className="text-teal-600 animate-spin" />
                        : <ClipboardList size={16} className="text-teal-700" />}
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <p className="text-slate-800 font-semibold text-sm truncate">{paper.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{paper.questions?.length ?? paper.totalQuestions ?? '—'} questions · {paper.totalMarks} marks</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock size={11} />
                      <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[11px] text-teal-700 font-semibold group-hover:underline">View →</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state when logged out */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-emerald-700" />
            </div>
            <h3 className="text-slate-700 font-bold text-lg mb-2">Sign in to get started</h3>
            <p className="text-slate-400 text-sm mb-6">Access AI chat, quizzes, flashcards, and more.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Sign in / Register
            </button>
          </motion.div>
        )}
      </main>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showQuizModal && (
          <QuizModal
            onClose={() => setShowQuizModal(false)}
            onCreated={loadData}
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
            onCreated={loadData}
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
            onCreated={loadData}
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
            onCreated={loadData}
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
