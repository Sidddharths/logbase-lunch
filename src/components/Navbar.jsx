// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Logbase Lunch Program</h2>
      <ul>
        {/* <li><Link to="/">Home</Link></li>
        {!user && <li><Link to="/login">Login</Link></li>}
        {user?.role === "employee" && <li><Link to="/employee">Dashboard</Link></li>}
        {user?.role === "admin" && <li><Link to="/admin">Admin Panel</Link></li>} */}
        {user && <li className="logout-btn" onClick={logout}>Logout</li>}
      </ul>
    </nav>
  );
}

export default Navbar;