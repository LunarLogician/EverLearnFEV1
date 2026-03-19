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

  getChatCount: async () => {
    const response = await api.get('/chat/count')
    return response.data
  },

  getChats: async () => {
    const response = await api.get('/chat/history')
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
