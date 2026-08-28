/* ============================
   SETTINGS TYPES
============================ */

export type SettingGroup =
  | "COMPANY"
  | "CALLING"
  | "FOLLOW_UP"
  | "TRIAL"
  | "ATTENDANCE"
  | "GENERAL";

export type SettingValueType =
  | "STRING"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "TIME"
  | "SELECT"
  | "TEXTAREA";

export type SettingKey =
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
   SETTING OPTION
============================ */

export interface SettingOption {
  label: string;
  value: string;
}

/* ============================
   SETTING LIST ITEM
============================ */

export interface SettingListItem {
  key: SettingKey;

  label: string;

  description?: string;

  group: SettingGroup;

  valueType: SettingValueType;

  value: string;

  defaultValue: string;

  required?: boolean;

  options?: SettingOption[];
}

/* ============================
   SETTINGS LIST RESPONSE
============================ */

export interface SettingsListResponse {
  success: boolean;

  settings: SettingListItem[];
}

/* ============================
   CONTROL PANEL
============================ */

export interface ControlPanelSettings {
  company: {
    companyName: string;
    companyPhone: string;
    companyEmail: string;
    companyAddress: string;
  };

  calling: {
    dailyCallTarget: number;
  };

  followUp: {
    defaultFollowUpDays: number;
  };

  trial: {
    defaultTrialDays: number;
    maxTrialExtensionDays: number;
    maxTrialExtensions: number;
  };

  attendance: {
    officeStartTime: string;
    officeEndTime: string;
    lateAfterTime: string;
    halfDayAfterTime: string;
  };

  general: {
    timezone: string;
    dateFormat: string;
    defaultPageSize: number;
  };
}

export interface ControlPanelResponse {
  success: boolean;

  settings: ControlPanelSettings;
}

/* ============================
   UPDATE
============================ */

export interface UpdateSettingPayload {
  value: string;
}

export interface BulkSettingItem {
  key: SettingKey;
  value: string;
}

export interface BulkUpdateSettingsPayload {
  settings: BulkSettingItem[];
}

/* ============================
   DEMO PRODUCT
============================ */

export interface DemoProduct {
  id: string;

  productCode: string;

  name: string;

  type: string;

  description?: string | null;

  isTrialAvailable: boolean;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

/* ============================
   LEAD STATUS
============================ */

export interface SettingsLeadStatus {
  id: string;

  name: string;

  color?: string | null;

  sortOrder: number;

  isActive: boolean;
}

/* ============================
   LEAD SOURCE
============================ */

export interface SettingsLeadSource {
  id: string;

  name: string;

  description?: string | null;

  isActive: boolean;
}

/* ============================
   EMPLOYEE
============================ */

export interface SettingsEmployee {
  id: string;

  employeeCode: string;

  name: string;

  mobile: string;

  email?: string | null;

  gender?: string | null;

  dateOfBirth?: string | null;

  address?: string | null;

  profileImage?: string | null;

  joiningDate?: string | null;

  salary?: string | number | null;

  status: string;

  isActive: boolean;

  branch?: {
    id: string;
    branchCode: string;
    name: string;
  } | null;

  role?: {
    id: string;
    name: string;
  } | null;

  reportingManager?: {
    id: string;
    employeeCode: string;
    name: string;
  } | null;
}

/* ============================
   BRANCH
============================ */

export interface SettingsBranch {
  id: string;

  branchCode: string;

  name: string;

  city?: string | null;

  state?: string | null;

  isActive: boolean;
}

/* ============================
   HOLIDAY
============================ */

export interface SettingsHoliday {
  id: string;

  title: string;

  holidayDate: string;

  description?: string | null;
}

/* ============================
   SETTINGS STATE
============================ */

export interface SettingsState {
  list: SettingListItem[];

  controlPanel:
    | ControlPanelSettings
    | null;

  loading: boolean;

  saving: boolean;

  error: string | null;
}

export interface DemoProduct {
  id: string;

  code: string;

  name: string;

  description?: string | null;

  isActive: boolean;

  sortOrder: number;

  createdAt?: string;

  updatedAt?: string;
}