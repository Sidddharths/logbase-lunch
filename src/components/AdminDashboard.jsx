
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>👋 Welcome, Admin</h1>
        <nav className="admin-nav">
          <NavLink to="daily-summary" className="admin-link">Lunch Plan</NavLink>
          <NavLink to="admin-meal-selector" className="admin-link">My Meal</NavLink>
          .
          <NavLink to="vendor-summary" className="admin-link">Vendor Summary</NavLink>
          <NavLink to="employee-bills" className="admin-link">Employee Bills</NavLink>
          .
          <NavLink to="menu-manager" className="admin-link">Menu Manager</NavLink>
          <NavLink to="holiday-manager" className="admin-link">Holiday Manager</NavLink>
        
        </nav>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
