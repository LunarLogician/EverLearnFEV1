import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { SEOHelmet } from '../components/SEOHelmet'
import { examPaperService, documentService } from '../services'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Trash2, X, Upload, AlertCircle, Loader2,
  Paperclip, Zap, ChevronDown, ChevronUp, Clock, BookOpen,
  AlignLeft,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const TYPE_LABELS = {
  short: 'Short Answer',
  long: 'Long Answer',
}
const TYPE_ICON = {
  short: <AlignLeft size={13} />,
  long: <BookOpen size={13} />,
}
const TYPE_COLOR = {
  short: 'bg-amber-50 text-amber-700 border-amber-200',
  long: 'bg-rose-50 text-rose-700 border-rose-200',
}

function msToTime(createdAt) {
  return new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Exam Paper Generator Modal ─────────────────────────────────────────────────
export function ExamPaperGeneratorModal({ onClose, onCreated, onView }) {
  const [mode, setMode] = useState('text')
  const [sourceText, setSourceText] = useState('')
  const [selectedDocument, setSelectedDocument] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(10)
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (mode === 'document' && documents.length === 0) loadDocuments()
  }, [mode])

  const loadDocuments = async () => {
    try {
      const data = await documentService.getUserDocuments()
      setDocuments(data.documents || [])
    } catch {
      setError('Failed to load documents')
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (mode === 'text' && !sourceText.trim()) return
    if (mode === 'text' && sourceText.length > 50000) return
    if (mode === 'document' && !selectedDocument) return
    if (mode === 'file' && !selectedFile) return

    setLoading(true)
    setError(null)
    try {
      const params = { title, subject, difficulty, numQuestions: parseInt(numQuestions), duration: parseInt(duration) }
      let data
      if (mode === 'document') {
        data = await examPaperService.generateFromDocument({ ...params, documentId: selectedDocument })
      } else if (mode === 'file') {
        data = await examPaperService.generateFromFile({ ...params, file: selectedFile })
      } else {
        data = await examPaperService.generate({ ...params, sourceText })
      }
      setResult(data.examPaper || data)
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate exam paper. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit =
    !loading &&
    (mode === 'text' ? sourceText.trim() && sourceText.length <= 50000
      : mode === 'file' ? !!selectedFile
      : !!selectedDocument)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-teal-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-teal-300" />
            <h2 className="text-white font-bold text-base">Generate Exam Paper</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {result ? (
          <div className="p-6 text-center overflow-y-auto flex-1">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-teal-700" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-1">{result.title}</h3>
            <p className="text-slate-500 text-sm mb-1">{result.questions?.length} questions · {result.totalMarks} marks · {result.duration} min</p>
            {result.subject && <p className="text-slate-400 text-xs mb-4">{result.subject}</p>}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              {result.questions?.slice(0, 3).map((q, i) => (
                <p key={i} className="text-xs text-slate-600 truncate">
                  <span className="font-semibold text-teal-700 mr-1">{i + 1}.</span>{q.question || q.questionText || q.text}
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
                onClick={() => { onView(result); onClose() }}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen size={13} /> View Paper
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Mode tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
              {['text', 'file', 'document'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); if (m === 'file') setSelectedFile(null) }}
                  className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === m ? 'bg-teal-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  {m === 'text' && <><Zap size={13} /> Text</>}
                  {m === 'file' && <><Upload size={13} /> File</>}
                  {m === 'document' && <><Paperclip size={13} /> Document</>}
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Biology Mid-Term Exam"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 placeholder-slate-400"
              />
            </div>

            {/* Subject */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Subject (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g., Biology"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Questions & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Questions</label>
                <select
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-600 bg-white"
                >
                  {[3, 5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Duration (min)</label>
                <select
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-600 bg-white"
                >
                  {[15, 30, 45, 60, 90, 120, 180].map(n => <option key={n} value={n}>{n} min</option>)}
                </select>
              </div>
            </div>

            {/* Source input */}
            {mode === 'text' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Source Text</label>
                <textarea
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="Paste your study material here..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 placeholder-slate-400 h-28 resize-none ${sourceText.length > 50000 ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-teal-600 focus:ring-teal-600/20'}`}
                  autoFocus
                />
                {sourceText.length > 40000 && (
                  <p className={`text-xs mt-1 text-right ${sourceText.length > 50000 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                    {sourceText.length.toLocaleString()}/50,000
                  </p>
                )}
              </div>
            )}

            {mode === 'file' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Upload File</label>
                <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 text-center hover:border-teal-500 hover:bg-teal-50/40 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.pptx"
                    onChange={e => {
                      const f = e.target.files?.[0] || null
                      if (f && f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB'); return }
                      setSelectedFile(f); setError(null)
                    }}
                    className="hidden"
                    id="exam-file-input"
                  />
                  <label htmlFor="exam-file-input" className="cursor-pointer block">
                    <Upload size={20} className="mx-auto mb-2 text-teal-600" />
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, DOC, or PPTX (max 10 MB)</p>
                    {selectedFile && <p className="text-xs text-teal-700 font-semibold mt-2">✓ {selectedFile.name}</p>}
                  </label>
                </div>
              </div>
            )}

            {mode === 'document' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Select Document</label>
                <select
                  value={selectedDocument}
                  onChange={e => setSelectedDocument(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 bg-white"
                >
                  <option value="">Choose a document...</option>
                  {documents.map(doc => <option key={doc._id} value={doc._id}>{doc.title}</option>)}
                </select>
                {documents.length === 0 && <p className="text-xs text-amber-600 mt-2">No documents found. Upload one in AI Chat first!</p>}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
                : <><FileText size={16} /> Generate Exam Paper</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

// ── Exam Paper Viewer Modal ────────────────────────────────────────────────────
export function ExamPaperViewModal({ paper, onClose }) {
  const [openSections, setOpenSections] = useState({})

  const grouped = (paper.questions || []).reduce((acc, q) => {
    const t = q.type || 'short'
    if (!acc[t]) acc[t] = []
    acc[t].push(q)
    return acc
  }, {})

  const toggleSection = (type) => setOpenSections(prev => ({ ...prev, [type]: !prev[type] }))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full sm:rounded-2xl sm:max-w-3xl sm:my-6 sm:mx-4 shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-teal-700 px-5 sm:px-7 py-4 flex items-start justify-between flex-shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-white font-bold text-base sm:text-lg leading-snug">{paper.title}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {paper.subject && (
                <span className="text-teal-200 text-xs font-medium">{paper.subject}</span>
              )}
              <span className="flex items-center gap-1 text-teal-300 text-xs">
                <Clock size={11} /> {paper.duration} min
              </span>
              <span className="text-teal-300 text-xs font-semibold">Total: {paper.totalMarks} marks</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                paper.difficulty === 'easy' ? 'bg-emerald-500/30 text-emerald-200'
                : paper.difficulty === 'hard' ? 'bg-red-500/30 text-red-200'
                : 'bg-amber-500/30 text-amber-200'
              }`}>
                {DIFFICULTY_LABELS[paper.difficulty] || paper.difficulty}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors flex-shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5 sm:py-6 space-y-4">
          {Object.entries(grouped).map(([type, questions]) => {
            const isOpen = openSections[type] !== false // default open
            const sectionMarks = questions.reduce((s, q) => s + (q.marks || 0), 0)

            return (
              <div key={type} className="border border-gray-200 rounded-2xl overflow-hidden">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(type)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${TYPE_COLOR[type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {TYPE_ICON[type] || <HelpCircle size={12} />}
                      {TYPE_LABELS[type] || type}
                    </span>
                    <span className="text-slate-500 text-xs">{questions.length} question{questions.length !== 1 ? 's' : ''} · {sectionMarks} marks</span>
                  </div>
                  {isOpen ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />}
                </button>

                {/* Questions */}
                {isOpen && (
                  <div className="divide-y divide-gray-100">
                    {questions.map((q, idx) => (
                      <div key={idx} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-slate-800 font-medium text-sm leading-relaxed flex-1">
                            <span className="text-teal-700 font-bold mr-1.5">Q{idx + 1}.</span>
                            {q.question || q.questionText || q.text}
                          </p>
                          <span className="text-[11px] text-slate-400 font-semibold flex-shrink-0 mt-0.5">[{q.marks} mark{q.marks !== 1 ? 's' : ''}]</span>
                        </div>

                        {/* Model answer */}
                        {q.modelAnswer && (
                          <div className="mt-2 ml-5 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            <span className="font-semibold text-slate-600">Model Answer: </span>{q.modelAnswer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 sm:px-7 py-4 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Exam Paper Page ────────────────────────────────────────────────────────────
export default function ExamPaperPage() {
  const { user } = useAuth()
  const [examPapers, setExamPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [activePaper, setActivePaper] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchExamPapers() }, [])

  const fetchExamPapers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await examPaperService.list()
      setExamPapers(data.exams || data.examPapers || data.papers || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPaper = async (paperOrObj) => {
    if (paperOrObj.questions) { setActivePaper(paperOrObj); return }
    try {
      const data = await examPaperService.getExamPaper(paperOrObj._id)
      setActivePaper(data.exam || data.examPaper)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const handleDelete = async (examId) => {
    if (!window.confirm('Delete this exam paper? This cannot be undone.')) return
    setDeletingId(examId)
    try {
      await examPaperService.deleteExamPaper(examId)
      setExamPapers(prev => prev.filter(p => p._id !== examId))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
  return (
    <>
      <SEOHelmet 
        title="Exam Paper Generator - Full Question Papers - EverlearnAI"
        description="Generate complete exam papers with long answers and short answers. Perfect for final exam prep."
        url="https://everlearn.ai/exam-papers"
        keywords="exam paper generator, question paper, practice exam, full paper"
      />
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-700" />
            <h1 className="text-3xl font-bold text-gray-800">Exam Papers</h1>
          </div>
          <p className="text-gray-500 mt-2">Generate full exam papers with mixed question types</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <button
          onClick={() => setShowGenerator(true)}
          className="mb-8 px-6 py-3 bg-teal-700 text-white rounded-xl hover:bg-teal-600 font-semibold transition text-sm flex items-center gap-2"
        >
          <FileText size={16} /> Generate Exam Paper
        </button>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && !examPapers.length ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading exam papers...</p>
            </div>
          ) : !user ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Sign in to view and generate exam papers.</p>
            </div>
          ) : examPapers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No exam papers yet. Generate one to get started!</p>
            </div>
          ) : (
            examPapers.map((paper) => (
              <motion.div
                key={paper._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug flex-1 truncate">{paper.title}</h3>
                  <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    paper.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700'
                    : paper.difficulty === 'hard' ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {DIFFICULTY_LABELS[paper.difficulty] || paper.difficulty}
                  </span>
                </div>

                {paper.subject && <p className="text-xs text-slate-500 mb-2">{paper.subject}</p>}

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-0.5"><BookOpen size={11} /> {paper.questions?.length ?? paper.totalQuestions ?? '—'} questions</span>
                  <span className="font-semibold text-teal-700">{paper.totalMarks} marks</span>
                  <span className="flex items-center gap-0.5"><Clock size={11} /> {paper.duration} min</span>
                </div>

                <p className="text-[11px] text-slate-400 mb-4">{msToTime(paper.createdAt)}</p>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleViewPaper(paper)}
                    className="flex-1 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
                  >
                    View Paper
                  </button>
                  <button
                    onClick={() => handleDelete(paper._id)}
                    disabled={deletingId === paper._id}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                    title="Delete"
                  >
                    {deletingId === paper._id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showGenerator && (
          <ExamPaperGeneratorModal
            onClose={() => setShowGenerator(false)}
            onCreated={fetchExamPapers}
            onView={handleViewPaper}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePaper && (
          <ExamPaperViewModal
            paper={activePaper}
            onClose={() => setActivePaper(null)}
          />
        )}
      </AnimatePresence>
    </div>
    </>\n  )\n}
