"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // Verify token is still valid
      axios
        .get("/api/auth/profile")
        .then((response) => {
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { username, password })
      const { access_token, user: userData } = response.data

      localStorage.setItem("token", access_token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed")
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/register", { username, email, password })
      const { access_token, user: userData } = response.data

      localStorage.setItem("token", access_token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
