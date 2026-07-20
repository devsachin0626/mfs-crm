import prisma from "../../config/prisma";
import { CreateLeadRequest, UpdateLeadRequest ,AssignLeadRequest, ChangeLeadStatusRequest, 
    CreateFollowUpRequest, FollowUpQuery , LeadQuery } from "../../types/lead.types";

export const createLead = async (
  data: CreateLeadRequest,
  createdById: string
) => {
  const {
    name,
    mobile,
    email,
    city,
    state,
    address,
    sourceId,
    remarks,
    assignedEmployeeId,
  } = data;

  // Required Validation
  if (!mobile) {
    throw new Error("Mobile Number is required");
  }

  // Duplicate Mobile Check
  const mobileExists = await prisma.lead.findFirst({
    where: {
      mobile,
    },
  });

  if (mobileExists) {
    throw new Error("Lead already exists with this Mobile Number");
  }

  // Duplicate Email Check
  if (email) {
    const emailExists = await prisma.lead.findFirst({
      where: {
        email,
      },
    });

    if (emailExists) {
      throw new Error("Lead already exists with this Email");
    }
  }

  // Default Status = NEW
  const defaultStatus = await prisma.leadStatus.findFirst({
    where: {
      name: "NEW",
      isActive: true,
    },
  });

  if (!defaultStatus) {
    throw new Error("Default Lead Status (NEW) not found");
  }

  // Source Validation
  if (sourceId) {
    const source = await prisma.leadSource.findUnique({
      where: {
        id: sourceId,
      },
    });

    if (!source) {
      throw new Error("Invalid Lead Source");
    }
  }

  // Employee Validation
  if (assignedEmployeeId) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: assignedEmployeeId,
      },
    });

    if (!employee) {
      throw new Error("Assigned Employee not found");
    }
  }

  // Generate Lead Code
  const lastLead = await prisma.lead.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  let leadCode = "LD00001";

  if (lastLead) {
    const lastNumber = Number(
      lastLead.leadCode.replace("LD", "")
    );

    leadCode = `LD${String(lastNumber + 1).padStart(5, "0")}`;
  }

  // Create Lead
  const lead = await prisma.lead.create({
    data: {
      leadCode,
      name,
      mobile,
      email,
      city,
      state,
      address,
      sourceId,
      remarks,
      assignedEmployeeId,
      statusId: defaultStatus.id,
    },
    include: {
      status: true,
      source: true,
      assignedEmployee: true,
    },
  });

  return {
    success: true,
    message: "Lead Created Successfully",
    lead,
  };
};

export const getLeads = async (query: LeadQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search
  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        mobile: {
          contains: query.search,
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Status Filter
  if (query.status) {
    where.status = {
      name: query.status,
    };
  }

  // Employee Filter
  if (query.employeeId) {
    where.assignedEmployeeId = query.employeeId;
  }

  // Source Filter
  if (query.source) {
    where.source = {
      name: query.source,
    };
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        status: true,
        source: true,
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
      },
    }),

    prisma.lead.count({
      where,
    }),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    leads,
  };
};

export const getLeadById = async (id: string) => {
  const lead = await prisma.lead.findUnique({
    where: {
      id,
    },
    include: {
      status: true,
      source: true,
      assignedEmployee: {
        select: {
          id: true,
          employeeCode: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
      histories: {
        orderBy: {
          createdAt: "desc",
        },
      },
      followUps: {
        orderBy: {
          followUpDate: "desc",
        },
      },
      client: true,
    },
  });

  if (!lead) {
    throw new Error("Lead Not Found");
  }

  return {
    success: true,
    lead,
  };
};

export const updateLead = async (
  id: string,
  data: UpdateLeadRequest
) => {
  // Check Lead
  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) {
    throw new Error("Lead Not Found");
  }

  // Mobile Duplicate Check
  if (data.mobile) {
    const mobileExists = await prisma.lead.findFirst({
      where: {
        mobile: data.mobile,
        NOT: {
          id,
        },
      },
    });

    if (mobileExists) {
      throw new Error("Mobile Number already exists");
    }
  }

  // Status Validation
  if (data.statusId) {
    const status = await prisma.leadStatus.findUnique({
      where: {
        id: data.statusId,
      },
    });

    if (!status) {
      throw new Error("Invalid Lead Status");
    }
  }

  // Source Validation
  if (data.sourceId) {
    const source = await prisma.leadSource.findUnique({
      where: {
        id: data.sourceId,
      },
    });

    if (!source) {
      throw new Error("Invalid Lead Source");
    }
  }

  // Employee Validation
  if (data.assignedEmployeeId) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: data.assignedEmployeeId,
      },
    });

    if (!employee) {
      throw new Error("Invalid Employee");
    }
  }

  const updatedLead = await prisma.lead.update({
  where: {
    id,
  },
  data: {
    name: data.name,
    mobile: data.mobile,
    email: data.email,
    city: data.city,
    state: data.state,
    address: data.address,
    stage: data.stage,
    nextFollowUp: data.nextFollowUp,
    remarks: data.remarks,

    ...(data.sourceId && {
      source: {
        connect: {
          id: data.sourceId,
        },
      },
    }),

    ...(data.statusId && {
      status: {
        connect: {
          id: data.statusId,
        },
      },
    }),

    ...(data.assignedEmployeeId && {
      assignedEmployee: {
        connect: {
          id: data.assignedEmployeeId,
        },
      },
    }),
  },
  include: {
    status: true,
    source: true,
    assignedEmployee: true,
  },
});

  return {
    success: true,
    message: "Lead Updated Successfully",
    lead: updatedLead,
  };
};

