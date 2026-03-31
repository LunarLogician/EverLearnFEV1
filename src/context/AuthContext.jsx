import { createContext, useState, useContext, useEffect } from 'react'
import { authService, streakService } from '../services/index'

const AuthContext = createContext()

function getCachedUser() {
  try {
    const raw = localStorage.getItem('ev_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveCachedUser(u) {
  try {
    if (u) localStorage.setItem('ev_user', JSON.stringify(u))
    else localStorage.removeItem('ev_user')
  } catch {}
}

export const AuthProvider = ({ children }) => {
  const cachedUser = getCachedUser()
  const hasToken = !!localStorage.getItem('token')
  // If we have a cached user + token, start with it so the page renders instantly
  const [user, setUser] = useState(cachedUser && hasToken ? cachedUser : null)
  const [loading, setLoading] = useState(!cachedUser && hasToken)
  const [error, setError] = useState(null)
  const [streak, setStreak] = useState(cachedUser?.streak || 0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const data = await authService.getCurrentUser()
      const u = data.user || data
      setUser(u)
      saveCachedUser(u)
      if (u) {
        setStreak(u.streak || 0)
        // Update streak silently — backend deduplicates same-day calls
        streakService.updateStreak().then(res => {
          if (res?.streak) setStreak(res.streak)
        }).catch(() => {})
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      localStorage.removeItem('token')
      saveCachedUser(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      setError(null)
      const data = await authService.register(name, email, password)
      // Registration now requires email verification — do NOT log in yet
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed'
      setError(errorMsg)
      throw err
    }
  }

  const verifyEmail = async (email, otp) => {
    try {
      setError(null)
      const data = await authService.verifyEmail(email, otp)
      if (data.user) { setUser(data.user); saveCachedUser(data.user) }
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed'
      setError(errorMsg)
      throw err
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const data = await authService.login(email, password)
      setUser(data.user)
      saveCachedUser(data.user)
      if (data.user) {
        setStreak(data.user.streak || 0)
        streakService.updateStreak().then(res => {
          if (res?.streak) setStreak(res.streak)
        }).catch(() => {})
      }
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed'
      setError(errorMsg)
      throw err
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    saveCachedUser(null)
    setStreak(0)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, register, verifyEmail, login, logout, streak }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
