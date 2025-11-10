import { useState } from "react";

function PostInput({ onPost }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);

    try {
      // Send text to backend for AI moderation
      const res = await fetch("http://127.0.0.1:5000/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      // Prepare new post object
      const newPost = {
        id: Date.now(),
        text,
        createdAt: new Date().toLocaleString(),
        status: data.status,
        severity: data.severity,
        reason: data.reason,
        score: data.score,
      };

      onPost(newPost);
      setText("");
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong with AI moderation.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <textarea
        rows="3"
        placeholder="Write your post..."
        className="w-full border rounded p-2 mb-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Moderating..." : "Post"}
      </button>
    </form>
  );
}

export default PostInput;
