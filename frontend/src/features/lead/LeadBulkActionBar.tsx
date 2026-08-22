import {
  useState,
} from "react";

import {
  Layers3,
  UserRoundCheck,
  X,
} from "lucide-react";

import {
  bulkAssignLeads,
  bulkChangeLeadStage,
  bulkChangeLeadStatus,
} from "../../services/leadBulk.service";

import type {
  LeadStage,
} from "../../types/lead.types";

interface EmployeeOption {
  id: string;
  name: string;
  employeeCode: string;
}

interface StatusOption {
  id: string;
  name: string;
}

interface Props {
  selectedIds: string[];

  employees: EmployeeOption[];

  statuses: StatusOption[];

  onClear: () => void;

  onSuccess: (
    message: string
  ) => void;
}

export default function LeadBulkActionBar({
  selectedIds,
  employees,
  statuses,
  onClear,
  onSuccess,
}: Props) {
  const [
    action,
    setAction,
  ] = useState<
    | ""
    | "ASSIGN"
    | "STAGE"
    | "STATUS"
  >("");

  const [
    employeeId,
    setEmployeeId,
  ] = useState("");

  const [
    stage,
    setStage,
  ] =
    useState<LeadStage | "">(
      ""
    );

  const [
    statusId,
    setStatusId,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  if (
    selectedIds.length ===
    0
  ) {
    return null;
  }

  const handleApply =
    async () => {
      try {
        setSaving(true);
        setError("");

        let response;

        if (
          action ===
          "ASSIGN"
        ) {
          if (!employeeId) {
            setError(
              "Select employee"
            );

            return;
          }

          response =
            await bulkAssignLeads(
              {
                leadIds:
                  selectedIds,

                employeeId,

                reason:
                  remarks ||
                  undefined,
              }
            );
        }

        if (
          action ===
          "STAGE"
        ) {
          if (!stage) {
            setError(
              "Select stage"
            );

            return;
          }

          response =
            await bulkChangeLeadStage(
              {
                leadIds:
                  selectedIds,

                stage,

                remarks:
                  remarks ||
                  undefined,
              }
            );
        }

        if (
          action ===
          "STATUS"
        ) {
          if (!statusId) {
            setError(
              "Select status"
            );

            return;
          }

          response =
            await bulkChangeLeadStatus(
              {
                leadIds:
                  selectedIds,

                statusId,

                remarks:
                  remarks ||
                  undefined,
              }
            );
        }

        if (!response) {
          setError(
            "Select bulk action"
          );

          return;
        }

        onSuccess(
          response.message
        );

        onClear();

        setAction("");
        setEmployeeId("");
        setStage("");
        setStatusId("");
        setRemarks("");
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Bulk operation failed"
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="sticky top-3 z-30 rounded-xl border border-blue-200 bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Layers3
              size={18}
              className="text-blue-700"
            />

            {selectedIds.length}{" "}
            selected
          </div>

          <select
            value={action}
            onChange={(e) => {
              setAction(
                e.target
                  .value as
                  typeof action
              );

              setError("");
            }}
            className={inputClass}
          >
            <option value="">
              Choose Action
            </option>

            <option value="ASSIGN">
              Assign Employee
            </option>

            <option value="STAGE">
              Change Stage
            </option>

            <option value="STATUS">
              Change Status
            </option>
          </select>

          {action ===
            "ASSIGN" && (
            <select
              value={
                employeeId
              }
              onChange={(e) =>
                setEmployeeId(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select Employee
              </option>

              {employees.map(
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
                    }{" "}
                    -{" "}
                    {
                      employee.employeeCode
                    }
                  </option>
                )
              )}
            </select>
          )}

          {action ===
            "STAGE" && (
            <select
              value={stage}
              onChange={(e) =>
                setStage(
                  e.target
                    .value as
                    LeadStage
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select Stage
              </option>

              <option value="NEW">
                New
              </option>

              <option value="WORKING">
                Working
              </option>

              <option value="FOLLOW_UP">
                Follow Up
              </option>

              <option value="CONVERTED">
                Converted
              </option>

              <option value="LOST">
                Lost
              </option>
            </select>
          )}

          {action ===
            "STATUS" && (
            <select
              value={
                statusId
              }
              onChange={(e) =>
                setStatusId(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select Status
              </option>

              {statuses.map(
                (status) => (
                  <option
                    key={
                      status.id
                    }
                    value={
                      status.id
                    }
                  >
                    {
                      status.name
                    }
                  </option>
                )
              )}
            </select>
          )}

          <button
            type="button"
            onClick={
              handleApply
            }
            disabled={
              saving ||
              !action
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <UserRoundCheck
              size={16}
            />

            {saving
              ? "Applying..."
              : "Apply"}
          </button>

          <button
            type="button"
            onClick={
              onClear
            }
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            <X size={16} />
            Clear
          </button>
        </div>

        {action && (
          <input
            value={remarks}
            onChange={(e) =>
              setRemarks(
                e.target.value
              )
            }
            placeholder={
              action ===
              "ASSIGN"
                ? "Assignment reason (optional)"
                : "Bulk update remarks (optional)"
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        )}

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500";