import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import "./AuthPages.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    setError({ text: "Please fill in all fields", type: "error" });
    return;
  }

  try {
    const response = await loginUser(email, password); // Must return { name, email, role }
    
    // Save to localStorage for global access
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response); // Optional if you're using React Context or props

    if (response.role === "admin") navigate("/admin");
    else navigate("/employee");
  } catch (err) {
    setError({ text: err.message || "Login failed", type: "error" });
  }
};


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      
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
      
      <button className="auth-button" onClick={handleLogin}>Login</button>
      
      {error && (
        <div className={`auth-message ${error.type}`}>
          {error.text}
        </div>
      )}
      
      <div className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
}

export default Login;