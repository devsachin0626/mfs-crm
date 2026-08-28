import api from "./api";

import type {
  AttendanceActionResponse,
  AttendanceDetailsResponse,
  AttendanceListResponse,
  AttendanceQuery,
  MonthlyAttendanceReport,
  UpdateAttendancePayload,
} from "../types/attendance.types";

/* ============================
   BASE URL
============================ */

const ATTENDANCE_URL =
  "/attendance";

/* ============================
   GET ATTENDANCES

   month/year =
   payroll attendance cycle.

   Example:
   month = 8
   year = 2026

   26 Jul 2026
      →
   25 Aug 2026
============================ */

export const getAttendances =
  async (
    params: AttendanceQuery = {}
  ): Promise<AttendanceListResponse> => {
    const response =
      await api.get<AttendanceListResponse>(
        ATTENDANCE_URL,
        {
          params: {
            page:
              params.page ??
              1,

            limit:
              params.limit ??
              20,

            search:
              params.search
                ?.trim() ||
              undefined,

            status:
              params.status ||
              undefined,

            month:
              params.month ||
              undefined,

            year:
              params.year ||
              undefined,

            employeeId:
              params.employeeId ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   GET ATTENDANCE BY ID
============================ */

export const getAttendanceById =
  async (
    id: string
  ): Promise<AttendanceDetailsResponse> => {
    const attendanceId =
      id?.trim();

    if (!attendanceId) {
      throw new Error(
        "Attendance ID Is Required"
      );
    }

    const response =
      await api.get<AttendanceDetailsResponse>(
        `${ATTENDANCE_URL}/${attendanceId}`
      );

    return response.data;
  };

/* ============================
   CHECK IN
============================ */

export const checkIn =
  async (
    data?: {
      remarks?: string;
    }
  ): Promise<AttendanceActionResponse> => {
    const response =
      await api.post<AttendanceActionResponse>(
        `${ATTENDANCE_URL}/check-in`,
        {
          remarks:
            data?.remarks
              ?.trim() ||
            undefined,
        }
      );

    return response.data;
  };

/* ============================
   CHECK OUT
============================ */

export const checkOut =
  async (
    data?: {
      remarks?: string;
    }
  ): Promise<AttendanceActionResponse> => {
    const response =
      await api.put<AttendanceActionResponse>(
        `${ATTENDANCE_URL}/check-out`,
        {
          remarks:
            data?.remarks
              ?.trim() ||
            undefined,
        }
      );

    return response.data;
  };

/* ============================
   UPDATE ATTENDANCE

   ADMIN / HR
============================ */

export const updateAttendance =
  async (
    id: string,
    data: UpdateAttendancePayload
  ): Promise<AttendanceActionResponse> => {
    const attendanceId =
      id?.trim();

    if (!attendanceId) {
      throw new Error(
        "Attendance ID Is Required"
      );
    }

    const response =
      await api.put<AttendanceActionResponse>(
        `${ATTENDANCE_URL}/${attendanceId}`,
        {
          checkIn:
            data.checkIn ??
            undefined,

          checkOut:
            data.checkOut ??
            undefined,

          status:
            data.status ||
            undefined,

          remarks:
            typeof data.remarks ===
              "string"
              ? data.remarks.trim()
              : data.remarks,
        }
      );

    return response.data;
  };

/* ============================
   MONTHLY ATTENDANCE REPORT

   month/year =
   payroll month.

   Example:

   August 2026
   =
   26 Jul 2026
      →
   25 Aug 2026
============================ */

export const getMonthlyAttendanceReport =
  async (
    employeeId: string,
    month: number,
    year: number
  ): Promise<MonthlyAttendanceReport> => {
    const id =
      employeeId?.trim();

    if (!id) {
      throw new Error(
        "Employee ID Is Required"
      );
    }

    if (
      !Number.isInteger(
        month
      ) ||
      month < 1 ||
      month > 12
    ) {
      throw new Error(
        "Month Must Be Between 1 And 12"
      );
    }

    if (
      !Number.isInteger(
        year
      ) ||
      year < 2000 ||
      year > 2200
    ) {
      throw new Error(
        "Invalid Year"
      );
    }

    const response =
      await api.get<MonthlyAttendanceReport>(
        `${ATTENDANCE_URL}/report/${id}`,
        {
          params: {
            month,
            year,
          },
        }
      );

    return response.data;
  };

/* ============================
   SERVICE OBJECT
============================ */

const attendanceService = {
  getAttendances,

  getAttendanceById,

  checkIn,

  checkOut,

  updateAttendance,

  getMonthlyAttendanceReport,
};

export default attendanceService;