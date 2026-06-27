import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchSetupStatus } from "../../api/api";

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
    <div className="auth-page relative overflow-hidden">
      <div className="absolute right-16 top-16 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <form className="auth-card relative max-w-[460px]" onSubmit={handleSubmit}>
        <p className="eyebrow">Initial Setup</p>
        <h1>Create Admin</h1>
        <p className="muted-copy">This endpoint only works while the database has no users.</p>

        {!statusLoading && !setupAvailable ? (
          <div className="auth-error">
            Setup already completed. Please sign in with existing admin credentials.
          </div>
        ) : null}
        {error ? <div className="auth-error">{error}</div> : null}

        <label className="auth-field block">
          <span>Name</span>
          <input value={form.name} required minLength={2} onChange={(event) => updateForm("name", event.target.value)} />
        </label>
        <label className="auth-field mt-3 block">
          <span>Email</span>
          <input type="email" value={form.email} required onChange={(event) => updateForm("email", event.target.value)} />
        </label>
        <label className="auth-field mt-3 block">
          <span>Password</span>
          <input type="password" value={form.password} required minLength={8} onChange={(event) => updateForm("password", event.target.value)} />
        </label>

        <button
          className="primary-button auth-submit"
          type="submit"
          disabled={submitting || !setupAvailable}
        >
          {submitting ? "Creating..." : "Create Admin"}
        </button>

        <p className="auth-footer">
          Already configured? <Link className="text-cyan-300" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
