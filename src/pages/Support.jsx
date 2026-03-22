import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MessageSquare, FileText, Zap, HelpCircle } from 'lucide-react'

const FAQS = [
  {
    q: 'How do I upgrade my plan?',
    a: 'Go to your Dashboard, click on any Pro feature card, and the upgrade modal will appear. You can also visit the pricing section on the homepage.',
  },
  {
    q: 'My AI response was wrong or cut off — what do I do?',
    a: 'Try rephrasing your prompt or breaking it into smaller parts. If the issue persists, email us with the prompt and we will investigate.',
  },
  {
    q: 'I uploaded a PDF but it says "processing failed".',
    a: 'Make sure the file is under 10 MB, not password-protected, and in PDF, DOCX, PPTX, or image format. Scanned image-only PDFs may not extract text correctly.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Email us at zlabservices@gmail.com with your account email and the subject line "Cancel subscription". We will cancel it the same day. You keep access until the end of your current billing period and won\'t be charged again.',
  },
  {
    q: 'I was charged but my plan did not update.',
    a: 'This can take a minute or two. Try refreshing the page. If it still shows the wrong plan after 10 minutes, email us with your payment receipt.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes, within 7 days of a charge if the service did not work as described. Email us with your account email and reason.',
  },
  {
    q: 'What file types can I upload?',
    a: 'PDF, DOCX, PPTX, TXT, JPG, and PNG. Maximum file size is 10 MB.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We use HTTPS, hashed passwords, and do not sell your data. Uploaded files are processed to generate results and are not stored permanently. See our Privacy Policy for full details.',
  },
]

export default function Support() {
  const navigate = useNavigate()

  return (
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

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">Help Center</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Support</h1>
          <p className="text-base text-gray-500">
            Find answers to common questions below, or reach us directly at{' '}
            <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 font-semibold hover:underline">
              zlabservices@gmail.com
            </a>
          </p>
        </div>

        {/* Quick contact card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Email support</p>
              <p className="text-xs text-gray-500">We typically reply within 24 hours.</p>
            </div>
          </div>
          <a
            href="mailto:zlabservices@gmail.com"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <Mail size={14} /> Send an email
          </a>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle size={20} className="text-emerald-700" /> Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-2xl border border-gray-100 bg-white p-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">{item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Still stuck?{' '}
            <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 font-semibold hover:underline">
              Email us directly →
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-100 px-5 sm:px-6 py-8 mt-10">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
  )
}
