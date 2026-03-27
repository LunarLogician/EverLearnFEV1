import { useNavigate } from 'react-router-dom'
import { SEOHelmet } from '../components/SEOHelmet'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <>
      <SEOHelmet 
        title="Terms of Service - EverlearnAI"
        description="Read the terms and conditions for using EverlearnAI study platform."
        url="https://everlearn.ai/terms"
        keywords="terms of service, terms and conditions, user agreement"
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: March 22, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-600">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using EverlearnAI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms are between you and ZLab Services, reachable at{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>
              EverlearnAI is an AI-powered study platform providing features including AI chat, quiz and MCQ generation, flashcard creation, assignment help, document Q&A, and exam paper generation. Features available to you depend on your subscription plan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must provide a valid email address and verify it to access the Service.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 7 years old to create an account. Users under 18 should have parental awareness when using the Service.</li>
              <li>You may not create accounts for others without their consent or operate multiple accounts to circumvent usage limits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Free Tier & Subscriptions</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>New accounts receive 200 free tokens upon registration. Once exhausted, a paid plan is required to continue using AI features.</li>
              <li>Paid plans (Basic, Pro) are billed monthly. Prices are displayed in PKR on the pricing page.</li>
              <li>Subscriptions renew automatically unless cancelled before the next billing date.</li>
              <li>We reserve the right to change pricing with reasonable notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Acceptable Use</h2>
            <p>You agree not to use EverlearnAI to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Generate content that is harmful, illegal, defamatory, or violates any third party's rights.</li>
              <li>Attempt to access other users' data or reverse-engineer the Service.</li>
              <li>Submit content that violates academic integrity policies at your institution — you are solely responsible for how you use AI-generated output.</li>
              <li>Overload, attack, or disrupt the Service or its infrastructure.</li>
              <li>Resell or redistribute AI-generated output as your own product without disclosure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. AI-Generated Content</h2>
            <p>
              AI responses generated by EverlearnAI are provided for educational assistance only. They may contain errors or inaccuracies. Do not rely solely on AI-generated content for critical academic, medical, legal, or financial decisions. You are responsible for verifying any information before use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Intellectual Property</h2>
            <p>
              EverlearnAI and its original content, branding, and technology are owned by ZLab Services. AI-generated output produced using your prompts and content belongs to you, subject to the terms of our underlying AI provider (Anthropic). You retain ownership of content you upload.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Refund Policy</h2>
            <p>
              We offer refunds on a case-by-case basis within 7 days of a charge if the Service did not function as described. To request a refund, email{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>{' '}
              with your account email and reason.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, without prior notice. To cancel your subscription, email us at{' '}
              <a href="mailto:zlabservices@gmail.com" className="text-emerald-700 hover:underline">zlabservices@gmail.com</a>{' '}
              with your account email and we will cancel it promptly. You keep access until the end of your current billing period and will not be charged again.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or that AI-generated content will be accurate, complete, or suitable for any particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ZLab Services shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Changes to Terms</h2>
            <p>
              We may revise these Terms from time to time. Continued use of the Service after updates constitutes your acceptance of the new terms. We will update the "Last updated" date above when changes are made.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Contact</h2>
            <p>
              Questions about these Terms? Email us at{' '}
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
