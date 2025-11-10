export default function PostCard({ post, onUpdate }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status approved";
      case "Flagged":
        return "status flagged";
      case "Removed":
        return "status removed";
      case "Appeal":
        return "status appeal";
      default:
        return "status";
    }
  };

  return (
    <div className="post-card">
      <p className="text">{post.text}</p>
      <small className="time">Posted at {post.createdAt}</small>

      <div className="status-line">
        <span className={getStatusClass(post.status)}>{post.status}</span>
        {post.flagged && post.reasons.length > 0 && (
          <span className="reasons">
            Reasons: {post.reasons.join(", ")}
          </span>
        )}
      </div>

      <div className="actions">
        <button onClick={() => onUpdate(post.id, "Approved")}>Approve</button>
        <button onClick={() => onUpdate(post.id, "Removed")}>Remove</button>
        <button onClick={() => onUpdate(post.id, "Appeal")}>Appeal</button>
      </div>
    </div>
  );
}
