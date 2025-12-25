import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h2>Multi-Tenant SaaS</h2>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>

        {(user.role === "tenant_admin" || user.role === "super_admin") && (
          <Link to="/tasks">Tasks</Link>
        )}

        {user.role === "tenant_admin" && <Link to="/users">Users</Link>}

        {user.role === "super_admin" && <Link to="/tenants">Tenants</Link>}
      </div>

      <div className="user-menu">
        <span>{user.name} ({user.role})</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}