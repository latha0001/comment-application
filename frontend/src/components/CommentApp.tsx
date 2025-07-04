"use client"
import { useQuery } from "react-query"
import axios from "axios"

import { useAuth } from "../contexts/AuthContext"
import CommentForm from "./CommentForm"
import CommentList from "./CommentList"
import NotificationDropdown from "./NotificationDropdown"

export default function CommentApp() {
  const { user, logout } = useAuth()

  const {
    data: comments,
    isLoading,
    refetch,
  } = useQuery("comments", () => axios.get("/api/comments").then((res) => res.data), {
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return <div className="loading">Loading comments...</div>
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1>Comment System</h1>
          <div className="user-info">
            <NotificationDropdown />
            <span>Welcome, {user?.username}</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <CommentForm onCommentAdded={refetch} />
        <CommentList comments={comments || []} onCommentUpdated={refetch} />
      </div>
    </>
  )
}
