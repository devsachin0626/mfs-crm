/* ============================
   SETTINGS TYPES
   ADMIN CONTROL PANEL
============================ */

/* ============================
   SETTING KEYS
============================ */

export type SettingKey =
  | "CRM_DISPLAY_NAME"
  | "COMPANY_NAME"
  | "COMPANY_PHONE"
  | "COMPANY_EMAIL"
  | "COMPANY_ADDRESS"
  | "DAILY_CALL_TARGET"
  | "DEFAULT_FOLLOWUP_DAYS"
  | "DEFAULT_TRIAL_DAYS"
  | "MAX_TRIAL_EXTENSION_DAYS"
  | "MAX_TRIAL_EXTENSIONS"
  | "OFFICE_START_TIME"
  | "OFFICE_END_TIME"
  | "LATE_AFTER_TIME"
  | "HALF_DAY_AFTER_TIME"
  | "TIMEZONE"
  | "DATE_FORMAT"
  | "DEFAULT_PAGE_SIZE";

/* ============================
   SETTING GROUP
============================ */

export type SettingGroup =
  | "COMPANY"
  | "CALLING"
  | "FOLLOW_UP"
  | "TRIAL"
  | "ATTENDANCE"
  | "GENERAL";

/* ============================
   SETTING DATA TYPE
============================ */

export type SettingValueType =
  | "STRING"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "TIME"
  | "SELECT"
  | "TEXTAREA";

/* ============================
   SETTING DEFINITION
============================ */

export interface SettingDefinition {
  key: SettingKey;

  label: string;

  description?: string;

  group: SettingGroup;

  valueType: SettingValueType;

  defaultValue: string;

  required?: boolean;

  min?: number;

  max?: number;

  options?: {
    label: string;

    value: string;
  }[];
}

/* ============================
   SETTING RECORD
============================ */

export interface SettingRecord {
  id: string;

  key: string;

  value: string;

  description?: string | null;

  createdAt: Date;

  updatedAt: Date;
}

/* ============================
   UPDATE SINGLE SETTING
============================ */

export interface UpdateSettingRequest {
  value: string;
}

/* ============================
   BULK SETTING ITEM
============================ */

export interface BulkSettingItem {
  key: SettingKey;

  value: string;
}

/* ============================
   BULK UPDATE REQUEST
============================ */

export interface BulkUpdateSettingsRequest {
  settings: BulkSettingItem[];
}

/* ============================
   SETTINGS RESPONSE
============================ */

export interface SettingsResponse {
  success: boolean;

  settings: {
    [key: string]: string;
  };
}

/* ============================
   SETTINGS LIST ITEM
============================ */

export interface SettingsListItem {
  key: SettingKey;

  label: string;

  description?: string;

  group: SettingGroup;

  valueType: SettingValueType;

  value: string;

  defaultValue: string;

  required?: boolean;

  options?: {
    label: string;

    value: string;
  }[];
}

/* ============================
   COMPANY SETTINGS
============================ */

export interface CompanySettings {
  crmDisplayName: string;

  companyName: string;

  companyPhone: string;

  companyEmail: string;

  companyAddress: string;
}

/* ============================
   CALLING SETTINGS
============================ */

export interface CallingSettings {
  dailyCallTarget: number;
}

/* ============================
   FOLLOW-UP SETTINGS
============================ */

export interface FollowUpSettings {
  defaultFollowUpDays: number;
}

/* ============================
   TRIAL SETTINGS
============================ */

export interface TrialSettings {
  defaultTrialDays: number;

  maxTrialExtensionDays: number;

  maxTrialExtensions: number;
}

/* ============================
   ATTENDANCE SETTINGS
============================ */

export interface AttendanceSettings {
  officeStartTime: string;

  officeEndTime: string;

  lateAfterTime: string;

  halfDayAfterTime: string;
}

/* ============================
   GENERAL SETTINGS
============================ */

export interface GeneralSettings {
  timezone: string;

  dateFormat: string;

  defaultPageSize: number;
}

/* ============================
   CONTROL PANEL SETTINGS
============================ */

export interface ControlPanelSettings {
  company: CompanySettings;

  calling: CallingSettings;

  followUp: FollowUpSettings;

  trial: TrialSettings;

  attendance: AttendanceSettings;

  general: GeneralSettings;
}

/* ============================
   VALIDATION RESULT
============================ */

export interface SettingValidationResult {
  valid: boolean;

  message?: string;
}
