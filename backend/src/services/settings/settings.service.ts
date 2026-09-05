import prisma from "../../config/prisma";

import type {
  BulkUpdateSettingsRequest,
  ControlPanelSettings,
  SettingDefinition,
  SettingGroup,
  SettingKey,
  SettingValidationResult,
  SettingsListItem,
  SettingsResponse,
  UpdateSettingRequest,
} from "../../types/settings.types";

/* ============================
   SETTING DEFINITIONS
============================ */

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  /* ============================
     COMPANY
  ============================ */

  {
    key: "CRM_DISPLAY_NAME",
    label: "CRM Display Name",
    description:
      "Short CRM name displayed in the sidebar.",
    group: "COMPANY",
    valueType: "STRING",
    defaultValue:
      "MFS CRM",
    required: true,
  },

  {
    key: "COMPANY_NAME",
    label: "Company Name",
    description:
      "Company name displayed across CRM.",
    group: "COMPANY",
    valueType: "STRING",
    defaultValue:
      "Mahakal Financial Services",
    required: true,
  },

  {
    key: "COMPANY_PHONE",
    label: "Company Phone",
    description:
      "Primary company contact number.",
    group: "COMPANY",
    valueType: "PHONE",
    defaultValue: "",
  },

  {
    key: "COMPANY_EMAIL",
    label: "Company Email",
    description:
      "Primary company email address.",
    group: "COMPANY",
    valueType: "EMAIL",
    defaultValue: "",
  },

  {
    key: "COMPANY_ADDRESS",
    label: "Company Address",
    description:
      "Office / registered address.",
    group: "COMPANY",
    valueType: "TEXTAREA",
    defaultValue: "",
  },

  /* ============================
     CALLING
  ============================ */

  {
    key: "DAILY_CALL_TARGET",
    label: "Daily Call Target",
    description:
      "Default daily calling target per employee.",
    group: "CALLING",
    valueType: "NUMBER",
    defaultValue: "250",
    required: true,
    min: 0,
    max: 5000,
  },

  /* ============================
     FOLLOW-UP
  ============================ */

  {
    key: "DEFAULT_FOLLOWUP_DAYS",
    label: "Default Follow-up Days",
    description:
      "Default number of days for next follow-up.",
    group: "FOLLOW_UP",
    valueType: "NUMBER",
    defaultValue: "1",
    required: true,
    min: 0,
    max: 365,
  },

  /* ============================
     TRIAL / DEMO
  ============================ */

  {
    key: "DEFAULT_TRIAL_DAYS",
    label: "Default Trial Days",
    description:
      "Default demo duration when starting a trial.",
    group: "TRIAL",
    valueType: "NUMBER",
    defaultValue: "3",
    required: true,
    min: 1,
    max: 365,
  },

  {
    key: "MAX_TRIAL_EXTENSION_DAYS",
    label: "Maximum Extension Days",
    description:
      "Maximum days that can be added in one trial extension.",
    group: "TRIAL",
    valueType: "NUMBER",
    defaultValue: "7",
    required: true,
    min: 0,
    max: 365,
  },

  {
    key: "MAX_TRIAL_EXTENSIONS",
    label: "Maximum Trial Extensions",
    description:
      "Maximum number of times a trial can be extended.",
    group: "TRIAL",
    valueType: "NUMBER",
    defaultValue: "2",
    required: true,
    min: 0,
    max: 50,
  },

  /* ============================
     ATTENDANCE
  ============================ */

  {
    key: "OFFICE_START_TIME",
    label: "Office Start Time",
    description:
      "Default office start time.",
    group: "ATTENDANCE",
    valueType: "TIME",
    defaultValue: "09:30",
    required: true,
  },

  {
    key: "OFFICE_END_TIME",
    label: "Office End Time",
    description:
      "Default office end time.",
    group: "ATTENDANCE",
    valueType: "TIME",
    defaultValue: "18:30",
    required: true,
  },

  {
    key: "LATE_AFTER_TIME",
    label: "Late After",
    description:
      "Employee is marked late after this time.",
    group: "ATTENDANCE",
    valueType: "TIME",
    defaultValue: "09:45",
    required: true,
  },

  {
    key: "HALF_DAY_AFTER_TIME",
    label: "Half Day After",
    description:
      "Employee may be treated as half-day after this time.",
    group: "ATTENDANCE",
    valueType: "TIME",
    defaultValue: "11:00",
    required: true,
  },

  /* ============================
     GENERAL
  ============================ */

  {
    key: "TIMEZONE",
    label: "Timezone",
    description:
      "CRM timezone used for dates and times.",
    group: "GENERAL",
    valueType: "SELECT",
    defaultValue: "Asia/Kolkata",
    required: true,
    options: [
      {
        label: "India Standard Time",
        value: "Asia/Kolkata",
      },
      {
        label: "UTC",
        value: "UTC",
      },
    ],
  },

  {
    key: "DATE_FORMAT",
    label: "Date Format",
    description:
      "Default date format used in CRM.",
    group: "GENERAL",
    valueType: "SELECT",
    defaultValue: "DD/MM/YYYY",
    required: true,
    options: [
      {
        label: "DD/MM/YYYY",
        value: "DD/MM/YYYY",
      },
      {
        label: "MM/DD/YYYY",
        value: "MM/DD/YYYY",
      },
      {
        label: "YYYY-MM-DD",
        value: "YYYY-MM-DD",
      },
    ],
  },

  {
    key: "DEFAULT_PAGE_SIZE",
    label: "Default Rows Per Page",
    description:
      "Default number of rows shown in tables.",
    group: "GENERAL",
    valueType: "SELECT",
    defaultValue: "20",
    required: true,
    options: [
      {
        label: "10",
        value: "10",
      },
      {
        label: "20",
        value: "20",
      },
      {
        label: "50",
        value: "50",
      },
      {
        label: "100",
        value: "100",
      },
    ],
  },
];

