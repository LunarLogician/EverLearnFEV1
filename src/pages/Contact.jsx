import { useNavigate } from 'react-router-dom'
import { SEOHelmet } from '../components/SEOHelmet'
import { ArrowLeft, Mail, MessageCircle, Clock } from 'lucide-react'

export default function Contact() {
  const navigate = useNavigate()

  return (
    <>
      <SEOHelmet 
        title="Contact Us - Support & Feedback - EverlearnAI"
        description="Get in touch with EverlearnAI support team. We're here to help with questions and feedback."
        url="https://everlearn.ai/contact"
        keywords="contact support, customer support, feedback, help center"
      />
    <div className="bg-[#fdfcf8] min-h-screen text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-5 sm:px-12 py-4 flex items-center gap-4 bg-[#fdfcf8]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to home
        </button>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md overflow-hidden">
            <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-sm">
            Everlearn<span className="text-emerald-700">AI</span>
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-5 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">Get in touch</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Contact Us</h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Have a question, bug report, billing issue, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        {/* Contact cards */}
        <div className="space-y-4 mb-12">
          <a
            href="mailto:zlabservices@gmail.com"
            className="flex items-center gap-4 p-6 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-900 text-white flex items-center justify-center shrink-0 group-hover:bg-emerald-700 transition-colors">
              <Mail size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Email</p>
              <p className="text-base text-emerald-700 font-medium truncate">zlabservices@gmail.com</p>
              <p className="text-xs text-gray-400 mt-1">Best for support, billing, and general questions</p>
            </div>
          </a>

          <div className="flex items-center gap-4 p-6 rounded-2xl border border-gray-100 bg-white">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Response time</p>
              <p className="text-sm text-gray-500">We typically reply within <strong className="text-gray-700">24 hours</strong> on weekdays.</p>
            </div>
          </div>
        </div>

        {/* What to include */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-12">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-emerald-700" /> When emailing, please include:
          </h2>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">·</span>
              Your account email address
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">·</span>
              A clear description of your issue or question
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">·</span>
              Screenshots or error messages if relevant
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">·</span>
              Your subscription plan (Free / Basic / Pro)
            </li>
          </ul>
        </div>

        {/* CTA button */}
        <a
          href="mailto:zlabservices@gmail.com"
          className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[15px] transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5"
        >
          <Mail size={16} /> Open email app
        </a>

        <p className="text-center text-xs text-gray-400 mt-4">
          Or copy the address: <span className="font-medium text-gray-600 select-all">zlabservices@gmail.com</span>
        </p>
      </main>

      <footer className="border-t border-gray-100 px-5 sm:px-6 py-8 mt-10">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 EverlearnAI. Built for students.</p>
          <div className="flex gap-5">
            <a href="/privacy" className="text-xs text-gray-400 hover:text-emerald-700 transition-colors">Privacy</a>
            <a href="/terms" className="text-xs text-gray-400 hover:text-emerald-700 transition-colors">Terms</a>
            <a href="/support" className="text-xs text-gray-400 hover:text-emerald-700 transition-colors">Support</a>
            <a href="/contact" className="text-xs text-gray-400 hover:text-emerald-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
