import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import AgentTable from "../../components/AgentTable";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminAgentsPage() {
  const { agents, agentsLoading, loadAgents, createAgent } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAgents().catch(() => {});
  }, [loadAgents]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await createAgent(form);
      setMessage(`${form.email} is ready to log in.`);
      setForm({ name: "", email: "", password: "", role: "agent" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel">
          <p className="eyebrow">Identity Ops</p>
          <h1 className="mt-2 text-3xl font-black">Create Agent</h1>
          <p className="muted-copy mt-2">Admins can provision agent or admin accounts.</p>

          {message ? <div className="auth-success">{message}</div> : null}
          {error ? <div className="auth-error">{error}</div> : null}

          <form className="mt-5 space-y-3" onSubmit={handleCreate}>
            <label className="auth-field block">
              <span>Name</span>
              <input value={form.name} required onChange={(event) => updateForm("name", event.target.value)} />
            </label>
            <label className="auth-field block">
              <span>Email</span>
              <input type="email" value={form.email} required onChange={(event) => updateForm("email", event.target.value)} />
            </label>
            <label className="auth-field block">
              <span>Password</span>
              <input type="password" value={form.password} required minLength={8} onChange={(event) => updateForm("password", event.target.value)} />
            </label>
            <label className="auth-field block">
              <span>Role</span>
              <select value={form.role} onChange={(event) => updateForm("role", event.target.value)}>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="primary-button w-full" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </form>
        </section>

        <section className="min-w-0 space-y-4">
          <div>
            <p className="eyebrow">Team Directory</p>
            <h2 className="mt-2 text-3xl font-black">Agents ({agents.length})</h2>
          </div>
          {agentsLoading ? <p className="muted-copy">Loading agents...</p> : <AgentTable agents={agents} />}
        </section>
      </div>
    </AdminLayout>
  );
}
