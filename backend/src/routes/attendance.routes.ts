import { Router } from "express";
import * as attendanceController from "../controllers/attendance/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* ============================
   CHECK IN
============================ */

router.post(
  "/check-in",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "SALES_EXECUTIVE"),
  attendanceController.checkIn
);

/* ============================
   CHECK OUT
============================ */

router.put(
  "/check-out",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "SALES_EXECUTIVE"),
  attendanceController.checkOut
);

/* ============================
   GET ALL ATTENDANCE
============================ */

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  attendanceController.getAttendances
);

/* ============================
   MONTHLY ATTENDANCE REPORT
============================ */

router.get(
  "/report/:employeeId",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  attendanceController.monthlyAttendanceReport
);

/* ============================
   GET ATTENDANCE BY ID
============================ */

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  attendanceController.getAttendanceById
);

/* ============================
   UPDATE ATTENDANCE
============================ */

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  attendanceController.updateAttendance
);

export default router;