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

const TRIAL_KEYS:
  SettingKey[] = [
    "DEFAULT_TRIAL_DAYS",
    "MAX_TRIAL_EXTENSION_DAYS",
    "MAX_TRIAL_EXTENSIONS",
  ];

/* ============================
   PAGE
============================ */

export default function TrialSettingsSection() {
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

  const trialSettings =
    useMemo(
      () =>
        list.filter(
          (item) =>
            TRIAL_KEYS.includes(
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
      trialSettings.find(
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
            TRIAL_KEYS.map(
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
          "Reset Trial / Demo settings to default values?"
        );

      if (!confirmed) {
        return;
      }

      await dispatch(
        resetSettingsGroup(
          "TRIAL"
        )
      );
    };

  /* ============================
     VALUES
  ============================ */

  const defaultTrialDays =
    Number(
      getValue(
        "DEFAULT_TRIAL_DAYS"
      )
    ) || 0;

  const maxExtensionDays =
    Number(
      getValue(
        "MAX_TRIAL_EXTENSION_DAYS"
      )
    ) || 0;

  const maxExtensions =
    Number(
      getValue(
        "MAX_TRIAL_EXTENSIONS"
      )
    ) || 0;

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <SettingsSectionHeader
        title="Trial / Demo Settings"
        description="Configure default demo duration and extension rules used across Trial management."
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

      {/* RULES */}

      <SettingsCard
        title="Demo Duration Rules"
        description="These defaults are used while creating and extending Trial / Demo records."
      >
        <SettingRow
          title="Default Trial Days"
          description="Default duration suggested when creating a new Trial / Demo."
        >
          <div>
            <input
              type="number"
              min="1"
              max="365"
              value={
                getValue(
                  "DEFAULT_TRIAL_DAYS"
                )
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "DEFAULT_TRIAL_DAYS",
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            />

            <p className="mt-2 text-xs text-slate-400">
              Example: 3 means a new
              demo will default to
              three days.
            </p>
          </div>
        </SettingRow>

        <SettingRow
          title="Maximum Extension Days"
          description="Maximum number of days Admin or authorised users can add in one extension."
        >
          <div>
            <input
              type="number"
              min="0"
              max="365"
              value={
                getValue(
                  "MAX_TRIAL_EXTENSION_DAYS"
                )
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "MAX_TRIAL_EXTENSION_DAYS",
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            />

            <p className="mt-2 text-xs text-slate-400">
              Set 0 if extension
              should effectively be
              disabled by days.
            </p>
          </div>
        </SettingRow>

        <SettingRow
          title="Maximum Trial Extensions"
          description="Maximum number of times a single Trial / Demo can be extended."
        >
          <div>
            <input
              type="number"
              min="0"
              max="50"
              value={
                getValue(
                  "MAX_TRIAL_EXTENSIONS"
                )
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "MAX_TRIAL_EXTENSIONS",
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            />

            <p className="mt-2 text-xs text-slate-400">
              Example: 2 allows a
              Trial to be extended
              maximum two times.
            </p>
          </div>
        </SettingRow>
      </SettingsCard>

      {/* PREVIEW */}

      <SettingsCard
        title="Rule Preview"
        description="Quick summary of current Trial / Demo configuration."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <PreviewCard
            label="Default Demo"
            value={`${defaultTrialDays} days`}
          />

          <PreviewCard
            label="Per Extension"
            value={`${maxExtensionDays} days`}
          />

          <PreviewCard
            label="Max Extensions"
            value={String(
              maxExtensions
            )}
          />
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">
            Maximum possible demo period
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-900">
            {defaultTrialDays +
              maxExtensionDays *
                maxExtensions}{" "}
            days
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Based on default duration
            plus all permitted
            extensions.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ============================
   PREVIEW CARD
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

      <p className="mt-2 text-xl font-bold text-slate-900">
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