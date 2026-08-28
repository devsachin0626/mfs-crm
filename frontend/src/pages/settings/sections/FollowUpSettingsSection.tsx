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

const FOLLOW_UP_KEYS:
  SettingKey[] = [
    "DEFAULT_FOLLOWUP_DAYS",
  ];

/* ============================
   PAGE
============================ */

export default function FollowUpSettingsSection() {
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

  const followUpSettings =
    useMemo(
      () =>
        list.filter(
          (item) =>
            FOLLOW_UP_KEYS.includes(
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
      followUpSettings.find(
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
            FOLLOW_UP_KEYS.map(
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
          "Reset follow-up settings to default values?"
        );

      if (!confirmed) {
        return;
      }

      await dispatch(
        resetSettingsGroup(
          "FOLLOW_UP"
        )
      );
    };

  return (
    <div className="space-y-5">
      <SettingsSectionHeader
        title="Follow-up Settings"
        description="Configure default follow-up behavior used while managing leads and callbacks."
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
        title="Follow-up Defaults"
        description="These values are used when CRM needs to suggest the next follow-up."
      >
        <SettingRow
          title="Default Follow-up Days"
          description="Number of days after the current interaction when the next follow-up should be suggested."
        >
          <div>
            <input
              type="number"
              min="0"
              max="365"
              value={
                getValue(
                  "DEFAULT_FOLLOWUP_DAYS"
                )
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "DEFAULT_FOLLOWUP_DAYS",
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            />

            <p className="mt-2 text-xs text-slate-400">
              Example: 1 means tomorrow,
              2 means after two days.
            </p>
          </div>
        </SettingRow>
      </SettingsCard>
    </div>
  );
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";