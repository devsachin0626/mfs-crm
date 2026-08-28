import {
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../hooks/redux";

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
   KEYS
============================ */

const GENERAL_KEYS:
  SettingKey[] = [
    "TIMEZONE",
    "DATE_FORMAT",
    "DEFAULT_PAGE_SIZE",
  ];

/* ============================
   PAGE
============================ */

export default function GeneralSettingsSection() {
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

  const generalSettings =
    useMemo(
      () =>
        list.filter(
          (item) =>
            GENERAL_KEYS.includes(
              item.key
            )
        ),
      [list]
    );

  /* ============================
     VALUE
  ============================ */

  const getValue = (
    key: SettingKey
  ) => {
    return (
      generalSettings.find(
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
     SAVE
  ============================ */

  const handleSave =
    async () => {
      await dispatch(
        saveBulkSettings({
          settings:
            GENERAL_KEYS.map(
              (key) => ({
                key,

                value:
                  getValue(
                    key
                  ),
              })
            ),
        })
      );
    };

  /* ============================
     RESET
  ============================ */

  const handleReset =
    async () => {
      const confirmed =
        window.confirm(
          "Reset general settings to default values?"
        );

      if (!confirmed) {
        return;
      }

      await dispatch(
        resetSettingsGroup(
          "GENERAL"
        )
      );
    };

  return (
    <div className="space-y-5">
      <SettingsSectionHeader
        title="General Settings"
        description="Manage default timezone, date format and table behaviour used across the CRM."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                handleReset
              }
              disabled={
                saving
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw
                size={16}
              />

              Reset
            </button>

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={16}
                />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        }
      />

      <SettingsCard
        title="Regional & Display Defaults"
        description="Default formatting preferences used across the application."
      >
        <SettingRow
          title="Timezone"
          description="Default timezone used for CRM date and time calculations."
        >
          <select
            value={
              getValue(
                "TIMEZONE"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "TIMEZONE",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          >
            <option value="Asia/Kolkata">
              India Standard Time
              (Asia/Kolkata)
            </option>

            <option value="UTC">
              UTC
            </option>
          </select>
        </SettingRow>

        <SettingRow
          title="Date Format"
          description="Default date display format used by the CRM."
        >
          <select
            value={
              getValue(
                "DATE_FORMAT"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "DATE_FORMAT",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          >
            <option value="DD/MM/YYYY">
              DD/MM/YYYY
            </option>

            <option value="MM/DD/YYYY">
              MM/DD/YYYY
            </option>

            <option value="YYYY-MM-DD">
              YYYY-MM-DD
            </option>
          </select>
        </SettingRow>

        <SettingRow
          title="Default Rows Per Page"
          description="Default number of records shown in CRM tables."
        >
          <select
            value={
              getValue(
                "DEFAULT_PAGE_SIZE"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "DEFAULT_PAGE_SIZE",
                event.target
                  .value
              )
            }
            className={
              inputClass
            }
          >
            <option value="10">
              10 rows
            </option>

            <option value="20">
              20 rows
            </option>

            <option value="50">
              50 rows
            </option>

            <option value="100">
              100 rows
            </option>
          </select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        title="Current Configuration"
        description="Quick preview of active general settings."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <PreviewCard
            label="Timezone"
            value={
              getValue(
                "TIMEZONE"
              ) ||
              "-"
            }
          />

          <PreviewCard
            label="Date Format"
            value={
              getValue(
                "DATE_FORMAT"
              ) ||
              "-"
            }
          />

          <PreviewCard
            label="Rows Per Page"
            value={
              getValue(
                "DEFAULT_PAGE_SIZE"
              ) ||
              "-"
            }
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* ============================
   PREVIEW
============================ */

function PreviewCard({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";