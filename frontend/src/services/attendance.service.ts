import api from "./api";

import type {
  AttendanceListResponse,
  AttendanceQuery,
  
} from "../types/attendance.types";



export const getAttendances = async (
  params: AttendanceQuery
): Promise<AttendanceListResponse> => {
  const response = await api.get(
    "/attendance",
    {
      params,
    }
  );

  return response.data;
};

export const getAttendanceById = async (
  id: string
) => {
  const response = await api.get(
    `/attendance/${id}`
  );

  return response.data;
};

export const checkIn = async (
  data?: {
    remarks?: string;
  }
) => {
  const response = await api.post(
    "/attendance/check-in",
    data || {}
  );

  return response.data;
};

export const checkOut = async (
  data?: {
    remarks?: string;
  }
) => {
  const response = await api.put(
    "/attendance/check-out",
    data || {}
  );

  return response.data;
};

export const updateAttendance = async (
  id: string,
  data: {
    checkIn?: string;
    checkOut?: string;
    status?: string;
    remarks?: string;
  }
) => {
  const response = await api.put(
    `/attendance/${id}`,
    data
  );

  return response.data;
};

export const getMonthlyAttendanceReport =
  async (
    employeeId: string,
    month: number,
    year: number
  ) => {
    const response = await api.get(
      `/attendance/report/${employeeId}`,
      {
        params: {
          month,
          year,
        },
      }
    );

    return response.data;
  };

  