/* ============================
   VALID KEYS
============================ */

const VALID_SETTING_KEYS =
  new Set<SettingKey>(
    SETTING_DEFINITIONS.map(
      (item) => item.key
    )
  );

/* ============================
   GET DEFINITION
============================ */

const getDefinition = (
  key: SettingKey
) => {
  return SETTING_DEFINITIONS.find(
    (item) =>
      item.key === key
  );
};

/* ============================
   STRING CLEAN
============================ */

const cleanValue = (
  value: unknown
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/* ============================
   EMAIL VALIDATION
============================ */

const isValidEmail = (
  value: string
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
};

/* ============================
   PHONE VALIDATION
============================ */

const isValidPhone = (
  value: string
) => {
  return /^[0-9+\-\s()]{7,20}$/.test(
    value
  );
};

/* ============================
   TIME VALIDATION
============================ */

const isValidTime = (
  value: string
) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    value
  );
};

/* ============================
   SETTING VALIDATION
============================ */

export const validateSettingValue =
  (
    key: SettingKey,
    rawValue: unknown
  ): SettingValidationResult => {
    const definition =
      getDefinition(key);

    if (!definition) {
      return {
        valid: false,
        message:
          "Invalid Setting Key",
      };
    }

    const value =
      cleanValue(rawValue);

    if (
      definition.required &&
      !value
    ) {
      return {
        valid: false,
        message:
          `${definition.label} is required`,
      };
    }

    if (
      !value &&
      !definition.required
    ) {
      return {
        valid: true,
      };
    }

    /* NUMBER */

    if (
      definition.valueType ===
      "NUMBER"
    ) {
      const numberValue =
        Number(value);

      if (
        Number.isNaN(
          numberValue
        )
      ) {
        return {
          valid: false,
          message:
            `${definition.label} must be a valid number`,
        };
      }

      if (
        definition.min !==
          undefined &&
        numberValue <
          definition.min
      ) {
        return {
          valid: false,
          message:
            `${definition.label} cannot be less than ${definition.min}`,
        };
      }

      if (
        definition.max !==
          undefined &&
        numberValue >
          definition.max
      ) {
        return {
          valid: false,
          message:
            `${definition.label} cannot be greater than ${definition.max}`,
        };
      }
    }

    /* EMAIL */

    if (
      definition.valueType ===
        "EMAIL" &&
      !isValidEmail(value)
    ) {
      return {
        valid: false,
        message:
          `${definition.label} is invalid`,
      };
    }

    /* PHONE */

    if (
      definition.valueType ===
        "PHONE" &&
      !isValidPhone(value)
    ) {
      return {
        valid: false,
        message:
          `${definition.label} is invalid`,
      };
    }

    /* TIME */

    if (
      definition.valueType ===
        "TIME" &&
      !isValidTime(value)
    ) {
      return {
        valid: false,
        message:
          `${definition.label} must be in HH:MM format`,
      };
    }

    /* SELECT */

    if (
      definition.valueType ===
        "SELECT" &&
      definition.options &&
      definition.options.length >
        0
    ) {
      const validOption =
        definition.options.some(
          (option) =>
            option.value ===
            value
        );

      if (!validOption) {
        return {
          valid: false,
          message:
            `Invalid value for ${definition.label}`,
        };
      }
    }

    return {
      valid: true,
    };
  };

/* ============================
   GET ALL SETTINGS
============================ */

