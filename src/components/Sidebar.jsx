import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/analytics">Analytics</Link></li>
      </ul>
    </aside>
  );
}
export default Sidebar;
