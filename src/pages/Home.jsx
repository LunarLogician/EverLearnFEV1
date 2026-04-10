import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { SEOHelmet } from '../components/SEOHelmet'
import { StructuredData } from '../components/StructuredData'
import AuthModal from '../components/AuthModal'
import {
  MessageSquare, Target, Layers, PenLine,
  FileText, BarChart2, ArrowRight, Check, X,
  Sparkles, ChevronRight, Star, Menu
} from 'lucide-react'

// ─── Scroll reveal wrapper ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-72px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <MessageSquare size={20} />,
    name: 'AI Chat',
    desc: "Ask anything — homework problems, exam prep, concepts you don't get. Get detailed, accurate answers instantly, 24/7.",
    chip: '24/7 Available',
    chipColor: 'bg-blue-50 text-blue-700',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Target size={20} />,
    name: 'Quiz & MCQ Generator',
    desc: 'Paste a topic or your notes and get a custom quiz or full MCQ set in seconds. MCQs, true/false, short answer — all AI-generated.',
    chip: 'Instant',
    chipColor: 'bg-pink-50 text-pink-700',
    iconBg: 'bg-pink-50 text-pink-600',
  },
  {
    icon: <Layers size={20} />,
    name: 'Flashcards',
    desc: 'Convert any topic or uploaded file into a complete flashcard set. Maximize retention before your exams.',
    chip: 'Spaced Repetition',
    chipColor: 'bg-amber-50 text-amber-700',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <PenLine size={20} />,
    name: 'Assignment Help',
    desc: 'Struggling with an essay or report? Get AI writing assistance, outlines, rewrites and polished drafts.',
    chip: 'AI Writing',
    chipColor: 'bg-red-50 text-red-700',
    iconBg: 'bg-red-50 text-red-600',
  },
  {
    icon: <FileText size={20} />,
    name: 'Document Q&A',
    desc: 'Upload PDFs, DOCX, PPTX and chat with them directly. Find answers buried in 200-page textbooks in seconds.',
    chip: 'PDF · DOCX · PPTX',
    chipColor: 'bg-emerald-50 text-emerald-700',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: <BarChart2 size={20} />,
    name: 'Progress Tracking',
    desc: 'Track study streaks, quiz scores and improvements over time. Stay motivated throughout the semester.',
    chip: 'Coming Soon',
    chipColor: 'bg-sky-50 text-sky-600',
    iconBg: 'bg-sky-50 text-sky-500',
    soon: true,
  },
]

const STEPS = [
  {
    num: '01',
    name: 'Create your account',
    desc: 'Sign up in seconds — no credit card required. You get 10,000 free tokens and full access to all tools immediately.',
  },
  {
    num: '02',
    name: 'Choose your tool',
    desc: 'Pick from AI Chat, Quiz Generator, Flashcards, Assignment Help or Document Q&A — whatever your session needs.',
  },
  {
    num: '03',
    name: 'Study smarter',
    desc: 'Get instant, accurate help on any subject. Upload notes, paste a topic, or just ask — EverlearnAI handles the rest.',
  },
]

const TESTIMONIALS = [
  {
    stars: 5,
    quote: "Used the Quiz Generator the night before my Data Structures exam. Got 100 AI questions on trees and graphs — aced the paper. Absolute game changer.",
    name: 'Ali Khan',
    role: 'CS Student, NUST Islamabad',
    initials: 'AK',
    avatarColor: 'bg-blue-100 text-blue-700',
    featured: false,
  },
  {
    stars: 5,
    quote: "The Document Q&A is insane. I uploaded a 180-page textbook PDF and asked specific questions about chapters I hadn't read. Answered everything accurately. Saved me hours.",
    name: 'Sarah Raza',
    role: 'Medicine Student, KEMU Lahore',
    initials: 'SR',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    featured: true,
  },
  {
    stars: 5,
    quote: "Used Assignment Help to get an outline and rough draft for my FYP report, then refined it myself. My supervisor was genuinely impressed with the structure.",
    name: 'Usman Haider',
    role: 'Software Engineer, Bahria University',
    initials: 'UH',
    avatarColor: 'bg-pink-100 text-pink-700',
    featured: false,
  },
]

