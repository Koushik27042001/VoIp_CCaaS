import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchSetupStatus } from "../../api/api";
import { User, Mail, Lock, KeyRound, ShieldAlert } from "lucide-react";

export default function SetupAdminPage() {
  const navigate = useNavigate();
  const { setupAdminAccount, isAuthenticated, authLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [setupAvailable, setSetupAvailable] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    let mounted = true;

    fetchSetupStatus()
      .then((res) => {
        if (!mounted) return;
        setSetupAvailable(Boolean(res.data?.canSetup));
      })
      .catch(() => {
        if (!mounted) return;
        setSetupAvailable(true);
      })
      .finally(() => {
        if (!mounted) return;
        setStatusLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!setupAvailable) return;
    setSubmitting(true);
    setError("");

    try {
      await setupAdminAccount(form);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Setup failed. An admin may already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="split-auth-container">
      {/* Left Side: Illustration Panel */}
      <div className="split-auth-illustration">
        {/* Background Ambient Orbs */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-[80px] animate-float-slow pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px] animate-float-medium pointer-events-none z-0" />
        
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
          <h2 className="text-lg font-black text-white tracking-tight">System Provisioning</h2>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Configure backend dialing policies, register Asterisk SIP trunks, scale agents, and monitor key analytics dashboards.
          </p>
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div className="split-auth-form bg-slate-950">
        {/* Ambient Spots for Form side */}
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-violet-500/5 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 h-64 w-64 rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

        {!statusLoading && !setupAvailable ? (
          <div className="auth-error flex items-center gap-3 border border-rose-300/20 bg-rose-500/10 px-4 py-3 rounded-2xl text-xs font-bold text-rose-300 mb-4 max-w-[440px] w-full">
            <ShieldAlert size={16} className="shrink-0 text-rose-400 animate-pulse" />
            <span>Setup already completed. Please sign in with existing admin credentials.</span>
          </div>
        ) : null}

        <form className="auth-card relative w-full max-w-[440px] border border-white/10 bg-slate-900/40 p-8 rounded-3xl shadow-glow backdrop-blur-2xl transition duration-500" onSubmit={handleSubmit}>
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-px shadow-glow mb-4">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <KeyRound size={20} className="text-violet-400 animate-pulse" />
              </div>
            </div>
            <p className="eyebrow tracking-[0.25em] text-violet-300">SYSTEM INITIALIZATION</p>
            <h1 className="mt-2 text-2xl font-black text-white tracking-tight">Create Admin</h1>
            <p className="muted-copy mt-1 text-sm text-slate-400">
              Only available when the directory is empty.
            </p>
          </div>

          {/* Error Alert */}
          {error ? (
            <div className="auth-error flex items-center gap-3 border border-rose-300/20 bg-rose-500/10 px-4 py-3 rounded-2xl text-xs font-bold text-rose-300 mb-4">
              <ShieldAlert size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Form Inputs */}
          <div className="space-y-4">
            <label className="auth-field">
              <span>Admin Name</span>
              <div className="flex items-center gap-2 mt-1">
                <User size={16} className="text-slate-500 shrink-0" />
                <input
                  value={form.name}
                  required
                  minLength={2}
                  placeholder="John Doe"
                  className="w-full bg-transparent text-white outline-none border-none p-0"
                  onChange={(event) => updateForm("name", event.target.value)}
                />
              </div>
            </label>

            <label className="auth-field block">
              <span>Email Address</span>
              <div className="flex items-center gap-2 mt-1">
                <Mail size={16} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  value={form.email}
                  required
                  placeholder="admin@company.com"
                  className="w-full bg-transparent text-white outline-none border-none p-0"
                  onChange={(event) => updateForm("email", event.target.value)}
                />
              </div>
            </label>

            <label className="auth-field block">
              <span>Password</span>
              <div className="flex items-center gap-2 mt-1">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type="password"
                  value={form.password}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-transparent text-white outline-none border-none p-0"
                  onChange={(event) => updateForm("password", event.target.value)}
                />
              </div>
            </label>
          </div>

          <button className="primary-button auth-submit mt-6 w-full" type="submit" disabled={submitting || !setupAvailable}>
            {submitting ? "Initializing cockpit..." : "Provision Admin Cockpit"}
          </button>

          {/* Footer */}
          <p className="auth-footer text-center text-xs mt-6 text-slate-500">
            Already configured?{" "}
            <Link className="text-cyan-400 font-bold hover:underline transition" to="/login">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
