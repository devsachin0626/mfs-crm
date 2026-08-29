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
  CallOutcome,
  Prisma,
} from "@prisma/client";

import type {
  AllocateLeadPoolRequest,
} from "../../types/lead.types";



import {
  getLeadAccessWhere,
  checkLeadAccess,
} from "../../utils/leadAccess";


/* ============================
   ROLE HELPER
============================ */

const getLeadRoleName = (
  employee: any
): string => {
  if (
    typeof employee?.role ===
    "string"
  ) {
    return employee.role;
  }

  return (
    employee?.role?.name ||
    ""
  );
};

/* ============================
   MOBILE NORMALIZATION
============================ */

const normalizeLeadMobile = (
  value: string
) => {
  const digits =
    String(value || "")
      .replace(/\D/g, "");

  let mobile =
    digits;

  /*
   * India:
   * +91XXXXXXXXXX
   * 91XXXXXXXXXX
   * -> XXXXXXXXXX
   */

  if (
    mobile.length === 12 &&
    mobile.startsWith("91")
  ) {
    mobile =
      mobile.slice(2);
  }

  if (
    mobile.length === 11 &&
    mobile.startsWith("0")
  ) {
    mobile =
      mobile.slice(1);
  }

  if (
    !/^[6-9]\d{9}$/.test(
      mobile
    )
  ) {
    throw new Error(
      "Enter a valid 10 digit mobile number"
    );
  }

  return mobile;
};


/* ============================
   CALLING HELPERS
============================ */

const getRoleName = (
  currentEmployee: any
) => {
  if (
    typeof currentEmployee?.role ===
    "string"
  ) {
    return currentEmployee.role;
  }

  return (
    currentEmployee?.role?.name ||
    ""
  );
};

/* ============================
   CALLING SUMMARY ACCESS

   ADMIN / HR
   -> ANY EMPLOYEE

   TEAM LEADER
   -> SELF + TEAM

   EMPLOYEE
   -> SELF
============================ */

const checkCallingSummaryAccess =
  async (
    targetEmployeeId: string,
    currentEmployee: any
  ) => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    if (
      roleName === "ADMIN" ||
      roleName === "HR"
    ) {
      return;
    }

    if (
      roleName === "EMPLOYEE"
    ) {
      if (
        targetEmployeeId !==
        currentEmployee.id
      ) {
        throw new Error(
          "Calling Summary Access Denied"
        );
      }

      return;
    }

    if (
      roleName ===
      "TEAM_LEADER"
    ) {
      if (
        targetEmployeeId ===
        currentEmployee.id
      ) {
        return;
      }

      const teamMember =
        await prisma.employee.findFirst({
          where: {
            id:
              targetEmployeeId,

            reportingManagerId:
              currentEmployee.id,

            isActive:
              true,
          },

          select: {
            id: true,
          },
        });

      if (
        !teamMember
      ) {
        throw new Error(
          "Calling Summary Access Denied"
        );
      }

      return;
    }

    throw new Error(
      "Calling Summary Access Denied"
    );
  };

/* ============================
   DAILY CALLING TARGET

   Setting key:
   CALLING_DAILY_TARGET

   Default:
   250
============================ */

const getDailyCallingTarget =
  async () => {
    const setting =
      await prisma.setting.findUnique({
        where: {
          key:
            "CALLING_DAILY_TARGET",
        },
      });

    const configuredTarget =
      Number(
        setting?.value
      );

    if (
      Number.isFinite(
        configuredTarget
      ) &&
      configuredTarget > 0
    ) {
      return Math.floor(
        configuredTarget
      );
    }

    return 250;
  };