// Real plans from Lemon Squeezy
const PLANS = [
  {
    tier: 'Basic',
    price: 'RS 399',
    usd: '~$1.41',
    period: 'per month',
    desc: '200,000 AI tokens/month',
    features: [
      { text: 'All AI tools (Chat, MCQs, Quizzes, Flashcards)', ok: true },
      { text: 'Document Q&A & summaries', ok: true },
      { text: 'Assignment generation & analysis', ok: true },
      { text: 'Chat History', ok: true },
      { text: '200K tokens/month', ok: true },
      { text: 'Priority support', ok: false },
    ],
    cta: 'Get Basic',
    featured: false,
  },
  {
    tier: 'Pro',
    price: 'RS 899',
    usd: '~$3.21',
    period: 'per month',
    badge: '5x More Tokens',
    comparison: '5x tokens for 2.25x the price',
    desc: '1,000,000 AI tokens/month',
    features: [
      { text: 'All AI tools (Chat, MCQs, Quizzes, Flashcards)', ok: true },
      { text: 'Document Q&A & summaries', ok: true },
      { text: 'Assignment generation & analysis', ok: true },
      { text: 'Chat History (unlimited)', ok: true },
      { text: '1M tokens/month', ok: true },
      { text: 'Priority support', ok: true },
    ],
    cta: 'Get Pro',
    featured: true,
  },
]

