import prisma from "../../config/prisma";
import { CreateLeadRequest, UpdateLeadRequest ,AssignLeadRequest, ChangeLeadStatusRequest, 
    CreateFollowUpRequest, FollowUpQuery , LeadQuery } from "../../types/lead.types";

    import {
  SaveCallOutcomeRequest,
} from "../../types/lead.types";
import type {
  ChangeLeadStageRequest,
} from "../../types/lead.types";

import {
  calculateLeadAging,
} from "../../utils/leadAging";



import {
  getLeadAccessWhere,
  checkLeadAccess,
} from "../../utils/leadAccess";

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

export const getLeads = async (
  query: LeadQuery,
  currentEmployee: any
) => {
  const page =
    Number(query.page) || 1;

  const limit =
    Number(query.limit) || 10;

  const skip =
    (page - 1) * limit;

  const where: any = {};

  /* ============================
     ROLE BASED ACCESS
  ============================ */

  const accessWhere =
    await getLeadAccessWhere(
      currentEmployee
    );

  where.AND = [
    accessWhere,
  ];

  /* ============================
     SEARCH
  ============================ */

  if (query.search) {
    where.OR = [
      {
        leadCode: {
          contains:
            query.search,
          mode: "insensitive",
        },
      },

      {
        name: {
          contains:
            query.search,
          mode: "insensitive",
        },
      },

      {
        mobile: {
          contains:
            query.search,
        },
      },

      {
        email: {
          contains:
            query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  /* ============================
     STATUS FILTER
  ============================ */

  if (query.status) {
    where.status = {
      name:
        query.status,
    };
  }

  /* ============================
     EMPLOYEE FILTER
  ============================ */

  if (query.employeeId) {
    where.assignedEmployeeId =
      query.employeeId;
  }

  /* ============================
     SOURCE FILTER
  ============================ */

  if (query.source) {
    where.source = {
      name:
        query.source,
    };
  }

  /* ============================
     STAGE FILTER
  ============================ */

  if (query.stage) {
    where.stage =
      query.stage;
  }

  /* ============================
     FOLLOW-UP FILTER
  ============================ */

  if (query.followUp) {
    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() +
        1
    );

    if (
      query.followUp ===
      "TODAY"
    ) {
      where.nextFollowUp = {
        gte: today,
        lt: tomorrow,
      };
    }

    if (
      query.followUp ===
      "OVERDUE"
    ) {
      where.nextFollowUp = {
        lt: today,
      };
    }
  }

  /* ============================
     SMART VIEWS
  ============================ */

  if (query.smartView) {
    const now =
      new Date();

    if (
      query.smartView ===
      "MY_NEW"
    ) {
      where.stage =
        "NEW";

      /*
       Role access already makes
       EMPLOYEE see only own leads.

       ADMIN / HR / TL can additionally
       use employeeId filter.
      */
    }

    if (
      query.smartView ===
      "HOT"
    ) {
      const next24Hours =
        new Date(
          now.getTime() +
            24 *
              60 *
              60 *
              1000
        );

      /*
       HOT =
       overdue OR due within 24 hours
      */

      where.nextFollowUp = {
        lte: next24Hours,
      };

      where.isConverted =
        false;
    }

    if (
      query.smartView ===
      "OVERDUE"
    ) {
      where.nextFollowUp = {
        lt: now,
      };

      where.isConverted =
        false;
    }

    if (
      query.smartView ===
      "UNASSIGNED"
    ) {
      where.assignedEmployeeId =
        null;
    }

    if (
      query.smartView ===
      "NO_FOLLOW_UP"
    ) {
      where.nextFollowUp =
        null;

      where.isConverted =
        false;
    }

    if (
      query.smartView ===
      "CONVERTED"
    ) {
      where.stage =
        "CONVERTED";
    }

    if (
      query.smartView ===
      "LOST"
    ) {
      where.stage =
        "LOST";
    }
  }

  /* ============================
     GET LEADS
  ============================ */

  const [
    leads,
    total,
  ] =
    await Promise.all([
      prisma.lead.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          status: true,

          source: true,

          assignedEmployee: {
            select: {
              id: true,
              name: true,
              employeeCode:
                true,
            },
          },
        },
      }),

      prisma.lead.count({
        where,
      }),
    ]);

  /* ============================
     ADD AGING
  ============================ */

  const leadsWithAging =
    leads.map(
      (lead) => ({
        ...lead,

        aging:
          calculateLeadAging({
            createdAt:
              lead.createdAt,

            updatedAt:
              lead.updatedAt,

            lastCallAt:
              lead.lastCallAt,

            nextFollowUp:
              lead.nextFollowUp,
          }),
      })
    );

  /* ============================
     RETURN
  ============================ */

  return {
    success: true,

    total,

    page,

    limit,

    totalPages:
      Math.ceil(
        total / limit
      ),

    leads:
      leadsWithAging,
  };
};

