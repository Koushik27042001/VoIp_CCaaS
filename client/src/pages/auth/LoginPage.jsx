import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Mail, Lock, ShieldAlert, KeyRound } from "lucide-react";

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
    <div className="split-auth-container">
      {/* Left Side: Illustration Panel */}
      <div className="split-auth-illustration">
        {/* Background Ambient Orbs */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-[80px] animate-float-slow pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px] animate-float-medium pointer-events-none z-0" />
        
        {/* Centered Image */}
        <div className="illustration-img-container">
          <img 
            src="/login-illustration.png" 
            alt="CaaS Interface Illustration" 
            className="illustration-img"
          />
        </div>
        <div className="illustration-overlay" />
        <div className="illustration-badge">
          <h2 className="text-lg font-black text-white tracking-tight">Unified CCaaS Cockpit</h2>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Realtime Asterisk &amp; Twilio telephony, active customer scoreboards, dynamic agent status tracking, and instant CRM sync.
          </p>
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div className="split-auth-form bg-slate-950">
        {/* Ambient Spots for Form side */}
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 h-64 w-64 rounded-full bg-purple-500/5 blur-[90px] pointer-events-none" />

        <form className="auth-card relative w-full max-w-[420px] border border-white/10 bg-slate-900/40 p-8 rounded-3xl shadow-glow backdrop-blur-2xl transition duration-500" onSubmit={handleSubmit}>
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 p-px shadow-glow mb-4">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <KeyRound size={20} className="text-cyan-400 animate-pulse" />
              </div>
            </div>
            <p className="eyebrow tracking-[0.25em] text-cyan-300">VOIP COMMAND CENTER</p>
            <h1 className="mt-2 text-2xl font-black text-white tracking-tight">System Login</h1>
            <p className="muted-copy mt-1 text-sm text-slate-400">
              Sign in to start your secure calling session.
            </p>
          </div>

          {/* Alerts / Errors */}
          {(error || authError) ? (
            <div className="auth-error flex items-center gap-3 border border-rose-300/20 bg-rose-500/10 px-4 py-3 rounded-2xl text-xs font-bold text-rose-300 mb-4">
              <ShieldAlert size={16} className="shrink-0 text-rose-400" />
              <span>{error || authError}</span>
            </div>
          ) : null}

          {/* Input Fields */}
          <div className="space-y-4">
            <label className="auth-field">
              <span>Email Address</span>
              <div className="flex items-center gap-2 mt-1">
                <Mail size={16} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  placeholder="agent@company.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-white outline-none border-none p-0"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label className="auth-field block">
              <span>Password</span>
              <div className="flex items-center gap-2 mt-1">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent text-white outline-none border-none p-0"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>
          </div>

          {/* Submit */}
          <button className="primary-button auth-submit mt-6 w-full" type="submit" disabled={submitting}>
            {submitting ? "Establishing session..." : "Secure Sign In"}
          </button>

          {/* Footer */}
          <p className="auth-footer text-center text-xs mt-6 text-slate-500">
            First run on this system?{" "}
            <Link className="text-cyan-400 font-bold hover:underline transition" to="/setup">
              Initialize Admin
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
