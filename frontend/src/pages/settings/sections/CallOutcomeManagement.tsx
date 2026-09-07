import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  createCallOutcome,
  deleteCallOutcome,
  getCallOutcomes,
  updateCallOutcome,
} from "../../../services/callOutcome.service";
import { getLeadStatuses } from "../../../services/leadStatus.service";
import type {
  CallOutcomeOption,
  CallOutcomePayload,
} from "../../../types/calling.types";
import { SettingsCard } from "../SettingsLayout";

type LeadStatusOption = {
  id: string;
  name: string;
};

const emptyForm: CallOutcomePayload = {
  name: "",
  description: "",
  color: "#2563eb",
  leadStatusId: "",
  requiresFollowUp: false,
  marksLeadLost: false,
  sortOrder: 0,
  isActive: true,
};

export default function CallOutcomeManagement() {
  const [items, setItems] =
    useState<CallOutcomeOption[]>([]);
  const [statuses, setStatuses] =
    useState<LeadStatusOption[]>([]);
  const [form, setForm] =
    useState<CallOutcomePayload>({ ...emptyForm });
  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [outcomes, leadStatuses] =
        await Promise.all([
          getCallOutcomes(true),
          getLeadStatuses(),
        ]);
      setItems(outcomes.callOutcomes || []);
      setStatuses(
        leadStatuses.leadStatuses || []
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        "Failed to load call outcomes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const edit = (item: CallOutcomeOption) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      color: item.color || "#2563eb",
      leadStatusId: item.leadStatusId || "",
      requiresFollowUp: item.requiresFollowUp,
      marksLeadLost: item.marksLeadLost,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError("Outcome name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = editingId
        ? await updateCallOutcome(editingId, form)
        : await createCallOutcome(form);
      setMessage(response.message);
      resetForm();
      await load();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        "Failed to save call outcome"
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: CallOutcomeOption) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      setError("");
      const response =
        await deleteCallOutcome(item.id);
      setMessage(response.message);
      if (editingId === item.id) resetForm();
      await load();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        "Failed to delete call outcome"
      );
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <SettingsCard
      title="Call Outcomes Management"
      description="Admin controls the calling dropdown, automatic lead status and follow-up rules."
    >
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>
      )}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Outcome name"
          className={fieldClass}
        />
        <input
          value={form.description || ""}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Short description"
          className={fieldClass}
        />
        <select
          value={form.leadStatusId || ""}
          onChange={(event) => setForm({ ...form, leadStatusId: event.target.value })}
          className={fieldClass}
        >
          <option value="">Keep current lead status</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>{status.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="color"
            value={form.color || "#2563eb"}
            onChange={(event) => setForm({ ...form, color: event.target.value })}
            className="h-10 w-14 rounded-lg border border-slate-200 bg-white p-1"
            title="Outcome colour"
          />
          <input
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })}
            placeholder="Order"
            className={fieldClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.requiresFollowUp || false} onChange={(event) => setForm({ ...form, requiresFollowUp: event.target.checked })} />
          Follow-up required
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.marksLeadLost || false} onChange={(event) => setForm({ ...form, marksLeadLost: event.target.checked })} />
          Mark lead Lost
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isActive ?? true} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          Active in dropdown
        </label>
        <div className="flex justify-end gap-2">
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <X size={15} /> Cancel
            </button>
          )}
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {editingId ? "Update" : "Add Outcome"}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Outcome</th><th className="p-3">Lead Status</th><th className="p-3">Rules</th><th className="p-3">State</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading outcomes...</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="p-3"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color || "#2563eb" }} /><div><p className="font-medium text-slate-800">{item.name}</p><p className="text-xs text-slate-500">{item.description || item.code}</p></div></div></td>
                <td className="p-3 text-slate-600">{item.leadStatus?.name || "No automatic change"}</td>
                <td className="p-3 text-xs text-slate-600">{item.requiresFollowUp ? "Follow-up required" : "No follow-up"}{item.marksLeadLost ? " • Mark Lost" : ""}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.isActive ? "Active" : "Inactive"}</span></td>
                <td className="p-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => edit(item)} className="rounded-lg border border-slate-200 p-2 text-blue-700" title="Edit"><Pencil size={15} /></button><button type="button" onClick={() => remove(item)} className="rounded-lg border border-slate-200 p-2 text-red-600" title="Delete or deactivate"><Trash2 size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsCard>
  );
}
