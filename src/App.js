// src/App.js
//table format is in viewbill of employee dashboard
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Employee from "./pages/Employee";

function App() {
  const [user, setUser] = useState(null);

  

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        
        {/* Role-protected routes */}
        <Route
          path="/employee"
          element={
            user?.role === "employee" ? (
              <Employee user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
  path="/admin/*"
  element={
    user?.role === "admin" ? <Admin user={user} /> : <Navigate to="/login" replace />
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
