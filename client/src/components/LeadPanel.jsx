import { CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, FilePlus2, Phone, UserCheck, Mail, Building, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/useStore";

const statuses = ["Contacted", "Interested", "Closed"];
const LEADS_PER_PAGE = 8;

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function LeadPanel() {
  const leads = useStore((state) => state.leads);
  const selectedLead = useStore((state) => state.getSelectedLead());
  const selectLead = useStore((state) => state.selectLead);
  const updateLeadStatus = useStore((state) => state.updateLeadStatus);
  const addLeadNote = useStore((state) => state.addLeadNote);
  const startCall = useStore((state) => state.startCall);
  const makeRealCall = useStore((state) => state.makeRealCall);
  const backendOnline = useStore((state) => state.backendOnline);
  const leadsLoading = useStore((state) => state.leadsLoading);
  const leadsError = useStore((state) => state.leadsError);
  const loadCustomersFromBackend = useStore((state) => state.loadCustomersFromBackend);
  const [noteDraft, setNoteDraft] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const selectedLeadId = selectedLead?.id;

  useEffect(() => {
    loadCustomersFromBackend();
  }, [loadCustomersFromBackend]);

  const summary = useMemo(
    () =>
      leads.reduce(
        (acc, lead) => ({
          total: acc.total + 1,
          hot: acc.hot + (lead.priority === "Hot" ? 1 : 0),
          closed: acc.closed + (lead.status === "Closed" ? 1 : 0),
        }),
        { total: 0, hot: 0, closed: 0 },
      ),
    [leads],
  );

  const pageCount = Math.max(1, Math.ceil(leads.length / LEADS_PER_PAGE));
  const pageStart = (currentPage - 1) * LEADS_PER_PAGE;
  const visibleLeads = useMemo(
    () => leads.slice(pageStart, pageStart + LEADS_PER_PAGE),
    [leads, pageStart],
  );
  const showingStart = leads.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageStart + LEADS_PER_PAGE, leads.length);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  useEffect(() => {
    if (!selectedLeadId) return;

    const selectedIndex = leads.findIndex((lead) => lead.id === selectedLeadId);
    if (selectedIndex === -1) return;

    const selectedPage = Math.floor(selectedIndex / LEADS_PER_PAGE) + 1;
    setCurrentPage(selectedPage);
  }, [leads, selectedLeadId]);

  const paginationPages = useMemo(() => {
    const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
    return Array.from(pages)
      .filter((page) => page >= 1 && page <= pageCount)
      .sort((a, b) => a - b);
  }, [currentPage, pageCount]);

  const callLead = async () => {
    if (!selectedLead?.phone) return;

    try {
      await makeRealCall(selectedLead.phone);
    } catch {
      try {
        await startCall({ leadId: selectedLead.id });
      } catch {
        // Store owns the visible error/activity state.
      }
    }
  };

  const saveNote = () => {
    if (!noteDraft.trim() || !selectedLead) return;
    addLeadNote(selectedLead.id, noteDraft.trim());
    setNoteDraft("");
  };

  return (
    <section className="lead-panel border border-white/10 bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-xl shadow-panel">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-5">
        <div>
          <p className="eyebrow text-cyan-300 tracking-[0.2em] text-[10px]">Sales Pipeline</p>
          <h2 className="text-xl font-black text-white mt-1">Lead Workspace</h2>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-2xl text-center min-w-[64px]">
            <strong className="block text-sm text-white font-bold">{summary.total}</strong>
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Total</span>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-2xl text-center min-w-[64px]">
            <strong className="block text-sm text-orange-400 font-bold">{summary.hot}</strong>
            <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider">Hot</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl text-center min-w-[64px]">
            <strong className="block text-sm text-emerald-400 font-bold">{summary.closed}</strong>
            <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Closed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
        {/* Left Side: Leads List */}
        <div className="2xl:col-span-5 flex flex-col justify-between min-h-[460px]">
          {leads.length === 0 ? (
            <div className="flex items-center justify-center text-center p-6 border border-white/5 bg-slate-950/20 rounded-2xl text-xs text-slate-500 leading-relaxed flex-1">
              {leadsLoading
                ? "Loading leads from database..."
                : leadsError || (backendOnline === false
                  ? "Backend offline. Outbound calling is active for manual entry dialers."
                  : "No pipeline leads loaded. Use manual console dialer to place calls.")}
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="space-y-2">
                {visibleLeads.map((lead) => (
                  <button
                    key={lead.id}
                    className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition duration-300 text-left ${selectedLead?.id === lead.id ? "border-cyan-400/50 bg-cyan-400/10 shadow-glow" : "border-white/5 bg-slate-950/30 hover:border-white/20 hover:bg-slate-900/40"}`}
                    type="button"
                    onClick={() => selectLead(lead.id)}
                  >
                    <div className="min-w-0">
                      <strong className="block text-sm text-white font-bold truncate">{lead.name}</strong>
                      <span className="block text-xs text-slate-400 truncate mt-0.5">{lead.company}</span>
                      <span className="block text-[10px] text-slate-500 mt-1">{lead.lastTouch}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${lead.priority?.toLowerCase() === "hot" ? "bg-orange-500/15 text-orange-400 border border-orange-500/25 animate-pulseSoft" : lead.priority?.toLowerCase() === "warm" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25" : "bg-slate-800 text-slate-400 border border-white/5"}`}>{lead.priority}</span>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                  {showingStart}-{showingEnd} of {leads.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Previous page"
                    type="button"
                    className="h-8 w-8 grid place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white disabled:opacity-40"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {paginationPages.map((page, index) => {
                    const previousPage = paginationPages[index - 1];
                    const showGap = previousPage && page - previousPage > 1;

                    return (
                      <div className="flex items-center gap-1" key={page}>
                        {showGap ? <span className="text-slate-600 text-xs px-1">...</span> : null}
                        <button
                          className={`h-8 min-w-8 rounded-xl border text-xs font-bold ${currentPage === page ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"}`}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
                  <button
                    aria-label="Next page"
                    type="button"
                    className="h-8 w-8 grid place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white disabled:opacity-40"
                    disabled={currentPage === pageCount}
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Lead Detail view */}
        <div className="2xl:col-span-7 border border-white/5 bg-slate-950/20 rounded-[22px] p-5">
          {selectedLead ? (
            <div className="space-y-5">
              {/* Header profile */}
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white font-black text-sm flex items-center justify-center shadow-glow shrink-0">
                  {initials(selectedLead.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-white truncate">{selectedLead.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                    <Building size={12} className="text-slate-500" />
                    <span>{selectedLead.company}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/25`}>{selectedLead.priority}</span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-3.5 flex items-start gap-3">
                  <Phone size={14} className="text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Phone number</span>
                    <strong className="text-white text-sm tracking-wide">{selectedLead.phone}</strong>
                  </div>
                </div>
                <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-3.5 flex items-start gap-3">
                  <Mail size={14} className="text-slate-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Email address</span>
                    <strong className="text-white truncate block text-sm">{selectedLead.email || "No email info"}</strong>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black block mb-2">Disposition</span>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      type="button"
                      key={status}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition duration-200 ${selectedLead.status === status ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300 shadow-glow" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"}`}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                    >
                      <CheckCircle2 size={13} className="text-cyan-400" />
                      <span>{status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Actions */}
              <div className="flex gap-3 pt-2">
                <button className="primary-button flex-1 py-3 rounded-2xl font-black text-xs gap-2" type="button" onClick={callLead}>
                  <UserCheck size={14} />
                  Connect Line
                </button>
                <button className="ghost-button flex-1 py-3 rounded-2xl font-black text-xs gap-2" type="button">
                  <CalendarClock size={14} />
                  Book Call
                </button>
              </div>

              {/* Notes Section */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                    <Tag size={12} className="text-slate-500" />
                    Interaction History
                  </h4>
                  <FilePlus2 size={14} className="text-slate-500" />
                </div>

                <div className="flex gap-2 mb-3 bg-slate-950/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-cyan-500/50 focus-within:shadow-glow transition">
                  <input
                    value={noteDraft}
                    placeholder="Enter discussion details..."
                    className="flex-1 bg-transparent text-xs text-white border-none outline-none px-2.5"
                    onChange={(event) => setNoteDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveNote();
                    }}
                  />
                  <button className="ghost-button px-4 py-1.5 rounded-xl text-xs font-bold" type="button" onClick={saveNote}>Save</button>
                </div>

                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1.5">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.map((note, index) => (
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-xs text-slate-300 leading-relaxed" key={`${selectedLead.id}-${index}`}>
                        <p>{note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-600 text-center py-4">No notes recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-xs text-slate-500 leading-relaxed h-full">
              <UserCheck size={28} className="text-slate-600 mb-3 animate-pulse" />
              <span>Select a client from the workspace pool to review detail profile and sync CRM notes.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
