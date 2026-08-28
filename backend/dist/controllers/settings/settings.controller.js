"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandSettingsController = exports.resetSettingGroupController = exports.resetSettingController = exports.bulkUpdateSettingsController = exports.updateSettingController = exports.getSettingByKeyController = exports.getSettingsByGroupController = exports.getControlPanelSettingsController = exports.getSettingsListController = exports.getAllSettingsController = void 0;
const settings_service_1 = require("../../services/settings/settings.service");
/* ============================
   GET ALL SETTINGS
============================ */
const getAllSettingsController = async (_req, res) => {
    try {
        const result = await (0, settings_service_1.getAllSettings)();
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Load Settings",
        });
    }
};
exports.getAllSettingsController = getAllSettingsController;
/* ============================
   GET SETTINGS LIST
   UI METADATA
============================ */
const getSettingsListController = async (_req, res) => {
    try {
        const settings = await (0, settings_service_1.getSettingsList)();
        res
            .status(200)
            .json({
            success: true,
            settings,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Load Settings List",
        });
    }
};
exports.getSettingsListController = getSettingsListController;
/* ============================
   GET CONTROL PANEL SETTINGS
============================ */
const getControlPanelSettingsController = async (_req, res) => {
    try {
        const settings = await (0, settings_service_1.getControlPanelSettings)();
        res
            .status(200)
            .json({
            success: true,
            settings,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Load Control Panel Settings",
        });
    }
};
exports.getControlPanelSettingsController = getControlPanelSettingsController;
/* ============================
   GET SETTINGS BY GROUP
============================ */
const getSettingsByGroupController = async (req, res) => {
    try {
        const group = String(req.params.group ||
            "")
            .trim()
            .toUpperCase();
        const allowedGroups = [
            "COMPANY",
            "CALLING",
            "FOLLOW_UP",
            "TRIAL",
            "ATTENDANCE",
            "GENERAL",
        ];
        if (!allowedGroups.includes(group)) {
            res.status(400).json({
                success: false,
                message: "Invalid Setting Group",
            });
            return;
        }
        const settings = await (0, settings_service_1.getSettingsByGroup)(group);
        res
            .status(200)
            .json({
            success: true,
            group,
            settings,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Load Setting Group",
        });
    }
};
exports.getSettingsByGroupController = getSettingsByGroupController;
/* ============================
   GET SINGLE SETTING
============================ */
const getSettingByKeyController = async (req, res) => {
    try {
        const key = String(req.params.key ||
            "")
            .trim()
            .toUpperCase();
        const result = await (0, settings_service_1.getSettingByKey)(key);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Load Setting",
        });
    }
};
exports.getSettingByKeyController = getSettingByKeyController;
/* ============================
   UPDATE SINGLE SETTING
============================ */
const updateSettingController = async (req, res) => {
    try {
        const key = String(req.params.key ||
            "")
            .trim()
            .toUpperCase();
        const body = req.body;
        if (!body ||
            body.value ===
                undefined) {
            res.status(400).json({
                success: false,
                message: "Setting Value Is Required",
            });
            return;
        }
        const result = await (0, settings_service_1.updateSetting)(key, {
            value: String(body.value),
        });
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Update Setting",
        });
    }
};
exports.updateSettingController = updateSettingController;
/* ============================
   BULK UPDATE SETTINGS
============================ */
const bulkUpdateSettingsController = async (req, res) => {
    try {
        const body = req.body;
        if (!body ||
            !Array.isArray(body.settings) ||
            body.settings.length ===
                0) {
            res.status(400).json({
                success: false,
                message: "Settings Are Required",
            });
            return;
        }
        const normalized = {
            settings: body.settings.map((item) => ({
                key: String(item.key ||
                    "")
                    .trim()
                    .toUpperCase(),
                value: String(item.value ??
                    ""),
            })),
        };
        const result = await (0, settings_service_1.bulkUpdateSettings)(normalized);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Update Settings",
        });
    }
};
exports.bulkUpdateSettingsController = bulkUpdateSettingsController;
/* ============================
   RESET SINGLE SETTING
============================ */
const resetSettingController = async (req, res) => {
    try {
        const key = String(req.params.key ||
            "")
            .trim()
            .toUpperCase();
        const result = await (0, settings_service_1.resetSettingToDefault)(key);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Reset Setting",
        });
    }
};
exports.resetSettingController = resetSettingController;
/* ============================
   RESET SETTING GROUP
============================ */
const resetSettingGroupController = async (req, res) => {
    try {
        const group = String(req.params.group ||
            "")
            .trim()
            .toUpperCase();
        const allowedGroups = [
            "COMPANY",
            "CALLING",
            "FOLLOW_UP",
            "TRIAL",
            "ATTENDANCE",
            "GENERAL",
        ];
        if (!allowedGroups.includes(group)) {
            res.status(400).json({
                success: false,
                message: "Invalid Setting Group",
            });
            return;
        }
        const result = await (0, settings_service_1.resetSettingGroup)(group);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Reset Setting Group",
        });
    }
};
exports.resetSettingGroupController = resetSettingGroupController;
/* ============================
 GET BRAND SETTINGS

 Authenticated users ke liye
 sidebar / common layout data.
============================ */
const getBrandSettingsController = async (_req, res) => {
    try {
        const result = await (0, settings_service_1.getAllSettings)();
        res.status(200).json({
            success: true,
            brand: {
                companyName: result.settings
                    .COMPANY_NAME ||
                    "Mahakal Financial Services",
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message ||
                "Failed To Load Brand Settings",
        });
    }
};
exports.getBrandSettingsController = getBrandSettingsController;
