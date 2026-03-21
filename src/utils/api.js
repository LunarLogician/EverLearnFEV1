import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only force logout on 401 for protected routes, NOT for login/register
    const url = error.config?.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    // Normalize 413 (payload too large / file too big) into a readable message
    if (error.response?.status === 413) {
      if (!error.response.data) error.response.data = {}
      error.response.data.message =
        error.response.data?.message || 'File is too large. Please check the size limit and try again.'
    }
    // Dispatch upgrade event so any component can show the paywall
    if (
      (error.response?.status === 403 || error.response?.status === 429) &&
      error.response?.data?.upgradeRequired
    ) {
      window.dispatchEvent(new CustomEvent('upgrade:required', {
        detail: {
          requiredPlan: error.response.data.requiredPlan || 'basic',
          currentPlan: error.response.data.currentPlan,
        },
      }))
    }
    return Promise.reject(error)
  }
)

export default api