export const getAllSettings =
  async (): Promise<SettingsResponse> => {
    const records =
      await prisma.setting.findMany({
        orderBy: {
          key: "asc",
        },
      });

    const dbMap =
      new Map(
        records.map(
          (item) => [
            item.key,
            item.value,
          ]
        )
      );

    const settings:
      Record<
        string,
        string
      > = {};

    for (
      const definition of SETTING_DEFINITIONS
    ) {
      settings[
        definition.key
      ] =
        dbMap.get(
          definition.key
        ) ??
        definition.defaultValue;
    }

    return {
      success: true,
      settings,
    };
  };

/* ============================
   GET SETTINGS LIST
   UI METADATA + VALUE
============================ */

export const getSettingsList =
  async (): Promise<
    SettingsListItem[]
  > => {
    const records =
      await prisma.setting.findMany();

    const dbMap =
      new Map(
        records.map(
          (item) => [
            item.key,
            item.value,
          ]
        )
      );

    return SETTING_DEFINITIONS.map(
      (definition) => ({
        key:
          definition.key,

        label:
          definition.label,

        description:
          definition.description,

        group:
          definition.group,

        valueType:
          definition.valueType,

        value:
          dbMap.get(
            definition.key
          ) ??
          definition.defaultValue,

        defaultValue:
          definition.defaultValue,

        required:
          definition.required,

        options:
          definition.options,
      })
    );
  };

/* ============================
   GET SETTINGS BY GROUP
============================ */

export const getSettingsByGroup =
  async (
    group: SettingGroup
  ) => {
    const list =
      await getSettingsList();

    return list.filter(
      (item) =>
        item.group === group
    );
  };

/* ============================
   GET SINGLE SETTING
============================ */

export const getSettingByKey =
  async (
    key: SettingKey
  ) => {
    if (
      !VALID_SETTING_KEYS.has(
        key
      )
    ) {
      throw new Error(
        "Invalid Setting Key"
      );
    }

    const definition =
      getDefinition(key);

    if (!definition) {
      throw new Error(
        "Setting Definition Not Found"
      );
    }

    const record =
      await prisma.setting.findUnique({
        where: {
          key,
        },
      });

    return {
      success: true,

      setting: {
        key,

        label:
          definition.label,

        description:
          definition.description,

        group:
          definition.group,

        valueType:
          definition.valueType,

        value:
          record?.value ??
          definition.defaultValue,

        defaultValue:
          definition.defaultValue,

        required:
          definition.required,

        options:
          definition.options,

        updatedAt:
          record?.updatedAt ??
          null,
      },
    };
  };

/* ============================
   GET RAW VALUE
   INTERNAL MODULE USE
============================ */

export const getSettingValue =
  async (
    key: SettingKey
  ): Promise<string> => {
    const definition =
      getDefinition(key);

    if (!definition) {
      throw new Error(
        "Invalid Setting Key"
      );
    }

    const setting =
      await prisma.setting.findUnique({
        where: {
          key,
        },

        select: {
          value: true,
        },
      });

    return (
      setting?.value ??
      definition.defaultValue
    );
  };

/* ============================
   GET NUMBER VALUE
============================ */

export const getNumberSetting =
  async (
    key: SettingKey
  ): Promise<number> => {
    const value =
      await getSettingValue(
        key
      );

    const parsed =
      Number(value);

    if (
      Number.isNaN(parsed)
    ) {
      const definition =
        getDefinition(key);

      return Number(
        definition
          ?.defaultValue ??
          0
      );
    }

    return parsed;
  };

/* ============================
   UPDATE SINGLE SETTING
============================ */

export const updateSetting =
  async (
    key: SettingKey,
    data: UpdateSettingRequest
  ) => {
    if (
      !VALID_SETTING_KEYS.has(
        key
      )
    ) {
      throw new Error(
        "Invalid Setting Key"
      );
    }

    const value =
      cleanValue(
        data.value
      );

    const validation =
      validateSettingValue(
        key,
        value
      );

    if (
      !validation.valid
    ) {
      throw new Error(
        validation.message ||
          "Invalid Setting Value"
      );
    }

    const definition =
      getDefinition(key);

    const setting =
      await prisma.setting.upsert({
        where: {
          key,
        },

        update: {
          value,

          description:
            definition
              ?.description,
        },

        create: {
          key,

          value,

          description:
            definition
              ?.description,
        },
      });

    return {
      success: true,

      message:
        "Setting Updated Successfully",

      setting,
    };
  };

/* ============================
   BULK UPDATE SETTINGS
============================ */

