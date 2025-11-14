import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username,
        password,
      });

      if (response.data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed");
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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo">
            <div className="logo-icon">🚀</div>
            <h1>Join ChatterBox</h1>
          </div>
          <p className="tagline">Create your account and start chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>✅</span>
              <p>{success}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Choose a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <small className="field-hint">At least 3 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <small className="field-hint">At least 4 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="input-field"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-violet btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-small"></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link-violet">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h2>🎉 Welcome to ChatterBox!</h2>
          <p>Join thousands of users who are already connected and chatting.</p>

          <div className="features-list">
            <div className="feature-check">
              <span className="check-icon">✓</span>
              <span>Instant real-time messaging</span>
            </div>
            <div className="feature-check">
              <span className="check-icon">✓</span>
              <span>Secure file sharing</span>
            </div>
            <div className="feature-check">
              <span className="check-icon">✓</span>
              <span>HD voice calls</span>
            </div>
            <div className="feature-check">
              <span className="check-icon">✓</span>
              <span>Privacy-focused design</span>
            </div>
            <div className="feature-check">
              <span className="check-icon">✓</span>
              <span>User-friendly interface</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
