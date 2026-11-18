import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from './jwtDecode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('docintel-token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({ id: decoded.id, email: decoded.email || decoded.sub, role: decoded.role })
        localStorage.setItem('docintel-token', token)
      } catch {
        setToken(null)
        setUser(null)
        localStorage.removeItem('docintel-token')
      }
    } else {
      setUser(null)
      localStorage.removeItem('docintel-token')
    }
  }, [token])

  const login = (newToken) => setToken(newToken)
  const logout = () => setToken(null)

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
