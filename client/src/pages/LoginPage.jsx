import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, isAuthenticated, authLoading, authError } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  if (!authLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
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
      setError(
        err.response?.data?.message ||
        "Login failed. Check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">V</span>
          </div>

          <h1 className="text-3xl font-bold text-white">
            VoIP CCaaS
          </h1>

          <p className="text-slate-300 mt-2">
            Agent Login Portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-1">
              Sign in to access your dialer, leads, and calls.
            </p>
          </div>

          {(error || authError) && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error || authError}
            </div>
          )}

          {/* Email */}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="agent@company.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-900"
            />
          </div>

          {/* Password */}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-xl py-3 font-semibold text-white transition duration-300 ${submitting
                ? "cursor-not-allowed bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            First time?{" "}
            <Link
              to="/setup"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create Admin Account
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