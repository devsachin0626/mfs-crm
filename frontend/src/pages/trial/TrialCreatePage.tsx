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
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getClientOptions,
} from "../../services/client.service";

import {
  getTrialProductOptions,
} from "../../services/product.service";

import {
  getEmployees,
} from "../../services/employee.service";

import {
  startTrial,
} from "../../services/trial.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  ClientOption,
} from "../../services/client.service";

import type {
  ProductOption,
} from "../../services/product.service";

import type {
  Employee,
} from "../../types/employee.types";

/* ============================
   FORM TYPE
============================ */

type TrialForm = {
  clientId: string;

  productId: string;

  employeeId: string;

  trialDays: string;

  remarks: string;
};

/* ============================
   PAGE
============================ */

export default function TrialCreatePage() {
  const navigate =
    useNavigate();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  /* ============================
     OPTIONS
  ============================ */

  const [
    clients,
    setClients,
  ] =
    useState<
      ClientOption[]
    >([]);

  const [
    products,
    setProducts,
  ] =
    useState<
      ProductOption[]
    >([]);

  const [
    employees,
    setEmployees,
  ] =
    useState<
      Employee[]
    >([]);

  /* ============================
     UI STATE
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

  /* ============================
     FORM
  ============================ */

  const [
    form,
    setForm,
  ] =
    useState<TrialForm>({
      clientId: "",

      productId: "",

      employeeId: "",

      trialDays: "7",

      remarks: "",
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
    roleName === "HR" ||
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

          const [
            clientOptions,
            productOptions,
          ] =
            await Promise.all([
              getClientOptions(),

              getTrialProductOptions(),
            ]);

          setClients(
            clientOptions
          );

          setProducts(
            productOptions
          );

          /*
           * Employee dropdown
           * only management roles
           * need.
           */

          if (canAssign) {
            const employeeResponse =
              await getEmployees({
                page: 1,
                limit: 100,
              });

            setEmployees(
              (
                employeeResponse.employees ||
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
        } catch (error: any) {
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

    loadOptions();
  }, [canAssign]);

  /* ============================
     SELECTED DATA
  ============================ */

  const selectedClient =
    useMemo(
      () =>
        clients.find(
          (item) =>
            item.id ===
            form.clientId
        ),
      [
        clients,
        form.clientId,
      ]
    );

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (item) =>
            item.id ===
            form.productId
        ),
      [
        products,
        form.productId,
      ]
    );

  /* ============================
     VALIDATION
  ============================ */

  const validate =
    () => {
      if (!form.clientId) {
        return "Please select client";
      }

      if (!form.productId) {
        return "Please select product";
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
            clientId:
              form.clientId,

            productId:
              form.productId,

            /*
             * EMPLOYEE:
             * employeeId intentionally
             * not sent.
             *
             * Backend will auto assign
             * logged-in employee.
             */

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
            "Trial started successfully"
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
            500
          );
        } else {
          setTimeout(
            () => {
              navigate(
                "/trials"
              );
            },
            500
          );
        }
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            "Failed to start trial"
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

  if (loadingOptions) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-blue-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading trial
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
            Start New Demo
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Start a product
            trial for a client.
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
          ERROR / SUCCESS
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
                Select client,
                product and
                duration.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* ============================
              CLIENT
          ============================ */}

          <Field
            label="Client"
            required
          >
            <select
              value={
                form.clientId
              }
              onChange={(
                event
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,

                    clientId:
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
                Select Client
              </option>

              {clients.map(
                (client) => (
                  <option
                    key={
                      client.id
                    }
                    value={
                      client.id
                    }
                  >
                    {client.name}
                    {" - "}
                    {
                      client.mobile
                    }
                  </option>
                )
              )}
            </select>

            {selectedClient && (
              <InfoBox>
                <p className="font-medium text-slate-700">
                  {
                    selectedClient.name
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {
                    selectedClient.clientCode
                  }
                  {" · "}
                  {
                    selectedClient.mobile
                  }
                </p>

                {selectedClient.email && (
                  <p className="mt-1 text-xs text-slate-500">
                    {
                      selectedClient.email
                    }
                  </p>
                )}
              </InfoBox>
            )}
          </Field>

          {/* ============================
              PRODUCT
          ============================ */}

          <Field
            label="Trial Product"
            required
          >
            <select
              value={
                form.productId
              }
              onChange={(
                event
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,

                    productId:
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
                Select Trial
                Product
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
                      product.productCode
                    }
                  </option>
                )
              )}
            </select>

            {products.length ===
              0 && (
              <p className="mt-2 text-xs text-amber-600">
                No active
                trial-enabled
                products found.
              </p>
            )}

            {selectedProduct && (
              <InfoBox>
                <p className="font-medium text-slate-700">
                  {
                    selectedProduct.name
                  }
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>
                    Code:{" "}
                    {
                      selectedProduct.productCode
                    }
                  </span>

                  {selectedProduct.type && (
                    <span>
                      Type:{" "}
                      {
                        selectedProduct.type
                      }
                    </span>
                  )}

                  {selectedProduct.durationDays !=
                    null && (
                    <span>
                      Standard
                      Duration:{" "}
                      {
                        selectedProduct.durationDays
                      }{" "}
                      days
                    </span>
                  )}
                </div>
              </InfoBox>
            )}
          </Field>

          {/* ============================
              EMPLOYEE ASSIGNMENT
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
                    (prev) => ({
                      ...prev,

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
                Leave blank to
                assign this trial
                to yourself.
              </p>
            </Field>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">
                Trial Assignment
              </p>

              <p className="mt-1 text-xs text-blue-600">
                This demo will
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
                  (prev) => ({
                    ...prev,

                    trialDays:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="Example: 7"
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
                          prev
                        ) => ({
                          ...prev,

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
                  (prev) => ({
                    ...prev,

                    remarks:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="Add trial/demo notes..."
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
                "/trials"
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
  required = false,
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
    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      {children}
    </div>
  );
}

/* ============================
   INPUT CLASS
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";