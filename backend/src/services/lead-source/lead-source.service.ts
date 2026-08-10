import prisma from "../../config/prisma";
import { CreateLeadSourceRequest , UpdateLeadSourceRequest } from "../../types/lead-source.types";

export const createLeadSource = async (
  data: CreateLeadSourceRequest
) => {
  const existingLeadSource = await prisma.leadSource.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingLeadSource) {
    throw new Error("Lead Source Already Exists");
  }

  const leadSource = await prisma.leadSource.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    },
  });

  return {
    success: true,
    message: "Lead Source Created Successfully",
    leadSource,
  };
};

export const getLeadSources = async (
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

  // Search by name
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
  const total = await prisma.leadSource.count({
    where,
  });

  // Get Lead Sources
  const leadSources = await prisma.leadSource.findMany({
    where,

    orderBy: {
      createdAt: "desc",
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
    leadSources,
  };
};

export const getLeadSourceById = async (id: string) => {
  const leadSource = await prisma.leadSource.findUnique({
    where: {
      id,
    },
  });

  if (!leadSource) {
    throw new Error("Lead Source Not Found");
  }

  return {
    success: true,
    leadSource,
  };
};

export const updateLeadSource = async (
  id: string,
  data: UpdateLeadSourceRequest
) => {
  // Check Lead Source Exists
  const existingLeadSource = await prisma.leadSource.findUnique({
    where: {
      id,
    },
  });

  if (!existingLeadSource) {
    throw new Error("Lead Source Not Found");
  }

  // Update Lead Source
  const leadSource = await prisma.leadSource.update({
    where: {
      id,
    },

    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
  });

  return {
    success: true,
    message: "Lead Source Updated Successfully",
    leadSource,
  };
};

export const deleteLeadSource = async (id: string) => {
  // Check Lead Source Exists
  const existingLeadSource = await prisma.leadSource.findUnique({
    where: {
      id,
    },
  });

  if (!existingLeadSource) {
    throw new Error("Lead Source Not Found");
  }

  // Delete Lead Source
  const leadSource = await prisma.leadSource.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Lead Source Deleted Successfully",
    leadSource,
  };
};