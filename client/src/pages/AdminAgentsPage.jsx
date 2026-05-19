import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function AdminAgentsPage() {
  const user = useAuthStore((s) => s.user);
  const { agents, agentsLoading, loadAgents, createAgent } = useAuthStore();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAgents().catch(() => {});
  }, [loadAgents]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await createAgent({ name, email, password, role });
      setMessage(`Agent ${email} created successfully.`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("agent");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-agents-page">
      <div className="panel">
        <p className="eyebrow">Admin</p>
        <h2>Create Agent</h2>
        <p className="muted-copy">Only admins can create new agent accounts.</p>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form className="agent-form" onSubmit={handleCreate}>
          <label className="auth-field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <label className="auth-field">
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Agent"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h3>Team ({agents.length})</h3>
        {agentsLoading ? (
          <p className="muted-copy">Loading agents…</p>
        ) : agents.length === 0 ? (
          <p className="muted-copy">No agents yet.</p>
        ) : (
          <table className="agents-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.role}</td>
                  <td>{agent.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
