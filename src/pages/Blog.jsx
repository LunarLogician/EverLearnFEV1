import { Link } from 'react-router-dom'
import { SEOHelmet } from '../components/SEOHelmet'
import { ArrowLeft, Clock, ArrowRight, Tag } from 'lucide-react'

export const BLOG_POSTS = [
  {
    slug: 'best-ai-tools-for-studying-2026',
    title: 'Best AI Tools for Studying in 2026: Complete Guide for Students',
    excerpt: 'Discover the top AI-powered study tools that help you generate MCQs, flashcards, quizzes, and get instant homework help. Compare features, pricing, and find the best AI study assistant.',
    date: '2026-04-10',
    readTime: '8 min read',
    tags: ['AI Study Tools', 'Exam Prep', 'Productivity'],
    image: '/logo.png',
  },
  {
    slug: 'how-to-use-ai-mcq-generator-exam-prep',
    title: 'How to Use an AI MCQ Generator for Exam Prep (Step-by-Step)',
    excerpt: 'Learn how to generate hundreds of multiple-choice questions from any topic or document using AI. Master exam preparation with smart practice testing strategies.',
    date: '2026-04-08',
    readTime: '6 min read',
    tags: ['MCQ Generator', 'Exam Prep', 'Study Tips'],
    image: '/logo.png',
  },
  {
    slug: 'ai-flashcard-generator-spaced-repetition',
    title: 'AI Flashcard Generator + Spaced Repetition: The Science of Remembering Everything',
    excerpt: 'Why AI-generated flashcards combined with spaced repetition is the most effective way to memorize anything. Turn your notes into retention machines.',
    date: '2026-04-05',
    readTime: '7 min read',
    tags: ['Flashcards', 'Spaced Repetition', 'Study Science'],
    image: '/logo.png',
  },
  {
    slug: 'ai-homework-help-is-it-cheating',
    title: 'AI Homework Help: Is It Cheating? How to Use AI Ethically for Studying',
    excerpt: 'The ethical guide to using AI tutors and homework assistants. Learn the difference between learning with AI and having AI do your work — and why it matters.',
    date: '2026-04-02',
    readTime: '5 min read',
    tags: ['AI Ethics', 'Homework Help', 'Students'],
    image: '/logo.png',
  },
  {
    slug: 'how-to-study-for-exams-with-ai',
    title: 'How to Study for Exams with AI: A 7-Day Plan That Actually Works',
    excerpt: 'A practical 7-day exam prep plan using AI study tools. From generating practice questions to active recall with AI flashcards — this plan covers everything.',
    date: '2026-03-28',
    readTime: '9 min read',
    tags: ['Exam Prep', 'Study Plan', 'AI Tools'],
    image: '/logo.png',
  },
  {
    slug: 'document-qa-ai-study-hack',
    title: 'Document Q&A: The AI Study Hack That Saves Hours of Reading',
    excerpt: 'Upload your textbook PDF and ask it questions — that\'s Document Q&A. Learn how students are using AI to extract answers from 200-page textbooks in seconds.',
    date: '2026-03-25',
    readTime: '5 min read',
    tags: ['Document Q&A', 'AI Tools', 'Productivity'],
    image: '/logo.png',
  },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#fdfcf8]">
      <SEOHelmet
        title="Blog - AI Study Tips, Guides & Tools | EverlearnAI"
        description="Expert guides on using AI for studying. Learn how to generate MCQs, flashcards, and quizzes with AI. Study tips, exam prep strategies, and AI tool comparisons for students."
        keywords="AI study tips, AI tools for students, how to study with AI, MCQ generator guide, AI flashcards, exam prep AI, study blog"
        url="https://everlearn.ai/blog"
      />

      {/* Nav */}
      <nav className="bg-[#fdfcf8]/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="EverlearnAI" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">
              Everlearn<span className="text-emerald-700">AI</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-5 pt-16 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Blog
        </h1>
        <p className="mt-3 text-lg text-gray-500 max-w-2xl">
          Study smarter with AI — guides, tips, and strategies for students who want to ace their exams using AI-powered tools.
        </p>
      </header>

      {/* Posts Grid */}
      <main className="max-w-4xl mx-auto px-5 pb-20">
        <div className="grid gap-8">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-emerald-800 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="mt-3 text-gray-500 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{formatDate(post.date)}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read more <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-5 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md overflow-hidden">
              <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm">Everlearn<span className="text-emerald-700">AI</span></span>
          </div>
          <div className="flex gap-6">
            {[['Home', '/'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Support', '/support'], ['Contact', '/contact']].map(([l, href]) => (
              <Link key={l} to={href} className="text-sm text-gray-400 hover:text-emerald-700 transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-xs text-gray-400">© 2026 EverlearnAI. Built for students.</p>
        </div>
      </footer>
    </div>
  )
}
