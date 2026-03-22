import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import ChatPage from './pages/ChatPage'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import MCQPage from './pages/MCQPage'
import ExamPaperPage from './pages/ExamPaperPage'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Support from './pages/Support'
import Contact from './pages/Contact'
import PaywallModal from './components/PaywallModal'
import './styles/index.css'

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
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mcq" element={<MCQPage />} />
            <Route path="/exam-papers" element={<ExamPaperPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </BrowserRouter>
        {paywallOpen && (
          <PaywallModal
            requiredPlan={paywallProps.requiredPlan}
            currentPlan={paywallProps.currentPlan}
            onClose={() => setPaywallOpen(false)}
          />
        )}
      </ChatProvider>
    </AuthProvider>
  )
}

export default App