import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  Globe,
  Plus,
  Power,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Wifi,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createSipTrunk,
  deleteSipTrunk,
  fetchSipTrunks,
  regenerateSipTrunkConfig,
  updateSipTrunk,
} from "../../api/api";

const emptyForm = {
  carrierId: "",
  carrierName: "",
  host: "",
  port: 5060,
  username: "",
  password: "",
  fromUser: "",
  fromDomain: "",
  protocol: "PJSIP",
  transport: "udp",
  codecs: "ulaw,alaw",
  context: "from-trunk",
  outboundPrefix: "",
  enabled: true,
  registrationEnabled: true,
};

const statusMeta = (trunk) => {
  if (!trunk.enabled) {
    return { label: "Disabled", tone: "cold" };
  }
  if (trunk.lastReloadStatus === "failed") {
    return { label: "Authentication Failed", tone: "hot" };
  }
  if (trunk.registrationEnabled) {
    return { label: "Registered", tone: "live" };
  }
  return { label: "Provisioned", tone: "warm" };
};

const isSameDay = (value, baseline = new Date()) => {
  if (!value) return false;
  const date = new Date(value);
  return (
    date.getFullYear() === baseline.getFullYear() &&
    date.getMonth() === baseline.getMonth() &&
    date.getDate() === baseline.getDate()
  );
};

