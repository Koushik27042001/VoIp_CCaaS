import { useEffect, useState } from "react";
import { createLead, fetchLeads } from "../../api/api";
import LeadTable from "../../components/LeadTable";
import AdminLayout from "../../layouts/AdminLayout";

const emptyLead = {
  name: "",
  phone: "",
  email: "",
  company: "",
  status: "new",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(emptyLead);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetchLeads();
      setLeads(res.data.leads || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createLead(form);
      setForm(emptyLead);
      setMessage("Lead added to the admin pool.");
      await loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create lead");
    }
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel">
          <p className="eyebrow">Lead Intake</p>
          <h1 className="mt-2 text-3xl font-black">Upload Lead</h1>
          <p className="muted-copy mt-2">Add leads manually now. CSV upload can sit on this API later.</p>

          {message ? <div className="auth-success">{message}</div> : null}
          {error ? <div className="auth-error">{error}</div> : null}

          <form className="mt-5 space-y-3" onSubmit={handleCreate}>
            <label className="auth-field block">
              <span>Name</span>
              <input value={form.name} required onChange={(event) => updateForm("name", event.target.value)} />
            </label>
            <label className="auth-field block">
              <span>Phone</span>
              <input value={form.phone} required onChange={(event) => updateForm("phone", event.target.value)} />
            </label>
            <label className="auth-field block">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
            </label>
            <label className="auth-field block">
              <span>Company</span>
              <input value={form.company} onChange={(event) => updateForm("company", event.target.value)} />
            </label>
            <button className="primary-button w-full" type="submit">Add Lead</button>
          </form>
        </section>

        <section className="min-w-0 space-y-4">
          <div>
            <p className="eyebrow">Lead Pool</p>
            <h2 className="mt-2 text-3xl font-black">All Leads ({leads.length})</h2>
          </div>
          {loading ? <p className="muted-copy">Loading leads...</p> : <LeadTable leads={leads} />}
        </section>
      </div>
    </AdminLayout>
  );
}