export const getLeadById = async (
  id: string,
  currentEmployee: any
) => {
  /* ============================
     ROLE BASED ACCESS
  ============================ */

  const accessWhere =
    await getLeadAccessWhere(
      currentEmployee
    );

  /* ============================
     GET LEAD
  ============================ */

  const lead =
    await prisma.lead.findFirst({
      where: {
        AND: [
          {
            id,
          },

          accessWhere,
        ],
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

        /* ============================
           LEAD STATUS / CALL HISTORY
        ============================ */

        histories: {
          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            employee: {
              select: {
                id: true,
                employeeCode:
                  true,
                name: true,
              },
            },

            status: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },

        /* ============================
           FOLLOW UPS
        ============================ */

        followUps: {
          orderBy: {
            followUpDate:
              "desc",
          },

          include: {
            employee: {
              select: {
                id: true,
                employeeCode:
                  true,
                name: true,
              },
            },
          },
        },

        /* ============================
           ASSIGNMENT HISTORY
        ============================ */

        assignmentHistory: {
          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            fromEmployee: {
              select: {
                id: true,
                employeeCode:
                  true,
                name: true,
              },
            },

            toEmployee: {
              select: {
                id: true,
                employeeCode:
                  true,
                name: true,
              },
            },
          },
        },

        /* ============================
           CLIENT
        ============================ */

        client: true,
      },
    });

  if (!lead) {
    /*
     Same response for missing lead
     and unauthorized lead.
     This prevents exposing whether
     another employee's lead exists.
    */

    throw new Error(
      "Lead Not Found"
    );
  }

  /* ============================
     ADD AGING
  ============================ */

  const leadWithAging = {
    ...lead,

    aging:
      calculateLeadAging({
        createdAt:
          lead.createdAt,

        updatedAt:
          lead.updatedAt,

        lastCallAt:
          lead.lastCallAt,

        nextFollowUp:
          lead.nextFollowUp,
      }),
  };

  return {
    success: true,

    lead:
      leadWithAging,
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
    data: ChangeLeadStatusRequest,
  currentEmployee: any
) => {

  
await checkLeadAccess(
  leadId,
  currentEmployee
);

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
  data: CreateFollowUpRequest,
  currentEmployee: any
) => {
  /* ============================
     ACCESS CHECK
  ============================ */

  await checkLeadAccess(
    leadId,
    currentEmployee
  );

  /* ============================
     CHECK LEAD
  ============================ */

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  /* ============================
     CHECK EMPLOYEE
  ============================ */

  const employee =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  /* ============================
     DATE VALIDATION
  ============================ */

  const followUpDate =
    new Date(
      data.followUpDate
    );

  if (
    Number.isNaN(
      followUpDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid Follow-up Date"
    );
  }

  if (
    followUpDate <
    new Date()
  ) {
    throw new Error(
      "Follow-up date cannot be in the past"
    );
  }

  /* ============================
     TRANSACTION
  ============================ */

  const result =
    await prisma.$transaction(
      async (tx) => {
        const followUp =
          await tx.followUp.create({
            data: {
              leadId,
              employeeId,
              followUpDate,
              remarks:
                data.remarks,
            },
          });

        await tx.lead.update({
          where: {
            id: leadId,
          },

          data: {
            nextFollowUp:
              followUpDate,
          },
        });

        return followUp;
      }
    );

  return {
    success: true,

    message:
      "Follow-up Created Successfully",

    followUp: result,
  };
};
export const getFollowUps = async (
  query: FollowUpQuery,
  currentEmployee: any
) => {
  const page =
    Number(query.page) || 1;

  const limit =
    Number(query.limit) || 10;

  const skip =
    (page - 1) * limit;

  const where: any = {};

  /* ============================
     ROLE BASED ACCESS
  ============================ */

  const accessWhere =
    await getLeadAccessWhere(
      currentEmployee
    );

  where.lead = {
    AND: [
      accessWhere,
    ],
  };

  /* ============================
     EMPLOYEE FILTER
  ============================ */

  if (query.employeeId) {
    where.employeeId =
      query.employeeId;
  }

  /* ============================
     COMPLETED FILTER
  ============================ */

  if (
    query.isCompleted !==
    undefined
  ) {
    where.isCompleted =
      query.isCompleted ===
      "true";
  }

  /* ============================
     SEARCH
  ============================ */

  if (query.search) {
    where.lead = {
      AND: [
        accessWhere,

        {
          OR: [
            {
              name: {
                contains:
                  query.search,
                mode:
                  "insensitive",
              },
            },

            {
              leadCode: {
                contains:
                  query.search,
                mode:
                  "insensitive",
              },
            },

            {
              mobile: {
                contains:
                  query.search,
              },
            },
          ],
        },
      ],
    };
  }

  /* ============================
     DATE FILTERS
  ============================ */

  if (query.view) {
    const now =
      new Date();

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() +
        1
    );

    if (
      query.view ===
      "TODAY"
    ) {
      where.followUpDate = {
        gte: today,
        lt: tomorrow,
      };

      where.isCompleted =
        false;
    }

    if (
      query.view ===
      "OVERDUE"
    ) {
      where.followUpDate = {
        lt: now,
      };

      where.isCompleted =
        false;
    }

    if (
      query.view ===
      "UPCOMING"
    ) {
      where.followUpDate = {
        gte: tomorrow,
      };

      where.isCompleted =
        false;
    }
  }

  /* ============================
     GET DATA
  ============================ */

  const [
    followUps,
    total,
  ] =
    await Promise.all([
      prisma.followUp.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          followUpDate:
            "asc",
        },

        include: {
          lead: {
            select: {
              id: true,
              leadCode: true,
              name: true,
              mobile: true,
              email: true,
              city: true,

              status: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },

              assignedEmployee: {
                select: {
                  id: true,
                  employeeCode:
                    true,
                  name: true,
                },
              },
            },
          },

          employee: {
            select: {
              id: true,
              employeeCode:
                true,
              name: true,
            },
          },
        },
      }),

      prisma.followUp.count({
        where,
      }),
    ]);

  return {
    success: true,

    total,

    page,

    limit,

    totalPages:
      Math.ceil(
        total / limit
      ),

    followUps,
  };
};

