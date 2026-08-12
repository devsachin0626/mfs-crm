import prisma from "../../config/prisma";

import {
  CreateLeadHistoryRequest,UpdateLeadHistoryRequest
} from "../../types/lead-history.types";

export const createLeadHistory = async (
  data: CreateLeadHistoryRequest
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

  // Check Lead Status if provided
  if (data.statusId !== undefined) {
    const status = await prisma.leadStatus.findUnique({
      where: {
        id: data.statusId,
      },
    });

    if (!status) {
      throw new Error("Lead Status Not Found");
    }
  }

  // Create Lead History
  const leadHistory = await prisma.leadHistory.create({
    data: {
      leadId: data.leadId,
      employeeId: data.employeeId,
      statusId: data.statusId,
      remarks: data.remarks,
    },
  });

  return {
    success: true,
    message: "Lead History Created Successfully",
    leadHistory,
  };
};

export const getLeadHistories = async (
  page: number,
  limit: number,
  leadId?: string,
  employeeId?: string,
  statusId?: string
) => {
  const skip = (page - 1) * limit;

  const where: {
    leadId?: string;
    employeeId?: string;
    statusId?: string;
  } = {};

  // Filter by Lead
  if (leadId) {
    where.leadId = leadId;
  }

  // Filter by Employee
  if (employeeId) {
    where.employeeId = employeeId;
  }

  // Filter by Lead Status
  if (statusId) {
    where.statusId = statusId;
  }

  // Total count
  const total = await prisma.leadHistory.count({
    where,
  });

  // Get Lead Histories
  const leadHistories = await prisma.leadHistory.findMany({
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
    leadHistories,
  };
};

export const getLeadHistoryById = async (id: string) => {
  const leadHistory = await prisma.leadHistory.findUnique({
    where: {
      id,
    },
  });

  if (!leadHistory) {
    throw new Error("Lead History Not Found");
  }

  return {
    success: true,
    leadHistory,
  };
};

export const updateLeadHistory = async (
  id: string,
  data: UpdateLeadHistoryRequest
) => {
  // Check Lead History exists
  const existingHistory = await prisma.leadHistory.findUnique({
    where: {
      id,
    },
  });

  if (!existingHistory) {
    throw new Error("Lead History Not Found");
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

  // Check Lead Status if statusId is being updated
  if (data.statusId !== undefined) {
    const status = await prisma.leadStatus.findUnique({
      where: {
        id: data.statusId,
      },
    });

    if (!status) {
      throw new Error("Lead Status Not Found");
    }
  }

  // Update Lead History
  const leadHistory = await prisma.leadHistory.update({
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

      ...(data.statusId !== undefined && {
        statusId: data.statusId,
      }),

      ...(data.remarks !== undefined && {
        remarks: data.remarks,
      }),
    },
  });

  return {
    success: true,
    message: "Lead History Updated Successfully",
    leadHistory,
  };
};


export const deleteLeadHistory = async (id: string) => {
  // Check Lead History exists
  const existingHistory = await prisma.leadHistory.findUnique({
    where: {
      id,
    },
  });

  if (!existingHistory) {
    throw new Error("Lead History Not Found");
  }

  // Delete Lead History
  const leadHistory = await prisma.leadHistory.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Lead History Deleted Successfully",
    leadHistory,
  };
};