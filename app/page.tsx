"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Login from "./components/Login"
import Register from "./components/Register"
import CommentApp from "./components/CommentApp"

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<"login" | "register" | "app">("login")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {currentView === "login" ? (
          <Login onSwitchToRegister={() => setCurrentView("register")} />
        ) : (
          <Register onSwitchToLogin={() => setCurrentView("login")} />
        )}
      </div>
    )
  }

  return <CommentApp />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
