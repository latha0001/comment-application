"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"

interface CommentFormProps {
  parentId?: string
  onCommentAdded: () => void
  onCancel?: () => void
}

export default function CommentForm({ parentId, onCommentAdded, onCancel }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError("")

    try {
      await axios.post("/api/comments", {
        content: content.trim(),
        parentId,
      })

      setContent("")
      onCommentAdded()
      if (onCancel) onCancel()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={parentId ? "reply-form" : "comment-form"}>
      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          required
          maxLength={2000}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="comment-actions">
        <button type="submit" className="btn" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
