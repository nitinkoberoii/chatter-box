import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      if (response.data.success) {
        onLogin(username);
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Connection error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">💬</div>
            <h1>ChatterBox</h1>
          </div>
          <p className="tagline">Connect, Chat, Share</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-violet btn-block"
            disabled={loading}
          >
            {loading ? <span className="spinner-small"></span> : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="link-violet">
              Register here
            </Link>
          </p>
        </div>
      </div>

      <div className="features-section">
        <h2>Why ChatterBox?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">💬</div>
            <h3>Real-time Chat</h3>
            <p>Instant messaging with your friends</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📁</div>
            <h3>File Sharing</h3>
            <p>Share files securely and quickly</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎙️</div>
            <h3>Voice Chat</h3>
            <p>Crystal clear voice calls</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Your privacy is our priority</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
