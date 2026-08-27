import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Download,
  Filter,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  exportClientReport,
  exportLeadReport,
  exportTrialReport,
  fetchClientReport,
  fetchLeadReport,
  fetchReportFilterOptions,
  fetchTrialReport,
  resetReportFilters,
  setReportFilters,
  setReportPage,
} from "../../store/slices/reportSlice";

import type {
  ClientReportRow,
  LeadReportRow,
  ReportType,
  TrialReportRow,
} from "../../types/report.types";

/* ============================
   PAGE
============================ */

export default function ReportPage() {
  const dispatch =
    useAppDispatch();

  const {
    filterOptions,
    leadReport,
    clientReport,
    trialReport,
    filters,
    loading,
    filtersLoading,
    downloading,
    error,
  } =
    useAppSelector(
      (state) =>
        state.report
    );

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const [
    reportType,
    setReportType,
  ] =
    useState<ReportType>(
      "LEAD"
    );

  const [
    searchInput,
    setSearchInput,
  ] =
    useState(
      filters.search || ""
    );

  /* ============================
     ROLE
  ============================ */

  const roleName =
    useMemo(() => {
      const role =
        employee?.role as unknown;

      if (
        typeof role ===
        "string"
      ) {
        return role;
      }

      if (
        role &&
        typeof role ===
          "object" &&
        "name" in role
      ) {
        return String(
          (
            role as {
              name: string;
            }
          ).name
        );
      }

      return "";
    }, [employee]);

  /* ============================
     ADMIN ONLY
  ============================ */

  if (
    roleName &&
    roleName !== "ADMIN"
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          Access Denied
        </p>

        <p className="mt-1 text-sm text-red-600">
          Reports module is available
          only to Admin.
        </p>
      </div>
    );
  }

  /* ============================
     LOAD FILTER OPTIONS
  ============================ */

  useEffect(() => {
    dispatch(
      fetchReportFilterOptions()
    );
  }, [dispatch]);

  /* ============================
     INITIAL REPORT
  ============================ */

  useEffect(() => {
    if (!filterOptions) {
      return;
    }

    loadReport(
      reportType,
      filters
    );
  }, [
    dispatch,
    filterOptions,
    reportType,
  ]);

  /* ============================
     LOAD REPORT
  ============================ */

  const loadReport =
    (
      type: ReportType,
      currentFilters: typeof filters
    ) => {
      if (
        type === "CLIENT"
      ) {
        dispatch(
          fetchClientReport(
            currentFilters
          )
        );

        return;
      }

      if (
        type === "TRIAL"
      ) {
        dispatch(
          fetchTrialReport(
            currentFilters
          )
        );

        return;
      }

      dispatch(
        fetchLeadReport(
          currentFilters
        )
      );
    };

  /* ============================
     REPORT CHANGE
  ============================ */

  const handleReportTypeChange =
    (
      value: ReportType
    ) => {
      setReportType(
        value
      );

      dispatch(
        resetReportFilters()
      );

      setSearchInput("");

      const resetFilters = {
        page: 1,
        limit: 20,
        search: "",
        fromDate: "",
        toDate: "",
        employeeId: "",
        status: "",
        stage: "",
        source: "",
        productId: "",
        paymentStatus: "",
        trialStatus: "",
        followUpStatus: "",
      };

      loadReport(
        value,
        resetFilters
      );
    };

  /* ============================
     APPLY
  ============================ */

  const applyFilters =
    () => {
      const nextFilters = {
        ...filters,

        page: 1,

        search:
          searchInput.trim(),
      };

      dispatch(
        setReportFilters(
          nextFilters
        )
      );

      loadReport(
        reportType,
        nextFilters
      );
    };

  /* ============================
     RESET
  ============================ */

  const handleReset =
    () => {
      dispatch(
        resetReportFilters()
      );

      setSearchInput("");

      const resetFilters = {
        page: 1,
        limit: 20,
        search: "",
        fromDate: "",
        toDate: "",
        employeeId: "",
        status: "",
        stage: "",
        source: "",
        productId: "",
        paymentStatus: "",
        trialStatus: "",
        followUpStatus: "",
      };

      loadReport(
        reportType,
        resetFilters
      );
    };

  /* ============================
     REFRESH
  ============================ */

  const handleRefresh =
    () => {
      const currentFilters = {
        ...filters,

        search:
          searchInput.trim(),
      };

      loadReport(
        reportType,
        currentFilters
      );
    };

  /* ============================
     DOWNLOAD
  ============================ */

  const handleDownload =
    () => {
      const currentFilters = {
        ...filters,

        search:
          searchInput.trim(),
      };

      if (
        reportType === "CLIENT"
      ) {
        dispatch(
          exportClientReport(
            currentFilters
          )
        );

        return;
      }

      if (
        reportType === "TRIAL"
      ) {
        dispatch(
          exportTrialReport(
            currentFilters
          )
        );

        return;
      }

      dispatch(
        exportLeadReport(
          currentFilters
        )
      );
    };

  /* ============================
     PAGE CHANGE
  ============================ */

  const handlePageChange =
    (
      nextPage: number
    ) => {
      dispatch(
        setReportPage(
          nextPage
        )
      );

      const nextFilters = {
        ...filters,

        page:
          nextPage,

        search:
          searchInput.trim(),
      };

      loadReport(
        reportType,
        nextFilters
      );
    };

  /* ============================
     ACTIVE REPORT
  ============================ */

  const activeReport =
    reportType === "CLIENT"
      ? clientReport
      : reportType === "TRIAL"
        ? trialReport
        : leadReport;

  const totalRecords =
    activeReport?.pagination
      .total || 0;

  const totalPages =
    activeReport?.pagination
      .totalPages || 0;

  const currentPage =
    activeReport?.pagination
      .page ||
    filters.page ||
    1;

  const rowsPerPage =
    activeReport?.pagination
      .limit ||
    filters.limit ||
    20;

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Admin Reports
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Filter, preview and
            download CRM reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              loading
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={
              handleDownload
            }
            disabled={
              downloading ||
              totalRecords === 0
            }
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Download
                size={16}
              />
            )}

            {downloading
              ? "Downloading..."
              : "Download Excel"}
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* REPORT TYPE */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter
            size={18}
            className="text-blue-700"
          />

          <h2 className="font-semibold text-slate-900">
            Report Type
          </h2>
        </div>

        <div className="mt-4 max-w-sm">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Select Report
          </label>

          <select
            value={
              reportType
            }
            onChange={(
              event
            ) =>
              handleReportTypeChange(
                event.target
                  .value as ReportType
              )
            }
            className={
              inputClass
            }
          >
            <option value="LEAD">
              Lead Report
            </option>

            <option value="CLIENT">
              Client Report
            </option>

            <option value="TRIAL">
              Trial / Demo Report
            </option>
          </select>
        </div>
      </div>

      {/* FILTERS */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Filters
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Apply any combination
              of filters.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleReset
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw
              size={14}
            />

            Reset
          </button>
        </div>

        {filtersLoading ? (
          <div className="flex min-h-28 items-center justify-center">
            <Loader2
              size={22}
              className="animate-spin text-blue-700"
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* FROM */}

            <Field label="From Date">
              <input
                type="date"
                value={
                  filters.fromDate ||
                  ""
                }
                onChange={(
                  event
                ) =>
                  dispatch(
                    setReportFilters({
                      fromDate:
                        event.target
                          .value,

                      page: 1,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            {/* TO */}

            <Field label="To Date">
              <input
                type="date"
                value={
                  filters.toDate ||
                  ""
                }
                onChange={(
                  event
                ) =>
                  dispatch(
                    setReportFilters({
                      toDate:
                        event.target
                          .value,

                      page: 1,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            {/* EMPLOYEE */}

            <Field label="Employee">
              <select
                value={
                  filters.employeeId ||
                  ""
                }
                onChange={(
                  event
                ) =>
                  dispatch(
                    setReportFilters({
                      employeeId:
                        event.target
                          .value,

                      page: 1,
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  All Employees
                </option>

                {filterOptions
                  ?.employees.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }
                        {" - "}
                        {
                          item.employeeCode
                        }
                      </option>
                    )
                  )}
              </select>
            </Field>

            {/* LEAD STATUS */}

            {reportType ===
              "LEAD" && (
              <Field label="Lead Status">
                <select
                  value={
                    filters.status ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setReportFilters({
                        status:
                          event.target
                            .value,

                        page: 1,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    All Statuses
                  </option>

                  {filterOptions
                    ?.leadStatuses.map(
                      (
                        status
                      ) => (
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
              </Field>
            )}

            {/* CLIENT STATUS */}

            {reportType ===
              "CLIENT" && (
              <Field label="Client Status">
                <select
                  value={
                    filters.status ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setReportFilters({
                        status:
                          event.target
                            .value,

                        page: 1,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    All Clients
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </Field>
            )}

            {/* TRIAL STATUS */}

            {reportType ===
              "TRIAL" && (
              <Field label="Trial Status">
                <select
                  value={
                    filters.trialStatus ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setReportFilters({
                        trialStatus:
                          event.target
                            .value,

                        page: 1,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    All Trial Status
                  </option>

                  {filterOptions
                    ?.trialStatuses.map(
                      (
                        status
                      ) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {formatLabel(
                            status
                          )}
                        </option>
                      )
                    )}
                </select>
              </Field>
            )}

            {/* PRODUCT */}

            {reportType ===
              "TRIAL" && (
              <Field label="Product">
                <select
                  value={
                    filters.productId ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setReportFilters({
                        productId:
                          event.target
                            .value,

                        page: 1,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    All Products
                  </option>

                  {filterOptions
                    ?.products.map(
                      (
                        product
                      ) => (
                        <option
                          key={
                            product.id
                          }
                          value={
                            product.id
                          }
                        >
                          {
                            product.name
                          }
                          {" - "}
                          {
                            product.productCode
                          }
                        </option>
                      )
                    )}
                </select>
              </Field>
            )}

            {/* LEAD STAGE */}

            {reportType ===
              "LEAD" && (
              <Field label="Lead Stage">
                <select
                  value={
                    filters.stage ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setReportFilters({
                        stage:
                          event.target
                            .value,

                        page: 1,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    All Stages
                  </option>

                  {filterOptions
                    ?.leadStages.map(
                      (
                        stage
                      ) => (
                        <option
                          key={
                            stage
                          }
                          value={
                            stage
                          }
                        >
                          {formatLabel(
                            stage
                          )}
                        </option>
                      )
                    )}
                </select>
              </Field>
            )}

            {/* SOURCE */}

            {reportType ===
              "LEAD" && (
              <Field label="Lead Source">
                <select
                  value={
                    filters.source ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    dispatch(
                      setReportFilters({
                        source:
                          event.target
                            .value,

                        page: 1,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    All Sources
                  </option>

                  {filterOptions
                    ?.leadSources.map(
                      (
                        source
                      ) => (
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
              </Field>
            )}

            {/* SEARCH */}

            <Field label="Search">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchInput
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchInput(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    reportType ===
                    "CLIENT"
                      ? "Client name, mobile, code..."
                      : reportType ===
                          "TRIAL"
                        ? "Trial, lead, client, product..."
                        : "Lead name, mobile, code..."
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>
            </Field>

            {/* APPLY */}

            <div className="flex items-end">
              <button
                type="button"
                onClick={
                  applyFilters
                }
                disabled={
                  loading
                }
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : "Apply Filters"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Records"
          value={
            totalRecords
          }
          description={
            reportType ===
            "CLIENT"
              ? "Matching clients"
              : reportType ===
                  "TRIAL"
                ? "Matching trials"
                : "Matching leads"
          }
        />

        <SummaryCard
          title="Current Page"
          value={
            currentPage
          }
          description={`of ${Math.max(
            totalPages,
            1
          )} pages`}
        />

        <SummaryCard
          title="Rows Per Page"
          value={
            rowsPerPage
          }
          description="Preview only"
        />
      </div>

      {/* REPORT TABLE */}

      {reportType ===
      "CLIENT" ? (
        <ClientReportTable
          rows={
            clientReport
              ?.data || []
          }
          loading={
            loading
          }
          totalPages={
            totalPages
          }
          currentPage={
            currentPage
          }
          onPageChange={
            handlePageChange
          }
        />
      ) : reportType ===
        "TRIAL" ? (
        <TrialReportTable
          rows={
            trialReport
              ?.data || []
          }
          loading={
            loading
          }
          totalPages={
            totalPages
          }
          currentPage={
            currentPage
          }
          onPageChange={
            handlePageChange
          }
        />
      ) : (
        <LeadReportTable
          rows={
            leadReport
              ?.data || []
          }
          loading={
            loading
          }
          totalPages={
            totalPages
          }
          currentPage={
            currentPage
          }
          onPageChange={
            handlePageChange
          }
        />
      )}
    </div>
  );
}

/* ============================
   LEAD TABLE
============================ */

function LeadReportTable({
  rows,
  loading,
  totalPages,
  currentPage,
  onPageChange,
}: {
  rows: LeadReportRow[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange:
    (page: number) => void;
}) {
  return (
    <ReportCard
      title="Lead Report Preview"
      description="Excel download contains all matching Lead records."
      loading={loading}
      hasRows={
        rows.length > 0
      }
      totalPages={
        totalPages
      }
      currentPage={
        currentPage
      }
      onPageChange={
        onPageChange
      }
    >
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <TableHead>
              Lead
            </TableHead>

            <TableHead>
              Contact
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Stage
            </TableHead>

            <TableHead>
              Source
            </TableHead>

            <TableHead>
              Employee
            </TableHead>

            <TableHead>
              Created
            </TableHead>

            <TableHead>
              Follow-up
            </TableHead>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map(
            (row) => (
              <tr
                key={
                  row.id
                }
                className="hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {row.name ||
                      "Unnamed Lead"}
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    {
                      row.leadCode
                    }
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {
                      row.mobile
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {row.email ||
                      "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {row.status
                      ?.name ||
                      "-"}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {formatLabel(
                    row.stage
                  )}
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {row.source
                    ?.name ||
                    "-"}
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {row
                      .assignedEmployee
                      ?.name ||
                      "Unassigned"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {row
                      .assignedEmployee
                      ?.employeeCode ||
                      "-"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {formatDate(
                    row.createdAt
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {row.nextFollowUp
                    ? formatDateTime(
                        row.nextFollowUp
                      )
                    : "-"}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </ReportCard>
  );
}

/* ============================
   CLIENT TABLE
============================ */

function ClientReportTable({
  rows,
  loading,
  totalPages,
  currentPage,
  onPageChange,
}: {
  rows: ClientReportRow[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange:
    (page: number) => void;
}) {
  return (
    <ReportCard
      title="Client Report Preview"
      description="Excel download contains all matching Client records."
      loading={loading}
      hasRows={
        rows.length > 0
      }
      totalPages={
        totalPages
      }
      currentPage={
        currentPage
      }
      onPageChange={
        onPageChange
      }
    >
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <TableHead>
              Client
            </TableHead>

            <TableHead>
              Contact
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Source Lead
            </TableHead>

            <TableHead>
              Employee
            </TableHead>

            <TableHead>
              Orders
            </TableHead>

            <TableHead>
              Trials
            </TableHead>

            <TableHead>
              Services
            </TableHead>

            <TableHead>
              Created
            </TableHead>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map(
            (row) => (
              <tr
                key={
                  row.id
                }
                className="hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {
                      row.name
                    }
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    {
                      row.clientCode
                    }
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {
                      row.mobile
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {row.email ||
                      "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      row.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.isActive
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {row.lead
                    ?.leadCode ||
                    "-"}
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {row.lead
                      ?.assignedEmployee
                      ?.name ||
                      "-"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {row.lead
                      ?.assignedEmployee
                      ?.employeeCode ||
                      "-"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  {
                    row._count
                      .orders
                  }
                </td>

                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  {
                    row._count
                      .trials
                  }
                </td>

                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  {
                    row._count
                      .services
                  }
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {formatDate(
                    row.createdAt
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </ReportCard>
  );
}

/* ============================
   TRIAL TABLE
============================ */

function TrialReportTable({
  rows,
  loading,
  totalPages,
  currentPage,
  onPageChange,
}: {
  rows: TrialReportRow[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange:
    (page: number) => void;
}) {
  return (
    <ReportCard
      title="Trial / Demo Report Preview"
      description="Excel download contains all matching Trial / Demo records."
      loading={loading}
      hasRows={
        rows.length > 0
      }
      totalPages={
        totalPages
      }
      currentPage={
        currentPage
      }
      onPageChange={
        onPageChange
      }
    >
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <TableHead>
              Trial
            </TableHead>

            <TableHead>
              Lead / Client
            </TableHead>

            <TableHead>
              Product
            </TableHead>

            <TableHead>
              Employee
            </TableHead>

            <TableHead>
              Duration
            </TableHead>

            <TableHead>
              Start
            </TableHead>

            <TableHead>
              End
            </TableHead>

            <TableHead>
              Status
            </TableHead>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map(
            (row) => {
              const subjectName =
                row.lead
                  ?.name ||
                row.client
                  ?.name ||
                "-";

              const subjectCode =
                row.lead
                  ?.leadCode ||
                row.client
                  ?.clientCode ||
                "-";

              const subjectMobile =
                row.lead
                  ?.mobile ||
                row.client
                  ?.mobile ||
                "-";

              return (
                <tr
                  key={
                    row.id
                  }
                  className="hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-blue-700">
                      {
                        row.trialCode
                      }
                    </p>

                    {row.extensionCount >
                      0 && (
                      <p className="mt-1 text-xs text-slate-400">
                        Extended{" "}
                        {
                          row.extensionCount
                        }
                        x
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {subjectName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {subjectCode}
                      {" · "}
                      {subjectMobile}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {
                        row.product
                          .name
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        row.product
                          .productCode
                      }
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {row.employee
                        ?.name ||
                        "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {row.employee
                        ?.employeeCode ||
                        "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {
                      row.trialDays
                    }{" "}
                    days
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatDate(
                      row.startDate
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatDate(
                      row.endDate
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {formatLabel(
                        row.status
                      )}
                    </span>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </ReportCard>
  );
}

/* ============================
   REPORT CARD
============================ */

function ReportCard({
  title,
  description,
  loading,
  hasRows,
  totalPages,
  currentPage,
  onPageChange,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  hasRows: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange:
    (page: number) => void;
  children:
    React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      {loading &&
      !hasRows ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2
            size={26}
            className="animate-spin text-blue-700"
          />
        </div>
      ) : !hasRows ? (
        <div className="p-10 text-center text-sm text-slate-500">
          No report records found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            {children}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-700">
                {
                  currentPage
                }
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {Math.max(
                  totalPages,
                  1
                )}
              </span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  currentPage <=
                    1 ||
                  loading
                }
                onClick={() =>
                  onPageChange(
                    currentPage -
                      1
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  currentPage >=
                    totalPages ||
                  totalPages ===
                    0 ||
                  loading
                }
                onClick={() =>
                  onPageChange(
                    currentPage +
                      1
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================
   FIELD
============================ */

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================
   SUMMARY
============================ */

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ============================
   FORMATTERS
============================ */

function formatLabel(
  value: string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";