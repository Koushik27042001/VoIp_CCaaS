import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authLoading, authError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await login(email, password);
      const fallback = user.role === "admin" ? "/admin" : "/agent";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page relative overflow-hidden">
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <form className="auth-card relative max-w-[430px]" onSubmit={handleSubmit}>
        <p className="eyebrow">VoIP CCaaS</p>
        <h1>Command Login</h1>
        <p className="muted-copy">Agents and admins sign in from one secure workspace.</p>

        {(error || authError) ? <div className="auth-error">{error || authError}</div> : null}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            placeholder="agent@company.com"
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="auth-field mt-3 block">
          <span>Password</span>
          <input
            type="password"
            value={password}
            placeholder="Minimum 8 characters"
            autoComplete="current-password"
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button className="primary-button auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-footer">
          First run? <Link className="text-cyan-300" to="/setup">Create admin</Link>
        </p>
      </form>
    </div>
  );
}
