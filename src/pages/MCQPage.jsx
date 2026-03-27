import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SEOHelmet } from '../components/SEOHelmet';
import { mcqService, documentService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Trash2, X, Upload, AlertCircle, Loader2, Paperclip, Zap } from 'lucide-react';

// ── MCQ Generator Modal ───────────────────────────────────────────────────────
function MCQGeneratorModal({ onClose, onCreated, onStartMCQ }) {
  const [mode, setMode] = useState('text');
  const [sourceText, setSourceText] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (mode === 'document' && documents.length === 0) loadDocuments();
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
    if (mode === 'text' && sourceText.length > 50000) return;
    if (mode === 'document' && !selectedDocument) return;
    if (mode === 'file' && !selectedFile) return;

    setLoading(true); setError(null);
    try {
      let data;
      if (mode === 'document') {
        data = await mcqService.generateFromDocument(selectedDocument, parseInt(numQuestions), title);
      } else if (mode === 'file') {
        data = await mcqService.generateFromFile(selectedFile, parseInt(numQuestions), title || `MCQ from ${selectedFile.name}`);
      } else {
        data = await mcqService.generateFromText(sourceText, parseInt(numQuestions), title || `MCQ Set - ${new Date().toLocaleDateString()}`);
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
              <button onClick={() => setResult(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Generate Another
              </button>
              <button
                onClick={() => { onStartMCQ(result); onClose(); }}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap size={13} /> Take MCQ
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
              {['text', 'file', 'document'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); if (m === 'file') setSelectedFile(null); }}
                  className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-lg ${mode === m ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  {m === 'text' && <><Zap size={13} /> Text</>}
                  {m === 'file' && <><Upload size={13} /> File</>}
                  {m === 'document' && <><Paperclip size={13} /> Document</>}
                </button>
              ))}
            </div>

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

            {mode === 'text' && (
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
            )}

            {mode === 'file' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Upload File (PDF, DOCX, DOC, PPTX)</label>
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <input type="file" accept=".pdf,.docx,.doc,.pptx" onChange={e => {
                    const f = e.target.files?.[0] || null
                    if (f && f.size > 10 * 1024 * 1024) {
                      setError('File must be under 10 MB')
                      return
                    }
                    setSelectedFile(f); setError(null)
                  }} className="hidden" id="mcq-file-input" />
                  <label htmlFor="mcq-file-input" className="cursor-pointer block">
                    <Upload size={20} className="mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, DOC, or PPTX (max 10MB)</p>
                    {selectedFile && <p className="text-xs text-purple-600 font-semibold mt-2">✓ {selectedFile.name}</p>}
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 bg-white"
                >
                  <option value="">Choose a document...</option>
                  {documents.map(doc => <option key={doc._id} value={doc._id}>{doc.title}</option>)}
                </select>
                {documents.length === 0 && <p className="text-xs text-amber-600 mt-2">No documents found. Upload one first!</p>}
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

            {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}

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
        className="bg-white w-full sm:rounded-2xl sm:max-w-2xl sm:my-6 sm:mx-4 shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]"
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
                {Math.round((score / total) * 100)}% correct{' '}
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

// ── MCQ Page ──────────────────────────────────────────────────────────────────
export default function MCQPage() {
  const { user } = useAuth();
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [activeMCQ, setActiveMCQ] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchMCQs(); }, []);

  const fetchMCQs = async () => {
    setLoading(true); setError(null);
    try {
      const data = await mcqService.getMCQs();
      setMcqs(data.mcqs || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDeleteMCQ = async (mcqId) => {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;
    setDeletingId(mcqId);
    try {
      await mcqService.deleteMCQ(mcqId);
      setMcqs(mcqs.filter(m => m._id !== mcqId));
    } catch (err) {
      setError(err.message);
    }
    setDeletingId(null);
  };

  const handleTakeMCQ = async (mcqId) => {
    try {
      const data = await mcqService.getMCQ(mcqId);
      setActiveMCQ(data.mcq);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <SEOHelmet 
        title="MCQ Generator - Create Custom Question Papers - EverlearnAI"
        description="Generate AI-powered MCQs from any topic or document. Create custom question papers instantly for practice and exams."
        url="https://everlearn.ai/mcq"
        keywords="MCQ generator, question bank, multiple choice generator, practice questions"
      />
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">MCQs</h1>
          </div>
          <p className="text-gray-600 mt-2">Create and practice multiple-choice questions</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <button onClick={() => setShowGenerator(true)} className="mb-8 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold transition text-sm">
          + Generate MCQ
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && !mcqs.length ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto text-purple-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading MCQs...</p>
            </div>
          ) : mcqs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No MCQ sets yet. Create one to get started!</p>
            </div>
          ) : (
            mcqs.map((mcq) => (
              <motion.div
                key={mcq._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <h3 className="font-semibold text-gray-800 mb-3 truncate">{mcq.title}</h3>
                <div className="space-y-1 mb-4 text-xs text-gray-500">
                  <p>Created: {new Date(mcq.createdAt).toLocaleDateString()}</p>
                  <p>Best Score: <span className="font-semibold text-purple-600">{mcq.bestScore ?? 0}</span></p>
                  <p>Attempts: <span className="font-semibold">{mcq.totalAttempts}</span></p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTakeMCQ(mcq._id)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                  >
                    Take
                  </button>
                  <button
                    onClick={() => handleDeleteMCQ(mcq._id)}
                    disabled={deletingId === mcq._id}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    {deletingId === mcq._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showGenerator && (
          <MCQGeneratorModal
            onClose={() => setShowGenerator(false)}
            onCreated={() => fetchMCQs()}
            onStartMCQ={(mcq) => setActiveMCQ(mcq)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMCQ && (
          <MCQTakeModal
            mcq={activeMCQ}
            onClose={() => setActiveMCQ(null)}
            onComplete={() => { setActiveMCQ(null); fetchMCQs(); }}
          />
        )}
      </AnimatePresence>
    </div>
    </>\n  );\n}
}