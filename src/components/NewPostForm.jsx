import { useState } from "react";

export default function NewPostForm({ onPost }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onPost(text);
    setText("");
  }

  return (
    <form className="new-post" onSubmit={handleSubmit}>
      <textarea
        rows="3"
        placeholder="What's happening?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Post</button>
    </form>
  );
}
