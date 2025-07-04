"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import CommentForm from "./CommentForm"
import CommentList from "./CommentList"
import NotificationDropdown from "./NotificationDropdown"

// Mock data for demo
const mockComments = [
  {
    id: "1",
    content: "This is a great comment system! The nested structure works really well.",
    userId: "1",
    user: { username: "demo", id: "1" },
    parentId: null,
    isDeleted: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    canEdit: false,
    canRestore: false,
    replies: [
      {
        id: "2",
        content: "I agree! The 15-minute edit window is a nice touch.",
        userId: "2",
        user: { username: "alice", id: "2" },
        parentId: "1",
        isDeleted: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        canEdit: false,
        canRestore: false,
        replies: [
          {
            id: "3",
            content: "Yes, and the notification system keeps everyone engaged!",
            userId: "3",
            user: { username: "bob", id: "3" },
            parentId: "2",
            isDeleted: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            canEdit: false,
            canRestore: false,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "4",
    content: "The Docker setup makes deployment so easy. Great architecture!",
    userId: "4",
    user: { username: "charlie", id: "4" },
    parentId: null,
    isDeleted: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    canEdit: false,
    canRestore: false,
    replies: [],
  },
]

export default function CommentApp() {
  const { user, logout } = useAuth()
  const [comments, setComments] = useState(mockComments)
  const [loading, setLoading] = useState(false)

  const handleCommentAdded = (newComment: any) => {
    if (newComment.parentId) {
      // Add reply to existing comment
      const addReplyToComment = (comments: any[]): any[] => {
        return comments.map((comment) => {
          if (comment.id === newComment.parentId) {
            return {
              ...comment,
              replies: [...comment.replies, { ...newComment, replies: [] }],
            }
          } else if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            }
          }
          return comment
        })
      }
      setComments(addReplyToComment(comments))
    } else {
      // Add new top-level comment
      setComments([{ ...newComment, replies: [] }, ...comments])
    }
  }

  const handleCommentUpdated = () => {
    // In a real app, this would refetch comments from the API
    console.log("Comment updated - would refetch from API")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Comment System</h1>
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={logout}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add a Comment</h2>
          <CommentForm onCommentAdded={handleCommentAdded} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Comments ({comments.length})</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading comments...</div>
            </div>
          ) : (
            <CommentList
              comments={comments}
              onCommentUpdated={handleCommentUpdated}
              onCommentAdded={handleCommentAdded}
            />
          )}
        </div>
      </div>
    </div>
  )
}
