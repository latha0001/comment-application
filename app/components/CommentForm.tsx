"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

interface CommentFormProps {
  parentId?: string
  onCommentAdded: (comment: any) => void
  onCancel?: () => void
}

export default function CommentForm({ parentId, onCommentAdded, onCancel }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newComment = {
        id: Date.now().toString(),
        content: content.trim(),
        userId: user?.id,
        user: { username: user?.username, id: user?.id },
        parentId: parentId || null,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        canEdit: true,
        canRestore: false,
      }

      setContent("")
      onCommentAdded(newComment)
      if (onCancel) onCancel()
    } catch (err: any) {
      setError("Failed to post comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${parentId ? "bg-gray-50 p-4 rounded-lg mt-4" : "bg-white p-6 rounded-lg shadow-sm border"}`}
    >
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={parentId ? 3 : 4}
          maxLength={2000}
          required
        />
        <div className="text-right text-sm text-gray-500 mt-1">{content.length}/2000</div>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || !content.trim()}
        >
          {loading ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
