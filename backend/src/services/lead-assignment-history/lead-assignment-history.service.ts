import prisma from "../../config/prisma";
import {
  CreateLeadAssignmentHistoryRequest,UpdateLeadAssignmentHistoryRequest
} from "../../types/lead-assignment-history.types";

export const createLeadAssignmentHistory = async (
  data: CreateLeadAssignmentHistoryRequest
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

  // Check destination Employee exists
  const toEmployee = await prisma.employee.findUnique({
    where: {
      id: data.toEmployeeId,
    },
  });

  if (!toEmployee) {
    throw new Error("To Employee Not Found");
  }

  // Check source Employee if provided
  if (data.fromEmployeeId) {
    const fromEmployee = await prisma.employee.findUnique({
      where: {
        id: data.fromEmployeeId,
      },
    });

    if (!fromEmployee) {
      throw new Error("From Employee Not Found");
    }
  }

  // Create Assignment History
  const assignmentHistory =
    await prisma.leadAssignmentHistory.create({
      data: {
        leadId: data.leadId,
        fromEmployeeId: data.fromEmployeeId,
        toEmployeeId: data.toEmployeeId,
        reason: data.reason,
      },
    });

  return {
    success: true,
    message: "Lead Assignment History Created Successfully",
    assignmentHistory,
  };
};

export const getLeadAssignmentHistories = async (
  page: number,
  limit: number,
  leadId?: string,
  employeeId?: string
) => {
  const skip = (page - 1) * limit;

  const where: {
    leadId?: string;
    OR?: {
      fromEmployeeId?: string;
      toEmployeeId?: string;
    }[];
  } = {};

  // Filter by Lead
  if (leadId) {
    where.leadId = leadId;
  }

  // Filter by Employee
  if (employeeId) {
    where.OR = [
      {
        fromEmployeeId: employeeId,
      },
      {
        toEmployeeId: employeeId,
      },
    ];
  }

  // Total count
  const total = await prisma.leadAssignmentHistory.count({
    where,
  });

  // Get Assignment Histories
  const assignmentHistories =
    await prisma.leadAssignmentHistory.findMany({
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
    assignmentHistories,
  };
};

export const getLeadAssignmentHistoryById = async (id: string) => {
  const assignmentHistory =
    await prisma.leadAssignmentHistory.findUnique({
      where: {
        id,
      },
    });

  if (!assignmentHistory) {
    throw new Error("Lead Assignment History Not Found");
  }

  return {
    success: true,
    assignmentHistory,
  };
};

export const updateLeadAssignmentHistory = async (
  id: string,
  data: UpdateLeadAssignmentHistoryRequest
) => {
  // Check history exists
  const existingHistory =
    await prisma.leadAssignmentHistory.findUnique({
      where: {
        id,
      },
    });

  if (!existingHistory) {
    throw new Error("Lead Assignment History Not Found");
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

  // Check destination Employee
  if (data.toEmployeeId !== undefined) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: data.toEmployeeId,
      },
    });

    if (!employee) {
      throw new Error("To Employee Not Found");
    }
  }

  // Check source Employee if provided
  if (data.fromEmployeeId !== undefined) {
    if (data.fromEmployeeId === null) {
      // Allow removing source employee
    } else {
      const employee = await prisma.employee.findUnique({
        where: {
          id: data.fromEmployeeId,
        },
      });

      if (!employee) {
        throw new Error("From Employee Not Found");
      }
    }
  }

  // Update Assignment History
  const assignmentHistory =
    await prisma.leadAssignmentHistory.update({
      where: {
        id,
      },

      data: {
        ...(data.leadId !== undefined && {
          leadId: data.leadId,
        }),

        ...(data.fromEmployeeId !== undefined && {
          fromEmployeeId: data.fromEmployeeId,
        }),

        ...(data.toEmployeeId !== undefined && {
          toEmployeeId: data.toEmployeeId,
        }),

        ...(data.reason !== undefined && {
          reason: data.reason,
        }),
      },
    });

  return {
    success: true,
    message: "Lead Assignment History Updated Successfully",
    assignmentHistory,
  };
};

export const deleteLeadAssignmentHistory = async (id: string) => {
  // Check history exists
  const existingHistory =
    await prisma.leadAssignmentHistory.findUnique({
      where: {
        id,
      },
    });

  if (!existingHistory) {
    throw new Error("Lead Assignment History Not Found");
  }

  // Delete Assignment History
  const assignmentHistory =
    await prisma.leadAssignmentHistory.delete({
      where: {
        id,
      },
    });

  return {
    success: true,
    message: "Lead Assignment History Deleted Successfully",
    assignmentHistory,
  };
};