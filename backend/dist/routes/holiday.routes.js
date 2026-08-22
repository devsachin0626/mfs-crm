"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const holiday_service_1 = require("../controllers/holiday/holiday.service");
const router = (0, express_1.Router)();
// Create Holiday
router.post("/", holiday_service_1.createHolidayController);
// Get All Holidays
router.get("/", holiday_service_1.getHolidaysController);
// Get Holiday By ID
router.get("/:id", holiday_service_1.getHolidayByIdController);
// Update Holiday
router.put("/:id", holiday_service_1.updateHolidayController);
// Delete Holiday
router.delete("/:id", holiday_service_1.deleteHolidayController);
exports.default = router;
