import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getUser } from '../api/recipes'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  // При наличии токена подгружаем профиль пользователя.
  useEffect(() => {
    let active = true
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    getUser()
      .then((res) => {
        if (active) setUser(res.data)
      })
      .catch(() => {
        // Токен невалиден — выходим.
        if (active) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
