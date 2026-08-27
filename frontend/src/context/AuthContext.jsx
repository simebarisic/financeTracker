import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { setUnauthorizedHandler } from '../api/client'
import { login as apiLogin } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('ft_username'))
  const [token, setToken] = useState(() => localStorage.getItem('ft_token'))

  const logout = useCallback(() => {
    localStorage.removeItem('ft_token')
    localStorage.removeItem('ft_username')
    setToken(null)
    setUsername(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const login = useCallback(async (user, password) => {
    const data = await apiLogin(user, password)
    localStorage.setItem('ft_token', data.token)
    localStorage.setItem('ft_username', data.username)
    setToken(data.token)
    setUsername(data.username)
  }, [])

  const value = useMemo(
    () => ({ username, token, isAuthenticated: !!token, login, logout }),
    [username, token, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
