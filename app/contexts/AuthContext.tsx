"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

// Mock API functions for demo
const mockApi = {
  login: async (username: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (username === "demo" && password === "password") {
      return {
        access_token: "mock-token",
        user: { id: "1", username: "demo", email: "demo@example.com" },
      }
    }
    throw new Error("Invalid credentials")
  },

  register: async (username: string, email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      access_token: "mock-token",
      user: { id: "2", username, email },
    }
  },
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await mockApi.login(username, password)
      const { user: userData } = response

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.message || "Login failed")
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await mockApi.register(username, email, password)
      const { user: userData } = response

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.message || "Registration failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
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