function formatDate(value) {
  if (!value) return "Not generated";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formFromTrunk(trunk) {
  return {
    ...emptyForm,
    ...trunk,
    password: "",
    codecs: Array.isArray(trunk.codecs) ? trunk.codecs.join(",") : emptyForm.codecs,
  };
}

function buildPayload(form) {
  const payload = {
    ...form,
    port: Number(form.port) || 5060,
    codecs: form.codecs
      .split(",")
      .map((codec) => codec.trim())
      .filter(Boolean),
  };

  if (!payload.password) delete payload.password;
  return payload;
}

export default function SIPTrunkPage() {
  const [trunks, setTrunks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const stats = useMemo(() => {
    const enabled = trunks.filter((trunk) => trunk.enabled).length;
    const offline = trunks.filter((trunk) => !trunk.enabled || trunk.lastReloadStatus === "failed").length;
    const generatedToday = trunks.filter((trunk) => isSameDay(trunk.lastConfigGeneratedAt)).length;
    const latestReload = trunks
      .map((trunk) => trunk.lastConfigGeneratedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    return { total: trunks.length, enabled, offline, generatedToday, latestReload };
  }, [trunks]);

  const filteredTrunks = useMemo(() => {
    return trunks.filter((trunk) => {
      const searchable = `${trunk.carrierName} ${trunk.carrierId} ${trunk.host}`.toLowerCase();
      const matchesQuery = !query.trim() || searchable.includes(query.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && trunk.enabled) ||
        (statusFilter === "disabled" && !trunk.enabled) ||
        (statusFilter === "tls" && trunk.transport === "tls") ||
        (statusFilter === "udp" && trunk.transport === "udp") ||
        (statusFilter === "tcp" && trunk.transport === "tcp") ||
        (statusFilter === "pjsip" && trunk.protocol === "PJSIP");
      const matchesTransport =
        transportFilter === "all" || trunk.transport === transportFilter;

      return matchesQuery && matchesStatus && matchesTransport;
    });
  }, [trunks, query, statusFilter, transportFilter]);

  const loadTrunks = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchSipTrunks();
      setTrunks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load SIP trunks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrunks();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
    setShowAdvanced(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateSipTrunk(editingId, buildPayload(form));
        setMessage("SIP trunk updated and Asterisk config regenerated.");
      } else {
        await createSipTrunk(buildPayload(form));
        setMessage("SIP trunk saved and Asterisk config generated.");
      }

      resetForm();
      await loadTrunks();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save SIP trunk");
    } finally {
      setSaving(false);
    }
  };

  const editTrunk = (trunk) => {
    setEditingId(trunk._id);
    setForm(formFromTrunk(trunk));
    setMessage("");
    setError("");
  };

  const removeTrunk = async (id) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await deleteSipTrunk(id);
      if (editingId === id) resetForm();
      setMessage("SIP trunk removed and Asterisk config regenerated.");
      await loadTrunks();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete SIP trunk");
    } finally {
      setSaving(false);
      setPendingDeleteId("");
    }
  };

  const regenerateConfig = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await regenerateSipTrunkConfig();
      setMessage("Asterisk SIP configuration regenerated.");
      await loadTrunks();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to regenerate Asterisk config");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = Boolean(editingId);
  const pendingDelete = trunks.find((trunk) => trunk._id === pendingDeleteId) || null;

  return (
    <section className="settings-page">
      <div className="settings-header">
        <div>
          <p className="eyebrow">SIP Trunk Management</p>
          <h2>Enterprise Provider Operations</h2>
          <p>Manage all SIP providers, monitor registration, and control runtime configuration from one place.</p>
          <p className="muted-copy" style={{ marginTop: "10px" }}>
            Required only for Asterisk path. If you call via Twilio PSTN, SIP trunk fields are optional.
          </p>
          <p className="muted-copy" style={{ marginTop: "6px" }}>
            For SIP-only calling: set <code>TWILIO_ENABLED=false</code>, keep AMI credentials valid, and ensure
            each agent has a SIP extension provisioned.
          </p>
        </div>
      </div>

      <div className="sip-kpi-grid">
        <article className="sip-kpi-card">
          <div className="icon-box"><BadgeCheck size={16} /></div>
          <p className="label">Active Providers</p>
          <h3>{stats.enabled}</h3>
          <p className="muted-copy">of {stats.total} configured</p>
        </article>
        <article className="sip-kpi-card">
          <div className="icon-box"><Activity size={16} /></div>
          <p className="label">Offline / Failing</p>
          <h3>{stats.offline}</h3>
          <p className="muted-copy">needs operator attention</p>
        </article>
        <article className="sip-kpi-card">
          <div className="icon-box"><RefreshCcw size={16} /></div>
          <p className="label">Last Reload</p>
          <h3>{stats.latestReload ? formatDate(stats.latestReload) : "Pending"}</h3>
          <p className="muted-copy">latest generated config</p>
        </article>
        <article className="sip-kpi-card">
          <div className="icon-box"><Globe size={16} /></div>
          <p className="label">Generated Today</p>
          <h3>{stats.generatedToday}</h3>
          <p className="muted-copy">runtime config outputs</p>
        </article>
      </div>

      <div className="settings-grid">
        <form className="sip-form panel" onSubmit={handleSubmit}>
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">{isEditing ? "Edit Provider" : "Add Provider"}</p>
              <h2>{isEditing ? form.carrierName || "Update SIP Carrier" : "Create SIP Provider"}</h2>
            </div>
            <span className={`pill ${form.enabled ? "live" : "cold"}`}>
              {form.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="sip-form-stack">
            <article className="sip-section-card">
              <div className="sip-section-head">
                <div className="icon-box"><Globe size={16} /></div>
                <div>
                  <p className="eyebrow">General Information</p>
                  <h3>Provider identity</h3>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  <span>Carrier ID</span>
                  <input
                    value={form.carrierId}
                    placeholder="twilio-primary"
                    required
                    disabled={isEditing}
                    onChange={(event) => updateForm("carrierId", event.target.value)}
                  />
                </label>
                <label>
                  <span>Carrier Name</span>
                  <input
                    value={form.carrierName}
                    placeholder="Twilio Primary"
                    required
                    onChange={(event) => updateForm("carrierName", event.target.value)}
                  />
                </label>
              </div>
            </article>

            <article className="sip-section-card">
              <div className="sip-section-head">
                <div className="icon-box"><ShieldCheck size={16} /></div>
                <div>
                  <p className="eyebrow">Authentication</p>
                  <h3>Provider credentials</h3>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  <span>Username</span>
                  <input
                    value={form.username}
                    required
                    onChange={(event) => updateForm("username", event.target.value)}
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={form.password}
                    required={!isEditing}
                    placeholder={isEditing ? "Leave blank to keep current secret" : "SIP password"}
                    onChange={(event) => updateForm("password", event.target.value)}
                  />
                </label>
              </div>
            </article>

            <article className="sip-section-card">
              <div className="sip-section-head">
                <div className="icon-box"><Wifi size={16} /></div>
                <div>
                  <p className="eyebrow">Network</p>
                  <h3>Host and transport</h3>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  <span>Host</span>
                  <input
                    value={form.host}
                    placeholder="sip.provider.com"
                    required
                    onChange={(event) => updateForm("host", event.target.value)}
                  />
                </label>
                <label>
                  <span>Port</span>
                  <input
                    min="1"
                    max="65535"
                    type="number"
                    value={form.port}
                    onChange={(event) => updateForm("port", event.target.value)}
                  />
                </label>
                <label>
                  <span>Protocol</span>
                  <select value={form.protocol} onChange={(event) => updateForm("protocol", event.target.value)}>
                    <option value="PJSIP">PJSIP</option>
                    <option value="SIP">SIP</option>
                  </select>
                </label>
                <label>
                  <span>Transport</span>
                  <select value={form.transport} onChange={(event) => updateForm("transport", event.target.value)}>
                    <option value="udp">UDP</option>
                    <option value="tcp">TCP</option>
                    <option value="tls">TLS</option>
                  </select>
                </label>
              </div>
            </article>

            <article className="sip-section-card">
              <div className="sip-section-head">
                <div className="icon-box"><Power size={16} /></div>
                <div>
                  <p className="eyebrow">Registration</p>
                  <h3>Operational behavior</h3>
                </div>
              </div>
              <div className="toggle-row">
                <label>
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) => updateForm("enabled", event.target.checked)}
                  />
                  Enabled
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.registrationEnabled}
                    onChange={(event) => updateForm("registrationEnabled", event.target.checked)}
                  />
                  Register with carrier
                </label>
              </div>
            </article>

            <article className="sip-section-card">
              <div className="sip-section-head">
                <div className="icon-box"><SlidersHorizontal size={16} /></div>
                <div>
                  <p className="eyebrow">Advanced</p>
                  <h3>Optional routing and codec controls</h3>
                </div>
                <button
                  className="ghost-button compact-button"
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                >
                  {showAdvanced ? "Hide Advanced" : "Show Advanced"}
                </button>
              </div>
              {showAdvanced ? (
                <div className="form-grid">
                  <label>
                    <span>From User</span>
                    <input
                      value={form.fromUser}
                      placeholder="Defaults to username"
                      onChange={(event) => updateForm("fromUser", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>From Domain</span>
                    <input
                      value={form.fromDomain}
                      placeholder="Optional"
                      onChange={(event) => updateForm("fromDomain", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Context</span>
                    <input
                      value={form.context}
                      onChange={(event) => updateForm("context", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Codecs</span>
                    <input
                      value={form.codecs}
                      placeholder="ulaw,alaw"
                      onChange={(event) => updateForm("codecs", event.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <p className="muted-copy">Advanced fields hidden to keep provisioning focused.</p>
              )}
            </article>
          </div>

          {error ? <p className="form-alert error">{error}</p> : null}
          {message ? <p className="form-alert success">{message}</p> : null}

          <div className="action-row">
            <button className="primary-button" type="submit" disabled={saving}>
              <Save size={15} />
              {saving ? "Saving..." : isEditing ? "Update Provider" : "Save Provider"}
            </button>
            <button className="ghost-button" type="button" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        <div className="panel trunk-list-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Configured Providers</p>
              <h2>Carrier Trunks</h2>
            </div>
            <div className="action-row">
              <button className="ghost-button compact-button" type="button" onClick={resetForm}>
                <Plus size={15} />
                Add Provider
              </button>
              <button className="ghost-button compact-button" type="button" disabled={saving} onClick={regenerateConfig}>
                <RefreshCcw size={15} />
                Regenerate
              </button>
            </div>
          </div>

          <div className="sip-toolbar">
            <label className="sip-search">
              <Search size={15} />
              <input
                value={query}
                placeholder="Search provider, id, host..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="tls">TLS</option>
              <option value="udp">UDP</option>
              <option value="tcp">TCP</option>
              <option value="pjsip">PJSIP</option>
            </select>
            <select value={transportFilter} onChange={(event) => setTransportFilter(event.target.value)}>
              <option value="all">Any Transport</option>
              <option value="tls">TLS</option>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
            </select>
          </div>

          <div className="trunk-list">
            {loading ? (
              <p className="muted-copy">Loading SIP trunks...</p>
            ) : filteredTrunks.length === 0 ? (
              <div className="sip-empty-state">
                <div className="icon-box"><Globe size={18} /></div>
                <h3>No SIP Providers Yet</h3>
                <p className="muted-copy">Connect your first provider to start making calls.</p>
                <button className="primary-button" type="button" onClick={resetForm}>
                  <Plus size={14} />
                  Add SIP Provider
                </button>
              </div>
            ) : (
              filteredTrunks.map((trunk) => (
                <article className="trunk-card" key={trunk._id}>
                  <div className="trunk-card-head">
                    <div className="icon-box"><Wifi size={17} /></div>
                    <div>
                      <h3>{trunk.carrierName}</h3>
                      <p>{trunk.host}:{trunk.port} · {trunk.protocol} · {trunk.transport.toUpperCase()}</p>
                    </div>
                    <span className={`pill ${statusMeta(trunk).tone}`}>
                      {statusMeta(trunk).label}
                    </span>
                  </div>

                  <div className="trunk-meta-grid">
                    <div>
                      <span className="label">Registration</span>
                      <strong>{trunk.registrationEnabled ? "Enabled" : "Disabled"}</strong>
                    </div>
                    <div>
                      <span className="label">Reload Status</span>
                      <strong>{trunk.lastReloadStatus || "pending"}</strong>
                    </div>
                    <div>
                      <span className="label">Last Generated</span>
                      <strong>{formatDate(trunk.lastConfigGeneratedAt)}</strong>
                    </div>
                    <div>
                      <span className="label">Codecs</span>
                      <strong>{trunk.codecs?.join(", ") || "ulaw, alaw"}</strong>
                    </div>
                  </div>

                  <div className="trunk-actions">
                    <button className="ghost-button" type="button" onClick={() => editTrunk(trunk)}>
                      <CheckCircle2 size={15} />
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      disabled={saving}
                      onClick={() => setPendingDeleteId(trunk._id)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      {pendingDelete ? (
        <div className="sip-modal-backdrop" role="presentation">
          <div className="sip-modal panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Confirm Delete</p>
                <h2>Delete Provider?</h2>
              </div>
              <span className="pill hot">Destructive</span>
            </div>
            <p className="muted-copy">
              This removes <strong>{pendingDelete.carrierName}</strong> and regenerates Asterisk configuration.
            </p>
            <div className="action-row" style={{ marginTop: "14px" }}>
              <button className="ghost-button" type="button" onClick={() => setPendingDeleteId("")}>
                Cancel
              </button>
              <button
                className="danger-button"
                type="button"
                disabled={saving}
                onClick={() => removeTrunk(pendingDelete._id)}
              >
                <Trash2 size={14} />
                {saving ? "Deleting..." : "Delete Provider"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
