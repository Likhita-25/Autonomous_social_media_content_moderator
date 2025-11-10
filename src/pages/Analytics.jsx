import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useNavigate, useLocation } from "react-router-dom";

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || localStorage.getItem("username");

  const [posts, setPosts] = useState({ approved: [], rejected: [] });

  useEffect(() => {
    if (!username) {
      navigate("/"); // redirect if not logged in
      return;
    }
    loadPosts();
  }, [username, navigate]);

  const loadPosts = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/analytics_posts?username=${username}`);
      const data = await res.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setPosts({
        approved: data.approved || [],
        rejected: data.rejected || [],
      });
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Prepare chart data
  const statusData = [
    { name: "Approved", value: posts.approved.length },
    { name: "Rejected", value: posts.rejected.length },
  ];

  const COLORS = ["#18bc9c", "#e74c3c"]; // green and red

  // --- Styles ---
  const PRIMARY_COLOR = "#3498db";
  const DARK_BG = "#2c3e50";
  const LIGHT_BG = "#ecf0f1";
  const CARD_BG = "#ffffff";
  const TEXT_COLOR_LIGHT = "#ffffff";
  const TEXT_COLOR_DARK = "#2c3e50";

  const mainContainerStyle = { display: "flex", height: "100vh", fontFamily: "Roboto, sans-serif", backgroundColor: LIGHT_BG };
  const sidebarStyle = { width: "240px", background: DARK_BG, color: TEXT_COLOR_LIGHT, display: "flex", flexDirection: "column", padding: "20px" };
  const usernameHeaderStyle = { marginBottom: "50px", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" };
  const linkStyle = { color: "rgba(255,255,255,0.7)", marginBottom: "15px", textDecoration: "none", padding: "10px 15px", borderRadius: "6px", fontWeight: "500", cursor: "pointer" };
  const activeLinkStyle = { ...linkStyle, color: TEXT_COLOR_LIGHT, backgroundColor: PRIMARY_COLOR, fontWeight: "600" };
  const logoutButtonStyle = { marginTop: "auto", padding: "12px", backgroundColor: "#e74c3c", color: TEXT_COLOR_LIGHT, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
  const mainContentStyle = { flex: 1, padding: "30px", overflowY: "auto", backgroundColor: LIGHT_BG };
  const navbarStyle = { height: "60px", background: CARD_BG, color: TEXT_COLOR_DARK, display: "flex", alignItems: "center", paddingLeft: "25px", fontSize: "24px", fontWeight: "700", marginBottom: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
  const chartsContainerStyle = { display: "flex", flexWrap: "wrap", gap: "30px", marginTop: "20px" };
  const chartCardStyle = { padding: "20px", backgroundColor: CARD_BG, borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", flex: "1 1 400px" };

  return (
    <div style={mainContainerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h3 style={usernameHeaderStyle}>User: {username}</h3>
        <div style={linkStyle} onClick={() => navigate("/dashboard", { state: { username } })}>Dashboard</div>
        <div style={linkStyle} onClick={() => navigate("/feed", { state: { username } })}>Feed</div>
        <div style={activeLinkStyle}>Analytics</div>
        <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={navbarStyle}>Analytics Dashboard</div>

        <div style={chartsContainerStyle}>
          {/* Pie Chart */}
          <div style={chartCardStyle}>
            <h4 style={{ marginBottom: "20px", color: TEXT_COLOR_DARK }}>Post Status Distribution</h4>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div style={chartCardStyle}>
            <h4 style={{ marginBottom: "20px", color: TEXT_COLOR_DARK }}>Posts Approved vs Rejected</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke={TEXT_COLOR_DARK} />
                <YAxis allowDecimals={false} stroke={TEXT_COLOR_DARK} />
                <Tooltip />
                <Bar dataKey="value" fill={PRIMARY_COLOR} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optional: List posts */}
        <div style={{ marginTop: "40px" }}>
          <h4>Approved Posts</h4>
          {posts.approved.map(p => (
            <div key={p.id} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#dff0d8", borderRadius: "6px" }}>
              {p.content}
            </div>
          ))}

          <h4 style={{ marginTop: "30px" }}>Rejected Posts</h4>
          {posts.rejected.map(p => (
            <div key={p.id} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f2dede", borderRadius: "6px" }}>
              <p>{p.content}</p>
              <p><strong>Suggestion:</strong> {p.suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
