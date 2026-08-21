import {
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import * as XLSX from "xlsx";

import {
  getEmployees,
} from "../../services/employee.service";

import {
  getLeadSources,
} from "../../services/leadSource.service";

import {
  importLeads,
  previewLeadImport,
} from "../../services/leadImport.service";

import type {
  LeadImportPreviewRow,
  LeadImportRow,
} from "../../types/leadImport.types";

import {
  useEffect,
} from "react";

export default function LeadImportPage() {
  const navigate =
    useNavigate();

  const [
    fileName,
    setFileName,
  ] = useState("");

  const [
    rows,
    setRows,
  ] =
    useState<
      LeadImportRow[]
    >([]);

  const [
    previewRows,
    setPreviewRows,
  ] =
    useState<
      LeadImportPreviewRow[]
    >([]);

  const [
    summary,
    setSummary,
  ] =
    useState({
      total: 0,
      valid: 0,
      invalid: 0,
      duplicates: 0,
    });

  const [
    employees,
    setEmployees,
  ] = useState<any[]>([]);

  const [
    sources,
    setSources,
  ] = useState<any[]>([]);

  const [
    assignedEmployeeId,
    setAssignedEmployeeId,
  ] = useState("");

  const [
    sourceId,
    setSourceId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    importing,
    setImporting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ============================
     LOAD OPTIONS
  ============================ */

  useEffect(() => {
    const loadOptions =
      async () => {
        try {
          const [
            employeeResponse,
            sourceResponse,
          ] =
            await Promise.all([
              getEmployees({
                page: 1,
                limit: 100,
              }),

              getLeadSources(),
            ]);

          setEmployees(
            employeeResponse
              .employees || []
          );

          setSources(
            sourceResponse
              .leadSources || []
          );
        } catch (
          error
        ) {
          console.error(
            error
          );
        }
      };

    loadOptions();
  }, []);

  /* ============================
     FILE
  ============================ */

  const handleFile =
    async (
      file: File
    ) => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        setFileName(
          file.name
        );

        const buffer =
          await file.arrayBuffer();

        const workbook =
          XLSX.read(
            buffer,
            {
              type: "array",
            }
          );

        const sheetName =
          workbook.SheetNames[0];

        const sheet =
          workbook.Sheets[
            sheetName
          ];

        const rawRows =
          XLSX.utils.sheet_to_json<
            Record<
              string,
              any
            >
          >(sheet, {
            defval: "",
          });

        const parsedRows =
          rawRows.map(
            (row) => ({
              name:
                String(
                  row.name ||
                    row.Name ||
                    ""
                ).trim(),

              mobile:
                String(
                  row.mobile ||
                    row.Mobile ||
                    row.phone ||
                    row.Phone ||
                    ""
                ).trim(),

              email:
                String(
                  row.email ||
                    row.Email ||
                    ""
                ).trim(),

              city:
                String(
                  row.city ||
                    row.City ||
                    ""
                ).trim(),

              state:
                String(
                  row.state ||
                    row.State ||
                    ""
                ).trim(),

              address:
                String(
                  row.address ||
                    row.Address ||
                    ""
                ).trim(),

              remarks:
                String(
                  row.remarks ||
                    row.Remarks ||
                    ""
                ).trim(),
            })
          );

        setRows(
          parsedRows
        );

        const response =
          await previewLeadImport(
            parsedRows
          );

        setPreviewRows(
          response.rows
        );

        setSummary(
          response.summary
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to read file"
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================
     IMPORT
  ============================ */

  const handleImport =
    async () => {
      if (!rows.length) {
        return;
      }

      try {
        setImporting(true);
        setError("");
        setSuccessMessage("");

        const response =
          await importLeads({
            fileName,

            rows,

            assignedEmployeeId:
              assignedEmployeeId ||
              undefined,

            sourceId:
              sourceId ||
              undefined,
          });

        setSuccessMessage(
          response.message
        );

        setSummary({
          total:
            response.summary
              .total,

          valid:
            response.summary
              .imported,

          invalid:
            response.summary
              .failed,

          duplicates:
            response.summary
              .duplicates,
        });
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Import failed"
        );
      } finally {
        setImporting(false);
      }
    };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/leads"
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft
            size={19}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Import Leads
          </h1>

          <p className="text-sm text-slate-500">
            Excel / CSV lead import
          </p>
        </div>
      </div>

      {/* Upload */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-10 text-center">
          <FileSpreadsheet
            size={42}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 font-medium text-slate-700">
            Upload Excel or CSV
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Columns supported:
            name, mobile,
            email, city,
            state, address,
            remarks
          </p>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
            <Upload
              size={17}
            />

            Choose File

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file =
                  e.target
                    .files?.[0];

                if (file) {
                  handleFile(
                    file
                  );
                }
              }}
            />
          </label>

          {fileName && (
            <p className="mt-3 text-sm text-slate-500">
              {fileName}
            </p>
          )}
        </div>
      </section>

      {loading && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">
          Reading and validating file...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {previewRows.length >
        0 && (
        <>
          {/* Summary */}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total"
              value={
                summary.total
              }
              icon={
                <Users
                  size={18}
                />
              }
            />

            <SummaryCard
              title="Valid"
              value={
                summary.valid
              }
              icon={
                <CheckCircle2
                  size={18}
                />
              }
            />

            <SummaryCard
              title="Duplicates"
              value={
                summary.duplicates
              }
              icon={
                <AlertTriangle
                  size={18}
                />
              }
            />

            <SummaryCard
              title="Invalid"
              value={
                summary.invalid
              }
              icon={
                <XCircle
                  size={18}
                />
              }
            />
          </div>

          {/* Assignment */}

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assign Imported Leads
              </label>

              <select
                value={
                  assignedEmployeeId
                }
                onChange={(e) =>
                  setAssignedEmployeeId(
                    e.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Leave Unassigned
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Lead Source
              </label>

              <select
                value={
                  sourceId
                }
                onChange={(e) =>
                  setSourceId(
                    e.target.value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  No Source
                </option>

                {sources.map(
                  (source) => (
                    <option
                      key={
                        source.id
                      }
                      value={
                        source.id
                      }
                    >
                      {
                        source.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </section>

          {/* Preview */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Import Preview
              </h2>
            </div>

            <div className="max-h-130 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <TableHead>
                      #
                    </TableHead>

                    <TableHead>
                      Name
                    </TableHead>

                    <TableHead>
                      Mobile
                    </TableHead>

                    <TableHead>
                      Email
                    </TableHead>

                    <TableHead>
                      City
                    </TableHead>

                    <TableHead>
                      Result
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {previewRows.map(
                    (row) => (
                      <tr
                        key={
                          row.rowNumber
                        }
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {
                            row.rowNumber
                          }
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {row.name ||
                            "-"}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {
                            row.mobile
                          }
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-500">
                          {row.email ||
                            "-"}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-500">
                          {row.city ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {row.isValid ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Ready
                            </span>
                          ) : row.fileDuplicate ||
                            row.databaseDuplicate ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              Duplicate
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              Invalid
                            </span>
                          )}

                          {row.errors
                            .length >
                            0 && (
                            <p className="mt-1 text-xs text-red-500">
                              {row.errors.join(
                                ", "
                              )}
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Import */}

          <div className="flex justify-end rounded-2xl border border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={
                handleImport
              }
              disabled={
                importing ||
                summary.valid ===
                  0
              }
              className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {importing
                ? "Importing..."
                : `Import ${summary.valid} Valid Leads`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}