export const assignLead = async (
  leadId: string,
  data: AssignLeadRequest
) => {
  // Check Lead
  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!lead) {
    throw new Error("Lead Not Found");
  }

  // Check Employee
  const employee = await prisma.employee.findUnique({
    where: {
      id: data.employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee Not Found");
  }

  // Already Assigned
  if (lead.assignedEmployeeId === data.employeeId) {
    throw new Error("Lead Already Assigned To This Employee");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update Lead
    const updatedLead = await tx.lead.update({
      where: {
        id: leadId,
      },
      data: {
        assignedEmployee: {
          connect: {
            id: data.employeeId,
          },
        },
      },
    });

    // Save Assignment History
    await tx.leadAssignmentHistory.create({
      data: {
        leadId,
        fromEmployeeId: lead.assignedEmployeeId,
        toEmployeeId: data.employeeId,
      },
    });

    return updatedLead;
  });

  return {
    success: true,
    message: "Lead Assigned Successfully",
    lead: result,
  };
};

export const changeLeadStatus = async (
  leadId: string,
  employeeId: string,
  data: ChangeLeadStatusRequest
) => {
  // Check Lead
  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!lead) {
    throw new Error("Lead Not Found");
  }

  // Check Status
  const status = await prisma.leadStatus.findUnique({
    where: {
      id: data.statusId,
    },
  });

  if (!status) {
    throw new Error("Invalid Lead Status");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update Lead
    const updatedLead = await tx.lead.update({
      where: {
        id: leadId,
      },
      data: {
        status: {
          connect: {
            id: data.statusId,
          },
        },
        remarks: data.remarks,
        lastCallAt: new Date(),
      },
      include: {
        status: true,
      },
    });

    // Save History
    await tx.leadHistory.create({
      data: {
        leadId,
        employeeId,
        statusId: data.statusId,
        remarks: data.remarks,
      },
    });

    return updatedLead;
  });

  return {
    success: true,
    message: "Lead Status Updated Successfully",
    lead: result,
  };
};

export const createFollowUp = async (
  leadId: string,
  employeeId: string,
  data: CreateFollowUpRequest
) => {
  // Check Lead
  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!lead) {
    throw new Error("Lead Not Found");
  }

  // Check Employee
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee Not Found");
  }

  // Past Date Validation
  if (new Date(data.followUpDate) < new Date()) {
    throw new Error("Follow-up date cannot be in the past");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create Follow-up
    const followUp = await tx.followUp.create({
      data: {
        leadId,
        employeeId,
        followUpDate: data.followUpDate,
        remarks: data.remarks,
      },
    });

    // Update Lead
    await tx.lead.update({
      where: {
        id: leadId,
      },
      data: {
        nextFollowUp: data.followUpDate,
      },
    });

    return followUp;
  });

  return {
    success: true,
    message: "Follow-up Created Successfully",
    followUp: result,
  };
};

export const getFollowUps = async (query: FollowUpQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.isCompleted !== undefined) {
    where.isCompleted = query.isCompleted === "true";
  }

  if (query.search) {
    where.lead = {
      name: {
        contains: query.search,
        mode: "insensitive",
      },
    };
  }

  const [followUps, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        followUpDate: "asc",
      },
      include: {
        lead: {
          select: {
            id: true,
            leadCode: true,
            name: true,
            mobile: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
          },
        },
      },
    }),

    prisma.followUp.count({ where }),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    followUps,
  };
};

export const completeFollowUp = async (followUpId: string) => {
  const followUp = await prisma.followUp.findUnique({
    where: { id: followUpId },
  });

  if (!followUp) {
    throw new Error("Follow-up Not Found");
  }

  if (followUp.isCompleted) {
    throw new Error("Follow-up Already Completed");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedFollowUp = await tx.followUp.update({
      where: { id: followUpId },
      data: {
        isCompleted: true,
      },
    });

    await tx.lead.update({
      where: {
        id: followUp.leadId,
      },
      data: {
        nextFollowUp: null,
      },
    });

    return updatedFollowUp;
  });

  return {
    success: true,
    message: "Follow-up Completed Successfully",
    followUp: result,
  };
};