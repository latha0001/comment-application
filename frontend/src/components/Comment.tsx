"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import axios from "axios"
import classNames from "classnames"

import { useAuth } from "../contexts/AuthContext"
import CommentForm from "./CommentForm"

interface CommentProps {
  comment: any
  onCommentUpdated: () => void
}

export default function Comment({ comment, onCommentUpdated }: CommentProps) {
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
      await axios.patch(`/api/comments/${comment.id}`, {
        content: editContent.trim(),
      })

      setIsEditing(false)
      onCommentUpdated()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update comment")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    setLoading(true)
    try {
      await axios.delete(`/api/comments/${comment.id}`)
      onCommentUpdated()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete comment")
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    try {
      await axios.post(`/api/comments/${comment.id}/restore`)
      onCommentUpdated()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to restore comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={classNames("comment", { "comment-deleted": comment.isDeleted })}>
      <div className="comment-header">
        <span className="comment-author">{comment.user?.username}</span>
        <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
      </div>

      <div className="comment-content">
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="form-control"
              maxLength={2000}
            />
            <div className="comment-actions" style={{ marginTop: "0.5rem" }}>
              <button onClick={handleEdit} className="btn btn-small" disabled={loading || !editContent.trim()}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                  setError("")
                }}
                className="btn btn-secondary btn-small"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>{comment.isDeleted ? "[Comment deleted]" : comment.content}</p>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="comment-actions">
        {!comment.isDeleted && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="btn btn-small btn-secondary">
            Reply
          </button>
        )}

        {canEdit && (
          <button onClick={() => setIsEditing(true)} className="btn btn-small btn-secondary">
            Edit
          </button>
        )}

        {isOwner && !comment.isDeleted && (
          <button onClick={handleDelete} className="btn btn-small btn-danger" disabled={loading}>
            Delete
          </button>
        )}

        {canRestore && (
          <button onClick={handleRestore} className="btn btn-small" disabled={loading}>
            Restore
          </button>
        )}
      </div>

      {showReplyForm && (
        <CommentForm
          parentId={comment.id}
          onCommentAdded={() => {
            setShowReplyForm(false)
            onCommentUpdated()
          }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply: any) => (
            <Comment key={reply.id} comment={reply} onCommentUpdated={onCommentUpdated} />
          ))}
        </div>
      )}
    </div>
  )
}
