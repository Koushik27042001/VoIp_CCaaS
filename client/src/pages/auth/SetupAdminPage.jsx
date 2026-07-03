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

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!setupAvailable) return;
    setSubmitting(true);
    setError("");

    try {
      await setupAdminAccount(form);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Setup failed. An admin may already exist."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>

          <h1 className="text-3xl font-bold text-white">System Setup</h1>

          <p className="text-slate-300 mt-2">
            Initialize your admin cockpit
          </p>
        </div>

        {!statusLoading && !setupAvailable && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Setup already completed. Please sign in with existing admin
            credentials.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Create Admin
            </h2>

            <p className="text-gray-500 mt-1">
              Only available when the directory is empty.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Admin Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Name
            </label>
            <input
              value={form.name}
              required
              minLength={2}
              placeholder="John Doe"
              onChange={(e) => updateForm("name", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-slate-900"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              required
              placeholder="admin@company.com"
              onChange={(e) => updateForm("email", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-slate-900"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              onChange={(e) => updateForm("password", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !setupAvailable}
            className={`w-full rounded-xl py-3 font-semibold text-white transition duration-300 ${
              submitting || !setupAvailable
                ? "cursor-not-allowed bg-violet-400"
                : "bg-violet-600 hover:bg-violet-700 active:scale-[0.98]"
            }`}
          >
            {submitting ? "Initializing..." : "Provision Admin Cockpit"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already configured?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-300">
          © {new Date().getFullYear()} VoIP CCaaS Platform
        </p>
      </div>
    </div>
  );
}