export const createLead = async (
  data: CreateLeadRequest,
  currentEmployee: any
) => {

  const roleName =
  getRoleName(
    currentEmployee
  );

const isEmployee =
  roleName === "EMPLOYEE";

const canAssign =
  roleName === "ADMIN" ||
  roleName === "HR" ||
  roleName === "TEAM_LEADER";

if (
  !isEmployee &&
  !canAssign
) {
  throw new Error(
    "Lead creation access denied"
  );
}

  const name =
    data.name?.trim() ||
    undefined;

  const mobile =
    normalizeLeadMobile(
      data.mobile
    );

  const email =
    data.email
      ?.trim()
      .toLowerCase() ||
    undefined;

  const city =
    data.city?.trim() ||
    undefined;

  const state =
    data.state?.trim() ||
    undefined;

  const address =
    data.address?.trim() ||
    undefined;

  const remarks =
    data.remarks?.trim() ||
    undefined;

  /* ============================
     DUPLICATE MOBILE
  ============================ */

  const mobileExists =
    await prisma.lead.findFirst({
      where: {
        mobile,
      },

      select: {
        id: true,
        leadCode: true,
      },
    });

  if (mobileExists) {
    throw new Error(
      `Lead already exists with this mobile number (${mobileExists.leadCode})`
    );
  }

  /* ============================
     DUPLICATE EMAIL
  ============================ */

  if (email) {
    const emailExists =
      await prisma.lead.findFirst({
        where: {
          email: {
            equals:
              email,

            mode:
              "insensitive",
          },
        },

        select: {
          id: true,
        },
      });

    if (emailExists) {
      throw new Error(
        "Lead already exists with this Email"
      );
    }
  }

  /* ============================
     DEFAULT STATUS
  ============================ */

  const defaultStatus =
    await prisma.leadStatus.findFirst({
      where: {
        name: "NEW",
        isActive: true,
      },
    });

  if (!defaultStatus) {
    throw new Error(
      "Default Lead Status (NEW) not found"
    );
  }

  /* ============================
     SOURCE
  ============================ */

  if (data.sourceId) {
    const source =
      await prisma.leadSource.findUnique({
        where: {
          id:
            data.sourceId,
        },
      });

    if (
      !source ||
      !source.isActive
    ) {
      throw new Error(
        "Invalid Lead Source"
      );
    }
  }

  /* ============================
     ASSIGNMENT RULE

     EMPLOYEE:
     always self assigned.

     ADMIN / HR / TL:
     requested employee allowed.
  ============================ */

  let assignedEmployeeId:
    | string
    | undefined;

  if (
    roleName ===
    "EMPLOYEE"
  ) {
    assignedEmployeeId =
      currentEmployee.id;
  } else {
    assignedEmployeeId =
      data.assignedEmployeeId ||
      undefined;
  }

  if (
    assignedEmployeeId
  ) {
    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            assignedEmployeeId,
        },

        select: {
          id: true,
          isActive: true,
        },
      });

    if (
      !employee ||
      !employee.isActive
    ) {
      throw new Error(
        "Assigned Employee not found or inactive"
      );
    }

    /*
     * TL can assign only
     * self or own team.
     */

    if (
      roleName ===
      "TEAM_LEADER" &&
      assignedEmployeeId !==
        currentEmployee.id
    ) {
      const teamMember =
        await prisma.employee.findFirst({
          where: {
            id:
              assignedEmployeeId,

            reportingManagerId:
              currentEmployee.id,

            isActive:
              true,
          },

          select: {
            id: true,
          },
        });

      if (!teamMember) {
        throw new Error(
          "You can assign leads only to your team"
        );
      }
    }
  }

  /* ============================
     LEAD CODE
  ============================ */

  const lastLead =
    await prisma.lead.findFirst({
      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        leadCode: true,
      },
    });

  let leadCode =
    "LD00001";

  if (lastLead) {
    const lastNumber =
      Number(
        lastLead.leadCode.replace(
          "LD",
          ""
        )
      );

    leadCode =
      `LD${String(
        lastNumber + 1
      ).padStart(
        5,
        "0"
      )}`;
  }

  /* ============================
     CREATE
  ============================ */

  const lead =
  await prisma.$transaction(
    async (tx) => {
      const createdLead =
        await tx.lead.create({
          data: {
            leadCode,

            name,

            mobile,

            email,

            city,

            state,

            address,

            sourceId:
              data.sourceId ||
              undefined,

            remarks,

            assignedEmployeeId,

            statusId:
              defaultStatus.id,
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

      /* ============================
         INITIAL ASSIGNMENT HISTORY
      ============================ */

      if (
        assignedEmployeeId
      ) {
        await tx.leadAssignmentHistory.create({
          data: {
            leadId:
              createdLead.id,

            fromEmployeeId:
              null,

            toEmployeeId:
              assignedEmployeeId,

            reason:
              roleName ===
              "EMPLOYEE"
                ? "Lead created by employee"
                : "Initial lead assignment",
          },
        });
      }

      return createdLead;
    }
  );

  return {
    success: true,

    message:
      "Lead Created Successfully",

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
const roleName =
  getRoleName(
    currentEmployee
  );

const canFilterEmployee =
  roleName === "ADMIN" ||
  roleName === "HR" ||
  roleName === "TEAM_LEADER";

if (
  canFilterEmployee &&
  query.employeeId
) {
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


         where.assignedEmployeeId =
    currentEmployee.id;

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
  data: UpdateLeadRequest,
  currentEmployee: any
) => {
  /* ============================
     ACCESS CHECK
  ============================ */

  await checkLeadAccess(
    id,
    currentEmployee
  );

  const lead =
    await prisma.lead.findUnique({
      where: { id },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  const roleName =
    getRoleName(
      currentEmployee
    );

  const isEmployee =
    roleName === "EMPLOYEE";

  /* ============================
     EMPLOYEE RESTRICTIONS
  ============================ */

  if (
    isEmployee &&
    data.mobile !== undefined &&
    data.mobile !== lead.mobile
  ) {
    throw new Error(
      "Employee cannot change lead mobile number"
    );
  }

  if (
    isEmployee &&
    data.assignedEmployeeId !==
      undefined &&
    data.assignedEmployeeId !==
      lead.assignedEmployeeId
  ) {
    throw new Error(
      "Employee cannot change lead assignment"
    );
  }

  /* ============================
     SOURCE VALIDATION
  ============================ */

  if (data.sourceId) {
    const source =
      await prisma.leadSource.findUnique({
        where: {
          id: data.sourceId,
        },
      });

    if (!source) {
      throw new Error(
        "Invalid Lead Source"
      );
    }
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
     ASSIGNMENT VALIDATION
  ============================ */

  if (
    !isEmployee &&
    data.assignedEmployeeId
  ) {
    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            data.assignedEmployeeId,
        },
      });

    if (!employee) {
      throw new Error(
        "Invalid Employee"
      );
    }
  }

  /* ============================
     UPDATE
  ============================ */

  const updatedLead =
    await prisma.lead.update({
      where: {
        id,
      },

      data: {
        name:
          data.name,

        /*
         Employee mobile cannot change.
         For employee preserve DB value.
        */
        mobile:
          isEmployee
            ? lead.mobile
            : data.mobile,

        email:
          data.email,

        city:
          data.city,

        state:
          data.state,

        address:
          data.address,

        stage:
          data.stage,

        nextFollowUp:
          data.nextFollowUp,

        remarks:
          data.remarks,

        ...(data.sourceId && {
          source: {
            connect: {
              id:
                data.sourceId,
            },
          },
        }),

        ...(data.statusId && {
          status: {
            connect: {
              id:
                data.statusId,
            },
          },
        }),

        ...(
          !isEmployee &&
          data.assignedEmployeeId
            ? {
                assignedEmployee: {
                  connect: {
                    id:
                      data.assignedEmployeeId,
                  },
                },
              }
            : {}
        ),
      },

      include: {
        status: true,
        source: true,
        assignedEmployee:
          true,
      },
    });

  return {
    success: true,
    message:
      "Lead Updated Successfully",
    lead:
      updatedLead,
  };
};

export const assignLead = async (
  leadId: string,
  data: AssignLeadRequest,
  currentEmployee: any
) => {
  const roleName =
    getRoleName(
      currentEmployee
    );

  /* ============================
     ROLE PERMISSION
  ============================ */

  if (
    roleName === "EMPLOYEE"
  ) {
    throw new Error(
      "Employee cannot assign or transfer leads"
    );
  }

  if (
    roleName !== "ADMIN" &&
    roleName !== "HR" &&
    roleName !== "TEAM_LEADER"
  ) {
    throw new Error(
      "Lead assignment access denied"
    );
  }

  /* ============================
     LEAD ACCESS
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
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  /* ============================
     TARGET EMPLOYEE
  ============================ */

  const employee =
    await prisma.employee.findUnique({
      where: {
        id: data.employeeId,
      },

      select: {
        id: true,
        name: true,
        employeeCode: true,
        isActive: true,
        reportingManagerId: true,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  if (!employee.isActive) {
    throw new Error(
      "Cannot assign lead to inactive employee"
    );
  }

  /* ============================
     TEAM LEADER RESTRICTION
  ============================ */

  if (
    roleName ===
    "TEAM_LEADER"
  ) {
    const isSelf =
      employee.id ===
      currentEmployee.id;

    const isTeamMember =
      employee.reportingManagerId ===
      currentEmployee.id;

    if (
      !isSelf &&
      !isTeamMember
    ) {
      throw new Error(
        "Team Leader can assign leads only to self or own team"
      );
    }
  }

  /* ============================
     SAME EMPLOYEE CHECK
  ============================ */

  if (
    lead.assignedEmployeeId ===
    data.employeeId
  ) {
    throw new Error(
      "Lead Already Assigned To This Employee"
    );
  }

  /* ============================
     ASSIGN + HISTORY
  ============================ */

  const result =
    await prisma.$transaction(
      async (tx) => {
        const updatedLead =
          await tx.lead.update({
            where: {
              id:
                leadId,
            },

            data: {
              assignedEmployee: {
                connect: {
                  id:
                    data.employeeId,
                },
              },
            },

            include: {
              assignedEmployee: {
                select: {
                  id: true,
                  name: true,
                  employeeCode:
                    true,
                },
              },
            },
          });

        await tx.leadAssignmentHistory.create({
          data: {
            leadId,

            fromEmployeeId:
              lead.assignedEmployeeId,

            toEmployeeId:
              data.employeeId,

            reason:
              data.reason?.trim() ||
              undefined,
          },
        });

        return updatedLead;
      }
    );

  return {
    success: true,

    message:
      lead.assignedEmployeeId
        ? "Lead Transferred Successfully"
        : "Lead Assigned Successfully",

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
     LEAD CHECK
  ============================ */

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        id: true,
        isConverted: true,
        stage: true,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  if (lead.isConverted) {
    throw new Error(
      "Converted Lead Cannot Have Follow-up"
    );
  }

  if (
    lead.stage === "LOST" ||
    lead.stage === "CONVERTED"
  ) {
    throw new Error(
      "Follow-up Cannot Be Created For Closed Lead"
    );
  }

  /* ============================
     EMPLOYEE CHECK
  ============================ */

  const employee =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },

      select: {
        id: true,
        isActive: true,
        status: true,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  if (
    !employee.isActive ||
    employee.status !== "ACTIVE"
  ) {
    throw new Error(
      "Employee Account Inactive"
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
    followUpDate <=
    new Date()
  ) {
    throw new Error(
      "Follow-up Date Must Be In The Future"
    );
  }

  /* ============================
     TRANSACTION

     Rule:
     Only one active follow-up
     per lead.
  ============================ */

  const result =
    await prisma.$transaction(
      async (tx) => {
        /* Close previous active follow-ups */

        await tx.followUp.updateMany({
          where: {
            leadId,

            isCompleted: false,
          },

          data: {
            isCompleted: true,
          },
        });

        /* Create new follow-up */

        const followUp =
          await tx.followUp.create({
            data: {
              leadId,

              employeeId,

              followUpDate,

              remarks:
                data.remarks
                  ?.trim() ||
                undefined,
            },
          });

        /* Update lead */

        await tx.lead.update({
          where: {
            id: leadId,
          },

          data: {
            nextFollowUp:
              followUpDate,

            stage:
              lead.stage === "NEW"
                ? "FOLLOW_UP"
                : lead.stage,
          },
        });

        return followUp;
      }
    );

  return {
    success: true,

    message:
      "Follow-up Scheduled Successfully",

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
  /* ============================
     GET FOLLOW-UP
  ============================ */

  const followUp =
    await prisma.followUp.findUnique({
      where: {
        id: followUpId,
      },

      select: {
        id: true,
        leadId: true,
        isCompleted: true,
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

  /* ============================
     TRANSACTION
  ============================ */

  const result =
    await prisma.$transaction(
      async (tx) => {
        /* Complete current follow-up */

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

        /* Find next active follow-up */

        const nextFollowUp =
          await tx.followUp.findFirst({
            where: {
              leadId:
                followUp.leadId,

              isCompleted:
                false,
            },

            orderBy: {
              followUpDate:
                "asc",
            },

            select: {
              followUpDate:
                true,
            },
          });

        /* Sync lead.nextFollowUp */

        await tx.lead.update({
          where: {
            id:
              followUp.leadId,
          },

          data: {
            nextFollowUp:
              nextFollowUp
                ?.followUpDate ||
              null,
          },
        });

        return {
          updatedFollowUp,
          nextFollowUp:
            nextFollowUp
              ?.followUpDate ||
            null,
        };
      }
    );

  return {
    success: true,

    message:
      "Follow-up Completed Successfully",

    followUp:
      result.updatedFollowUp,

    nextFollowUp:
      result.nextFollowUp,
  };
};

export const saveCallOutcome =
  async (
    leadId: string,
    employeeId: string,
    data:
      SaveCallOutcomeRequest,
    currentEmployee: any
  ) => {
    /* ============================
       ACCESS
    ============================ */

    await checkLeadAccess(
      leadId,
      currentEmployee
    );

    /* ============================
       LEAD
    ============================ */

    const lead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },

        select: {
          id: true,
          leadCode: true,
          assignedEmployeeId:
            true,
          stage: true,
          isConverted: true,
        },
      });

    if (!lead) {
      throw new Error(
        "Lead Not Found"
      );
    }

    if (
      lead.isConverted
    ) {
      throw new Error(
        "Converted Lead Cannot Be Called"
      );
    }

    /* ============================
       EMPLOYEE
    ============================ */

    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            employeeId,
        },

        select: {
          id: true,
          isActive: true,
          status: true,
        },
      });

    if (!employee) {
      throw new Error(
        "Employee Not Found"
      );
    }

    if (
      !employee.isActive ||
      employee.status !==
        "ACTIVE"
    ) {
      throw new Error(
        "Employee Account Inactive"
      );
    }

    /* ============================
       OUTCOME VALIDATION
    ============================ */

    if (
      !data.outcome ||
      !Object.values(
        CallOutcome
      ).includes(
        data.outcome as CallOutcome
      )
    ) {
      throw new Error(
        "Invalid Call Outcome"
      );
    }

    /* ============================
       STATUS VALIDATION
    ============================ */

    if (
      data.statusId
    ) {
      const status =
        await prisma.leadStatus.findUnique({
          where: {
            id:
              data.statusId,
          },

          select: {
            id: true,
            isActive: true,
          },
        });

      if (
        !status ||
        !status.isActive
      ) {
        throw new Error(
          "Invalid Lead Status"
        );
      }
    }

    /* ============================
       FOLLOW-UP RULES
    ============================ */

    const requiresFollowUp =
      data.outcome ===
        "CALL_BACK" ||
      data.outcome ===
        "INTERESTED";

    if (
      requiresFollowUp &&
      !data.followUpDate
    ) {
      throw new Error(
        "Follow-up date is required for this call outcome"
      );
    }

    let followUpDate:
      | Date
      | undefined;

    if (
      data.followUpDate
    ) {
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
        followUpDate <=
        new Date()
      ) {
        throw new Error(
          "Follow-up date must be in the future"
        );
      }
    }

    /* ============================
       AUTO STAGE RULES
    ============================ */

    const shouldMarkLost =
      data.outcome ===
        "NOT_INTERESTED" ||
      data.outcome ===
        "WRONG_NUMBER";

    /* ============================
       TRANSACTION
    ============================ */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /* ============================
             FOLLOW-UP MANAGEMENT

             Only one active follow-up
             should remain after call.
          ============================ */

          if (
            followUpDate
          ) {
            await tx.followUp.updateMany({
              where: {
                leadId,

                isCompleted:
                  false,
              },

              data: {
                isCompleted:
                  true,
              },
            });
          }

          if (
            shouldMarkLost
          ) {
            await tx.followUp.updateMany({
              where: {
                leadId,

                isCompleted:
                  false,
              },

              data: {
                isCompleted:
                  true,
              },
            });
          }

          /* ============================
             UPDATE LEAD

             Call remarks are NOT written
             into lead.remarks.

             Remarks remain in history.
          ============================ */

          const updatedLead =
            await tx.lead.update({
              where: {
                id:
                  leadId,
              },

              data: {
                lastCallAt:
                  new Date(),

                ...(data.statusId && {
                  status: {
                    connect: {
                      id:
                        data.statusId,
                    },
                  },
                }),

                ...(followUpDate && {
                  nextFollowUp:
                    followUpDate,
                }),

                ...(shouldMarkLost && {
                  stage:
                    "LOST",

                  nextFollowUp:
                    null,
                }),
              },

              include: {
                status:
                  true,

                source:
                  true,

                assignedEmployee: {
                  select: {
                    id: true,

                    employeeCode:
                      true,

                    name:
                      true,
                  },
                },
              },
            });

          /* ============================
             CALL HISTORY
          ============================ */

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
                  data.remarks
                    ?.trim() ||
                  undefined,
              },
            });

          /* ============================
             CREATE NEW FOLLOW-UP
          ============================ */

          let followUp =
            null;

          if (
            followUpDate
          ) {
            followUp =
              await tx.followUp.create({
                data: {
                  leadId,

                  employeeId,

                  followUpDate,

                  remarks:
                    data.remarks
                      ?.trim() ||
                    undefined,
                },
              });
          }

          return {
            lead:
              updatedLead,

            history,

            followUp,
          };
        }
      );

    return {
      success: true,

      message:
        shouldMarkLost
          ? "Call Saved And Lead Marked As Lost"
          : followUpDate
            ? "Call Saved And Follow-up Scheduled"
            : "Call Outcome Saved Successfully",

      ...result,
    };
  };

export const getDailyCallingSummary =
  async (
    employeeId: string,
    currentEmployee: any
  ) => {
    /* ============================
       ACCESS
    ============================ */

    await checkCallingSummaryAccess(
      employeeId,
      currentEmployee
    );

    /* ============================
       EMPLOYEE
    ============================ */

    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            employeeId,
        },

        select: {
          id: true,

          employeeCode:
            true,

          name: true,

          isActive: true,
        },
      });

    if (
      !employee ||
      !employee.isActive
    ) {
      throw new Error(
        "Employee Not Found"
      );
    }

    /* ============================
       TODAY
    ============================ */

    const startOfDay =
      new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay =
      new Date(
        startOfDay
      );

    endOfDay.setDate(
      endOfDay.getDate() +
        1
    );

    /* ============================
       CALL DATA
    ============================ */

    const [
      todayCalls,
      outcomeGroups,
      dailyTarget,
    ] =
      await Promise.all([
        prisma.leadHistory.count({
          where: {
            employeeId,

            callOutcome: {
              not: null,
            },

            createdAt: {
              gte:
                startOfDay,

              lt:
                endOfDay,
            },
          },
        }),

        prisma.leadHistory.groupBy({
          by: [
            "callOutcome",
          ],

          where: {
            employeeId,

            callOutcome: {
              not:
                null,
            },

            createdAt: {
              gte:
                startOfDay,

              lt:
                endOfDay,
            },
          },

          _count: {
            _all:
              true,
          },
        }),

        getDailyCallingTarget(),
      ]);

    /* ============================
       OUTCOME COUNTS
    ============================ */

    const outcomes: Record<
      string,
      number
    > = {};

    Object.values(
      CallOutcome
    ).forEach(
      (outcome) => {
        outcomes[
          outcome
        ] = 0;
      }
    );

    outcomeGroups.forEach(
      (
        item
      ) => {
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

    /* ============================
       SUMMARY
    ============================ */

    const remaining =
      Math.max(
        dailyTarget -
          todayCalls,
        0
      );

    const achievementPercent =
      dailyTarget > 0
        ? Number(
            (
              todayCalls /
              dailyTarget *
              100
            ).toFixed(
              2
            )
          )
        : 0;

    return {
      success: true,

      employee: {
        id:
          employee.id,

        employeeCode:
          employee.employeeCode,

        name:
          employee.name,
      },

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

/* ============================
   EMPLOYEE FILTER
============================ */

if (employeeId) {
  const roleName =
    getRoleName(
      currentEmployee
    );

  if (
    roleName ===
    "EMPLOYEE"
  ) {
    if (
      employeeId !==
      currentEmployee.id
    ) {
      throw new Error(
        "Pipeline Access Denied"
      );
    }
  }

  if (
    roleName ===
    "TEAM_LEADER"
  ) {
    const allowedEmployee =
      await prisma.employee.findFirst({
        where: {
          id:
            employeeId,

          OR: [
            {
              id:
                currentEmployee.id,
            },

            {
              reportingManagerId:
                currentEmployee.id,
            },
          ],

          isActive:
            true,
        },

        select: {
          id: true,
        },
      });

    if (
      !allowedEmployee
    ) {
      throw new Error(
        "Pipeline Access Denied"
      );
    }
  }

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
  },
  currentEmployee: any
) => {
  if (
    !data.leadIds ||
    data.leadIds.length === 0
  ) {
    throw new Error(
      "Please select at least one lead"
    );
  }

  const roleName =
    getRoleName(
      currentEmployee
    );

  if (
    roleName !== "ADMIN" &&
    roleName !== "HR" &&
    roleName !== "TEAM_LEADER"
  ) {
    throw new Error(
      "Bulk lead assignment access denied"
    );
  }

  const uniqueLeadIds = [
    ...new Set(
      data.leadIds
    ),
  ];

  /* ============================
     TARGET EMPLOYEE
  ============================ */

  const employee =
    await prisma.employee.findUnique({
      where: {
        id:
          data.employeeId,
      },

      select: {
        id: true,
        employeeCode: true,
        name: true,
        isActive: true,
        reportingManagerId:
          true,
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

  /* ============================
     TL TARGET RESTRICTION
  ============================ */

  if (
    roleName ===
    "TEAM_LEADER"
  ) {
    const isSelf =
      employee.id ===
      currentEmployee.id;

    const isTeamMember =
      employee.reportingManagerId ===
      currentEmployee.id;

    if (
      !isSelf &&
      !isTeamMember
    ) {
      throw new Error(
        "Team Leader can assign leads only to self or own team"
      );
    }
  }

  /* ============================
     LEAD ACCESS
  ============================ */

  const accessWhere =
    await getLeadAccessWhere(
      currentEmployee
    );

  const leads =
    await prisma.lead.findMany({
      where: {
        AND: [
          accessWhere,

          {
            id: {
              in:
                uniqueLeadIds,
            },
          },
        ],
      },

      select: {
        id: true,
        assignedEmployeeId:
          true,
      },
    });

  /*
   * Important:
   * If even one requested lead
   * is outside current user's
   * access, reject whole request.
   */

  if (
    leads.length !==
    uniqueLeadIds.length
  ) {
    throw new Error(
      "One or more selected leads are not accessible"
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

  /* ============================
     ASSIGN + HISTORY
  ============================ */

  await prisma.$transaction(
    async (tx) => {
      for (
        const lead of
        changedLeads
      ) {
        await tx.lead.update({
          where: {
            id:
              lead.id,
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
              data.reason?.trim() ||
              "Bulk assignment",
          },
        });
      }
    }
  );

  return {
    success: true,

    message:
      `${changedLeads.length} leads assigned successfully`,

    updated:
      changedLeads.length,

    skipped:
      leads.length -
      changedLeads.length,
  };
};

/* ============================
   ALLOCATE LEADS FROM POOL

   ADMIN / HR only.
   Uses PostgreSQL row locks so
   the same unassigned lead can
   never be allocated twice.
============================ */

export const allocateLeadsFromPool =
  async (
    data:
      AllocateLeadPoolRequest,
    currentEmployee: any
  ) => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    if (
      roleName !== "ADMIN" &&
      roleName !== "HR"
    ) {
      throw new Error(
        "Lead pool allocation access denied"
      );
    }

    const quantity =
      Number(
        data.quantity
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      quantity > 5000
    ) {
      throw new Error(
        "Quantity must be between 1 and 5000"
      );
    }

    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            data.employeeId,
        },

        select: {
          id: true,
          employeeCode:
            true,
          name: true,
          isActive: true,
          status: true,
        },
      });

    if (!employee) {
      throw new Error(
        "Employee Not Found"
      );
    }

    if (
      !employee.isActive ||
      employee.status !==
        "ACTIVE"
    ) {
      throw new Error(
        "Cannot allocate leads to inactive employee"
      );
    }

    const reason =
      data.reason?.trim() ||
      "Lead pool allocation";

    const assigned =
      await prisma.$transaction(
        async (tx) => {
          const poolLeads =
            await tx.$queryRaw<
              Array<{
                id: string;
              }>
            >(
              Prisma.sql`
                SELECT "id"
                FROM "leads"
                WHERE "assignedEmployeeId" IS NULL
                  AND "isDuplicate" = false
                ORDER BY "createdAt" ASC, "id" ASC
                FOR UPDATE SKIP LOCKED
                LIMIT ${quantity}
              `
            );

          if (
            poolLeads.length ===
            0
          ) {
            return 0;
          }

          const leadIds =
            poolLeads.map(
              (lead) =>
                lead.id
            );

          const updateResult =
            await tx.lead.updateMany({
              where: {
                id: {
                  in:
                    leadIds,
                },

                assignedEmployeeId:
                  null,
              },

              data: {
                assignedEmployeeId:
                  employee.id,
              },
            });

          if (
            updateResult.count !==
            leadIds.length
          ) {
            throw new Error(
              "Lead pool changed during allocation. Please try again"
            );
          }

          await tx.leadAssignmentHistory.createMany({
            data:
              leadIds.map(
                (leadId) => ({
                  leadId,

                  fromEmployeeId:
                    null,

                  toEmployeeId:
                    employee.id,

                  reason,
                })
              ),
          });

          return leadIds.length;
        }
      );

    if (assigned === 0) {
      throw new Error(
        "No unassigned leads are available"
      );
    }

    const availableRemaining =
      await prisma.lead.count({
        where: {
          assignedEmployeeId:
            null,

          isDuplicate:
            false,
        },
      });

    return {
      success: true,

      message:
        assigned === quantity
          ? `${assigned} leads assigned successfully to ${employee.name}`
          : `${assigned} of ${quantity} requested leads assigned to ${employee.name}`,

      employee: {
        id:
          employee.id,

        employeeCode:
          employee.employeeCode,

        name:
          employee.name,
      },

      requested:
        quantity,

      assigned,

      availableRemaining,
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
    employeeId: string,

        currentEmployee: any

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

    const roleName =
  getRoleName(
    currentEmployee
  );

if (
  roleName !== "ADMIN" &&
  roleName !== "HR" &&
  roleName !== "TEAM_LEADER"
) {
  throw new Error(
    "Bulk stage update access denied"
  );
}

const accessWhere =
  await getLeadAccessWhere(
    currentEmployee
  );
 const leads =
  await prisma.lead.findMany({
    where: {
      AND: [
        accessWhere,

        {
          id: {
            in:
              uniqueLeadIds,
          },
        },
      ],
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
    "One or more selected leads are not accessible"
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
    employeeId: string,
        currentEmployee: any


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

    const roleName =
  getRoleName(
    currentEmployee
  );

if (
  roleName !== "ADMIN" &&
  roleName !== "HR" &&
  roleName !== "TEAM_LEADER"
) {
  throw new Error(
    "Bulk status update access denied"
  );
}

const accessWhere =
  await getLeadAccessWhere(
    currentEmployee
  );

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
      AND: [
        accessWhere,

        {
          id: {
            in:
              uniqueLeadIds,
          },
        },
      ],
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
    "One or more selected leads are not accessible"
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


  /* ============================
   CALLING QUEUE
============================ */

export const getCallingQueue =
  async (
    query: {
      page?: number;
      limit?: number;
      search?: string;
      employeeId?: string;
    },

    currentEmployee: any
  ) => {
    const page =
      Math.max(
        Number(
          query.page
        ) || 1,
        1
      );

    const limit =
      Math.min(
        Math.max(
          Number(
            query.limit
          ) || 20,
          1
        ),
        100
      );

    const skip =
      (page - 1) *
      limit;

    /* ============================
       ACCESS
    ============================ */

    const accessWhere =
      await getLeadAccessWhere(
        currentEmployee
      );

    const where: any = {
      AND: [
        accessWhere,
        {
          isConverted:
            false,
        },
        {
          stage: {
            notIn: [
              "LOST",
              "CONVERTED",
            ],
          },
        },
      ],
    };

    /* ============================
       OPTIONAL EMPLOYEE FILTER
    ============================ */

    if (
      query.employeeId
    ) {
      const roleName =
        typeof currentEmployee
          .role ===
        "string"
          ? currentEmployee
              .role
          : currentEmployee
              .role?.name;

      if (
        roleName ===
        "EMPLOYEE"
      ) {
        if (
          query.employeeId !==
          currentEmployee.id
        ) {
          throw new Error(
            "Calling Queue Access Denied"
          );
        }
      }

      if (
        roleName ===
        "TEAM_LEADER"
      ) {
        const allowed =
          await prisma.employee.findFirst({
            where: {
              id:
                query.employeeId,

              OR: [
                {
                  id:
                    currentEmployee.id,
                },

                {
                  reportingManagerId:
                    currentEmployee.id,
                },
              ],
            },

            select: {
              id: true,
            },
          });

        if (!allowed) {
          throw new Error(
            "Calling Queue Access Denied"
          );
        }
      }

      where.AND.push({
        assignedEmployeeId:
          query.employeeId,
      });
    }

    /* ============================
       SEARCH
    ============================ */

    if (
      query.search
    ) {
      where.AND.push({
        OR: [
          {
            leadCode: {
              contains:
                query.search,

              mode:
                "insensitive",
            },
          },

          {
            name: {
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

          {
            email: {
              contains:
                query.search,

              mode:
                "insensitive",
            },
          },
        ],
      });
    }

    /* ============================
       FETCH ACTIONABLE LEADS
    ============================ */

    const [
      leads,
      total,
    ] =
      await Promise.all([
        prisma.lead.findMany({
          where,

          skip,

          take:
            limit,

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

          orderBy: [
            {
              nextFollowUp:
                "asc",
            },

            {
              lastCallAt:
                "asc",
            },

            {
              createdAt:
                "asc",
            },
          ],
        }),

        prisma.lead.count({
          where,
        }),
      ]);

    /* ============================
       PRIORITY
    ============================ */

    const now =
      new Date();

    const startOfToday =
      new Date();

    startOfToday.setHours(
      0,
      0,
      0,
      0
    );

    const endOfToday =
      new Date(
        startOfToday
      );

    endOfToday.setDate(
      endOfToday.getDate() +
        1
    );

    const queue =
      leads
        .map(
          (lead) => {
            let priority =
              4;

            let queueType:
              | "OVERDUE"
              | "TODAY"
              | "NEW"
              | "GENERAL" =
              "GENERAL";

            if (
              lead.nextFollowUp &&
              lead.nextFollowUp <
                now
            ) {
              priority =
                1;

              queueType =
                "OVERDUE";
            } else if (
              lead.nextFollowUp &&
              lead.nextFollowUp >=
                startOfToday &&
              lead.nextFollowUp <
                endOfToday
            ) {
              priority =
                2;

              queueType =
                "TODAY";
            } else if (
              lead.stage ===
              "NEW"
            ) {
              priority =
                3;

              queueType =
                "NEW";
            }

            return {
              ...lead,

              queueType,

              priority,

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
          }
        )
        .sort(
          (a, b) => {
            if (
              a.priority !==
              b.priority
            ) {
              return (
                a.priority -
                b.priority
              );
            }

            const aFollowUp =
              a.nextFollowUp
                ? new Date(
                    a.nextFollowUp
                  ).getTime()
                : Number.MAX_SAFE_INTEGER;

            const bFollowUp =
              b.nextFollowUp
                ? new Date(
                    b.nextFollowUp
                  ).getTime()
                : Number.MAX_SAFE_INTEGER;

            return (
              aFollowUp -
              bFollowUp
            );
          }
        );

    return {
      success: true,

      total,

      page,

      limit,

      totalPages:
        Math.ceil(
          total /
            limit
        ),

      queue,
    };
  };


  /* ============================
   LEAD SUMMARY
============================ */

export const getLeadSummary =
  async (
    currentEmployee: any
  ) => {
    const accessWhere =
      await getLeadAccessWhere(
        currentEmployee
      );

    const startOfToday =
      new Date();

    startOfToday.setHours(
      0,
      0,
      0,
      0
    );

    const endOfToday =
      new Date(
        startOfToday
      );

    endOfToday.setDate(
      endOfToday.getDate() +
        1
    );

    const now =
      new Date();

    const [
      total,
      newLeads,
      working,
      followUp,
      converted,
      lost,
      todayFollowUps,
      overdueFollowUps,
      myLeads,
      unassigned,
    ] =
      await Promise.all([
        /* TOTAL */

        prisma.lead.count({
          where:
            accessWhere,
        }),

        /* NEW */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                stage:
                  "NEW",
              },
            ],
          },
        }),

        /* WORKING */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                stage:
                  "WORKING",
              },
            ],
          },
        }),

        /* FOLLOW UP STAGE */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                stage:
                  "FOLLOW_UP",
              },
            ],
          },
        }),

        /* CONVERTED */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                stage:
                  "CONVERTED",
              },
            ],
          },
        }),

        /* LOST */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                stage:
                  "LOST",
              },
            ],
          },
        }),

        /* TODAY FOLLOW UPS */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                nextFollowUp: {
                  gte:
                    startOfToday,

                  lt:
                    endOfToday,
                },
              },
              {
                stage: {
                  notIn: [
                    "CONVERTED",
                    "LOST",
                  ],
                },
              },
            ],
          },
        }),

        /* OVERDUE FOLLOW UPS */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                nextFollowUp: {
                  lt:
                    now,
                },
              },
              {
                stage: {
                  notIn: [
                    "CONVERTED",
                    "LOST",
                  ],
                },
              },
            ],
          },
        }),

        /* MY LEADS */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                assignedEmployeeId:
                  currentEmployee.id,
              },
            ],
          },
        }),

        /* UNASSIGNED */

        prisma.lead.count({
          where: {
            AND: [
              accessWhere,
              {
                assignedEmployeeId:
                  null,
              },
            ],
          },
        }),
      ]);

    return {
      success: true,

      summary: {
        total,

        new:
          newLeads,

        working,

        followUp,

        converted,

        lost,

        todayFollowUps,

        overdueFollowUps,

        myLeads,

        unassigned,
      },
    };
  };