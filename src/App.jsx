import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import PaywallModal from './components/PaywallModal'
import './styles/index.css'

const Home = lazy(() => import('./pages/Home'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MCQPage = lazy(() => import('./pages/MCQPage'))
const ExamPaperPage = lazy(() => import('./pages/ExamPaperPage'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const Support = lazy(() => import('./pages/Support'))
const Contact = lazy(() => import('./pages/Contact'))

function App() {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallProps, setPaywallProps] = useState({})

  useEffect(() => {
    const handler = (e) => {
      setPaywallProps(e.detail || {})
      setPaywallOpen(true)
    }
    window.addEventListener('upgrade:required', handler)
    return () => window.removeEventListener('upgrade:required', handler)
  }, [])

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<ChatProvider><ChatPage /></ChatProvider>} />
              <Route path="/dashboard" element={<ChatProvider><Dashboard /></ChatProvider>} />
              <Route path="/mcq" element={<MCQPage />} />
              <Route path="/exam-papers" element={<ExamPaperPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
          {paywallOpen && (
            <PaywallModal
              requiredPlan={paywallProps.requiredPlan}
              currentPlan={paywallProps.currentPlan}
              onClose={() => setPaywallOpen(false)}
            />
          )}
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App