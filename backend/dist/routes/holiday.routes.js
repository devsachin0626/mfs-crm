"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const holiday_service_1 = require("../controllers/holiday/holiday.service");
const router = (0, express_1.Router)();
/* ============================
   AUTHENTICATION
============================ */
router.use(auth_middleware_1.authenticate);
/* ============================
   GET HOLIDAYS

   Admin / HR can view.
============================ */
router.get("/", (0, role_middleware_1.authorize)("ADMIN", "HR"), holiday_service_1.getHolidaysController);
router.get("/:id", (0, role_middleware_1.authorize)("ADMIN", "HR"), holiday_service_1.getHolidayByIdController);
/* ============================
   ADMIN ONLY MUTATIONS
============================ */
router.post("/", (0, role_middleware_1.authorize)("ADMIN"), holiday_service_1.createHolidayController);
router.put("/:id", (0, role_middleware_1.authorize)("ADMIN"), holiday_service_1.updateHolidayController);
router.delete("/:id", (0, role_middleware_1.authorize)("ADMIN"), holiday_service_1.deleteHolidayController);
exports.default = router;
