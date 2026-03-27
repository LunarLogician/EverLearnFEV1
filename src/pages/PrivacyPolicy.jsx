import { useNavigate } from 'react-router-dom'
import { SEOHelmet } from '../components/SEOHelmet'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <>
      <SEOHelmet 
        title="Privacy Policy - EverlearnAI"
        description="Learn how EverlearnAI protects your data and privacy. Transparent privacy practices for students."
        url="https://everlearn.ai/privacy"
        keywords="privacy policy, data protection, terms of service"
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

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: March 22, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-600">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who We Are</h2>
            <p>
              EverlearnAI ("we", "us", "our") is an AI-powered study platform operated by ZLab Services. We are reachable at{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account information:</strong> your email address and password (stored hashed) when you register.</li>
              <li><strong>Usage data:</strong> the messages, questions, quiz topics, and documents you submit to generate AI responses.</li>
              <li><strong>Uploaded files:</strong> documents (PDF, DOCX, PPTX, images) you upload for Document Q&A or assignment help. These are processed to generate your requested output and are not stored permanently beyond the active session.</li>
              <li><strong>Token usage:</strong> we track how many tokens you consume each billing cycle to enforce plan limits.</li>
              <li><strong>Payment information:</strong> processed entirely by our payment provider (Lemon Squeezy). We do not store your card details.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and device information collected automatically via standard server logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, maintain, and improve the EverlearnAI service.</li>
              <li>To process your AI requests and return results (chat, quizzes, flashcards, MCQs, exam papers).</li>
              <li>To manage your subscription and enforce usage limits.</li>
              <li>To send transactional emails (email verification, password reset). We do not send unsolicited marketing emails.</li>
              <li>To detect and prevent fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. AI Processing & Third Parties</h2>
            <p>
              Your prompts and uploaded content are sent to Anthropic (Claude API) to generate AI responses. Anthropic's usage policies apply. We do not sell or share your personal data with any other third parties for advertising or marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Retention</h2>
            <p>
              Your account data (email, usage history, saved quizzes, flashcards, MCQs, exam papers) is retained while your account is active. Uploaded files are used only to generate the requested output and are not stored beyond your session. You may request deletion of your account and associated data at any time by emailing{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies</h2>
            <p>
              We use only essential cookies required for authentication and session management. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Security</h2>
            <p>
              Passwords are stored using secure hashing. All data is transmitted over HTTPS. While we take reasonable precautions, no internet service can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Children's Privacy</h2>
            <p>
              EverlearnAI is designed to be suitable for users aged 7 and above. Users under 18 should use the platform with parental awareness. We do not knowingly collect personal data beyond what is required to operate the service. If you believe your child's data has been collected inappropriately, contact us at{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>{' '}
              and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time. To exercise these rights, email us at{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date at the top of this page. Continued use of EverlearnAI after changes constitutes your acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Contact</h2>
            <p>
              Questions about this policy? Reach us at{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>.
            </p>
          </section>

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
    </>
  )
}
