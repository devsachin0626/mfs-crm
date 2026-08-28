import api from "./api";

import type {
  BulkUpdateSettingsPayload,
  ControlPanelResponse,
  SettingGroup,
  SettingKey,
  SettingsListResponse,
  UpdateSettingPayload,
} from "../types/settings.types";

/* ============================
   BASE URL
============================ */

const SETTINGS_URL = "/settings";

/* ============================
   GET SETTINGS LIST
============================ */

export const getSettingsList = async () => {
  const response =
    await api.get<SettingsListResponse>(
      `${SETTINGS_URL}/list`
    );

  return response.data;
};

/* ============================
   GET CONTROL PANEL SETTINGS
============================ */

export const getControlPanelSettings =
  async () => {
    const response =
      await api.get<ControlPanelResponse>(
        `${SETTINGS_URL}/control-panel`
      );

    return response.data;
  };

/* ============================
   GET SETTINGS BY GROUP
============================ */

export const getSettingsByGroup =
  async (group: SettingGroup) => {
    const response = await api.get(
      `${SETTINGS_URL}/group/${group}`
    );

    return response.data;
  };

/* ============================
   GET SINGLE SETTING
============================ */

export const getSettingByKey =
  async (key: SettingKey) => {
    const response = await api.get(
      `${SETTINGS_URL}/${key}`
    );

    return response.data;
  };

/* ============================
   UPDATE SINGLE SETTING
============================ */

export const updateSetting =
  async (
    key: SettingKey,
    data: UpdateSettingPayload
  ) => {
    const response = await api.put(
      `${SETTINGS_URL}/${key}`,
      data
    );

    return response.data;
  };

/* ============================
   BULK UPDATE SETTINGS
============================ */

export const bulkUpdateSettings =
  async (
    data: BulkUpdateSettingsPayload
  ) => {
    const response = await api.put(
      `${SETTINGS_URL}/bulk`,
      data
    );

    return response.data;
  };

/* ============================
   RESET SINGLE SETTING
============================ */

export const resetSetting =
  async (key: SettingKey) => {
    const response = await api.put(
      `${SETTINGS_URL}/${key}/reset`
    );

    return response.data;
  };

/* ============================
   RESET GROUP
============================ */

export const resetSettingGroup =
  async (group: SettingGroup) => {
    const response = await api.put(
      `${SETTINGS_URL}/group/${group}/reset`
    );

    return response.data;
  };

/* ============================
   SETTINGS SERVICE
============================ */

const settingsService = {
  getSettingsList,

  getControlPanelSettings,

  getSettingsByGroup,

  getSettingByKey,

  updateSetting,

  bulkUpdateSettings,

  resetSetting,

  resetSettingGroup,
};

export default settingsService;