export const bulkUpdateSettings =
  async (
    data: BulkUpdateSettingsRequest
  ) => {
    if (
      !Array.isArray(
        data.settings
      ) ||
      data.settings.length ===
        0
    ) {
      throw new Error(
        "Settings Are Required"
      );
    }

    const uniqueKeys =
      new Set<string>();

    for (
      const item of data.settings
    ) {
      if (
        !VALID_SETTING_KEYS.has(
          item.key
        )
      ) {
        throw new Error(
          `Invalid Setting Key: ${item.key}`
        );
      }

      if (
        uniqueKeys.has(
          item.key
        )
      ) {
        throw new Error(
          `Duplicate Setting Key: ${item.key}`
        );
      }

      uniqueKeys.add(
        item.key
      );

      const validation =
        validateSettingValue(
          item.key,
          item.value
        );

      if (
        !validation.valid
      ) {
        throw new Error(
          validation.message ||
            `Invalid Value For ${item.key}`
        );
      }
    }

    const result =
      await prisma.$transaction(
        data.settings.map(
          (item) => {
            const definition =
              getDefinition(
                item.key
              );

            return prisma.setting.upsert({
              where: {
                key:
                  item.key,
              },

              update: {
                value:
                  cleanValue(
                    item.value
                  ),

                description:
                  definition
                    ?.description,
              },

              create: {
                key:
                  item.key,

                value:
                  cleanValue(
                    item.value
                  ),

                description:
                  definition
                    ?.description,
              },
            });
          }
        )
      );

    return {
      success: true,

      message:
        "Settings Updated Successfully",

      updatedCount:
        result.length,

      settings:
        result,
    };
  };

/* ============================
   RESET SETTING TO DEFAULT
============================ */

export const resetSettingToDefault =
  async (
    key: SettingKey
  ) => {
    const definition =
      getDefinition(key);

    if (!definition) {
      throw new Error(
        "Invalid Setting Key"
      );
    }

    const setting =
      await prisma.setting.upsert({
        where: {
          key,
        },

        update: {
          value:
            definition.defaultValue,

          description:
            definition.description,
        },

        create: {
          key,

          value:
            definition.defaultValue,

          description:
            definition.description,
        },
      });

    return {
      success: true,

      message:
        "Setting Reset Successfully",

      setting,
    };
  };

/* ============================
   RESET GROUP
============================ */

export const resetSettingGroup =
  async (
    group: SettingGroup
  ) => {
    const definitions =
      SETTING_DEFINITIONS.filter(
        (item) =>
          item.group ===
          group
      );

    if (
      definitions.length ===
      0
    ) {
      throw new Error(
        "Invalid Setting Group"
      );
    }

    await prisma.$transaction(
      definitions.map(
        (definition) =>
          prisma.setting.upsert({
            where: {
              key:
                definition.key,
            },

            update: {
              value:
                definition.defaultValue,

              description:
                definition.description,
            },

            create: {
              key:
                definition.key,

              value:
                definition.defaultValue,

              description:
                definition.description,
            },
          })
      )
    );

    return {
      success: true,

      message:
        `${group} Settings Reset Successfully`,
    };
  };

/* ============================
   CONTROL PANEL SETTINGS
   PARSED RESPONSE
============================ */

export const getControlPanelSettings =
  async (): Promise<ControlPanelSettings> => {
    const result =
      await getAllSettings();

    const settings =
      result.settings;

    return {
      company: {
        crmDisplayName:
          settings.CRM_DISPLAY_NAME,

        companyName:
          settings.COMPANY_NAME,

        companyPhone:
          settings.COMPANY_PHONE,

        companyEmail:
          settings.COMPANY_EMAIL,

        companyAddress:
          settings.COMPANY_ADDRESS,
      },

      calling: {
        dailyCallTarget:
          Number(
            settings.DAILY_CALL_TARGET
          ) || 0,
      },

      followUp: {
        defaultFollowUpDays:
          Number(
            settings.DEFAULT_FOLLOWUP_DAYS
          ) || 0,
      },

      trial: {
        defaultTrialDays:
          Number(
            settings.DEFAULT_TRIAL_DAYS
          ) || 0,

        maxTrialExtensionDays:
          Number(
            settings.MAX_TRIAL_EXTENSION_DAYS
          ) || 0,

        maxTrialExtensions:
          Number(
            settings.MAX_TRIAL_EXTENSIONS
          ) || 0,
      },

      attendance: {
        officeStartTime:
          settings.OFFICE_START_TIME,

        officeEndTime:
          settings.OFFICE_END_TIME,

        lateAfterTime:
          settings.LATE_AFTER_TIME,

        halfDayAfterTime:
          settings.HALF_DAY_AFTER_TIME,
      },

      general: {
        timezone:
          settings.TIMEZONE,

        dateFormat:
          settings.DATE_FORMAT,

        defaultPageSize:
          Number(
            settings.DEFAULT_PAGE_SIZE
          ) || 20,
      },
    };
  };