export const completeFollowUp = async (
  followUpId: string,
  currentEmployee: any
) => {
  const followUp =
    await prisma.followUp.findUnique({
      where: {
        id: followUpId,
      },
    });

  if (!followUp) {
    throw new Error(
      "Follow-up Not Found"
    );
  }

  /* ============================
     ACCESS CHECK
  ============================ */

  await checkLeadAccess(
    followUp.leadId,
    currentEmployee
  );

  if (
    followUp.isCompleted
  ) {
    throw new Error(
      "Follow-up Already Completed"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const updatedFollowUp =
          await tx.followUp.update({
            where: {
              id: followUpId,
            },

            data: {
              isCompleted:
                true,
            },
          });

        await tx.lead.update({
          where: {
            id:
              followUp.leadId,
          },

          data: {
            nextFollowUp:
              null,
          },
        });

        return updatedFollowUp;
      }
    );

  return {
    success: true,

    message:
      "Follow-up Completed Successfully",

    followUp:
      result,
  };
};


export const saveCallOutcome = async (
  leadId: string,
    employeeId: string,
  data: SaveCallOutcomeRequest,
  currentEmployee: any
) => {
  await checkLeadAccess(
    leadId,
    currentEmployee
  );


  /* ============================
     CHECK LEAD
  ============================ */

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  /* ============================
     CHECK EMPLOYEE
  ============================ */

  const employee =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  /* ============================
     STATUS VALIDATION
  ============================ */

  if (data.statusId) {
    const status =
      await prisma.leadStatus.findUnique({
        where: {
          id: data.statusId,
        },
      });

    if (!status) {
      throw new Error(
        "Invalid Lead Status"
      );
    }
  }

  /* ============================
     FOLLOW-UP DATE
  ============================ */

  let followUpDate:
    | Date
    | undefined;

  if (data.followUpDate) {
    followUpDate =
      new Date(
        data.followUpDate
      );

    if (
      Number.isNaN(
        followUpDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid Follow-up Date"
      );
    }

    if (
      followUpDate <
      new Date()
    ) {
      throw new Error(
        "Follow-up date cannot be in the past"
      );
    }
  }

  /* ============================
     TRANSACTION
  ============================ */

  const result =
    await prisma.$transaction(
      async (tx) => {
        /* Update Lead */

        const updatedLead =
          await tx.lead.update({
            where: {
              id: leadId,
            },

            data: {
              lastCallAt:
                new Date(),

              remarks:
                data.remarks,

              ...(data.statusId && {
                status: {
                  connect: {
                    id: data.statusId,
                  },
                },
              }),

              ...(followUpDate && {
                nextFollowUp:
                  followUpDate,
              }),
            },

            include: {
              status: true,
              source: true,

              assignedEmployee: {
                select: {
                  id: true,
                  employeeCode: true,
                  name: true,
                },
              },
            },
          });

        /* Call History */

        const history =
          await tx.leadHistory.create({
            data: {
              leadId,

              employeeId,

              statusId:
                data.statusId,

              callOutcome:
                data.outcome,

              remarks:
                data.remarks,
            },
          });

        /* Optional Follow-up */

        let followUp = null;

        if (followUpDate) {
          followUp =
            await tx.followUp.create({
              data: {
                leadId,

                employeeId,

                followUpDate,

                remarks:
                  data.remarks,
              },
            });
        }

        return {
          lead: updatedLead,
          history,
          followUp,
        };
      }
    );

  return {
    success: true,

    message:
      "Call Outcome Saved Successfully",

    ...result,
  };
};

