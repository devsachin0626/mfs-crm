import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Search,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getLeads,
  getLeadById,
} from "../../services/lead.service";

import {
  getActiveDemoProducts,
} from "../../services/demoProduct.service";

import {
  getEmployees,
} from "../../services/employee.service";

import {
  startTrial,
} from "../../services/trial.service";

import {
  getTrialRuntimeSettings,
} from "../../services/settings.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  Lead,
} from "../../types/lead.types";

import type {
  Employee,
} from "../../types/employee.types";

import type {
  DemoProduct,
} from "../../types/settings.types";

/* ============================
   FORM
============================ */

type TrialForm = {
  leadId: string;

  demoProductId: string;

  employeeId: string;

  trialDays: string;

  remarks: string;
};

/* ============================
   DEFAULT
============================ */

const DEFAULT_TRIAL_DAYS =
  "7";

/* ============================
   PAGE
============================ */

export default function TrialCreatePage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  /* ============================
     QUERY LEAD
  ============================ */

  const queryLeadId =
    searchParams.get(
      "leadId"
    ) || "";

  /* ============================
     DATA
  ============================ */

  const [
    leads,
    setLeads,
  ] =
    useState<Lead[]>(
      []
    );

  const [
    products,
    setProducts,
  ] =
    useState<
      DemoProduct[]
    >([]);

  const [
    employees,
    setEmployees,
  ] =
    useState<
      Employee[]
    >([]);

  /* ============================
     UI
  ============================ */

  const [
    loadingOptions,
    setLoadingOptions,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    leadSearch,
    setLeadSearch,
  ] =
    useState("");

  /* ============================
     FORM
  ============================ */

  const [
    form,
    setForm,
  ] =
    useState<TrialForm>({
      leadId:
        queryLeadId,

      demoProductId:
        "",

      employeeId:
        "",

      trialDays:
        DEFAULT_TRIAL_DAYS,

      remarks:
        "",
    });

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

  const canAssign =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR" ||
    roleName ===
      "TEAM_LEADER";

  /* ============================
     LOAD OPTIONS
  ============================ */

  useEffect(() => {
    const loadOptions =
      async () => {
        try {
          setLoadingOptions(
            true
          );

          setError("");

          /*
           * Lead + Demo Product
           * parallel load.
           */

          const [
            leadResponse,
            demoProducts,
          ] =
            await Promise.all([
              getLeads({
                page: 1,
                limit: 100,
              }),

              getActiveDemoProducts(),
            ]);

          /* ============================
             LEADS
          ============================ */

          const availableLeads =
            (
              leadResponse.leads ||
              []
            ).filter(
              (lead) =>
                lead.stage !==
                  "LOST" &&
                !lead.isConverted
            );

          setLeads(
            availableLeads
          );

          /* ============================
             DEMO PRODUCTS
          ============================ */

          setProducts(
            demoProducts ||
              []
          );

          /* ============================
             DEFAULT TRIAL DAYS

             Settings endpoint can be
             ADMIN-only, therefore
             failure must not break
             employee Trial form.
          ============================ */

       try {
  const runtimeResponse =
    await getTrialRuntimeSettings();

  const value =
    Number(
      runtimeResponse
        ?.trial
        ?.defaultTrialDays
    );

  if (
    Number.isInteger(
      value
    ) &&
    value > 0 &&
    value <= 365
  ) {
    setForm(
      (current) => ({
        ...current,

        trialDays:
          String(
            value
          ),
      })
    );
  }
} catch {
  setForm(
    (current) => ({
      ...current,

      trialDays:
        DEFAULT_TRIAL_DAYS,
    })
  );
}

          /* ============================
             EMPLOYEES
          ============================ */

          if (canAssign) {
            const employeeResponse =
              await getEmployees({
                page: 1,
                limit: 100,
              });

            setEmployees(
              (
                employeeResponse
                  .employees ||
                []
              ).filter(
                (item) =>
                  item.isActive
              )
            );
          } else {
            setEmployees(
              []
            );
          }

          /* ============================
             QUERY LEAD

             Lead may not exist inside
             first 100 records.
          ============================ */

          if (
            queryLeadId &&
            !availableLeads.some(
              (lead) =>
                lead.id ===
                queryLeadId
            )
          ) {
            try {
              const directLead =
                await getLeadById(
                  queryLeadId
                );

              if (
                directLead.lead &&
                directLead.lead
                  .stage !==
                  "LOST" &&
                !directLead.lead
                  .isConverted
              ) {
                setLeads(
                  (current) => [
                    directLead.lead,

                    ...current.filter(
                      (item) =>
                        item.id !==
                        directLead
                          .lead.id
                    ),
                  ]
                );
              }
            } catch {
              /*
               * Backend access rules
               * still protect Lead.
               */
            }
          }
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data?.message ||
              "Failed to load trial form options"
          );
        } finally {
          setLoadingOptions(
            false
          );
        }
      };

    void loadOptions();
  }, [
    canAssign,
    queryLeadId,
  ]);

  /* ============================
     SELECTED LEAD
  ============================ */

  const selectedLead =
    useMemo(
      () =>
        leads.find(
          (item) =>
            item.id ===
            form.leadId
        ),
      [
        leads,
        form.leadId,
      ]
    );

  /* ============================
     SELECTED DEMO PRODUCT
  ============================ */

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (item) =>
            item.id ===
            form.demoProductId
        ),
      [
        products,
        form.demoProductId,
      ]
    );

  /* ============================
     FILTER LEADS
  ============================ */

  const filteredLeads =
    useMemo(() => {
      const value =
        leadSearch
          .trim()
          .toLowerCase();

      if (!value) {
        return leads;
      }

      return leads.filter(
        (lead) =>
          lead.leadCode
            .toLowerCase()
            .includes(
              value
            ) ||
          (
            lead.name ||
            ""
          )
            .toLowerCase()
            .includes(
              value
            ) ||
          lead.mobile.includes(
            value
          )
      );
    }, [
      leads,
      leadSearch,
    ]);

  /* ============================
     AUTO EMPLOYEE
  ============================ */

  useEffect(() => {
    if (
      !canAssign ||
      !selectedLead
    ) {
      return;
    }

    if (
      selectedLead
        .assignedEmployeeId
    ) {
      setForm(
        (current) => ({
          ...current,

          employeeId:
            selectedLead
              .assignedEmployeeId ||
            "",
        })
      );
    }
  }, [
    canAssign,
    selectedLead,
  ]);

  /* ============================
     VALIDATION
  ============================ */

  const validate =
    () => {
      if (
        !form.leadId
      ) {
        return "Please select Lead";
      }

      if (
        selectedLead
          ?.stage ===
        "LOST"
      ) {
        return "Lost Lead cannot start demo";
      }

      if (
        selectedLead
          ?.isConverted
      ) {
        return "Converted Lead cannot start new Lead demo";
      }

      if (
        !form.demoProductId
      ) {
        return "Please select Demo Product";
      }

      const trialDays =
        Number(
          form.trialDays
        );

      if (
        !Number.isInteger(
          trialDays
        ) ||
        trialDays <= 0 ||
        trialDays > 365
      ) {
        return "Trial days must be between 1 and 365";
      }

      return "";
    };

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const validationError =
        validate();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        setError("");

        setSuccess("");

        const response =
          await startTrial({
            leadId:
              form.leadId,

            demoProductId:
              form.demoProductId,

            employeeId:
              canAssign &&
              form.employeeId
                ? form.employeeId
                : undefined,

            trialDays:
              Number(
                form.trialDays
              ),

            remarks:
              form.remarks
                .trim() ||
              undefined,
          });

        setSuccess(
          response.message ||
            "Demo started successfully"
        );

        const trialId =
          response.trial
            ?.id;

        if (trialId) {
          setTimeout(
            () => {
              navigate(
                `/trials/${trialId}`
              );
            },
            400
          );

          return;
        }

        setTimeout(
          () => {
            navigate(
              "/trials"
            );
          },
          400
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to start demo"
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* ============================
     LOADING
  ============================ */

  if (
    loadingOptions
  ) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-blue-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading demo
            options...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/trials"
              )
            }
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft
              size={16}
            />

            Back to Trials
          </button>

          <p className="text-sm font-medium text-slate-500">
            Demo Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Start Lead Demo
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Select a Lead and
            start a product demo.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Logged in as
          </p>

          <p className="mt-1 text-sm font-semibold text-blue-900">
            {employee?.name ||
              "-"}
          </p>

          <p className="text-xs text-blue-600">
            {roleName ||
              "-"}
          </p>
        </div>
      </div>

      {/* ============================
          ERROR
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================
          SUCCESS
      ============================ */}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2
            size={17}
          />

          {success}
        </div>
      )}

      {/* ============================
          FORM
      ============================ */}

      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <PlayCircle
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Demo Details
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Lead, demo product,
                duration and
                assignment.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* ============================
              LEAD
          ============================ */}

          <Field
            label="Lead"
            required
          >
            <div className="relative mb-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  leadSearch
                }
                onChange={(
                  event
                ) =>
                  setLeadSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search lead by name, mobile or code..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <select
              value={
                form.leadId
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    leadId:
                      event.target
                        .value,
                  })
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select Lead
              </option>

              {filteredLeads.map(
                (lead) => (
                  <option
                    key={
                      lead.id
                    }
                    value={
                      lead.id
                    }
                  >
                    {
                      lead.leadCode
                    }
                    {" - "}
                    {lead.name ||
                      "Unnamed Lead"}
                    {" - "}
                    {
                      lead.mobile
                    }
                  </option>
                )
              )}
            </select>

            {leads.length ===
              0 && (
              <p className="mt-2 text-xs text-amber-600">
                No eligible
                Leads found.
              </p>
            )}

            {selectedLead && (
              <InfoBox>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedLead.name ||
                        "Unnamed Lead"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        selectedLead.leadCode
                      }
                      {" · "}
                      {
                        selectedLead.mobile
                      }
                    </p>

                    {selectedLead.email && (
                      <p className="mt-1 text-xs text-slate-500">
                        {
                          selectedLead.email
                        }
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {
                      selectedLead.stage
                    }
                  </span>
                </div>

                {selectedLead
                  .assignedEmployee && (
                  <p className="mt-3 text-xs text-slate-500">
                    Lead Owner:{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        selectedLead
                          .assignedEmployee
                          .name
                      }
                    </span>
                  </p>
                )}
              </InfoBox>
            )}
          </Field>

          {/* ============================
              DEMO PRODUCT
          ============================ */}

          <Field
            label="Demo Product"
            required
          >
            <select
              value={
                form.demoProductId
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    demoProductId:
                      event.target
                        .value,
                  })
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select Demo Product
              </option>

              {products.map(
                (product) => (
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
                      product.code
                    }
                  </option>
                )
              )}
            </select>

            {products.length ===
              0 && (
              <p className="mt-2 text-xs text-amber-600">
                No active Demo
                Products found.
                Create or activate
                one from Settings.
              </p>
            )}

            {selectedProduct && (
              <InfoBox>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {
                        selectedProduct.name
                      }
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {
                        selectedProduct.code
                      }
                    </p>

                    {selectedProduct.description && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {
                          selectedProduct.description
                        }
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>
              </InfoBox>
            )}
          </Field>

          {/* ============================
              EMPLOYEE
          ============================ */}

          {canAssign ? (
            <Field label="Assigned Employee">
              <select
                value={
                  form.employeeId
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (current) => ({
                      ...current,

                      employeeId:
                        event.target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Assign to Me
                </option>

                {employees.map(
                  (item) => (
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

              <p className="mt-2 text-xs text-slate-500">
                Lead owner is
                selected
                automatically when
                available.
              </p>
            </Field>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">
                Demo Assignment
              </p>

              <p className="mt-1 text-xs text-blue-600">
                This Demo will
                automatically be
                assigned to you.
              </p>
            </div>
          )}

          {/* ============================
              DAYS
          ============================ */}

          <Field
            label="Trial Days"
            required
          >
            <input
              type="number"
              min={1}
              max={365}
              value={
                form.trialDays
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    trialDays:
                      event.target
                        .value,
                  })
                )
              }
              className={
                inputClass
              }
            />

            <div className="mt-2 flex flex-wrap gap-2">
              {[
                3,
                5,
                7,
                15,
                30,
              ].map(
                (days) => (
                  <button
                    key={
                      days
                    }
                    type="button"
                    onClick={() =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          trialDays:
                            String(
                              days
                            ),
                        })
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      form.trialDays ===
                      String(
                        days
                      )
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {days} Days
                  </button>
                )
              )}
            </div>
          </Field>

          {/* ============================
              REMARKS
          ============================ */}

          <Field label="Remarks">
            <textarea
              rows={4}
              value={
                form.remarks
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    remarks:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="Demo notes..."
              className={
                inputClass
              }
            />
          </Field>
        </div>

        {/* ============================
            FOOTER
        ============================ */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                queryLeadId
                  ? `/leads/${queryLeadId}`
                  : "/trials"
              )
            }
            disabled={
              submitting
            }
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              products.length ===
                0
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Starting...
              </>
            ) : (
              <>
                <PlayCircle
                  size={17}
                />

                Start Demo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================
   FIELD
============================ */

function Field({
  label,
  required,
  children,
}: {
  label: string;

  required?: boolean;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ============================
   INFO BOX
============================ */

function InfoBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {children}
    </div>
  );
}

/* ============================
   INPUT CLASS
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";