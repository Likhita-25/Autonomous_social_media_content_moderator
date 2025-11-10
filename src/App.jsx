import { useState } from "react";
import PostCard from "./components/PostCard";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);

  function moderate(text) {
    const badWords = ["hate", "kill", "spam"];
    const flagged = badWords.some((w) => text.toLowerCase().includes(w));
    const reasons = badWords.filter((w) => text.toLowerCase().includes(w));
    return {
      flagged,
      reasons,
      status: flagged ? "Flagged" : "Approved",
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    const moderation = moderate(text);
    const newPost = {
      id: Date.now(),
      text,
      createdAt: new Date().toLocaleTimeString(),
      ...moderation,
    };

    setPosts([newPost, ...posts]);
    setText("");
  }

  function updateStatus(id, status) {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  return (
    <div>
      {/* Header */}
      <header className="navbar">
        <h1>Content Moderator</h1>
      </header>

      {/* Post Input */}
      <div className="input-card">
        <form onSubmit={handleSubmit}>
          <textarea
            rows="3"
            placeholder="Write something..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      </div>

      {/* Feed */}
      <div className="feed">
        {posts.length === 0 ? (
          <p className="empty">No posts yet. Start writing!</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={updateStatus} />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
