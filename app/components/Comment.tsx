"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import CommentForm from "./CommentForm"

interface CommentProps {
  comment: any
  onCommentUpdated: () => void
  onCommentAdded: (comment: any) => void
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

export default function Comment({ comment, onCommentUpdated, onCommentAdded }: CommentProps) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isOwner = user?.id === comment.userId
  const canEdit = isOwner && comment.canEdit && !comment.isDeleted
  const canRestore = isOwner && comment.isDeleted && comment.canRestore

  const handleEdit = async () => {
    if (!editContent.trim()) return

    setLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsEditing(false)
      onCommentUpdated()
    } catch (err: any) {
      setError("Failed to update comment")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      onCommentUpdated()
    } catch (err: any) {
      setError("Failed to delete comment")
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      onCommentUpdated()
    } catch (err: any) {
      setError("Failed to restore comment")
    } finally {
      setLoading(false)
    }
  }

  const handleReplyAdded = (newReply: any) => {
    setShowReplyForm(false)
    onCommentAdded(newReply)
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${comment.isDeleted ? "opacity-60" : ""}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-800">{comment.user?.username}</span>
          <span className="text-gray-500 text-sm">{formatTimeAgo(comment.createdAt)}</span>
          {comment.canEdit && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Can edit</span>}
        </div>
      </div>

      <div className="mb-4">
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={2000}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || !editContent.trim()}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                  setError("")
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed">{comment.isDeleted ? "[Comment deleted]" : comment.content}</p>
        )}
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="flex space-x-3 text-sm">
        {!comment.isDeleted && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Reply
          </button>
        )}

        {canEdit && (
          <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-gray-500 font-medium">
            Edit
          </button>
        )}

        {isOwner && !comment.isDeleted && (
          <button onClick={handleDelete} className="text-red-600 hover:text-red-500 font-medium" disabled={loading}>
            Delete
          </button>
        )}

        {canRestore && (
          <button
            onClick={handleRestore}
            className="text-green-600 hover:text-green-500 font-medium"
            disabled={loading}
          >
            Restore
          </button>
        )}
      </div>

      {showReplyForm && (
        <CommentForm parentId={comment.id} onCommentAdded={handleReplyAdded} onCancel={() => setShowReplyForm(false)} />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-6 space-y-4 border-l-2 border-gray-100 pl-6">
          {comment.replies.map((reply: any) => (
            <Comment
              key={reply.id}
              comment={reply}
              onCommentUpdated={onCommentUpdated}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
