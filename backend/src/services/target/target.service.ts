import prisma from "../../config/prisma";
import { CreateTargetRequest } from "../../types/target.types";

export const createTarget = async (
  data: CreateTargetRequest
) => {
  // Check Employee
  const employee = await prisma.employee.findUnique({
    where: {
      id: data.employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee Not Found");
  }

  // Check Duplicate Target
  const existingTarget = await prisma.employeeTarget.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
      },
    },
  });

  if (existingTarget) {
    throw new Error(
      "Target Already Exists For This Month"
    );
  }

  // Create Target
  const target = await prisma.employeeTarget.create({
    data: {
      employeeId: data.employeeId,

      month: data.month,

      year: data.year,

      brokerageTarget: data.brokerageTarget,

      dematTarget: data.dematTarget,

      revenueTarget: data.revenueTarget,
    },

    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Employee Target Created Successfully",
    target,
  };
};

export const getTargets = async (
  page: number,
  limit: number,
  search?: string,
  month?: number,
  year?: number,
  employeeId?: string

) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search Employee Name
  if (search) {
    where.employee = {
      name: {
        contains: search,
        mode: "insensitive",
      },
    };
  }

  if (employeeId) {
  where.employeeId = employeeId;
}

  // Filter Month
  if (month) {
    where.month = month;
  }

  // Filter Year
  if (year) {
    where.year = year;
  }

  const total = await prisma.employeeTarget.count({
    where,
  });

  const targets = await prisma.employeeTarget.findMany({
    where,

    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
    },

    orderBy: [
      {
        year: "desc",
      },
      {
        month: "desc",
      },
      {
        createdAt: "desc",
      },
    ],

    skip,
    take: limit,
  });

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    targets,
  };
};

export const getTargetById = async (id: string) => {
  const target = await prisma.employeeTarget.findUnique({
    where: {
      id,
    },

    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
    },
  });

  if (!target) {
    throw new Error("Employee Target Not Found");
  }

  return {
    success: true,
    target,
  };
};

import { UpdateTargetRequest } from "../../types/target.types";

export const updateTarget = async (
  id: string,
  data: UpdateTargetRequest
) => {
  // Check Target Exists
  const target = await prisma.employeeTarget.findUnique({
    where: {
      id,
    },
  });

  if (!target) {
    throw new Error("Employee Target Not Found");
  }

  // Update Target
  const updatedTarget = await prisma.employeeTarget.update({
    where: {
      id,
    },

    data: {
      brokerageTarget:
        data.brokerageTarget ?? target.brokerageTarget,

      dematTarget:
        data.dematTarget ?? target.dematTarget,

      revenueTarget:
        data.revenueTarget ?? target.revenueTarget,

      achievedAmount:
        data.achievedAmount ?? target.achievedAmount,
    },

    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Employee Target Updated Successfully",
    target: updatedTarget,
  };
};