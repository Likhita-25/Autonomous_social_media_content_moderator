import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get logged-in username
  const loggedInUser = location.state?.username || localStorage.getItem("username"); 

  const [posts, setPosts] = useState([]);
  const [newPostId, setNewPostId] = useState(null);

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    loadPosts();

    const intervalId = setInterval(loadPosts, 5000);
    return () => clearInterval(intervalId);
  }, [loggedInUser, navigate]);

  const loadPosts = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/moderated_posts?username=${loggedInUser}`);
      const data = await res.json();

      if (data.length > posts.length && data.length > 0) {
        const latestPost = data[0];
        if (!posts.length || latestPost.id !== posts[0].id) {
          setNewPostId(latestPost.id);
          setTimeout(() => setNewPostId(null), 1500);
        }
      }

      setPosts(data);
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getStatusColor = (status) => {
    if (status.toLowerCase() === "approved") return "#18bc9c";
    if (status.toLowerCase() === "rejected") return "#e74c3c";
    return "#f1c40f";
  };

  // --- STYLES ---
  const PRIMARY_COLOR = "#3498db";
  const DARK_BG = "#2c3e50";
  const LIGHT_BG = "#ecf0f1";
  const CARD_BG = "#ffffff";
  const TEXT_COLOR_LIGHT = "#ffffff";
  const TEXT_COLOR_DARK = "#2c3e50";

  const mainContainerStyle = {
    display: "flex",
    height: "100vh",
    fontFamily: "Roboto, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: LIGHT_BG,
  };

  const sidebarStyle = {
    width: "240px",
    background: DARK_BG,
    color: TEXT_COLOR_LIGHT,
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.2)",
    zIndex: 10,
  };

  const usernameHeaderStyle = { 
    marginBottom: "50px", 
    fontSize: "1.2rem", 
    fontWeight: "bold",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    paddingBottom: "15px",
    color: PRIMARY_COLOR,
  };

  const linkBaseStyle = {
    padding: "12px 15px",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: "10px",
    transition: "background-color 0.2s, color 0.2s",
    fontWeight: "500",
    fontSize: "1rem",
  };

  const inactiveLinkStyle = {
    ...linkBaseStyle,
    backgroundColor: "transparent",
    color: "rgba(255, 255, 255, 0.8)",
  };

  const activeLinkStyle = {
    ...linkBaseStyle,
    backgroundColor: PRIMARY_COLOR,
    color: TEXT_COLOR_LIGHT,
    fontWeight: "600",
  }

  const logoutButtonStyle = {
    ...linkBaseStyle,
    marginTop: "auto",
    backgroundColor: "#e74c3c", 
    color: TEXT_COLOR_LIGHT,
    fontWeight: "bold",
  };

  const mainContentStyle = { 
    flex: 1, 
    padding: "30px", 
    overflowY: "auto",
    backgroundColor: LIGHT_BG,
  };

  const navbarStyle = {
    height: "60px",
    background: CARD_BG,
    color: TEXT_COLOR_DARK,
    display: "flex",
    alignItems: "center",
    paddingLeft: "25px",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const postCardBase = {
    padding: "15px 20px",
    marginBottom: "15px",
    borderRadius: "10px",
    backgroundColor: CARD_BG,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, background-color 0.5s",
    cursor: "pointer",
  };

  const newPostHighlightStyle = {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    border: `1px solid ${PRIMARY_COLOR}`,
  };

  const postCardStyle = (p) => {
    const status = p.status || (p.sentiment === "POSITIVE" ? "approved" : "rejected");
    return {
      ...postCardBase,
      borderLeft: `5px solid ${getStatusColor(status)}`,
      ...(p.id === newPostId ? newPostHighlightStyle : {}),
    };
  };

  const postTextStyle = { fontSize: "1rem", color: TEXT_COLOR_DARK, lineHeight: "1.4", marginBottom: '10px' };
  const usernameTextStyle = { fontWeight: "bold", color: PRIMARY_COLOR, marginRight: '8px' };
  const footerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' };
  const smallTextStyle = { fontSize: "0.85rem", color: "#7f8c8d" };
  const statusBadgeStyle = (status) => ({
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      backgroundColor: getStatusColor(status),
      color: TEXT_COLOR_LIGHT,
  });

  if (!loggedInUser) return null; // wait for auth

  return (
    <div style={mainContainerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h3 style={usernameHeaderStyle}>User: {loggedInUser}</h3>
        <button onClick={() => navigate("/dashboard")} style={activeLinkStyle}>Dashboard</button>
        <button onClick={() => navigate("/feed", { state: { username: loggedInUser } })} style={inactiveLinkStyle}>Feed</button>
        <button onClick={() => navigate("/analytics", { state: { username: loggedInUser } })} style={inactiveLinkStyle}>Analytics</button>
        <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={navbarStyle}>Moderated Content Feed</div>
        <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '10px' }}>
          {posts.length === 0 && <p style={{ color: TEXT_COLOR_DARK }}>No posts have been moderated yet by this user.</p>}
          {posts.map((p) => {
            const status = p.status || (p.sentiment === "POSITIVE" ? "approved" : "rejected");
            return (
              <div
                key={p.id}
                style={postCardStyle(p)}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <p style={postTextStyle}>
                  <span style={usernameTextStyle}>{p.username}</span>
                  {p.content}
                </p>
                <div style={footerStyle}>
                  <p style={smallTextStyle}>Sentiment: {p.sentiment}</p>
                  <span style={statusBadgeStyle(status)}>{status.toUpperCase()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
