import {
  CalendarDays,
  Check,
  CirclePlus,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../hooks/redux";

import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
} from "../../../services/holiday.service";

import type {
  Holiday,
} from "../../../services/holiday.service";

import {
  resetSettingsGroup,
  saveBulkSettings,
  setLocalSettingValue,
} from "../../../store/slices/settingsSlice";

import type {
  SettingKey,
} from "../../../types/settings.types";

import {
  SettingRow,
  SettingsCard,
  SettingsSectionHeader,
} from "../SettingsLayout";

/* ============================
   SETTINGS KEYS
============================ */

const ATTENDANCE_KEYS:
  SettingKey[] = [
    "OFFICE_START_TIME",
    "OFFICE_END_TIME",
    "LATE_AFTER_TIME",
    "HALF_DAY_AFTER_TIME",
  ];

/* ============================
   HOLIDAY FORM
============================ */

type HolidayForm = {
  title: string;

  holidayDate: string;

  description: string;
};

const INITIAL_HOLIDAY_FORM:
  HolidayForm = {
    title: "",

    holidayDate: "",

    description: "",
  };

/* ============================
   PAGE
============================ */

export default function AttendanceSettingsSection() {
  const dispatch =
    useAppDispatch();

  const {
    list,
    saving,
  } =
    useAppSelector(
      (state) =>
        state.settings
    );

  /* ============================
     HOLIDAYS
  ============================ */

  const [
    holidays,
    setHolidays,
  ] =
    useState<
      Holiday[]
    >([]);

  const [
    holidaysLoading,
    setHolidaysLoading,
  ] =
    useState(true);

  const [
    holidaySaving,
    setHolidaySaving,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    holidaySearch,
    setHolidaySearch,
  ] =
    useState("");

  const [
    showHolidayModal,
    setShowHolidayModal,
  ] =
    useState(false);

  const [
    editingHoliday,
    setEditingHoliday,
  ] =
    useState<
      Holiday | null
    >(null);

  const [
    holidayForm,
    setHolidayForm,
  ] =
    useState<HolidayForm>(
      INITIAL_HOLIDAY_FORM
    );

  /* ============================
     MESSAGE
  ============================ */

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);

  /* ============================
     ATTENDANCE SETTINGS
  ============================ */

  const attendanceSettings =
    useMemo(
      () =>
        list.filter(
          (item) =>
            ATTENDANCE_KEYS.includes(
              item.key
            )
        ),
      [list]
    );

  /* ============================
     GET VALUE
  ============================ */

  const getValue = (
    key: SettingKey
  ) => {
    return (
      attendanceSettings.find(
        (item) =>
          item.key === key
      )?.value || ""
    );
  };

  /* ============================
     CHANGE
  ============================ */

  const handleChange = (
    key: SettingKey,
    value: string
  ) => {
    dispatch(
      setLocalSettingValue({
        key,
        value,
      })
    );
  };

  /* ============================
     SAVE ATTENDANCE RULES
  ============================ */

  const handleSaveRules =
    async () => {
      setError(
        null
      );

      setSuccess(
        null
      );

      const officeStart =
        getValue(
          "OFFICE_START_TIME"
        );

      const officeEnd =
        getValue(
          "OFFICE_END_TIME"
        );

      const lateAfter =
        getValue(
          "LATE_AFTER_TIME"
        );

      const halfDayAfter =
        getValue(
          "HALF_DAY_AFTER_TIME"
        );

      if (
        !officeStart ||
        !officeEnd ||
        !lateAfter ||
        !halfDayAfter
      ) {
        setError(
          "All attendance timing fields are required."
        );

        return;
      }

      try {
        await dispatch(
          saveBulkSettings({
            settings:
              ATTENDANCE_KEYS.map(
                (key) => ({
                  key,

                  value:
                    getValue(
                      key
                    ),
                })
              ),
          })
        ).unwrap();

        setSuccess(
          "Attendance rules saved successfully."
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      }
    };

  /* ============================
     RESET ATTENDANCE RULES
  ============================ */

  const handleResetRules =
    async () => {
      const confirmed =
        window.confirm(
          "Reset attendance settings to default values?"
        );

      if (!confirmed) {
        return;
      }

      setError(
        null
      );

      setSuccess(
        null
      );

      try {
        await dispatch(
          resetSettingsGroup(
            "ATTENDANCE"
          )
        ).unwrap();

        setSuccess(
          "Attendance settings reset successfully."
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      }
    };

  /* ============================
     LOAD HOLIDAYS
  ============================ */

  const loadHolidays =
    async () => {
      try {
        setHolidaysLoading(
          true
        );

        setError(
          null
        );

        const response =
          await getHolidays({
            page: 1,

            limit: 500,
          });

        setHolidays(
          response.holidays ||
            []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setHolidaysLoading(
          false
        );
      }
    };

  useEffect(() => {
    void loadHolidays();
  }, []);

  /* ============================
     FILTER HOLIDAYS
  ============================ */

  const filteredHolidays =
    useMemo(() => {
      const value =
        holidaySearch
          .trim()
          .toLowerCase();

      if (!value) {
        return holidays;
      }

      return holidays.filter(
        (holiday) =>
          holiday.title
            .toLowerCase()
            .includes(
              value
            ) ||
          (
            holiday.description ||
            ""
          )
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [
      holidays,
      holidaySearch,
    ]);

  /* ============================
     CREATE HOLIDAY
  ============================ */

  const openCreateHoliday =
    () => {
      setEditingHoliday(
        null
      );

      setHolidayForm({
        ...INITIAL_HOLIDAY_FORM,
      });

      setShowHolidayModal(
        true
      );
    };

  /* ============================
     EDIT HOLIDAY
  ============================ */

  const openEditHoliday =
    (
      holiday:
        Holiday
    ) => {
      setEditingHoliday(
        holiday
      );

      setHolidayForm({
        title:
          holiday.title,

        holidayDate:
          toDateInput(
            holiday.holidayDate
          ),

        description:
          holiday.description ||
          "",
      });

      setShowHolidayModal(
        true
      );
    };

  /* ============================
     SAVE HOLIDAY
  ============================ */

  const handleSaveHoliday =
    async () => {
      const title =
        holidayForm.title.trim();

      if (!title) {
        setError(
          "Holiday title is required."
        );

        return;
      }

      if (
        !holidayForm.holidayDate
      ) {
        setError(
          "Holiday date is required."
        );

        return;
      }

      try {
        setHolidaySaving(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );

        const payload = {
          title,

          holidayDate:
            holidayForm.holidayDate,

          description:
            holidayForm.description
              .trim() ||
            null,
        };

        if (
          editingHoliday
        ) {
          await updateHoliday(
            editingHoliday.id,
            payload
          );

          setSuccess(
            "Holiday updated successfully."
          );
        } else {
          await createHoliday(
            payload
          );

          setSuccess(
            "Holiday added successfully."
          );
        }

        setShowHolidayModal(
          false
        );

        setEditingHoliday(
          null
        );

        await loadHolidays();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setHolidaySaving(
          false
        );
      }
    };

  /* ============================
     DELETE HOLIDAY
  ============================ */

  const handleDeleteHoliday =
    async (
      holiday:
        Holiday
    ) => {
      const confirmed =
        window.confirm(
          `Delete holiday "${holiday.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          holiday.id
        );

        setError(
          null
        );

        setSuccess(
          null
        );

        await deleteHoliday(
          holiday.id
        );

        setSuccess(
          "Holiday deleted successfully."
        );

        await loadHolidays();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <SettingsSectionHeader
        title="Attendance Settings"
        description="Manage office timings, late and half-day rules, and company holiday calendar."
      />

      {/* ============================
          MESSAGES
      ============================ */}

      {error && (
        <Message
          type="ERROR"
          message={
            error
          }
          onClose={() =>
            setError(
              null
            )
          }
        />
      )}

      {success && (
        <Message
          type="SUCCESS"
          message={
            success
          }
          onClose={() =>
            setSuccess(
              null
            )
          }
        />
      )}

      {/* ============================
          OFFICE RULES
      ============================ */}

      <SettingsCard
        title="Office Timing Rules"
        description="Configure default attendance timings used by the CRM."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                handleResetRules
              }
              disabled={
                saving
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw
                size={15}
              />

              Reset
            </button>

            <button
              type="button"
              onClick={
                handleSaveRules
              }
              disabled={
                saving
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={15}
                />
              )}

              Save Rules
            </button>
          </div>
        }
      >
        <SettingRow
          title="Office Start Time"
          description="Normal office reporting time."
        >
          <input
            type="time"
            value={
              getValue(
                "OFFICE_START_TIME"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "OFFICE_START_TIME",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          />
        </SettingRow>

        <SettingRow
          title="Office End Time"
          description="Normal office closing time."
        >
          <input
            type="time"
            value={
              getValue(
                "OFFICE_END_TIME"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "OFFICE_END_TIME",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          />
        </SettingRow>

        <SettingRow
          title="Late After"
          description="Employee may be marked late after this time."
        >
          <input
            type="time"
            value={
              getValue(
                "LATE_AFTER_TIME"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "LATE_AFTER_TIME",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          />
        </SettingRow>

        <SettingRow
          title="Half Day After"
          description="Employee may be treated as half-day when reporting after this time."
        >
          <input
            type="time"
            value={
              getValue(
                "HALF_DAY_AFTER_TIME"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "HALF_DAY_AFTER_TIME",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          />
        </SettingRow>
      </SettingsCard>

      {/* ============================
          HOLIDAY CALENDAR
      ============================ */}

      <SettingsCard>
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={18}
                className="text-blue-700"
              />

              <p className="font-semibold text-slate-900">
                Holiday Calendar
              </p>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {
                holidays.length
              }{" "}
              holidays configured
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  holidaySearch
                }
                onChange={(
                  event
                ) =>
                  setHolidaySearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search holidays..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <button
              type="button"
              onClick={
                openCreateHoliday
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <CirclePlus
                size={16}
              />

              Add Holiday
            </button>
          </div>
        </div>

        {holidaysLoading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Loader2
              size={26}
              className="animate-spin text-blue-700"
            />
          </div>
        ) : filteredHolidays.length ===
          0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <CalendarDays
              size={34}
              className="text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-700">
              No holidays found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add company holidays to
              the attendance calendar.
            </p>

            <button
              type="button"
              onClick={
                openCreateHoliday
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <CirclePlus
                size={16}
              />

              Add Holiday
            </button>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <TableHead>
                    Holiday
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Description
                  </TableHead>

                  <TableHead align="right">
                    Actions
                  </TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredHolidays.map(
                  (
                    holiday
                  ) => (
                    <tr
                      key={
                        holiday.id
                      }
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {
                            holiday.title
                          }
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDate(
                          holiday.holidayDate
                        )}
                      </td>

                      <td className="max-w-lg px-4 py-4 text-sm text-slate-500">
                        {holiday.description ||
                          "-"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditHoliday(
                                holiday
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              holiday.id
                            }
                            onClick={() =>
                              handleDeleteHoliday(
                                holiday
                              )
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            {deletingId ===
                            holiday.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={15}
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>

      {/* ============================
          HOLIDAY MODAL
      ============================ */}

      {showHolidayModal && (
        <Modal
          title={
            editingHoliday
              ? "Edit Holiday"
              : "Add Holiday"
          }
          description="Manage company holiday calendar used by attendance workflows."
          onClose={() => {
            if (
              holidaySaving
            ) {
              return;
            }

            setShowHolidayModal(
              false
            );

            setEditingHoliday(
              null
            );
          }}
        >
          <div className="space-y-4">
            <Field label="Holiday Name">
              <input
                type="text"
                value={
                  holidayForm.title
                }
                onChange={(
                  event
                ) =>
                  setHolidayForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      title:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="e.g. Diwali"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Holiday Date">
              <input
                type="date"
                value={
                  holidayForm.holidayDate
                }
                onChange={(
                  event
                ) =>
                  setHolidayForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      holidayDate:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={4}
                value={
                  holidayForm.description
                }
                onChange={(
                  event
                ) =>
                  setHolidayForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      description:
                        event
                          .target
                          .value,
                    })
                  )
                }
                placeholder="Optional description"
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowHolidayModal(
                    false
                  );

                  setEditingHoliday(
                    null
                  );
                }}
                disabled={
                  holidaySaving
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveHoliday
                }
                disabled={
                  holidaySaving
                }
                className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {holidaySaving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {editingHoliday
                  ? "Update Holiday"
                  : "Add Holiday"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================
   MESSAGE
============================ */

function Message({
  type,
  message,
  onClose,
}: {
  type:
    | "SUCCESS"
    | "ERROR";

  message: string;

  onClose:
    () => void;
}) {
  const success =
    type === "SUCCESS";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <div className="flex items-center gap-2">
        {success && (
          <Check
            size={16}
          />
        )}

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        <X
          size={16}
        />
      </button>
    </div>
  );
}

/* ============================
   MODAL
============================ */

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;

  description?: string;

  onClose:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {
                  description
                }
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
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
      <label className="mb-2 block text-sm font-semibold text-slate-700">
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
  align = "left",
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* ============================
   DATE HELPERS
============================ */

function toDateInput(
  value?:
    | string
    | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
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

/* ============================
   ERROR
============================ */

function getErrorMessage(
  error: unknown
) {
  if (
    typeof error ===
      "object" &&
    error !== null
  ) {
    const apiError =
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };

        message?: string;
      };

    return (
      apiError.response
        ?.data?.message ||
      apiError.message ||
      "Something went wrong"
    );
  }

  if (
    typeof error ===
    "string"
  ) {
    return error;
  }

  return "Something went wrong";
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";