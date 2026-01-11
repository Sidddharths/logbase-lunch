import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import "./AuthPages.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState("employee"); // fixed for now
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage({ text: "Please fill in all fields", type: "error" });
      return;
    }

    // Password length validation
  if (password.length < 6) {
    setMessage({ text: "Password must be at least 6 characters long", type: "error" });
    return;
  }


    try {
      await registerUser(name, email, password, role);
      setMessage({ text: "Registered successfully! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ text: err.message || "Registration failed", type: "error" });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <h2>Employee Register</h2>
      
      <div className="auth-input-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          className="auth-input"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="auth-input-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="auth-input"
          type="email"
          placeholder="@logbase.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="auth-input-group password-container">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>
      
      <button className="auth-button" onClick={handleRegister}>Register</button>
      
      {message && (
        <div className={`auth-message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="auth-link">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
}

export default Register;