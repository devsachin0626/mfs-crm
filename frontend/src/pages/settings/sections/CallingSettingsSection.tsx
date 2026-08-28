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

const CALLING_KEYS:
  SettingKey[] = [
    "DAILY_CALL_TARGET",
  ];

/* ============================
   PAGE
============================ */

export default function CallingSettingsSection() {
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
     SETTINGS
  ============================ */

  const callingSettings =
    useMemo(
      () =>
        list.filter(
          (item) =>
            CALLING_KEYS.includes(
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
      callingSettings.find(
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
            CALLING_KEYS.map(
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
          "Reset calling settings to default values?"
        );

      if (!confirmed) {
        return;
      }

      await dispatch(
        resetSettingsGroup(
          "CALLING"
        )
      );
    };

  return (
    <div className="space-y-5">
      <SettingsSectionHeader
        title="Calling Settings"
        description="Configure calling targets and defaults used by the CRM calling workspace."
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
        title="Calling Rules"
        description="These settings control employee calling targets and calling workspace defaults."
      >
        <SettingRow
          title="Daily Call Target"
          description="Default number of calls expected from each employee per working day."
        >
          <input
            type="number"
            min="0"
            max="5000"
            value={
              getValue(
                "DAILY_CALL_TARGET"
              )
            }
            onChange={(
              event
            ) =>
              handleChange(
                "DAILY_CALL_TARGET",
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

      <SettingsCard
        title="How this affects CRM"
        description="Calling workspace should read this setting instead of using a hard-coded target."
      >
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">
            Current Daily Target
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-900">
            {getValue(
              "DAILY_CALL_TARGET"
            ) || "0"}
          </p>

          <p className="mt-1 text-xs text-blue-700">
            calls per employee per day
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";