import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import type {
  PayloadAction,
} from "@reduxjs/toolkit";

import settingsService from "../../services/settings.service";

import type {
  BulkUpdateSettingsPayload,
  ControlPanelSettings,
  SettingGroup,
  SettingKey,
  SettingListItem,
  SettingsState,
} from "../../types/settings.types";

/* ============================
   INITIAL STATE
============================ */

const initialState: SettingsState = {
  list: [],

  controlPanel: null,

  loading: false,

  saving: false,

  error: null,
};

/* ============================
   ERROR HELPER
============================ */

const getErrorMessage = (
  error: unknown
): string => {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };

      message?: string;
    };

    return (
      apiError.response?.data
        ?.message ||
      apiError.message ||
      "Something went wrong"
    );
  }

  return "Something went wrong";
};

/* ============================
   FETCH SETTINGS LIST
============================ */

export const fetchSettingsList =
  createAsyncThunk<
    SettingListItem[],
    void,
    {
      rejectValue: string;
    }
  >(
    "settings/fetchSettingsList",

    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await settingsService.getSettingsList();

        return (
          response.settings || []
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* ============================
   FETCH CONTROL PANEL
============================ */

export const fetchControlPanelSettings =
  createAsyncThunk<
    ControlPanelSettings,
    void,
    {
      rejectValue: string;
    }
  >(
    "settings/fetchControlPanelSettings",

    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await settingsService.getControlPanelSettings();

        return response.settings;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* ============================
   UPDATE SINGLE SETTING
============================ */

export const saveSetting =
  createAsyncThunk<
    {
      key: SettingKey;
      value: string;
    },
    {
      key: SettingKey;
      value: string;
    },
    {
      rejectValue: string;
    }
  >(
    "settings/saveSetting",

    async (
      payload,
      { rejectWithValue }
    ) => {
      try {
        await settingsService.updateSetting(
          payload.key,
          {
            value:
              payload.value,
          }
        );

        return payload;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* ============================
   BULK SAVE SETTINGS
============================ */

export const saveBulkSettings =
  createAsyncThunk<
    BulkUpdateSettingsPayload,
    BulkUpdateSettingsPayload,
    {
      rejectValue: string;
    }
  >(
    "settings/saveBulkSettings",

    async (
      payload,
      { rejectWithValue }
    ) => {
      try {
        await settingsService.bulkUpdateSettings(
          payload
        );

        return payload;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* ============================
   RESET SINGLE SETTING
============================ */

export const resetSingleSetting =
  createAsyncThunk<
    SettingKey,
    SettingKey,
    {
      rejectValue: string;
    }
  >(
    "settings/resetSingleSetting",

    async (
      key,
      {
        rejectWithValue,
        dispatch,
      }
    ) => {
      try {
        await settingsService.resetSetting(
          key
        );

        await dispatch(
          fetchSettingsList()
        );

        await dispatch(
          fetchControlPanelSettings()
        );

        return key;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* ============================
   RESET GROUP
============================ */

export const resetSettingsGroup =
  createAsyncThunk<
    SettingGroup,
    SettingGroup,
    {
      rejectValue: string;
    }
  >(
    "settings/resetSettingsGroup",

    async (
      group,
      {
        rejectWithValue,
        dispatch,
      }
    ) => {
      try {
        await settingsService.resetSettingGroup(
          group
        );

        await dispatch(
          fetchSettingsList()
        );

        await dispatch(
          fetchControlPanelSettings()
        );

        return group;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(error)
        );
      }
    }
  );

/* ============================
   SETTINGS SLICE
============================ */

const settingsSlice =
  createSlice({
    name: "settings",

    initialState,

    reducers: {
      /* ============================
         CLEAR ERROR
      ============================ */

      clearSettingsError:
        (state) => {
          state.error = null;
        },

      /* ============================
         LOCAL VALUE UPDATE

         Used while editing forms.
         Does not save to database.
      ============================ */

      setLocalSettingValue:
        (
          state,
          action: PayloadAction<{
            key: SettingKey;
            value: string;
          }>
        ) => {
          const setting =
            state.list.find(
              (item) =>
                item.key ===
                action.payload.key
            );

          if (setting) {
            setting.value =
              action.payload.value;
          }
        },

      /* ============================
         CLEAR SETTINGS
      ============================ */

      clearSettings:
        (state) => {
          state.list = [];

          state.controlPanel =
            null;

          state.loading =
            false;

          state.saving =
            false;

          state.error =
            null;
        },
    },

    extraReducers:
      (builder) => {
        /* ============================
           FETCH SETTINGS LIST
        ============================ */

        builder
          .addCase(
            fetchSettingsList.pending,
            (state) => {
              state.loading =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            fetchSettingsList.fulfilled,
            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.list =
                action.payload;
            }
          )

          .addCase(
            fetchSettingsList.rejected,
            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.error =
                action.payload ||
                "Failed to load settings";
            }
          );

        /* ============================
           FETCH CONTROL PANEL
        ============================ */

        builder
          .addCase(
            fetchControlPanelSettings.pending,
            (state) => {
              state.loading =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            fetchControlPanelSettings.fulfilled,
            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.controlPanel =
                action.payload;
            }
          )

          .addCase(
            fetchControlPanelSettings.rejected,
            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.error =
                action.payload ||
                "Failed to load control panel settings";
            }
          );

        /* ============================
           SAVE SINGLE SETTING
        ============================ */

        builder
          .addCase(
            saveSetting.pending,
            (state) => {
              state.saving =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            saveSetting.fulfilled,
            (
              state,
              action
            ) => {
              state.saving =
                false;

              const setting =
                state.list.find(
                  (item) =>
                    item.key ===
                    action.payload
                      .key
                );

              if (setting) {
                setting.value =
                  action.payload
                    .value;
              }
            }
          )

          .addCase(
            saveSetting.rejected,
            (
              state,
              action
            ) => {
              state.saving =
                false;

              state.error =
                action.payload ||
                "Failed to save setting";
            }
          );

        /* ============================
           BULK SAVE
        ============================ */

        builder
          .addCase(
            saveBulkSettings.pending,
            (state) => {
              state.saving =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            saveBulkSettings.fulfilled,
            (
              state,
              action
            ) => {
              state.saving =
                false;

              for (
                const updated of action
                  .payload.settings
              ) {
                const setting =
                  state.list.find(
                    (item) =>
                      item.key ===
                      updated.key
                  );

                if (setting) {
                  setting.value =
                    updated.value;
                }
              }
            }
          )

          .addCase(
            saveBulkSettings.rejected,
            (
              state,
              action
            ) => {
              state.saving =
                false;

              state.error =
                action.payload ||
                "Failed to save settings";
            }
          );

        /* ============================
           RESET SINGLE
        ============================ */

        builder
          .addCase(
            resetSingleSetting.pending,
            (state) => {
              state.saving =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            resetSingleSetting.fulfilled,
            (state) => {
              state.saving =
                false;
            }
          )

          .addCase(
            resetSingleSetting.rejected,
            (
              state,
              action
            ) => {
              state.saving =
                false;

              state.error =
                action.payload ||
                "Failed to reset setting";
            }
          );

        /* ============================
           RESET GROUP
        ============================ */

        builder
          .addCase(
            resetSettingsGroup.pending,
            (state) => {
              state.saving =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            resetSettingsGroup.fulfilled,
            (state) => {
              state.saving =
                false;
            }
          )

          .addCase(
            resetSettingsGroup.rejected,
            (
              state,
              action
            ) => {
              state.saving =
                false;

              state.error =
                action.payload ||
                "Failed to reset settings";
            }
          );
      },
  });

/* ============================
   ACTIONS
============================ */

export const {
  clearSettingsError,
  setLocalSettingValue,
  clearSettings,
} = settingsSlice.actions;

/* ============================
   REDUCER
============================ */

export default settingsSlice.reducer;