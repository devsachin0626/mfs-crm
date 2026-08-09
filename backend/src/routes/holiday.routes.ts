import { Router } from "express";

import {
  createHolidayController,
  getHolidaysController,
  getHolidayByIdController,
  updateHolidayController,
  deleteHolidayController,
} from "../controllers/holiday/holiday.service";

const router = Router();

// Create Holiday
router.post("/", createHolidayController);

// Get All Holidays
router.get("/", getHolidaysController);

// Get Holiday By ID
router.get("/:id", getHolidayByIdController);

// Update Holiday
router.put("/:id", updateHolidayController);

// Delete Holiday
router.delete("/:id", deleteHolidayController);

export default router;