import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, Pencil, Phone, RefreshCw, Save, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "../../hooks/redux";
import { getCallingQueue, getDailyCallingSummary, saveCallOutcome } from "../../services/calling.service";
import { getCallOutcomes } from "../../services/callOutcome.service";
import { getLeadStatuses } from "../../services/leadStatus.service";
import type { CallOutcomeOption, CallingQueueLead, DailyCallingSummary } from "../../types/calling.types";

type LeadStatusOption = { id: string; name: string };

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getMinDateTime = () => {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function CallingWorkspacePage() {
  const navigate = useNavigate();
  const employee = useAppSelector((state) => state.auth.employee);
  const [queue, setQueue] = useState<CallingQueueLead[]>([]);
  const [outcomes, setOutcomes] = useState<CallOutcomeOption[]>([]);
  const [statuses, setStatuses] = useState<LeadStatusOption[]>([]);
  const [summary, setSummary] = useState<DailyCallingSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [batchNumber, setBatchNumber] = useState(1);
  const [batchSize, setBatchSize] = useState(0);
  const [completedInBatch, setCompletedInBatch] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [callOutcome, setCallOutcome] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedOutcome = useMemo(
    () => outcomes.find((item) => item.code === callOutcome),
    [outcomes, callOutcome]
  );

  const resetEditor = () => {
    setEditingLeadId(null);
    setCallOutcome("");
    setSelectedStatus("");
    setFollowUpDate("");
    setRemarks("");
  };

  const loadSummary = useCallback(async () => {
    if (!employee?.id) return;
    try {
      setSummary(await getDailyCallingSummary(employee.id));
    } catch (loadError) {
      console.error("Calling summary error", loadError);
    }
  }, [employee?.id]);

  const loadQueue = useCallback(async () => {
    if (!employee?.id) return;
    try {
      setLoading(true);
      setError("");
      const response = await getCallingQueue({
        page: 1,
        limit: 10,
        search: search || undefined,
        employeeId: employee.id,
      });
      const nextQueue = response.queue || [];
      setQueue(nextQueue);
      setTotal(response.total || 0);
      setBatchSize(nextQueue.length);
      setCompletedInBatch(0);
      resetEditor();
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || "Failed to load calling leads");
    } finally {
      setLoading(false);
    }
  }, [employee?.id, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setBatchNumber(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { void loadQueue(); }, [loadQueue]);
  useEffect(() => { void loadSummary(); }, [loadSummary]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [outcomeResponse, statusResponse] = await Promise.all([
          getCallOutcomes(),
          getLeadStatuses(),
        ]);
        setOutcomes(outcomeResponse.callOutcomes || []);
        setStatuses(statusResponse.leadStatuses || []);
      } catch (loadError: any) {
        setError(loadError?.response?.data?.message || "Failed to load calling options");
      }
    };
    void loadOptions();
  }, []);

  const openEditor = (leadId: string) => {
    resetEditor();
    setEditingLeadId(leadId);
    setError("");
    setSuccess("");
  };

  const handleSave = async (lead: CallingQueueLead) => {
    if (!callOutcome) {
      setError("Please select call outcome");
      return;
    }
    if (selectedOutcome?.requiresFollowUp && !followUpDate) {
      setError("Follow-up date is required for this outcome");
      return;
    }
    if (followUpDate && new Date(followUpDate) <= new Date()) {
      setError("Follow-up date must be in the future");
      return;
    }

    try {
      setSavingLeadId(lead.id);
      setError("");
      setSuccess("");
      const response = await saveCallOutcome(lead.id, {
        outcome: callOutcome,
        statusId: selectedStatus || undefined,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
        remarks: remarks.trim() || undefined,
      });

      const remaining = queue.filter((item) => item.id !== lead.id);
      setQueue(remaining);
      setTotal((value) => Math.max(value - 1, 0));
      setCompletedInBatch((value) => value + 1);
      setSuccess(response?.message || "Call saved successfully");
      resetEditor();
      await loadSummary();

      if (remaining.length === 0) {
        setBatchNumber((value) => value + 1);
        await loadQueue();
      }
    } catch (saveError: any) {
      setError(saveError?.response?.data?.message || saveError?.message || "Failed to save call");
    } finally {
      setSavingLeadId(null);
    }
  };

  if (!employee?.id) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">Logged-in employee information not found.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calling Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Call and update 10 priority leads in one batch</p>
        </div>
        <button type="button" onClick={() => { void loadQueue(); void loadSummary(); }} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Calls Today" value={summary?.summary.todayCalls ?? 0} detail={`Target ${summary?.summary.dailyTarget ?? 250}`} />
        <SummaryCard title="Current Batch" value={`#${batchNumber}`} detail={`${completedInBatch} of ${batchSize || 10} completed`} />
        <SummaryCard title="Batch Remaining" value={queue.length} detail="Auto-loads next 10" />
        <SummaryCard title="Available Leads" value={total} detail="Not called today" />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search lead, mobile or email..." className={`${inputClass} pl-9`} />
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Batch {batchNumber} Calling Leads</h2>
            <p className="mt-1 text-xs text-slate-500">Save a call update and that lead will leave this list.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{queue.length} remaining</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading priority leads...</div>
        ) : queue.length === 0 ? (
          <div className="p-10 text-center"><p className="font-semibold text-slate-800">No calling leads available</p><p className="mt-1 text-sm text-slate-500">All assigned leads may already be called today.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-240 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Follow-up</th><th className="px-4 py-3">Last Call</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {queue.map((lead, index) => (
                  <LeadCallingRows key={lead.id} lead={lead} index={index} isEditing={editingLeadId === lead.id} isSaving={savingLeadId === lead.id} outcomes={outcomes} statuses={statuses} callOutcome={callOutcome} selectedStatus={selectedStatus} followUpDate={followUpDate} remarks={remarks} selectedOutcome={selectedOutcome} onCallOutcome={setCallOutcome} onStatus={setSelectedStatus} onFollowUp={setFollowUpDate} onRemarks={setRemarks} onEdit={() => openEditor(lead.id)} onCancel={resetEditor} onSave={() => void handleSave(lead)} onView={() => navigate(`/leads/${lead.id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

type LeadRowsProps = {
  lead: CallingQueueLead;
  index: number;
  isEditing: boolean;
  isSaving: boolean;
  outcomes: CallOutcomeOption[];
  statuses: LeadStatusOption[];
  callOutcome: string;
  selectedStatus: string;
  followUpDate: string;
  remarks: string;
  selectedOutcome?: CallOutcomeOption;
  onCallOutcome: (value: string) => void;
  onStatus: (value: string) => void;
  onFollowUp: (value: string) => void;
  onRemarks: (value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onView: () => void;
};

function LeadCallingRows(props: LeadRowsProps) {
  const { lead, index, isEditing, isSaving, outcomes, statuses, callOutcome, selectedStatus, followUpDate, remarks, selectedOutcome, onCallOutcome, onStatus, onFollowUp, onRemarks, onEdit, onCancel, onSave, onView } = props;
  return (
    <>
      <tr className={`border-t border-slate-100 ${isEditing ? "bg-blue-50/40" : "hover:bg-slate-50/60"}`}>
        <td className="px-4 py-3 text-xs text-slate-400">{index + 1}</td>
        <td className="px-4 py-3"><p className="font-semibold text-blue-700">{lead.name || "Unnamed Lead"}</p><p className="mt-0.5 text-xs text-slate-400">{lead.leadCode}</p></td>
        <td className="px-4 py-3"><p className="font-medium text-slate-800">{lead.mobile}</p><p className="mt-0.5 text-xs text-slate-400">{lead.city || lead.email || "-"}</p></td>
        <td className="px-4 py-3"><Badge text={lead.status?.name || lead.stage} /></td>
        <td className="px-4 py-3"><PriorityBadge type={lead.queueType} /></td>
        <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(lead.nextFollowUp)}</td>
        <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(lead.lastCallAt)}</td>
        <td className="px-4 py-3"><div className="flex justify-end gap-2"><a href={`tel:${lead.mobile}`} className="rounded-lg border border-emerald-200 p-2 text-emerald-700" title="Call"><Phone size={16} /></a><button type="button" onClick={onView} className="rounded-lg border border-slate-200 p-2 text-blue-700" title="View lead"><Eye size={16} /></button><button type="button" onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white"><Pencil size={14} /> Update</button></div></td>
      </tr>

      {isEditing && (
        <tr className="border-t border-blue-100 bg-blue-50/40">
          <td colSpan={8} className="p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Call Outcome *</label><select value={callOutcome} onChange={(event) => onCallOutcome(event.target.value)} className={inputClass}><option value="">Select outcome</option>{outcomes.map((outcome) => <option key={outcome.id} value={outcome.code}>{outcome.name}</option>)}</select>{selectedOutcome?.description && <p className="mt-1 text-xs text-slate-500">{selectedOutcome.description}</p>}</div>
              <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Lead Status</label><select value={selectedStatus} onChange={(event) => onStatus(event.target.value)} className={inputClass}><option value="">Automatic / keep current</option>{statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}</select></div>
              <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Follow-up Date {selectedOutcome?.requiresFollowUp ? "*" : ""}</label><div className="relative"><CalendarClock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="datetime-local" min={getMinDateTime()} value={followUpDate} onChange={(event) => onFollowUp(event.target.value)} className={`${inputClass} pl-9`} /></div></div>
              <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Remarks</label><input value={remarks} onChange={(event) => onRemarks(event.target.value)} placeholder="Call notes..." className={inputClass} /></div>
            </div>
            {selectedOutcome?.marksLeadLost && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">This outcome will mark the lead Lost and remove it from the calling queue.</p>}
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onCancel} disabled={isSaving} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"><X size={15} /> Cancel</button><button type="button" onClick={onSave} disabled={isSaving || !callOutcome || Boolean(selectedOutcome?.requiresFollowUp && !followUpDate)} className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} /> {isSaving ? "Saving..." : "Save & Remove"}</button></div>
          </td>
        </tr>
      )}
    </>
  );
}

function SummaryCard({ title, value, detail }: { title: string; value: string | number; detail: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>;
}

function Badge({ text }: { text: string }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{text}</span>;
}

function PriorityBadge({ type }: { type: CallingQueueLead["queueType"] }) {
  const classes = { OVERDUE: "bg-red-50 text-red-700", TODAY: "bg-amber-50 text-amber-700", NEW: "bg-emerald-50 text-emerald-700", GENERAL: "bg-slate-100 text-slate-600" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[type]}`}>{type}</span>;
}
