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
  createHolidayController,
  deleteHolidayController,
  getHolidayByIdController,
  getHolidaysController,
  updateHolidayController,
} from "../controllers/holiday/holiday.service";

const router =
  Router();

/* ============================
   AUTHENTICATION
============================ */

router.use(
  authenticate
);

/* ============================
   GET HOLIDAYS

   Admin / HR can view.
============================ */

router.get(
  "/",
  authorize(
    "ADMIN",
    "HR"
  ),
  getHolidaysController
);

router.get(
  "/:id",
  authorize(
    "ADMIN",
    "HR"
  ),
  getHolidayByIdController
);

/* ============================
   ADMIN ONLY MUTATIONS
============================ */

router.post(
  "/",
  authorize(
    "ADMIN"
  ),
  createHolidayController
);

router.put(
  "/:id",
  authorize(
    "ADMIN"
  ),
  updateHolidayController
);

router.delete(
  "/:id",
  authorize(
    "ADMIN"
  ),
  deleteHolidayController
);

export default router;