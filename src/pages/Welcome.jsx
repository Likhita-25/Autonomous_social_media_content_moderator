import React from "react";

export default function Welcome() {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#1c2a4f", // Dark blue background for a modern feel
    color: "#e0e7ff",
    padding: "20px",
    boxSizing: "border-box",
    textAlign: "center",
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Semi-transparent white for a frosted glass effect
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    padding: "50px 70px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    animation: "fadeInUp 1s ease-in-out",
  };

  const headingStyle = {
    fontSize: "3rem",
    color: "#ffffff",
    marginBottom: "15px",
    letterSpacing: "1.5px",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  };

  const subHeadingStyle = {
    fontSize: "1.2rem",
    color: "#b0c4ff",
    marginBottom: "40px",
    fontWeight: "300",
  };

  const linkContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
  };

  const linkStyle = {
    textDecoration: "none",
    padding: "15px 35px",
    borderRadius: "50px",
    fontSize: "1.1rem",
    fontWeight: "600",
    transition: "transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
    letterSpacing: "0.5px",
  };

  const registerLinkStyle = {
    ...linkStyle,
    background: "linear-gradient(45deg, #4a90e2, #6a40e6)", // Gradient for a vibrant look
    color: "#fff",
    boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)",
  };

  const loginLinkStyle = {
    ...linkStyle,
    backgroundColor: "transparent",
    color: "#b0c4ff",
    border: "2px solid #b0c4ff",
    boxShadow: "0 4px 15px rgba(176, 196, 255, 0.2)",
  };

  const keyframes = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes gradientBackground {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Welcome, Content Moderator</h1>
        <p style={subHeadingStyle}>A powerful platform to help you manage and maintain a safe online community.</p>
        <div style={linkContainerStyle}>
          <a
            href="/register"
            style={registerLinkStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 6px 20px rgba(74, 144, 226, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 15px rgba(74, 144, 226, 0.4)";
            }}
          >
            Register
          </a>
          <a
            href="/login"
            style={loginLinkStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.color = "#ffffff";
              e.target.style.borderColor = "#ffffff";
              e.target.style.boxShadow = "0 6px 20px rgba(176, 196, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.color = "#b0c4ff";
              e.target.style.borderColor = "#b0c4ff";
              e.target.style.boxShadow = "0 4px 15px rgba(176, 196, 255, 0.2)";
            }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}