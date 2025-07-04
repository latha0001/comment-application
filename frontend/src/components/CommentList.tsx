import Comment from "./Comment"

interface CommentListProps {
  comments: any[]
  onCommentUpdated: () => void
}

export default function CommentList({ comments, onCommentUpdated }: CommentListProps) {
  if (!comments.length) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onCommentUpdated={onCommentUpdated} />
      ))}
    </div>
  )
}
