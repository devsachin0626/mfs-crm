import prisma from "../../config/prisma";

import {
  CreateFollowUpRequest, UpdateFollowUpRequest
} from "../../types/follow-up.types";

export const createFollowUp = async (
  data: CreateFollowUpRequest
) => {
  // Check Lead exists
  const lead = await prisma.lead.findUnique({
    where: {
      id: data.leadId,
    },
  });

  if (!lead) {
    throw new Error("Lead Not Found");
  }

  // Check Employee if provided
  if (data.employeeId !== undefined) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: data.employeeId,
      },
    });

    if (!employee) {
      throw new Error("Employee Not Found");
    }
  }

  // Validate Follow-Up Date
  const followUpDate = new Date(data.followUpDate);

  if (isNaN(followUpDate.getTime())) {
    throw new Error("Invalid Follow Up Date");
  }

  // Create Follow-Up
  const followUp = await prisma.followUp.create({
    data: {
      leadId: data.leadId,
      employeeId: data.employeeId,
      followUpDate,
      remarks: data.remarks,
      isCompleted: data.isCompleted ?? false,
    },
  });

  return {
    success: true,
    message: "Follow Up Created Successfully",
    followUp,
  };
};

export const getFollowUps = async (
  page: number,
  limit: number,
  leadId?: string,
  employeeId?: string,
  isCompleted?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: {
    leadId?: string;
    employeeId?: string;
    isCompleted?: boolean;
  } = {};

  // Filter by Lead
  if (leadId) {
    where.leadId = leadId;
  }

  // Filter by Employee
  if (employeeId) {
    where.employeeId = employeeId;
  }

  // Filter by Completion Status
  if (isCompleted !== undefined) {
    where.isCompleted = isCompleted;
  }

  // Total count
  const total = await prisma.followUp.count({
    where,
  });

  // Get FollowUps
  const followUps = await prisma.followUp.findMany({
    where,

    orderBy: {
      followUpDate: "asc",
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
    followUps,
  };
};

export const getFollowUpById = async (id: string) => {
  const followUp = await prisma.followUp.findUnique({
    where: {
      id,
    },
  });

  if (!followUp) {
    throw new Error("Follow Up Not Found");
  }

  return {
    success: true,
    followUp,
  };
};

export const updateFollowUp = async (
  id: string,
  data: UpdateFollowUpRequest
) => {
  // Check FollowUp exists
  const existingFollowUp = await prisma.followUp.findUnique({
    where: {
      id,
    },
  });

  if (!existingFollowUp) {
    throw new Error("Follow Up Not Found");
  }

  // Check Lead if leadId is being updated
  if (data.leadId !== undefined) {
    const lead = await prisma.lead.findUnique({
      where: {
        id: data.leadId,
      },
    });

    if (!lead) {
      throw new Error("Lead Not Found");
    }
  }

  // Check Employee if employeeId is being updated
  if (data.employeeId !== undefined) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: data.employeeId,
      },
    });

    if (!employee) {
      throw new Error("Employee Not Found");
    }
  }

  // Validate Follow-Up Date if provided
  let followUpDate: Date | undefined;

  if (data.followUpDate !== undefined) {
    followUpDate = new Date(data.followUpDate);

    if (isNaN(followUpDate.getTime())) {
      throw new Error("Invalid Follow Up Date");
    }
  }

  // Update FollowUp
  const followUp = await prisma.followUp.update({
    where: {
      id,
    },

    data: {
      ...(data.leadId !== undefined && {
        leadId: data.leadId,
      }),

      ...(data.employeeId !== undefined && {
        employeeId: data.employeeId,
      }),

      ...(followUpDate !== undefined && {
        followUpDate,
      }),

      ...(data.remarks !== undefined && {
        remarks: data.remarks,
      }),

      ...(data.isCompleted !== undefined && {
        isCompleted: data.isCompleted,
      }),
    },
  });

  return {
    success: true,
    message: "Follow Up Updated Successfully",
    followUp,
  };
};

export const deleteFollowUp = async (id: string) => {
  // Check FollowUp exists
  const existingFollowUp = await prisma.followUp.findUnique({
    where: {
      id,
    },
  });

  if (!existingFollowUp) {
    throw new Error("Follow Up Not Found");
  }

  // Delete FollowUp
  const followUp = await prisma.followUp.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Follow Up Deleted Successfully",
    followUp,
  };
};