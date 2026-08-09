import prisma from "../../config/prisma";
import { CreateHolidayRequest ,UpdateHolidayRequest} from "../../types/holiday.types";

export const createHoliday = async (
  data: CreateHolidayRequest
) => {
  const holiday = await prisma.holiday.create({
    data: {
      title: data.title,
      holidayDate: new Date(data.holidayDate),
      description: data.description,
    },
  });

  return {
    success: true,
    message: "Holiday Created Successfully",
    holiday,
  };
};

export const getHolidays = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search by Holiday Title
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  // Total Holidays
  const total = await prisma.holiday.count({
    where,
  });

  // Get Holidays
  const holidays = await prisma.holiday.findMany({
    where,

    orderBy: {
      holidayDate: "asc",
    },

    skip,
    take: limit,
  });

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    holidays,
  };
};

export const getHolidayById = async (id: string) => {
  const holiday = await prisma.holiday.findUnique({
    where: {
      id,
    },
  });

  if (!holiday) {
    throw new Error("Holiday Not Found");
  }

  return {
    success: true,
    holiday,
  };
};

export const updateHoliday = async (
  id: string,
  data: UpdateHolidayRequest
) => {
  // Check Holiday Exists
  const existingHoliday = await prisma.holiday.findUnique({
    where: {
      id,
    },
  });

  if (!existingHoliday) {
    throw new Error("Holiday Not Found");
  }

  // Update Holiday
  const holiday = await prisma.holiday.update({
    where: {
      id,
    },

    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),

      ...(data.holidayDate !== undefined && {
        holidayDate: new Date(data.holidayDate),
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
  });

  return {
    success: true,
    message: "Holiday Updated Successfully",
    holiday,
  };
};

export const deleteHoliday = async (id: string) => {
  // Check Holiday Exists
  const existingHoliday = await prisma.holiday.findUnique({
    where: {
      id,
    },
  });

  if (!existingHoliday) {
    throw new Error("Holiday Not Found");
  }

  // Delete Holiday
  const holiday = await prisma.holiday.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Holiday Deleted Successfully",
    holiday,
  };
};