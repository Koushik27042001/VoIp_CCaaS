import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function SetupAdminPage() {
  const navigate = useNavigate();
  const { setupAdminAccount, isAuthenticated, authLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dialer" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await setupAdminAccount({ name, email, password });
      navigate("/dialer", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Setup failed. An admin may already exist — try logging in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Initial Setup</p>
        <h1>Create Admin</h1>
        <p className="muted-copy">
          One-time setup when no users exist in the database.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <label className="auth-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Admin name"
            required
            minLength={2}
          />
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
            minLength={8}
          />
        </label>

        <button className="primary-button auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Admin"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
