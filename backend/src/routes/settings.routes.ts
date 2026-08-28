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
  getControlPanelSettingsController,
  getSettingByKeyController,
  getSettingsByGroupController,
  getSettingsListController,
  resetSettingController,
  resetSettingGroupController,
  updateSettingController,
} from "../controllers/settings/settings.controller";

const router =
  Router();

/* ============================
   ADMIN ONLY
============================ */

router.use(
  authenticate
);

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