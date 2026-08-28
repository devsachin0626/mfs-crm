import api from "./api";

/* ============================
   TYPES
============================ */

export interface Holiday {
  id: string;

  title: string;

  holidayDate: string;

  description?:
    | string
    | null;

  createdAt?: string;

  updatedAt?: string;
}

export interface HolidayPayload {
  title: string;

  holidayDate: string;

  description?:
    | string
    | null;
}

interface HolidayListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  holidays: Holiday[];
}

interface HolidayResponse {
  success: boolean;

  message?: string;

  holiday: Holiday;
}

/* ============================
   GET HOLIDAYS
============================ */

export const getHolidays =
  async (
    params?: {
      page?: number;

      limit?: number;

      search?: string;
    }
  ): Promise<
    HolidayListResponse
  > => {
    const response =
      await api.get<HolidayListResponse>(
        "/holidays",
        {
          params: {
            page:
              params?.page ??
              1,

            limit:
              params?.limit ??
              100,

            search:
              params?.search
                ?.trim() ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   GET HOLIDAY BY ID
============================ */

export const getHolidayById =
  async (
    id: string
  ): Promise<Holiday> => {
    const response =
      await api.get<HolidayResponse>(
        `/holidays/${id}`
      );

    return response.data
      .holiday;
  };

/* ============================
   CREATE
============================ */

export const createHoliday =
  async (
    data:
      HolidayPayload
  ): Promise<Holiday> => {
    const response =
      await api.post<HolidayResponse>(
        "/holidays",
        data
      );

    return response.data
      .holiday;
  };

/* ============================
   UPDATE
============================ */

export const updateHoliday =
  async (
    id: string,
    data:
      Partial<HolidayPayload>
  ): Promise<Holiday> => {
    const response =
      await api.put<HolidayResponse>(
        `/holidays/${id}`,
        data
      );

    return response.data
      .holiday;
  };

/* ============================
   DELETE
============================ */

export const deleteHoliday =
  async (
    id: string
  ): Promise<void> => {
    await api.delete(
      `/holidays/${id}`
    );
  };

/* ============================
   SERVICE
============================ */

const holidayService = {
  getHolidays,

  getHolidayById,

  createHoliday,

  updateHoliday,

  deleteHoliday,
};

export default holidayService;