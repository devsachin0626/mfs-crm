"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const report_controller_1 = require("../controllers/report/report.controller");
const router = (0, express_1.Router)();
/* ============================
   ADMIN ONLY
============================ */
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)("ADMIN"));
/* ============================
   FILTER OPTIONS
============================ */
router.get("/filters", report_controller_1.getReportFilterOptionsController);
/* ============================
   LEAD REPORT
============================ */
router.get("/leads", report_controller_1.getLeadReportController);
/* ============================
   LEAD EXCEL EXPORT
============================ */
router.get("/leads/export", report_controller_1.downloadLeadReportController);
/* ============================
   CLIENT REPORT
============================ */
router.get("/clients", report_controller_1.getClientReportController);
/* ============================
   CLIENT EXPORT DATA
   Excel route next step
============================ */
router.get("/clients/export-data", report_controller_1.getClientReportExportDataController);
router.get("/clients/export", report_controller_1.downloadLeadReportController);
/* ============================
   TRIAL / DEMO REPORT
============================ */
router.get("/trials", report_controller_1.getTrialReportController);
/* ============================
   TRIAL EXPORT DATA
============================ */
router.get("/trials/export-data", report_controller_1.getTrialReportExportDataController);
/* ============================
   TRIAL EXCEL EXPORT
============================ */
router.get("/trials/export", report_controller_1.downloadTrialReportController);
exports.default = router;
