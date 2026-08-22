import { Router } from "express";

import * as attendanceController from "../controllers/attendance/attendance.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   SELF CHECK IN
============================ */

router.post(
  "/check-in",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  attendanceController.checkIn
);

/* ============================
   SELF CHECK OUT
============================ */

router.put(
  "/check-out",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  attendanceController.checkOut
);

/* ============================
   GET ATTENDANCE LIST

   Access filtering service/controller
   me role ke hisaab se hoga
============================ */

router.get(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  attendanceController.getAttendances
);

/* ============================
   MONTHLY ATTENDANCE REPORT
============================ */

router.get(
  "/report/:employeeId",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  attendanceController.monthlyAttendanceReport
);

/* ============================
   GET ATTENDANCE BY ID
============================ */

router.get(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  attendanceController.getAttendanceById
);

/* ============================
   UPDATE ATTENDANCE
   ONLY ADMIN / HR
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  attendanceController.updateAttendance
);

export default router;