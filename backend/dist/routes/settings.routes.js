"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const settings_controller_1 = require("../controllers/settings/settings.controller");
const router = (0, express_1.Router)();
/* ============================
   ADMIN ONLY
============================ */
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)("ADMIN"));
/* ============================
   GET ALL RAW SETTINGS
============================ */
router.get("/", settings_controller_1.getAllSettingsController);
/* ============================
   GET UI SETTINGS LIST
============================ */
router.get("/list", settings_controller_1.getSettingsListController);
/* ============================
   GET PARSED CONTROL PANEL
============================ */
router.get("/control-panel", settings_controller_1.getControlPanelSettingsController);
/* ============================
   GET SETTINGS BY GROUP
============================ */
router.get("/group/:group", settings_controller_1.getSettingsByGroupController);
/* ============================
   BULK UPDATE
============================ */
router.put("/bulk", settings_controller_1.bulkUpdateSettingsController);
/* ============================
   RESET GROUP
============================ */
router.put("/group/:group/reset", settings_controller_1.resetSettingGroupController);
/* ============================
   GET SINGLE SETTING
============================ */
router.get("/:key", settings_controller_1.getSettingByKeyController);
/* ============================
   UPDATE SINGLE SETTING
============================ */
router.put("/:key", settings_controller_1.updateSettingController);
/* ============================
   RESET SINGLE SETTING
============================ */
router.put("/:key/reset", settings_controller_1.resetSettingController);
exports.default = router;