export const getDailyCallingSummary = async (
  employeeId: string
) => {
  const employee =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  const startOfDay =
    new Date();

  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  const endOfDay =
    new Date(startOfDay);

  endOfDay.setDate(
    endOfDay.getDate() + 1
  );

  const todayCalls =
    await prisma.leadHistory.count({
      where: {
        employeeId,

        callOutcome: {
          not: null,
        },

        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

  const outcomeGroups =
    await prisma.leadHistory.groupBy({
      by: [
        "callOutcome",
      ],

      where: {
        employeeId,

        callOutcome: {
          not: null,
        },

        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },

      _count: {
        _all: true,
      },
    });

  const outcomes: Record<
    string,
    number
  > = {};

  outcomeGroups.forEach(
    (item) => {
      if (
        item.callOutcome
      ) {
        outcomes[
          item.callOutcome
        ] =
          item._count._all;
      }
    }
  );

  const dailyTarget = 250;

  const remaining =
    Math.max(
      dailyTarget -
        todayCalls,
      0
    );

  const achievementPercent =
    Number(
      (
        (todayCalls /
          dailyTarget) *
        100
      ).toFixed(2)
    );

  return {
    success: true,

    employee,

    date:
      startOfDay,

    summary: {
      todayCalls,

      dailyTarget,

      remaining,

      achievementPercent,

      outcomes,
    },
  };
};

export const getLeadTimeline = async (
  leadId: string,
  currentEmployee: any
) => {
  /* ============================
     ACCESS CHECK
  ============================ */

  await checkLeadAccess(
    leadId,
    currentEmployee
  );

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        id: true,
        leadCode: true,
        isConverted: true,
        createdAt: true,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  const [
    histories,
    followUps,
    assignments,
  ] = await Promise.all([
    prisma.leadHistory.findMany({
      where: {
        leadId,
      },

      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
          },
        },

        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),

    prisma.followUp.findMany({
      where: {
        leadId,
      },

      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
          },
        },
      },
    }),

    prisma.leadAssignmentHistory.findMany({
      where: {
        leadId,
      },

      include: {
        fromEmployee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
          },
        },

        toEmployee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const timeline: any[] = [];

  /* ============================
     CALL + STATUS HISTORY
  ============================ */

  histories.forEach((item) => {
    if (item.callOutcome) {
      timeline.push({
        id: `call-${item.id}`,
        type: "CALL",

        title: `Call - ${item.callOutcome.replaceAll(
          "_",
          " "
        )}`,

        description:
          item.remarks ||
          undefined,

        createdAt:
          item.createdAt,

        employee:
          item.employee,

        meta: {
          callOutcome:
            item.callOutcome,

          status:
            item.status,
        },
      });
    } else {
      timeline.push({
        id: `status-${item.id}`,
        type: "STATUS",

        title:
          item.status
            ? `Status changed to ${item.status.name}`
            : "Lead updated",

        description:
          item.remarks ||
          undefined,

        createdAt:
          item.createdAt,

        employee:
          item.employee,

        meta: {
          status:
            item.status,
        },
      });
    }
  });

  /* ============================
     FOLLOW UPS
  ============================ */

  followUps.forEach((item) => {
    timeline.push({
      id: `followup-${item.id}`,

      type:
        item.isCompleted
          ? "FOLLOW_UP_COMPLETED"
          : "FOLLOW_UP",

      title:
        item.isCompleted
          ? "Follow-up Completed"
          : "Follow-up Scheduled",

      description:
        item.remarks ||
        undefined,

      createdAt:
        item.createdAt,

      employee:
        item.employee,

      meta: {
        followUpDate:
          item.followUpDate,

        isCompleted:
          item.isCompleted,
      },
    });
  });

  /* ============================
     ASSIGNMENT HISTORY
  ============================ */

  assignments.forEach((item) => {
    timeline.push({
      id: `assignment-${item.id}`,
      type: "ASSIGNMENT",

      title:
        item.fromEmployee
          ? `Lead transferred to ${item.toEmployee.name}`
          : `Lead assigned to ${item.toEmployee.name}`,

      description:
        item.reason ||
        undefined,

      createdAt:
        item.createdAt,

      employee:
        item.toEmployee,

      meta: {
        fromEmployee:
          item.fromEmployee,

        toEmployee:
          item.toEmployee,
      },
    });
  });

  /* ============================
     CONVERSION
  ============================ */

  if (lead.isConverted) {
    timeline.push({
      id: `conversion-${lead.id}`,
      type: "CONVERSION",
      title:
        "Lead Converted to Client",
      createdAt:
        lead.createdAt,
      employee: null,
    });
  }

  /* ============================
     SORT DESC
  ============================ */

  timeline.sort(
    (a, b) =>
      new Date(
        b.createdAt
      ).getTime() -
      new Date(
        a.createdAt
      ).getTime()
  );

  return {
    success: true,
    total:
      timeline.length,
    timeline,
  };
};

/* ============================
   GET LEAD PIPELINE
============================ */

export const getLeadPipeline = async (
  employeeId: string | undefined,
  search: string | undefined,
  currentEmployee: any
) => {
  const where: any = {};

  /* ============================
     ROLE BASED ACCESS
  ============================ */

  const accessWhere =
    await getLeadAccessWhere(
      currentEmployee
    );

  where.AND = [
    accessWhere,
  ];

  /* ============================
     EMPLOYEE FILTER
  ============================ */

  if (employeeId) {
    where.assignedEmployeeId =
      employeeId;
  }

  /* ============================
     SEARCH
  ============================ */

  if (search) {
    where.OR = [
      {
        leadCode: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        mobile: {
          contains: search,
        },
      },

      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  /* ============================
     GET LEADS
  ============================ */

  const leads =
    await prisma.lead.findMany({
      where,

      orderBy: [
        {
          nextFollowUp: "asc",
        },

        {
          updatedAt: "desc",
        },
      ],

      include: {
        status: true,

        source: true,

        assignedEmployee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
          },
        },
      },
    });

  /* ============================
     ADD AGING
  ============================ */

  const enrichedLeads =
    leads.map((lead) => ({
      ...lead,

      aging:
        calculateLeadAging({
          createdAt:
            lead.createdAt,

          updatedAt:
            lead.updatedAt,

          lastCallAt:
            lead.lastCallAt,

          nextFollowUp:
            lead.nextFollowUp,
        }),
    }));

  /* ============================
     BUILD PIPELINE
  ============================ */

  const pipeline = {
    NEW:
      enrichedLeads.filter(
        (lead) =>
          lead.stage ===
          "NEW"
      ),

    WORKING:
      enrichedLeads.filter(
        (lead) =>
          lead.stage ===
          "WORKING"
      ),

    FOLLOW_UP:
      enrichedLeads.filter(
        (lead) =>
          lead.stage ===
          "FOLLOW_UP"
      ),

    CONVERTED:
      enrichedLeads.filter(
        (lead) =>
          lead.stage ===
          "CONVERTED"
      ),

    LOST:
      enrichedLeads.filter(
        (lead) =>
          lead.stage ===
          "LOST"
      ),
  };

  /* ============================
     RETURN
  ============================ */

  return {
    success: true,

    total:
      enrichedLeads.length,

    counts: {
      NEW:
        pipeline.NEW.length,

      WORKING:
        pipeline.WORKING.length,

      FOLLOW_UP:
        pipeline.FOLLOW_UP
          .length,

      CONVERTED:
        pipeline.CONVERTED
          .length,

      LOST:
        pipeline.LOST.length,
    },

    pipeline,
  };
};
/* ============================
   CHANGE LEAD STAGE
============================ */

export const changeLeadStage = async (
  leadId: string,
  employeeId: string,
  data: ChangeLeadStageRequest,
  currentEmployee: any
) => {
  /* ============================
     ACCESS CHECK
  ============================ */

  await checkLeadAccess(
    leadId,
    currentEmployee
  );

  /* ============================
     GET LEAD
  ============================ */

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },

      include: {
        assignedEmployee: true,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  /* ============================
     SAME STAGE CHECK
  ============================ */

  if (
    lead.stage ===
    data.stage
  ) {
    throw new Error(
      "Lead is already in this stage"
    );
  }

  const oldStage =
    lead.stage;

  /* ============================
     UPDATE
  ============================ */

  const result =
    await prisma.$transaction(
      async (tx) => {
        const updatedLead =
          await tx.lead.update({
            where: {
              id: leadId,
            },

            data: {
              stage:
                data.stage,

              ...(data.stage ===
                "CONVERTED" && {
                isConverted:
                  true,
              }),

              ...(data.stage !==
                "CONVERTED" && {
                isConverted:
                  false,
              }),
            },

            include: {
              status: true,

              source: true,

              assignedEmployee: {
                select: {
                  id: true,
                  employeeCode:
                    true,
                  name: true,
                },
              },
            },
          });

        await tx.leadHistory.create({
          data: {
            leadId,

            employeeId,

            remarks:
              data.remarks ||
              `Stage changed from ${oldStage} to ${data.stage}`,
          },
        });

        return updatedLead;
      }
    );

  return {
    success: true,

    message:
      "Lead Stage Updated Successfully",

    previousStage:
      oldStage,

    stage:
      data.stage,

    lead: result,
  };
};
/* ============================
   BULK ASSIGN LEADS
============================ */

export const bulkAssignLeads = async (
  data: {
    leadIds: string[];
    employeeId: string;
    reason?: string;
  }
) => {
  if (
    !data.leadIds ||
    data.leadIds.length === 0
  ) {
    throw new Error(
      "Please select at least one lead"
    );
  }

  const uniqueLeadIds = [
    ...new Set(data.leadIds),
  ];

  const employee =
    await prisma.employee.findUnique({
      where: {
        id: data.employeeId,
      },

      select: {
        id: true,
        employeeCode: true,
        name: true,
        isActive: true,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  if (!employee.isActive) {
    throw new Error(
      "Cannot assign leads to inactive employee"
    );
  }

  const leads =
    await prisma.lead.findMany({
      where: {
        id: {
          in: uniqueLeadIds,
        },
      },

      select: {
        id: true,
        assignedEmployeeId: true,
      },
    });

  if (
    leads.length !==
    uniqueLeadIds.length
  ) {
    throw new Error(
      "One or more selected leads were not found"
    );
  }

  const changedLeads =
    leads.filter(
      (lead) =>
        lead.assignedEmployeeId !==
        data.employeeId
    );

  if (
    changedLeads.length === 0
  ) {
    throw new Error(
      "All selected leads are already assigned to this employee"
    );
  }

  await prisma.$transaction(
    async (tx) => {
      for (
        const lead of
        changedLeads
      ) {
        await tx.lead.update({
          where: {
            id: lead.id,
          },

          data: {
            assignedEmployeeId:
              data.employeeId,
          },
        });

        await tx.leadAssignmentHistory.create({
          data: {
            leadId:
              lead.id,

            fromEmployeeId:
              lead.assignedEmployeeId,

            toEmployeeId:
              data.employeeId,

            reason:
              data.reason ||
              "Bulk assignment",
          },
        });
      }
    }
  );

  return {
    success: true,

    message: `${changedLeads.length} leads assigned successfully`,

    updated:
      changedLeads.length,

    skipped:
      leads.length -
      changedLeads.length,
  };
};

/* ============================
   BULK CHANGE STAGE
============================ */

export const bulkChangeLeadStage =
  async (
    data: {
      leadIds: string[];
      stage:
        | "NEW"
        | "WORKING"
        | "FOLLOW_UP"
        | "CONVERTED"
        | "LOST";

      remarks?: string;
    },
    employeeId: string
  ) => {
    if (
      !data.leadIds ||
      data.leadIds.length === 0
    ) {
      throw new Error(
        "Please select at least one lead"
      );
    }

    const uniqueLeadIds = [
      ...new Set(
        data.leadIds
      ),
    ];

    const leads =
      await prisma.lead.findMany({
        where: {
          id: {
            in: uniqueLeadIds,
          },
        },

        select: {
          id: true,
          stage: true,
        },
      });

    if (
      leads.length !==
      uniqueLeadIds.length
    ) {
      throw new Error(
        "One or more selected leads were not found"
      );
    }

    const changedLeads =
      leads.filter(
        (lead) =>
          lead.stage !==
          data.stage
      );

    await prisma.$transaction(
      async (tx) => {
        for (
          const lead of
          changedLeads
        ) {
          await tx.lead.update({
            where: {
              id: lead.id,
            },

            data: {
              stage:
                data.stage,

              isConverted:
                data.stage ===
                "CONVERTED",
            },
          });

          /*
           IMPORTANT:
           callOutcome intentionally
           NOT saved here.
           Therefore Daily Call Counter
           will NOT increase.
          */

          await tx.leadHistory.create({
            data: {
              leadId:
                lead.id,

              employeeId,

              remarks:
                data.remarks ||
                `Bulk stage change: ${lead.stage} → ${data.stage}`,
            },
          });
        }
      }
    );

    return {
      success: true,

      message: `${changedLeads.length} leads moved successfully`,

      updated:
        changedLeads.length,

      skipped:
        leads.length -
        changedLeads.length,
    };
  };

/* ============================
   BULK CHANGE STATUS
============================ */

export const bulkChangeLeadStatus =
  async (
    data: {
      leadIds: string[];
      statusId: string;
      remarks?: string;
    },
    employeeId: string
  ) => {
    if (
      !data.leadIds ||
      data.leadIds.length === 0
    ) {
      throw new Error(
        "Please select at least one lead"
      );
    }

    const uniqueLeadIds = [
      ...new Set(
        data.leadIds
      ),
    ];

    const status =
      await prisma.leadStatus.findUnique({
        where: {
          id: data.statusId,
        },
      });

    if (!status) {
      throw new Error(
        "Invalid Lead Status"
      );
    }

    const leads =
      await prisma.lead.findMany({
        where: {
          id: {
            in: uniqueLeadIds,
          },
        },

        select: {
          id: true,
          statusId: true,
        },
      });

    if (
      leads.length !==
      uniqueLeadIds.length
    ) {
      throw new Error(
        "One or more selected leads were not found"
      );
    }

    const changedLeads =
      leads.filter(
        (lead) =>
          lead.statusId !==
          data.statusId
      );

    await prisma.$transaction(
      async (tx) => {
        for (
          const lead of
          changedLeads
        ) {
          await tx.lead.update({
            where: {
              id: lead.id,
            },

            data: {
              statusId:
                data.statusId,
            },
          });

          /*
           Status history yes.
           Call outcome NO.
          */

          await tx.leadHistory.create({
            data: {
              leadId:
                lead.id,

              employeeId,

              statusId:
                data.statusId,

              remarks:
                data.remarks ||
                `Bulk status changed to ${status.name}`,
            },
          });
        }
      }
    );

    return {
      success: true,

      message: `${changedLeads.length} leads updated successfully`,

      updated:
        changedLeads.length,

      skipped:
        leads.length -
        changedLeads.length,
    };
  };