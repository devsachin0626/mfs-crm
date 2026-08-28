import {
  Router,
} from "express";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

import {
  bulkUpdateSettingsController,
  getAllSettingsController,
  getBrandSettingsController,
  getControlPanelSettingsController,
  getSettingByKeyController,
  getSettingsByGroupController,
  getSettingsListController,
  resetSettingController,
  resetSettingGroupController,
  updateSettingController,
  getTrialRuntimeSettingsController,
} from "../controllers/settings/settings.controller";

const router =
  Router();

/* ============================
   AUTHENTICATED USERS

   Common CRM settings such as
   company branding.
============================ */

router.use(
  authenticate
);

/* ============================
   BRAND SETTINGS

   ADMIN / HR / TL / EMPLOYEE
   sab authenticated users.
============================ */

router.get(
  "/brand",
  getBrandSettingsController
);

router.get(
  "/trial-runtime",
  getTrialRuntimeSettingsController
);

/* ============================
   ADMIN ONLY BELOW
============================ */

router.use(
  authorize(
    "ADMIN"
  )
);

/* ============================
   GET ALL RAW SETTINGS
============================ */

router.get(
  "/",
  getAllSettingsController
);

/* ============================
   GET UI SETTINGS LIST
============================ */

router.get(
  "/list",
  getSettingsListController
);

/* ============================
   GET PARSED CONTROL PANEL
============================ */

router.get(
  "/control-panel",
  getControlPanelSettingsController
);

/* ============================
   GET SETTINGS BY GROUP
============================ */

router.get(
  "/group/:group",
  getSettingsByGroupController
);

/* ============================
   BULK UPDATE
============================ */

router.put(
  "/bulk",
  bulkUpdateSettingsController
);

/* ============================
   RESET GROUP
============================ */

router.put(
  "/group/:group/reset",
  resetSettingGroupController
);

/* ============================
   GET SINGLE SETTING
============================ */

router.get(
  "/:key",
  getSettingByKeyController
);

/* ============================
   UPDATE SINGLE SETTING
============================ */

router.put(
  "/:key",
  updateSettingController
);

/* ============================
   RESET SINGLE SETTING
============================ */

router.put(
  "/:key/reset",
  resetSettingController
);

export default router;