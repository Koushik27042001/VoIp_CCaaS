import { CheckCircle2, PlugZap, RefreshCcw, Save, Trash2 } from "lucide-react";
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

  const enabledCount = useMemo(
    () => trunks.filter((trunk) => trunk.enabled).length,
    [trunks],
  );

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

  return (
    <section className="settings-page">
      <div className="settings-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>SIP Trunks</h2>
          <p>Manage carrier credentials, registration settings and generated Asterisk trunk config.</p>
          <p className="muted-copy" style={{ marginTop: "8px" }}>
            Required only for Asterisk path. If you call via Twilio PSTN, SIP trunk fields are optional.
          </p>
        </div>
        <div className="header-stats">
          <div><strong>{trunks.length}</strong><span>Total</span></div>
          <div><strong className="closed">{enabledCount}</strong><span>Enabled</span></div>
        </div>
      </div>

      <div className="settings-grid">
        <form className="sip-form panel" onSubmit={handleSubmit}>
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">{editingId ? "Edit Trunk" : "New Trunk"}</p>
              <h2>{editingId ? form.carrierName || "Update SIP Carrier" : "Carrier Details"}</h2>
            </div>
            <span className={`pill ${form.enabled ? "live" : "cold"}`}>
              {form.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="form-grid">
            <label>
              <span>Carrier ID</span>
              <input
                value={form.carrierId}
                placeholder="twilio-primary"
                required
                disabled={Boolean(editingId)}
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
                required={!editingId}
                placeholder={editingId ? "Leave blank to keep current secret" : "SIP password"}
                onChange={(event) => updateForm("password", event.target.value)}
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

          {error ? <p className="form-alert error">{error}</p> : null}
          {message ? <p className="form-alert success">{message}</p> : null}

          <div className="action-row">
            <button className="primary-button" type="submit" disabled={saving}>
              <Save size={15} />
              {saving ? "Saving..." : editingId ? "Update Trunk" : "Save Trunk"}
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
            <button className="ghost-button compact-button" type="button" disabled={saving} onClick={regenerateConfig}>
              <RefreshCcw size={15} />
              Regenerate
            </button>
          </div>

          <div className="trunk-list">
            {loading ? (
              <p className="muted-copy">Loading SIP trunks...</p>
            ) : trunks.length === 0 ? (
              <p className="muted-copy">No SIP trunks configured yet.</p>
            ) : (
              trunks.map((trunk) => (
                <article className="trunk-card" key={trunk._id}>
                  <div className="trunk-card-head">
                    <div className="icon-box"><PlugZap size={17} /></div>
                    <div>
                      <h3>{trunk.carrierName}</h3>
                      <p>{trunk.host}:{trunk.port} · {trunk.protocol}</p>
                    </div>
                    <span className={`pill ${trunk.enabled ? "live" : "cold"}`}>
                      {trunk.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <div className="trunk-meta-grid">
                    <div>
                      <span className="label">Registration</span>
                      <strong>{trunk.registrationEnabled ? "Enabled" : "Disabled"}</strong>
                    </div>
                    <div>
                      <span className="label">Reload</span>
                      <strong>{trunk.lastReloadStatus || "pending"}</strong>
                    </div>
                    <div>
                      <span className="label">Generated</span>
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
                    <button className="danger-button" type="button" disabled={saving} onClick={() => removeTrunk(trunk._id)}>
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
    </section>
  );
}
