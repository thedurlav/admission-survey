import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../context/AuthContext";

export default function Login() {
  const [role, setRole] = useState("surveyor");
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await login(form.username, form.password);
      if (user.role !== role) {
        setError(
          `This account is not a ${role}. Please select the correct role.`,
        );
        setLoading(false);
        return;
      }
      navigate(role === "admin" ? "/admin" : "/surveyor");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials.",
      );
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (
      !form.fullName ||
      !form.username ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/signup", {
        username: form.username.toLowerCase(),
        password: form.password,
        fullName: form.fullName,
      });
      // Auto login after signup
      localStorage.setItem("token", res.data.token);
      window.location.href = "/surveyor";
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setForm({ username: "", password: "", fullName: "", confirmPassword: "" });
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setError("");
    if (newRole === "admin") setMode("login");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">🏫</div>
        <div className="login-title">AdmissionTrack</div>
        <div className="login-sub">School Field Survey System</div>

        {/* Role selector */}
        <div className="role-selector">
          {["surveyor", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              className={`role-btn ${role === r ? "selected" : ""}`}
              onClick={() => switchRole(r)}
            >
              <div className="role-btn-icon">{r === "admin" ? "🛡️" : "📋"}</div>
              <div className="role-btn-label">
                {r === "admin" ? "Admin" : "Surveyor"}
              </div>
            </button>
          ))}
        </div>

        {/* Login / Signup tabs — only show for surveyor */}
        {role === "surveyor" && (
          <div
            style={{
              display: "flex",
              background: "var(--gray-100)",
              borderRadius: "var(--radius-sm)",
              padding: 3,
              marginBottom: "1.25rem",
              gap: 3,
            }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                style={{
                  flex: 1,
                  padding: "7px",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: mode === m ? "var(--white)" : "transparent",
                  color: mode === m ? "var(--gray-800)" : "var(--gray-500)",
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={role === "admin" ? "admin" : "your username"}
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
              }}
            >
              {loading
                ? "Signing in..."
                : `Sign in as ${role === "admin" ? "Admin" : "Surveyor"}`}
            </button>
          </form>
        )}

        {/* SIGNUP FORM — surveyor only */}
        {mode === "signup" && role === "surveyor" && (
          <form className="login-form" onSubmit={handleSignup}>
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                autoCapitalize="words"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. ravi_kumar (no spaces)"
                autoCapitalize="none"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
              }}
            >
              {loading ? "Creating account..." : "Create Surveyor Account"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--gray-400)",
                marginTop: 4,
              }}
            >
              Account will be active immediately
            </p>
          </form>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "var(--gray-400)",
            marginTop: "1.25rem",
          }}
        >
          Developed by Team EduERP | © 2026 AdmissionTrack
        </p>
      </div>
    </div>
  );
}
