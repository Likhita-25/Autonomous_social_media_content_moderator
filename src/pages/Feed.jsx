import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Feed() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState("");
  const [post, setPost] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const userFromState = location.state?.username;
    const userFromStorage = localStorage.getItem("username");

    if (userFromState) {
      setLoggedInUser(userFromState);
      localStorage.setItem("username", userFromState);
    } else if (userFromStorage) {
      setLoggedInUser(userFromStorage);
    } else {
      navigate("/"); // redirect to login if no user
    }
  }, [location.state, navigate]);

  if (!loggedInUser) return <p>Please login first</p>;

  const handlePost = async (textToPost) => {
    if (!textToPost.trim()) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loggedInUser, text: textToPost }),
      });

      const data = await response.json();
      setResult(data);
      setPost(""); // clear input field
    } catch (err) {
      console.error(err);
      setResult({ status: "error", message: "Something went wrong!" });
    }
  };

  const handleNavigation = (path) => {
    if (path === "/") {
      localStorage.removeItem("username");
      navigate("/");
    } else {
      navigate(path, { state: { username: loggedInUser } });
    }
  };

  const getSensitivityColor = (score) => {
    if (score < 30) return "#2ecc71"; // Green (Low)
    if (score < 70) return "#f1c40f"; // Yellow (Medium)
    return "#e74c3c"; // Red (High)
  };

  const getResultBorderColor = (result) => {
    if (!result) return "#bdc3c7";
    if (result.status === "approved") return "#2ecc71";
    if (result.status === "alert") return "#f39c12"; // sensitive alert
    return "#e74c3c"; // rejected
  };

  // --- Styles ---
  const PRIMARY_COLOR = "#3498db";
  const DARK_BG = "#2c3e50";
  const LIGHT_BG = "#ecf0f1";
  const CARD_BG = "#ffffff";
  const TEXT_COLOR_LIGHT = "#ffffff";
  const TEXT_COLOR_DARK = "#2c3e50";

  const mainContainerStyle = {
    display: "flex",
    fontFamily: "Roboto, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
    backgroundColor: LIGHT_BG,
  };

  const sidebarStyle = {
    width: "240px",
    backgroundColor: DARK_BG,
    color: TEXT_COLOR_LIGHT,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.2)",
    zIndex: 10,
  };

  const sidebarHeaderStyle = {
    fontSize: "1.5rem",
    marginBottom: "30px",
    fontWeight: "700",
    color: PRIMARY_COLOR,
  };

  const sidebarButtonStyle = {
    padding: "12px 15px",
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "1rem",
  };

  const logoutButtonStyle = {
    ...sidebarButtonStyle,
    marginTop: "auto",
    backgroundColor: "#e74c3c",
    color: TEXT_COLOR_LIGHT,
    fontWeight: "bold",
  };

  const mainContentStyle = {
    flex: 1,
    padding: "50px",
    backgroundColor: LIGHT_BG,
  };

  const postTitleStyle = {
    fontSize: "2rem",
    marginBottom: "20px",
    color: TEXT_COLOR_DARK,
  };

  const textareaStyle = {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    border: "2px solid #bdc3c7",
    borderRadius: "10px",
    resize: "vertical",
  };

  const submitButtonStyle = {
    marginTop: "20px",
    padding: "12px 30px",
    cursor: "pointer",
    backgroundColor: PRIMARY_COLOR,
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    fontWeight: "bold",
    fontSize: "1rem",
  };

  const resultCardStyle = {
    marginTop: "40px",
    padding: "25px",
    backgroundColor: CARD_BG,
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderLeft: `5px solid ${getResultBorderColor(result)}`,
  };

  const resultHeaderStyle = { marginBottom: "15px", borderBottom: "1px dashed #ddd", paddingBottom: "10px" };
  const listItemStyle = { marginBottom: "8px" };

  return (
    <div style={mainContainerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={sidebarHeaderStyle}>Welcome, {loggedInUser}</h2>
        <button style={sidebarButtonStyle} onClick={() => handleNavigation("/dashboard")}>Dashboard</button>
        <button style={{ ...sidebarButtonStyle, backgroundColor: PRIMARY_COLOR, color: TEXT_COLOR_LIGHT }} onClick={() => handleNavigation("/feed")}>Feed (Moderator)</button>
        <button style={sidebarButtonStyle} onClick={() => handleNavigation("/analytics")}>Analytics</button>
        <button style={logoutButtonStyle} onClick={() => handleNavigation("/")}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <h2 style={postTitleStyle}>Content Submission Check</h2>
        <textarea
          rows="5"
          style={textareaStyle}
          placeholder="Write your post..."
          value={post}
          onChange={(e) => setPost(e.target.value)}
        />
        <button onClick={() => handlePost(post)} style={submitButtonStyle}>Submit for Moderation</button>

        {/* Show result */}
        {result && (
          <div style={resultCardStyle}>
            <h3 style={resultHeaderStyle}>Moderation Result</h3>
            <p style={listItemStyle}>
              <strong>Status:</strong>{" "}
              <span style={{ color: getResultBorderColor(result), fontWeight: "bold" }}>{result.status}</span>
            </p>
            <p style={listItemStyle}><strong>Message:</strong> {result.message}</p>
            <p style={listItemStyle}><strong>Sentiment:</strong> {result.sentiment}</p>

            {result.sensitivity_score !== undefined && (
              <div style={{ marginTop: "15px" }}>
                <strong style={listItemStyle}>Sensitivity Score:</strong> {result.sensitivity_score}%
                <div style={{ width: "100%", height: "10px", backgroundColor: "#ddd", borderRadius: "5px", marginTop: "8px", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: `${result.sensitivity_score}%`,
                      height: "100%",
                      backgroundColor: getSensitivityColor(result.sensitivity_score),
                      borderRadius: "5px",
                      transition: "width 0.5s ease"
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Sensitive Topics Alert */}
            {result.topics && result.topics.length > 0 && (
              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fdf5e6", borderRadius: "5px", border: "1px solid #f1c40f" }}>
                <strong>⚠️ Sensitive Topics Detected:</strong> {result.topics.join(", ")}
                <p style={{ fontSize: "0.9rem", color: "#e67e22", marginTop: "5px" }}>
                  Your post contains sensitive content. It has been rewritten and flagged for moderation.
                </p>
              </div>
            )}

            {result.suggestions && (
              <div style={{ marginTop: "15px" }}>
                <strong>Suggestions:</strong>
                <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                  {result.suggestions.map((s, i) => <li key={i} style={{ marginBottom: "5px", color: '#34495e' }}>{s}</li>)}
                </ul>
              </div>
            )}

            {result.auto_correction && result.auto_correction.length > 0 && (
              <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                <strong style={{ color: PRIMARY_COLOR }}>Auto-Correction:</strong>
                <p style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "5px", marginTop: "5px", border: '1px solid #c9dfff' }}>
                  {result.auto_correction}
                </p>
                <p style={{ fontStyle: "italic", color: "#27ae60", fontSize: '0.9rem', marginTop: '5px' }}>
                  This post was automatically rewritten and submitted to ensure platform safety.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
