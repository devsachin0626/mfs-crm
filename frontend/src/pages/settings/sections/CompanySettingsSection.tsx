import {
  Building2,
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
   COMPANY KEYS
============================ */

const COMPANY_KEYS: SettingKey[] = [
  "COMPANY_NAME",
  "COMPANY_PHONE",
  "COMPANY_EMAIL",
  "COMPANY_ADDRESS",
];

/* ============================
   PAGE
============================ */

export default function CompanySettingsSection() {
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
     COMPANY SETTINGS
  ============================ */

  const companySettings =
    useMemo(
      () =>
        list.filter(
          (item) =>
            COMPANY_KEYS.includes(
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
      companySettings.find(
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
            COMPANY_KEYS.map(
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
          "Reset company settings to default values?"
        );

      if (!confirmed) {
        return;
      }

      await dispatch(
        resetSettingsGroup(
          "COMPANY"
        )
      );
    };

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <SettingsSectionHeader
        title="Company Settings"
        description="Manage company identity and primary contact information used across the CRM."
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

      {/* ============================
          COMPANY PROFILE CARD
      ============================ */}

      <SettingsCard
        title="Company Profile"
        description="These details can be used in reports, headers and other company-level screens."
      >
        {/* COMPANY NAME */}

        <SettingRow
          title="Company Name"
          description="Main company name displayed inside CRM."
        >
          <input
            type="text"
            value={
              getValue(
                "COMPANY_NAME"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "COMPANY_NAME",
                event.target
                  .value
              )
            }
            placeholder="Company name"
            className={
              inputClass
            }
          />
        </SettingRow>

        {/* PHONE */}

        <SettingRow
          title="Company Phone"
          description="Primary contact number for the company."
        >
          <input
            type="text"
            value={
              getValue(
                "COMPANY_PHONE"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "COMPANY_PHONE",
                event.target
                  .value
              )
            }
            placeholder="+91 98765 43210"
            className={
              inputClass
            }
          />
        </SettingRow>

        {/* EMAIL */}

        <SettingRow
          title="Company Email"
          description="Primary email address used for company communication."
        >
          <input
            type="email"
            value={
              getValue(
                "COMPANY_EMAIL"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "COMPANY_EMAIL",
                event.target
                  .value
              )
            }
            placeholder="support@company.com"
            className={
              inputClass
            }
          />
        </SettingRow>

        {/* ADDRESS */}

        <SettingRow
          title="Company Address"
          description="Office or registered business address."
        >
          <textarea
            value={
              getValue(
                "COMPANY_ADDRESS"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "COMPANY_ADDRESS",
                event.target
                  .value
              )
            }
            placeholder="Enter company address"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </SettingRow>
      </SettingsCard>

      {/* ============================
          BRAND PREVIEW
      ============================ */}

      <SettingsCard
        title="Preview"
        description="Quick preview of how company identity may appear across the CRM."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Building2
                size={24}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900">
                {getValue(
                  "COMPANY_NAME"
                ) ||
                  "Company Name"}
              </h3>

              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p>
                  {getValue(
                    "COMPANY_PHONE"
                  ) ||
                    "Phone not configured"}
                </p>

                <p>
                  {getValue(
                    "COMPANY_EMAIL"
                  ) ||
                    "Email not configured"}
                </p>

                <p className="max-w-2xl">
                  {getValue(
                    "COMPANY_ADDRESS"
                  ) ||
                    "Address not configured"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ============================
   INPUT CLASS
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";