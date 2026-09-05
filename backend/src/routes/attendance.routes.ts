import {
  Router,
} from "express";

import * as attendanceController from "../controllers/attendance/attendance.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router =
  Router();

/* ============================
   ALL ATTENDANCE ROUTES
   REQUIRE LOGIN
============================ */

router.use(
  authenticate
);

router.get(
  "/employee-options",
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  attendanceController.getAttendanceEmployeeOptions
);

/* ============================
   SELF CHECK IN

   Logged-in employee ka
   employeeId controller
   req.employee se leta hai.
============================ */

router.post(
  "/check-in",

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

   month/year =
   payroll attendance cycle

   Example:
   month=8
   year=2026

   26 Jul 2026
       →
   25 Aug 2026

   Access:
   ADMIN       → All
   HR          → All
   TEAM_LEADER → Self + Team
   EMPLOYEE    → Self
============================ */

router.get(
  "/",

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

   IMPORTANT:
   Keep this route BEFORE /:id

   GET
   /attendance/report/:employeeId
============================ */

router.get(
  "/report/:employeeId",

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

   ADMIN / HR ONLY

   Manual correction:
   - Check In
   - Check Out
   - Status
   - Remarks
============================ */

router.put(
  "/:id",

  authorize(
    "ADMIN",
    "HR"
  ),

  attendanceController.updateAttendance
);

export default router;
