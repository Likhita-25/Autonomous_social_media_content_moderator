import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/register", {
        username,
        password,
      });

      setMessage(response.data.message);

      // ✅ Automatically navigate to login after success
      if (response.data.message === "User registered successfully") {
        setTimeout(() => {
          navigate("/login");
        }, 1500); // short delay so user sees success message
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Something went wrong!");
      }
    }
  };

  // --- STYLES BASED ON THE DARK/FROSTED GLASS THEME ---

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#1c2a4f", // Dark blue background
    color: "#e0e7ff",
    padding: "20px",
  };

  const cardStyle = {
    maxWidth: "400px",
    width: "100%", 
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Frosted glass effect
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  };

  const inputBaseStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "16px",
    color: "#ffffff",
  };

  const buttonStyle = {
    padding: "12px 25px",
    // Vibrant gradient for the primary button
    background: "linear-gradient(45deg, #4a90e2, #6a40e6)", 
    color: "#fff",
    border: "none",
    borderRadius: "50px", // Pill shape
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "600",
    width: "100%",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)",
  };

  const messageStyle = {
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    // Dynamic styling for success/error in the dark theme
    backgroundColor: message.includes("successfully") 
      ? "rgba(0, 255, 0, 0.1)"
      : "rgba(255, 0, 0, 0.1)", 
    color: message.includes("successfully") 
      ? "#90EE90"
      : "#FFB6C1", 
    border: message.includes("successfully") 
      ? "1px solid rgba(0, 255, 0, 0.3)"
      : "1px solid rgba(255, 0, 0, 0.3)",
  };

  const labelStyle = { 
    display: "block", 
    marginBottom: "8px", 
    fontWeight: "600", 
    color: "#b0c4ff" 
  };
  // --- END STYLES ---

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#ffffff" }}>
          Create Account
        </h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputBaseStyle}
            />
          </div>
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputBaseStyle}
            />
          </div>
          <button
            type="submit"
            style={buttonStyle}
            // Hover effect for the button
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(74, 144, 226, 0.6)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(74, 144, 226, 0.4)";
            }}
          >
            Register
          </button>
        </form>
        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </div>
  );
}

export default Register;