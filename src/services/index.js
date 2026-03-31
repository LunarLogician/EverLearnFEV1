import api from '@/utils/api'

export const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  verifyEmail: async (email, otp) => {
    const response = await api.post('/auth/verify-email', { email, otp })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  resendOtp: async (email) => {
    const response = await api.post('/auth/resend-verification-otp', { email })
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },
}

export const chatService = {
  sendMessage: async (message, documentId = null, image = null, chatId = null) => {
    // Only include fields if they are strings (not null)
    const payload = { message };
    if (typeof documentId === 'string') payload.documentId = documentId;
    if (typeof image === 'string') payload.image = image;
    if (typeof chatId === 'string') payload.chatId = chatId;
    console.log('[chatService.sendMessage] Sending:', payload);
    try {
      // Use /chat/direct for generic chat (no document)
      const response = await api.post('/chat/direct', payload);
      console.log('[chatService.sendMessage] Response:', response.data);
      return response.data;
    } catch (err) {
      console.error('[chatService.sendMessage] Error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Streaming variant — calls /chat/stream and fires callbacks as SSE events arrive.
  // onChunk(text): called for each token chunk
  // Returns a Promise that resolves with { chatId, tokenCount } on completion
  // or rejects with an Error on stream-level or HTTP errors.
  sendMessageStream: (message, documentId = null, image = null, chatId = null, onChunk, signal = null) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
    const token = localStorage.getItem('token')
    const payload = { message }
    if (typeof documentId === 'string') payload.documentId = documentId
    if (typeof image === 'string') payload.image = image
    if (typeof chatId === 'string') payload.chatId = chatId

    return new Promise(async (resolve, reject) => {
      let response
      try {
        response = await fetch(`${API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
          signal,
        })
      } catch (networkErr) {
        if (networkErr.name === 'AbortError') {
          return resolve({ chatId: null, tokenCount: 0, aborted: true })
        }
        return reject(new Error('Network error — could not reach the server.'))
      }

      if (!response.ok) {
        // Non-2xx before the stream starts — parse JSON error body
        try {
          const errData = await response.json()
          const err = new Error(errData.message || 'Stream request failed')
          if (errData.upgradeRequired) err.upgradeRequired = true
          if (errData.requiredPlan) err.requiredPlan = errData.requiredPlan
          return reject(err)
        } catch {
          return reject(new Error(`Stream request failed with status ${response.status}`))
        }
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            // SSE lines are separated by \n\n
            const parts = buffer.split('\n\n')
            buffer = parts.pop() // keep incomplete trailing part
            for (const part of parts) {
              const line = part.trim()
              if (!line.startsWith('data:')) continue
              let json
              try { json = JSON.parse(line.slice(5).trim()) } catch { continue }
              if (json.type === 'chunk') {
                onChunk(json.text)
              } else if (json.type === 'done') {
                resolve({ chatId: json.chatId, tokenCount: json.tokenCount })
              } else if (json.type === 'error') {
                reject(new Error(json.message || 'Stream error'))
              }
            }
          }
        } catch (readErr) {
          if (readErr.name === 'AbortError') {
            return resolve({ chatId: null, tokenCount: 0, aborted: true })
          }
          reject(new Error('Stream read error: ' + readErr.message))
        }
      }

      pump()
    })
  },


  getChatCount: async () => {
    const response = await api.get('/chat/count')
    return response.data
  },

  getChats: async () => {
    const response = await api.get('/chat/history')
    return response.data
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/chat/${chatId}`)
    return response.data
  },

  deleteAllChats: async () => {
    const response = await api.delete('/chat/all')
    return response.data
  },
}

export const quizService = {
  getUserQuizzes: async () => {
    const response = await api.get('/quiz')
    return response.data
  },
  generateFromText: async (topic, numberOfQuestions = 5, difficulty = 'intermediate', quizTitle = '') => {
  const response = await api.post('/quiz/generate-from-text', {
    topic,
    numberOfQuestions,
    difficulty,
    quizTitle,
  })
  return response.data
},
  generateFromFile: async (file, numberOfQuestions = 5, difficulty = 'intermediate') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('numberOfQuestions', numberOfQuestions)
    formData.append('difficulty', difficulty)
    const response = await api.post('/quiz/generate-from-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  generateFromDocument: async (documentId, numberOfQuestions = 5, difficulty = 'intermediate') => {
    const response = await api.post('/quiz/generate', { documentId, numberOfQuestions, difficulty, quizTitle: `Quiz from Document` })
    return response.data
  },
  getQuiz: async (id) => {
    const response = await api.get(`/quiz/${id}`)
    return response.data
  },
  submitQuiz: async (id, answers) => {
    const response = await api.post(`/quiz/${id}/submit`, { answers })
    return response.data
  },
  deleteQuiz: async (id) => {
    const response = await api.delete(`/quiz/${id}`)
    return response.data
  },
}

export const mcqService = {
  getMCQs: async () => {
    const response = await api.get('/mcq/list')
    return response.data
  },
  generateFromText: async (sourceText, numQuestions = 5, title = '') => {
    const response = await api.post('/mcq/generate', { sourceText, numQuestions, title })
    return response.data
  },
  generateFromDocument: async (documentId, numQuestions = 5, title = '') => {
    const response = await api.post('/mcq/generate-from-document', { documentId, numQuestions, title })
    return response.data
  },
  generateFromFile: async (file, numQuestions = 5, title = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('numQuestions', numQuestions)
    if (title) formData.append('title', title)
    const response = await api.post('/mcq/generate-from-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  getMCQ: async (mcqId) => {
    const response = await api.get(`/mcq/${mcqId}`)
    return response.data
  },
  submitAnswers: async (mcqId, userAnswers) => {
    const response = await api.post('/mcq/submit', { mcqId, userAnswers })
    return response.data
  },
  deleteMCQ: async (mcqId) => {
    const response = await api.delete(`/mcq/${mcqId}`)
    return response.data
  },
}

export const streakService = {
  // Call this once per session (on login or on mount). Backend handles dedup.
  updateStreak: async () => {
    const response = await api.post('/auth/streak')
    return response.data  // { streak: number }
  },
}

export const flashcardService = {
  getUserFlashcards: async () => {
    const response = await api.get('/flashcards')
    return response.data
  },
  getFlashcardSet: async (id) => {
    const response = await api.get(`/flashcards/${id}`)
    return response.data
  },
  generateFromText: async (topic, numberOfCards = 10, difficulty = 'intermediate', setTitle = '') => {
    const response = await api.post('/flashcards/generate-from-text', { topic, numberOfCards, difficulty, setTitle })
    return response.data
  },
  generateFromFile: async (file, numberOfCards = 10, difficulty = 'intermediate') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('numberOfCards', numberOfCards)
    formData.append('difficulty', difficulty)
    const response = await api.post('/flashcards/generate-from-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  deleteFlashcardSet: async (id) => {
    const response = await api.delete(`/flashcards/${id}`)
    return response.data
  },
}

export const documentService = {
  uploadDocument: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getUserDocuments: async () => {
    const response = await api.get('/documents')
    return response.data
  },

  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },
}

export const examPaperService = {
  list: async () => {
    const response = await api.get('/exam-papers/list')
    return response.data
  },
  generate: async ({ sourceText, title, subject, difficulty, numQuestions, duration }) => {
    const response = await api.post('/exam-papers/generate', {
      sourceText,
      title,
      subject,
      difficulty,
      numQuestions,
      duration,
    })
    return response.data
  },
  generateFromDocument: async ({ documentId, title, subject, difficulty, numQuestions, duration }) => {
    const response = await api.post('/exam-papers/generate-from-document', {
      documentId,
      title,
      subject,
      difficulty,
      numQuestions,
      duration,
    })
    return response.data
  },
  generateFromFile: async ({ file, title, subject, difficulty, numQuestions, duration }) => {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    if (subject) formData.append('subject', subject)
    if (difficulty) formData.append('difficulty', difficulty)
    if (numQuestions) formData.append('numQuestions', numQuestions)
    if (duration) formData.append('duration', duration)
    const response = await api.post('/exam-papers/generate-from-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  getExamPaper: async (examId) => {
    const response = await api.get(`/exam-papers/${examId}`)
    return response.data
  },
  deleteExamPaper: async (examId) => {
    const response = await api.delete(`/exam-papers/${examId}`)
    return response.data
  },
}

export const subscriptionService = {
  getPlans: async () => {
    const response = await api.get('/subscription/plans')
    return response.data
  },

  getSubscription: async () => {
    const response = await api.get('/subscription')
    return response.data
  },

  createCheckout: async (plan) => {
    const response = await api.post('/subscription/checkout', { plan })
    return response.data
  },

  cancel: async () => {
    const response = await api.post('/subscription/cancel')
    return response.data
  },
}
