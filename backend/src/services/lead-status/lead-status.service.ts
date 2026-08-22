import prisma from "../../config/prisma";
import { CreateLeadStatusRequest,UpdateLeadStatusRequest } from "../../types/lead-status.types";

export const createLeadStatus = async (
  data: CreateLeadStatusRequest
) => {
  // Check duplicate Lead Status
  const existingLeadStatus = await prisma.leadStatus.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingLeadStatus) {
    throw new Error("Lead Status Already Exists");
  }

  // Create Lead Status
  const leadStatus = await prisma.leadStatus.create({
    data: {
      name: data.name,
      color: data.color,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });

  return {
    success: true,
    message: "Lead Status Created Successfully",
    leadStatus,
  };
};

export const getLeadStatuses = async (
  page: number,
  limit: number,
  search?: string,
  isActive?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: {
    name?: {
      contains: string;
      mode: "insensitive";
    };
    isActive?: boolean;
  } = {};

  // Search by status name
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  // Active / Inactive filter
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Total count
  const total = await prisma.leadStatus.count({
    where,
  });

  // Get Lead Statuses
  const leadStatuses = await prisma.leadStatus.findMany({
    where,

    orderBy: [
      {
        sortOrder: "asc",
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
    leadStatuses,
  };
};

export const getLeadStatusById = async (id: string) => {
  const leadStatus = await prisma.leadStatus.findUnique({
    where: {
      id,
    },
  });

  if (!leadStatus) {
    throw new Error("Lead Status Not Found");
  }

  return {
    success: true,
    leadStatus,
  };
};


export const updateLeadStatus = async (
  id: string,
  data: UpdateLeadStatusRequest
) => {
  // Check Lead Status Exists
  const existingLeadStatus = await prisma.leadStatus.findUnique({
    where: {
      id,
    },
  });

  if (!existingLeadStatus) {
    throw new Error("Lead Status Not Found");
  }

  // Update Lead Status
  const leadStatus = await prisma.leadStatus.update({
    where: {
      id,
    },

    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.color !== undefined && {
        color: data.color,
      }),

      ...(data.sortOrder !== undefined && {
        sortOrder: data.sortOrder,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
  });

  return {
    success: true,
    message: "Lead Status Updated Successfully",
    leadStatus,
  };
};

export const deleteLeadStatus = async (id: string) => {
  // Check Lead Status Exists
  const existingLeadStatus = await prisma.leadStatus.findUnique({
    where: {
      id,
    },
  });

  if (!existingLeadStatus) {
    throw new Error("Lead Status Not Found");
  }

  // Delete Lead Status
  const leadStatus = await prisma.leadStatus.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Lead Status Deleted Successfully",
    leadStatus,
  };
};

