import Comment from "./Comment"

interface CommentListProps {
  comments: any[]
  onCommentUpdated: () => void
  onCommentAdded: (comment: any) => void
}

export default function CommentList({ comments, onCommentUpdated, onCommentAdded }: CommentListProps) {
  if (!comments.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <div className="text-gray-500 text-lg">No comments yet</div>
        <div className="text-gray-400 text-sm mt-1">Be the first to comment!</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          onCommentUpdated={onCommentUpdated}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  )
}
