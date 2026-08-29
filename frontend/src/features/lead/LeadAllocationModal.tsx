import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Layers3,
  X,
} from "lucide-react";

import {
  allocateLeadsFromPool,
} from "../../services/leadBulk.service";

import type {
  AllocateLeadPoolResponse,
} from "../../types/leadBulk.types";

interface EmployeeOption {
  id: string;

  name: string;

  employeeCode: string;

  isActive?: boolean;
}

interface Props {
  employees:
    EmployeeOption[];

  availableCount: number;

  onClose: () => void;

  onSuccess: (
    response:
      AllocateLeadPoolResponse
  ) => void;
}

export default function LeadAllocationModal({
  employees,
  availableCount,
  onClose,
  onSuccess,
}: Props) {
  const [
    employeeId,
    setEmployeeId,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("100");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleSubmit =
    async (
      event:
        FormEvent
    ) => {
      event.preventDefault();

      const parsedQuantity =
        Number(
          quantity
        );

      if (!employeeId) {
        setError(
          "Select employee"
        );

        return;
      }

      if (
        !Number.isInteger(
          parsedQuantity
        ) ||
        parsedQuantity < 1 ||
        parsedQuantity > 5000
      ) {
        setError(
          "Quantity must be between 1 and 5000"
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const response =
          await allocateLeadsFromPool({
            employeeId,

            quantity:
              parsedQuantity,

            reason:
              reason.trim() ||
              undefined,
          });

        onSuccess(
          response
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            "Lead allocation failed"
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Layers3
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Allocate Leads
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assign leads from the unassigned pool
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-5"
        >
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Available Unassigned Leads
            </p>

            <p className="mt-1 text-3xl font-bold text-blue-900">
              {
                availableCount
              }
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Employee
              <span className="ml-1 text-red-500">
                *
              </span>
            </span>

            <select
              value={
                employeeId
              }
              onChange={(event) => {
                setEmployeeId(
                  event.target
                    .value
                );

                setError("");
              }}
              disabled={saving}
              className={
                inputClass
              }
            >
              <option value="">
                Select Employee
              </option>

              {employees
                .filter(
                  (employee) =>
                    employee.isActive !==
                    false
                )
                .map(
                  (employee) => (
                    <option
                      key={
                        employee.id
                      }
                      value={
                        employee.id
                      }
                    >
                      {
                        employee.name
                      }
                      {" - "}
                      {
                        employee.employeeCode
                      }
                    </option>
                  )
                )}
            </select>
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Number of Leads
              <span className="ml-1 text-red-500">
                *
              </span>
            </span>

            <div className="mb-3 flex flex-wrap gap-2">
              {[
                50,
                100,
                300,
              ].map(
                (value) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() => {
                      setQuantity(
                        String(
                          value
                        )
                      );

                      setError("");
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      quantity ===
                      String(
                        value
                      )
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {
                      value
                    }
                  </button>
                )
              )}
            </div>

            <input
              type="number"
              min={1}
              max={5000}
              step={1}
              value={
                quantity
              }
              onChange={(event) => {
                setQuantity(
                  event.target
                    .value
                );

                setError("");
              }}
              disabled={saving}
              placeholder="Enter custom quantity"
              className={
                inputClass
              }
            />

            <p className="mt-2 text-xs text-slate-500">
              Maximum 5,000 leads per allocation. If fewer leads are available, all remaining leads will be assigned.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Reason
              <span className="ml-1 text-slate-400">
                (optional)
              </span>
            </span>

            <input
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target
                    .value
                )
              }
              disabled={saving}
              placeholder="Example: Daily calling allocation"
              className={
                inputClass
              }
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={
                onClose
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                availableCount ===
                  0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              <Layers3
                size={17}
              />

              {saving
                ? "Allocating..."
                : "Allocate Leads"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400";
