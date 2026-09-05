import {
  Request,
  Response,
} from "express";

import {
  bulkUpdateSettings,
  getAllSettings,
  getControlPanelSettings,
  getNumberSetting,
  getSettingByKey,
  getSettingsByGroup,
  getSettingsList,
  resetSettingGroup,
  resetSettingToDefault,
  updateSetting,
} from "../../services/settings/settings.service";

import type {
  BulkUpdateSettingsRequest,
  SettingGroup,
  SettingKey,
  UpdateSettingRequest,
} from "../../types/settings.types";

/* ============================
   GET ALL SETTINGS
============================ */

export const getAllSettingsController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await getAllSettings();

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Settings",
      });
    }
  };

/* ============================
   GET SETTINGS LIST
   UI METADATA
============================ */

export const getSettingsListController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const settings =
        await getSettingsList();

      res
        .status(200)
        .json({
          success: true,

          settings,
        });
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Settings List",
      });
    }
  };

/* ============================
   GET CONTROL PANEL SETTINGS
============================ */

export const getControlPanelSettingsController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const settings =
        await getControlPanelSettings();

      res
        .status(200)
        .json({
          success: true,

          settings,
        });
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Control Panel Settings",
      });
    }
  };

/* ============================
   GET SETTINGS BY GROUP
============================ */

export const getSettingsByGroupController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const group =
        String(
          req.params.group ||
            ""
        )
          .trim()
          .toUpperCase() as SettingGroup;

      const allowedGroups:
        SettingGroup[] = [
          "COMPANY",
          "CALLING",
          "FOLLOW_UP",
          "TRIAL",
          "ATTENDANCE",
          "GENERAL",
        ];

      if (
        !allowedGroups.includes(
          group
        )
      ) {
        res.status(400).json({
          success: false,

          message:
            "Invalid Setting Group",
        });

        return;
      }

      const settings =
        await getSettingsByGroup(
          group
        );

      res
        .status(200)
        .json({
          success: true,

          group,

          settings,
        });
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Setting Group",
      });
    }
  };

/* ============================
   GET SINGLE SETTING
============================ */

export const getSettingByKeyController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const key =
        String(
          req.params.key ||
            ""
        )
          .trim()
          .toUpperCase() as SettingKey;

      const result =
        await getSettingByKey(
          key
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Setting",
      });
    }
  };

/* ============================
   UPDATE SINGLE SETTING
============================ */

export const updateSettingController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const key =
        String(
          req.params.key ||
            ""
        )
          .trim()
          .toUpperCase() as SettingKey;

      const body =
        req.body as UpdateSettingRequest;

      if (
        !body ||
        body.value ===
          undefined
      ) {
        res.status(400).json({
          success: false,

          message:
            "Setting Value Is Required",
        });

        return;
      }

      const result =
        await updateSetting(
          key,
          {
            value:
              String(
                body.value
              ),
          }
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Update Setting",
      });
    }
  };

/* ============================
   BULK UPDATE SETTINGS
============================ */

export const bulkUpdateSettingsController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const body =
        req.body as BulkUpdateSettingsRequest;

      if (
        !body ||
        !Array.isArray(
          body.settings
        ) ||
        body.settings.length ===
          0
      ) {
        res.status(400).json({
          success: false,

          message:
            "Settings Are Required",
        });

        return;
      }

      const normalized:
        BulkUpdateSettingsRequest = {
          settings:
            body.settings.map(
              (
                item
              ) => ({
                key:
                  String(
                    item.key ||
                      ""
                  )
                    .trim()
                    .toUpperCase() as SettingKey,

                value:
                  String(
                    item.value ??
                      ""
                  ),
              })
            ),
        };

      const result =
        await bulkUpdateSettings(
          normalized
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Update Settings",
      });
    }
  };

/* ============================
   RESET SINGLE SETTING
============================ */

export const resetSettingController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const key =
        String(
          req.params.key ||
            ""
        )
          .trim()
          .toUpperCase() as SettingKey;

      const result =
        await resetSettingToDefault(
          key
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Reset Setting",
      });
    }
  };

/* ============================
   RESET SETTING GROUP
============================ */

export const resetSettingGroupController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const group =
        String(
          req.params.group ||
            ""
        )
          .trim()
          .toUpperCase() as SettingGroup;

      const allowedGroups:
        SettingGroup[] = [
          "COMPANY",
          "CALLING",
          "FOLLOW_UP",
          "TRIAL",
          "ATTENDANCE",
          "GENERAL",
        ];

      if (
        !allowedGroups.includes(
          group
        )
      ) {
        res.status(400).json({
          success: false,

          message:
            "Invalid Setting Group",
        });

        return;
      }

      const result =
        await resetSettingGroup(
          group
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Reset Setting Group",
      });
    }
  };

  /* ============================
   GET BRAND SETTINGS

   Authenticated users ke liye
   sidebar / common layout data.
============================ */

export const getBrandSettingsController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await getAllSettings();

      res.status(200).json({
        success: true,

        brand: {
          crmDisplayName:
            result.settings
              .CRM_DISPLAY_NAME ||
            "MFS CRM",

          companyName:
            result.settings
              .COMPANY_NAME ||
            "Mahakal Financial Services",
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Brand Settings",
      });
    }
  };

  /* ============================
   GET TRIAL RUNTIME SETTINGS

   Authenticated CRM users.
============================ */

export const getTrialRuntimeSettingsController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const [
        defaultTrialDays,
        maxExtensionDays,
        maxExtensions,
      ] =
        await Promise.all([
          getNumberSetting(
            "DEFAULT_TRIAL_DAYS"
          ),

          getNumberSetting(
            "MAX_TRIAL_EXTENSION_DAYS"
          ),

          getNumberSetting(
            "MAX_TRIAL_EXTENSIONS"
          ),
        ]);

      res.status(200).json({
        success: true,

        trial: {
          defaultTrialDays,

          maxExtensionDays,

          maxExtensions,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Trial Runtime Settings",
      });
    }
  };