const TOOL_PILLS = [
  { icon: <MessageSquare size={16} />, label: 'AI Chat', color: 'text-blue-600 bg-blue-50' },
  { icon: <Target size={16} />, label: 'Quizzes & MCQs', color: 'text-pink-600 bg-pink-50' },
  { icon: <Layers size={16} />, label: 'Flashcards', color: 'text-amber-600 bg-amber-50' },
  { icon: <PenLine size={16} />, label: 'Assignments', color: 'text-red-600 bg-red-50' },
  { icon: <FileText size={16} />, label: 'Documents', color: 'text-emerald-700 bg-emerald-50' },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [demoTab, setDemoTab] = useState('mcq')
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (!document.getElementById('everlearn-fonts')) {
      const link = document.createElement('link')
      link.id = 'everlearn-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap'
      document.head.appendChild(link)
    }
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    <div className="bg-[#fdfcf8] text-gray-900 overflow-x-hidden">
      <SEOHelmet 
        title="EverlearnAI - Free MCQ Generator, Quiz Maker & Study Tools"
        description="Generate MCQs, flashcards, and quizzes from any topic. Chat with documents. Get instant homework help. Start free with 10,000 tokens."
        url="https://everlearnai.live/"
      />
      <StructuredData />

      <style>{`
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        @keyframes float-0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        @keyframes float-1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes float-3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes float-4 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        .float-0{animation:float-0 2.8s ease-in-out 0s infinite}
        .float-1{animation:float-1 3.1s ease-in-out 0.2s infinite}
        .float-2{animation:float-2 2.6s ease-in-out 0.4s infinite}
        .float-3{animation:float-3 3.3s ease-in-out 0.1s infinite}
        .float-4{animation:float-4 2.9s ease-in-out 0.3s infinite}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.35)}}
        .pulse-dot{animation:pulse-dot 2s ease-in-out infinite}
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileNavOpen ? 'bg-[#fdfcf8]/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="px-5 md:px-12 py-4 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">
              Everlearn<span className="text-emerald-700">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {['Features', 'How it works', 'Pricing', 'Blog'].map((l) => (
              <a key={l} href={l === 'Blog' ? '/blog' : `#${l.toLowerCase().replace(/ /g, '-')}`}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop auth buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition-all">
                  Dashboard
                </button>
                <button onClick={() => navigate('/chat')}
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all">
                  Go to Chat
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                  Log in
                </button>
                <button onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
                  Get started free
                </button>
              </div>
            )}

            {/* Mobile: single CTA + hamburger */}
            <button
              onClick={() => navigate(user ? '/chat' : '/dashboard')}
              className="md:hidden px-3.5 py-2 bg-emerald-900 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all"
            >
              {user ? 'Chat' : 'Start free'}
            </button>
            <button
              onClick={() => setMobileNavOpen(o => !o)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-gray-100 bg-[#fdfcf8]/98 px-5 py-3 space-y-0.5">
            {['Features', 'How it works', 'Pricing', 'Blog'].map((l) => (
              <a
                key={l}
                href={l === 'Blog' ? '/blog' : `#${l.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMobileNavOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {l}
              </a>
            ))}
            {user ? (
              <div className="pt-2 border-t border-gray-100 space-y-0.5">
                <button
                  onClick={() => { navigate('/dashboard'); setMobileNavOpen(false) }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 space-y-0.5">
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileNavOpen(false) }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ─── MOBILE APP BANNER ──────────────────────────────────────────────── */}
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-gray-950 border-b border-white/10 py-2 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <p className="text-xs text-white/70">
            <span className="font-semibold text-white">EverlearnAI is also on Android!</span>
            <span className="hidden sm:inline text-white/50"> — same tools, quizzes & chat on your phone.</span>
          </p>
          <a
            href="/EverlearnAI.apk"
            download
            aria-label="Download EverlearnAI Android App"
            className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-950 rounded-lg text-xs font-semibold transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="currentColor" aria-hidden="true">
              <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm11.155 11.742L1.321 23.566c.116.064.248.1.39.1.145 0 .277-.038.395-.106l13.688-7.754-4.302-4.14zm5.883-5.585L5.119 0 9.507 4.365l8.868 5.716z"/>
            </svg>
            Download Now
          </a>
        </div>
      </div>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 sm:px-6" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '136px', paddingBottom: '64px' }}>
        {/* BG effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_600px_at_50%_30%,rgba(16,185,129,0.07),transparent_70%)]" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 55% at 50% 50%,black 0%,transparent 80%)',
          }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 mb-8 shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <span className="text-xs font-medium text-emerald-800">AI-Powered Study Assistant · Powered by Claude</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="serif text-[clamp(52px,8vw,86px)] leading-[1.05] tracking-[-3px] text-gray-900"
          >
            AI Study Tools.<br />
            <em className="text-emerald-800">Study Smarter.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 text-lg font-light text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            The #1 AI study assistant — generate MCQs, quizzes, and flashcards from your notes or any topic. Chat with your documents and get AI homework help 24/7.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[15px] transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:-translate-y-0.5"
            >
              <Sparkles size={15} /> Start for free
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-[15px] transition-all hover:-translate-y-0.5"
            >
              See all features <ChevronRight size={15} />
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-4 text-xs text-gray-400"
          >
            No credit card required · 10,000 free tokens included · Upgrade anytime
          </motion.p>

        </div>

        {/* Floating tool pills */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-16 flex flex-wrap justify-center gap-3 max-w-xl mx-auto"
        >
          {TOOL_PILLS.map((t, i) => (
            <div key={t.label} className={`float-${i} bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.color}`}>{t.icon}</div>
              <span className="text-xs font-medium text-gray-600">{t.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── SEE IT IN ACTION (CONVERSION DEMO) ─────────────────────────────── */}
      <section className="py-16 sm:py-28 px-5 sm:px-6 bg-[#f7f6f2]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
                <div className="w-4 h-0.5 bg-emerald-500 rounded" /> See it in action
              </div>
              <h2 className="serif text-[clamp(32px,4vw,52px)] leading-tight tracking-tight">
                The workflow that<br /><em className="text-emerald-800">turns studying into scores</em>
              </h2>
            </div>
            <p className="text-base text-gray-500 max-w-md leading-relaxed">
              For exams, paste your notes or upload a file to generate an MCQ set in seconds, take it like a real test, then use explanations to fix weak areas. For everyday study, switch to quizzes and flashcards.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
            {/* Left: tab rail */}
            <Reveal className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Pick a tool</div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {[
                  { id: 'mcq', label: 'MCQ Preparation', icon: <Target size={16} /> },
                  { id: 'quiz', label: 'Quiz Generator', icon: <Sparkles size={16} /> },
                  { id: 'flash', label: 'Flashcards', icon: <Layers size={16} /> },
                  { id: 'docs', label: 'Document Q&A', icon: <FileText size={16} /> },
                ].map((t) => {
                  const active = demoTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDemoTab(t.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all text-left ${
                        active
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        active ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>{t.icon}</span>
                      <span className="text-sm font-semibold">{t.label}</span>
                      <span className={`ml-auto text-xs font-semibold ${active ? 'text-emerald-200' : 'text-gray-400'}`}>→</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Check size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">Best for exams</div>
                    <p className="text-sm text-gray-500 leading-relaxed mt-0.5">
                      Use MCQs to practice retrieval, flashcards for recall, and quizzes to detect weak areas.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: mock preview */}
            <Reveal className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden">
                    <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {demoTab === 'mcq' ? 'MCQ Preparation' : demoTab === 'quiz' ? 'Quiz Generator' : demoTab === 'flash' ? 'Flashcards' : 'Document Q&A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {demoTab === 'mcq' ? 'Generate • Take • Review explanations' :
                       demoTab === 'quiz' ? 'Custom quiz sets in seconds' :
                       demoTab === 'flash' ? 'Short, high-retention cards' :
                       'Ask questions from your files'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Try it now <ArrowRight size={14} />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {demoTab === 'mcq' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Generated MCQ</div>
                      <div className="text-sm font-semibold text-gray-900 leading-relaxed">
                        Which option best describes photosynthesis?
                      </div>
                      <div className="mt-3 space-y-2">
                        {['A. Cellular respiration', 'B. Converting light into chemical energy', 'C. Protein synthesis', 'D. DNA replication'].map((o, i) => (
                          <div key={i} className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700">
                            {o}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-700">Results</div>
                        <div className="text-xs font-semibold text-emerald-800">Score: 8/10</div>
                      </div>
                      <div className="mt-3 rounded-xl bg-white border border-emerald-200 p-3">
                        <div className="text-xs font-semibold text-gray-900">Explanation</div>
                        <div className="text-sm text-gray-600 leading-relaxed mt-1">
                          Correct answer: <span className="font-semibold">B</span>. Photosynthesis converts light energy into chemical energy stored in glucose.
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          { k: 'Weak areas', v: '2 topics' },
                          { k: 'Time', v: '6m 12s' },
                          { k: 'Accuracy', v: '80%' },
                          { k: 'Next', v: 'Retry wrong' },
                        ].map((s) => (
                          <div key={s.k} className="rounded-xl border border-emerald-200 bg-white px-3 py-2">
                            <div className="text-[11px] text-emerald-800 font-semibold">{s.k}</div>
                            <div className="text-xs text-gray-600 mt-0.5">{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {demoTab === 'quiz' && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Generated Quiz</div>
                    <div className="text-sm font-semibold text-gray-900">Data Structures — Trees & Graphs</div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Q1. What is the time complexity of BFS?',
                        'Q2. Define a binary search tree.',
                        'Q3. When does Dijkstra fail?',
                        'Q4. What is a topological order?'
                      ].map((q, i) => (
                        <div key={i} className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700">
                          <span className="font-semibold text-emerald-700 mr-2">#{i + 1}</span>{q}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['MCQ', 'Short answer', 'True/False', 'Difficulty: Mixed'].map((t) => (
                        <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {demoTab === 'flash' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Flashcard</div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Front</div>
                        <div className="text-sm font-semibold text-gray-900 leading-relaxed">What is chlorophyll’s role in photosynthesis?</div>
                      </div>
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">Back</div>
                        <div className="text-sm text-emerald-900 leading-relaxed font-semibold">
                          It absorbs light energy and helps convert it into chemical energy used in light‑dependent reactions.
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Why it converts</div>
                      <ul className="space-y-3 text-sm text-gray-600">
                        {[
                          { t: 'Short answers only', d: 'No paragraphs — cards fit cleanly and review fast.' },
                          { t: 'Exam-style prompts', d: 'Questions are phrased like what you see in tests.' },
                          { t: 'Instant sets', d: 'Upload a file or type a topic, get a set immediately.' },
                        ].map((x) => (
                          <li key={x.t} className="flex gap-2.5">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                              <Check size={12} />
                            </span>
                            <span><span className="font-semibold text-gray-900">{x.t}.</span> {x.d}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-5 w-full py-3 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all"
                      >
                        Generate flashcards
                      </button>
                    </div>
                  </div>
                )}

                {demoTab === 'docs' && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Document Q&A</div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="text-xs text-gray-500">You</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">Summarize chapter 3 in 5 bullets.</div>
                      <div className="mt-4 text-xs text-gray-500">EverlearnAI</div>
                      <div className="mt-1 text-sm text-gray-700 leading-relaxed">
                        1) Key concept A… 2) Key concept B… 3) Key concept C… 4) Common pitfalls… 5) Exam-style takeaways…
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Source-linked', 'Fast retrieval', 'Great for textbooks'].map((t) => (
                          <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Pro unlocks</span> file-based flashcards/quizzes + advanced tools.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all"
                  >
                    Try for free
                  </button>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
                  >
                    See pricing
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────────────────────── */}
      <div className="bg-emerald-900 py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 overflow-hidden">
          {[
            { num: '50,000+', label: 'Students worldwide' },
            { num: '2.4M', label: 'Questions answered' },
            { num: '98%', label: 'Satisfaction rate' },
            { num: '4.9 ★', label: 'Average rating' },
          ].map((s) => (
            <div key={s.label} className="text-center py-5 px-4 bg-emerald-900">
              <div className="serif text-2xl text-white">{s.num}</div>
              <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
                <div className="w-4 h-0.5 bg-emerald-500 rounded" /> Features
              </div>
              <h2 className="serif text-[clamp(32px,4vw,52px)] leading-tight tracking-tight">
                Six powerful tools,<br /><em className="text-emerald-800">one platform</em>
              </h2>
            </div>
            <p className="text-base text-gray-500 max-w-sm leading-relaxed">
              From instant answers to document analysis — EverlearnAI covers every part of your study workflow.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {FEATURES.map((f, i) => (
              <Reveal key={f.name} delay={i * 0.05}>
                <div className={`bg-white p-5 sm:p-8 h-full hover:bg-emerald-50/50 transition-colors duration-200 ${f.soon ? 'opacity-55' : ''}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${f.iconBg}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  <span className={`inline-block mt-4 text-[11px] font-semibold px-2.5 py-1 rounded-full ${f.chipColor}`}>
                    {f.chip}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ──────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-5 sm:px-6 bg-[#f9fafb]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
              <div className="w-4 h-0.5 bg-emerald-500 rounded" /> Your study dashboard <div className="w-4 h-0.5 bg-emerald-500 rounded" />
            </div>
            <h2 className="serif text-[clamp(28px,3.5vw,40px)] leading-tight tracking-tight mb-2">
              Everything you need in one place
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
              See all your quizzes, MCQ sets, flashcards, and chats at a glance — then jump back into any tool with a single click.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between bg-gray-900 text-white">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/10 font-semibold">Dashboard</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-white/70">AI Chat</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                  <span className="hidden sm:inline">Zubair Ahmed</span>
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-xs font-semibold flex items-center justify-center">
                    ZA
                  </span>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-5 sm:py-6 bg-slate-50 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Welcome back, Zubair 👋</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Pick a tool below and start studying smarter.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-2 text-xs">
                    {[
                      { label: 'Quizzes', value: '2' },
                      { label: 'Flashcard Sets', value: '2' },
                      { label: 'MCQs Created', value: '4' },
                      { label: 'Free Tokens Left', value: '200' },
                                      { label: 'Free Tokens Left', value: '10,000' },
                    ].map((s) => (
                      <div key={s.label} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-left">
                        <div className="text-[11px] text-slate-400">{s.label}</div>
                        <div className="text-sm font-semibold text-slate-900">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Quiz Generator', desc: 'AI-generated quizzes from any topic instantly.', cta: 'Generate Quiz' },
                  { title: 'MCQ Generator', desc: 'Multiple-choice questions from any text or file.', cta: 'Create MCQs' },
                  { title: 'Flashcards', desc: 'Short, high-retention cards from notes or docs.', cta: 'Generate Flashcards' },
                  { title: 'Assignment Help', desc: 'Outlines and rewrites for essays & reports.', cta: 'Get Help' },
                  { title: 'Document Q&A', desc: 'Upload PDFs, DOCX, PPTX and chat with them.', cta: 'Upload & Chat' },
                  { title: 'AI Chat', desc: 'Ask anything — homework, concepts, exam prep.', cta: 'Open Chat' },
                ].map((t) => (
                  <div key={t.title} className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{t.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                    </div>
                    <button className="mt-3 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-emerald-900 text-white text-xs font-semibold">
                      {t.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-xs sm:text-sm text-slate-500">
                  Recent quizzes, flashcard sets and MCQs appear here so you can resume in one click.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold"
                >
                  View my real dashboard
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ──────────────────────────────────────────────── */}
    

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-28 px-5 sm:px-6 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
              <div className="w-4 h-0.5 bg-emerald-500 rounded" /> How it works
            </div>
            <h2 className="serif text-[clamp(32px,4vw,52px)] leading-tight tracking-tight">
              Up and running<br /><em className="text-emerald-400">in 60 seconds</em>
            </h2>
          </Reveal>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div>
                  <div className="serif text-[80px] leading-none text-white/12 select-none mb-2">{s.num}</div>
                  <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center text-xs font-semibold text-white/80 mb-5">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{s.name}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
              <div className="w-4 h-0.5 bg-emerald-500 rounded" /> Student reviews <div className="w-4 h-0.5 bg-emerald-500 rounded" />
            </div>
            <h2 className="serif text-[clamp(32px,4vw,52px)] leading-tight tracking-tight">
              Loved by students<br /><em className="text-emerald-800">everywhere</em>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <div className={`rounded-2xl p-7 h-full border transition-all hover:-translate-y-1 hover:shadow-lg duration-200 ${
                  t.featured ? 'bg-emerald-50 border-emerald-200 shadow-md' : 'bg-white border-gray-100'
                }`}>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${t.avatarColor}`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-28 px-5 sm:px-6 bg-[#f7f6f2]">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
              <div className="w-4 h-0.5 bg-emerald-500 rounded" /> Pricing <div className="w-4 h-0.5 bg-emerald-500 rounded" />
            </div>
            <h2 className="serif text-[clamp(32px,4vw,52px)] leading-tight tracking-tight">
              Simple, student-friendly<br /><em className="text-emerald-800">pricing</em>
            </h2>
            <p className="mt-3 text-sm text-gray-500">Start free. Upgrade when you want file-based tools and higher limits.</p>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PLANS.map((plan) => (
                <div
                  key={plan.tier}
                  className={`rounded-2xl p-5 sm:p-8 border relative overflow-hidden ${
                    plan.featured
                      ? 'bg-emerald-900 border-emerald-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute top-5 right-5">
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full tracking-wide uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${plan.featured ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {plan.tier}
                  </div>

                  <div className="serif text-5xl tracking-tight mb-1">{plan.price}</div>
                  <div className={`text-xs font-medium mb-1 ${plan.featured ? 'text-emerald-400/70' : 'text-gray-400'}`}>{plan.usd} USD</div>
                  <div className={`text-sm mb-1 ${plan.featured ? 'text-emerald-300' : 'text-gray-400'}`}>{plan.period}</div>
                  <div className={`text-xs mb-3 ${plan.featured ? 'text-emerald-400/70' : 'text-gray-400'}`}>{plan.desc}</div>
                  {plan.comparison && (
                    <div className={`text-xs font-semibold mb-7 px-3 py-2 rounded-lg ${plan.featured ? 'bg-emerald-400/20 text-emerald-200' : 'bg-emerald-50 text-emerald-700'}`}>
                      {plan.comparison}
                    </div>
                  )}

                  <ul className={`space-y-3 mb-8 border-t pt-6 ${plan.featured ? 'border-white/10' : 'border-gray-100'}`}>
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        {f.ok
                          ? <Check size={14} className={plan.featured ? 'text-emerald-400' : 'text-emerald-600'} />
                          : <X size={14} className={plan.featured ? 'text-white/25' : 'text-gray-300'} />
                        }
                        <span className={!f.ok ? (plan.featured ? 'text-white/30' : 'text-gray-300') : (plan.featured ? 'text-white/85' : 'text-gray-700')}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.featured
                        ? 'bg-white text-emerald-900 hover:bg-emerald-50'
                        : 'bg-emerald-900 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {plan.cta} <ArrowRight size={14} className="inline ml-1" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Not ready to commit?{' '}
                <button onClick={() => navigate('/chat')} className="text-emerald-700 font-semibold hover:underline">
                  Start with 10,000 free tokens →
                </button>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ (OBJECTIONS) ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-28 px-5 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
              <div className="w-4 h-0.5 bg-emerald-500 rounded" /> FAQ <div className="w-4 h-0.5 bg-emerald-500 rounded" />
            </div>
            <h2 className="serif text-[clamp(32px,4vw,52px)] leading-tight tracking-tight">
              Quick answers to<br /><em className="text-emerald-800">common questions</em>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: 'Is it free to try?',
                a: 'Yes. You get 200 free tokens to test the experience before upgrading.',
              },
              {
                q: 'Will it help with exam prep?',
                a: 'That’s the core use case: generate MCQs/quizzes from your notes, take them instantly, and review explanations to fix weak areas.',
              },
              {
                q: 'Do you store my files?',
                a: 'Your uploads are used to generate results. For best privacy, avoid uploading sensitive personal documents.',
              },
              {
                q: 'What do I get with Pro?',
                a: 'Pro unlocks file-based flashcards/quizzes plus higher monthly token limits and priority support.',
              },
            ].map((x) => (
              <div key={x.q} className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="text-sm font-semibold text-gray-900">{x.q}</div>
                <div className="mt-2 text-sm text-gray-600 leading-relaxed">{x.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-32 px-5 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_400px_at_50%_50%,rgba(16,185,129,0.06),transparent_70%)]" />
        <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-4">
            <div className="w-4 h-0.5 bg-emerald-500 rounded" /> Ready to start? <div className="w-4 h-0.5 bg-emerald-500 rounded" />
          </div>
          <h2 className="serif text-[clamp(36px,5vw,64px)] leading-tight tracking-tight mb-4">
            Stop cramming.<br /><em className="text-emerald-800">Start learning.</em>
          </h2>
          <p className="text-base text-gray-500 mb-10">
            Join thousands of students who study smarter with EverlearnAI. Free to start — no credit card needed.
          </p>
          <div className="flex gap-3 justify-center flex-col sm:flex-row items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5"
            >
              <Sparkles size={15} /> Create free account
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Explore features <ArrowRight size={15} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ─── DOWNLOAD APP ────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 py-20 bg-gradient-to-b from-gray-50 to-[#fdfcf8]">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-emerald-700">📱 Now on Android</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Take EverlearnAI everywhere
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
              Download our Android app and study on the go. All the same AI tools — MCQs, quizzes, flashcards, chat — right in your pocket.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="/EverlearnAI.apk"
                download
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-semibold text-[15px] transition-all shadow-lg hover:-translate-y-0.5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 2.237l-2.088 3.613a7.87 7.87 0 00-6.87 0L6.477 2.237a.5.5 0 00-.866.5l2.06 3.564A8.002 8.002 0 004 13h16a8.002 8.002 0 00-3.671-6.699l2.06-3.564a.5.5 0 00-.866-.5zM9 10a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2zM4 14v7a1 1 0 001 1h1v-8H4zm15 0v7a1 1 0 01-1 1h-1v-8h2zM7 14v9h4v-9H7zm6 0v9h4v-9h-4z"/></svg>
                Download for Android
              </a>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-[15px] transition-all hover:-translate-y-0.5"
              >
                Use on Web <ArrowRight size={15} />
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Android 8.0+ required · iOS coming soon
            </p>
          </div>
        </Reveal>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-5 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md overflow-hidden">
              <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm">Everlearn<span className="text-emerald-700">AI</span></span>
          </div>
          <div className="flex gap-6">
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Support', '/support'], ['Contact', '/contact'], ['Blog', '/blog']].map(([l, href]) => (
              <a key={l} href={href} className="text-sm text-gray-400 hover:text-emerald-700 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-gray-400">© 2026 EverlearnAI. Built for students.</p>
        </div>
      </footer>

    </div>

    {authModalOpen && (
      <AuthModal
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => { setAuthModalOpen(false); navigate('/chat') }}
      />
    )}
    </>
  )
}