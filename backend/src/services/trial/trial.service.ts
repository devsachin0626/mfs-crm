import prisma from "../../config/prisma";

import type {
  StartTrialRequest,
} from "../../types/trial.types";

import type {
  CurrentEmployee,
} from "../../types/current-employee.types";

/* ============================
   ROLE
============================ */

const getRoleName = (
  currentEmployee: CurrentEmployee
) => {
  if (
    typeof currentEmployee.role ===
    "string"
  ) {
    return currentEmployee.role;
  }

  return (
    currentEmployee.role?.name ||
    ""
  );
};

/* ============================
   MANAGE TRIAL

   Extend / Complete
============================ */

const canManageTrials = (
  currentEmployee: CurrentEmployee
) => {
  const roleName =
    getRoleName(
      currentEmployee
    );

  return (
    roleName === "ADMIN" ||
    roleName === "HR" ||
    roleName === "TEAM_LEADER"
  );
};

/* ============================
   ALLOWED EMPLOYEE IDS

   ADMIN / HR
   -> all

   TEAM LEADER
   -> self + direct team

   EMPLOYEE
   -> self
============================ */

const getAllowedEmployeeIds =
  async (
    currentEmployee: CurrentEmployee
  ): Promise<string[] | null> => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    if (
      roleName === "ADMIN" ||
      roleName === "HR"
    ) {
      return null;
    }

    if (
      roleName ===
      "EMPLOYEE"
    ) {
      return [
        currentEmployee.id,
      ];
    }

    if (
      roleName ===
      "TEAM_LEADER"
    ) {
      const teamMembers =
        await prisma.employee.findMany({
          where: {
            reportingManagerId:
              currentEmployee.id,

            isActive: true,
          },

          select: {
            id: true,
          },
        });

      return [
        currentEmployee.id,

        ...teamMembers.map(
          (item) =>
            item.id
        ),
      ];
    }

    return [];
  };

/* ============================
   CHECK TRIAL ACCESS
============================ */

const checkTrialAccess =
  async (
    employeeId:
      | string
      | null,

    currentEmployee:
      CurrentEmployee
  ) => {
    const allowedIds =
      await getAllowedEmployeeIds(
        currentEmployee
      );

    /*
     * ADMIN / HR
     */
    if (
      allowedIds === null
    ) {
      return;
    }

    if (!employeeId) {
      throw new Error(
        "Trial Access Denied"
      );
    }

    if (
      !allowedIds.includes(
        employeeId
      )
    ) {
      throw new Error(
        "Trial Access Denied"
      );
    }
  };

/* ============================
   CHECK LEAD ACCESS
============================ */

const checkLeadAccess =
  async (
    assignedEmployeeId:
      | string
      | null,

    currentEmployee:
      CurrentEmployee
  ) => {
    const allowedIds =
      await getAllowedEmployeeIds(
        currentEmployee
      );

    /*
     * ADMIN / HR
     */
    if (
      allowedIds === null
    ) {
      return;
    }

    /*
     * Employee / TL cannot
     * start trial on an
     * unassigned lead.
     */
    if (!assignedEmployeeId) {
      throw new Error(
        "Lead Is Not Assigned To Any Employee"
      );
    }

    if (
      !allowedIds.includes(
        assignedEmployeeId
      )
    ) {
      throw new Error(
        "Lead Access Denied"
      );
    }
  };

/* ============================
   VALIDATE DAYS
============================ */

const validateTrialDays = (
  trialDays: number
) => {
  if (
    !Number.isInteger(
      trialDays
    ) ||
    trialDays <= 0 ||
    trialDays > 365
  ) {
    throw new Error(
      "Trial Days Must Be Between 1 And 365"
    );
  }
};

/* ============================
   EXPIRE OLD TRIALS
============================ */

const expireOldTrials =
  async () => {
    await prisma.trial.updateMany({
      where: {
        status:
          "ACTIVE",

        endDate: {
          lt:
            new Date(),
        },
      },

      data: {
        status:
          "EXPIRED",
      },
    });
  };

/* ============================
   GENERATE TRIAL CODE
============================ */

const generateTrialCode =
  async () => {
    const lastTrial =
      await prisma.trial.findFirst({
        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          trialCode:
            true,
        },
      });

    if (!lastTrial) {
      return "TR00001";
    }

    const lastNumber =
      Number(
        lastTrial.trialCode.replace(
          "TR",
          ""
        )
      );

    const nextNumber =
      Number.isNaN(
        lastNumber
      )
        ? 1
        : lastNumber + 1;

    return `TR${String(
      nextNumber
    ).padStart(
      5,
      "0"
    )}`;
  };

/* ============================
   START TRIAL
============================ */

export const startTrial =
  async (
    data: StartTrialRequest,

    currentEmployee:
      CurrentEmployee
  ) => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    if (
      ![
        "ADMIN",
        "HR",
        "TEAM_LEADER",
        "EMPLOYEE",
      ].includes(
        roleName
      )
    ) {
      throw new Error(
        "Trial Creation Access Denied"
      );
    }

    /* ============================
       BASIC VALIDATION
    ============================ */

    if (
      !data.leadId &&
      !data.clientId
    ) {
      throw new Error(
        "Lead Or Client Is Required"
      );
    }

    if (!data.productId) {
      throw new Error(
        "Product Is Required"
      );
    }

    const trialDays =
      Number(
        data.trialDays
      );

    validateTrialDays(
      trialDays
    );

    await expireOldTrials();

    /* ============================
       LEAD

       Normal flow:
       Lead -> Demo -> Client
    ============================ */

    let lead:
      | {
          id: string;
          leadCode: string;
          name: string | null;
          mobile: string;
          email: string | null;
          stage: string;
          isConverted: boolean;
          assignedEmployeeId:
            | string
            | null;

          client:
            | {
                id: string;
                clientCode: string;
                isActive: boolean;
              }
            | null;
        }
      | null = null;

    if (data.leadId) {
      lead =
        await prisma.lead.findUnique({
          where: {
            id:
              data.leadId,
          },

          select: {
            id: true,

            leadCode:
              true,

            name: true,

            mobile: true,

            email: true,

            stage: true,

            isConverted:
              true,

            assignedEmployeeId:
              true,

            client: {
              select: {
                id: true,

                clientCode:
                  true,

                isActive:
                  true,
              },
            },
          },
        });

      if (!lead) {
        throw new Error(
          "Lead Not Found"
        );
      }

      if (
        lead.stage ===
        "LOST"
      ) {
        throw new Error(
          "Lost Lead Cannot Start Trial"
        );
      }

      await checkLeadAccess(
        lead.assignedEmployeeId,
        currentEmployee
      );
    }

    /* ============================
       CLIENT

       Existing clients can also
       receive another product demo.

       If client originated from
       a lead, preserve that lead
       relation automatically.
    ============================ */

    let client:
      | {
          id: string;
          clientCode: string;
          name: string;
          mobile: string;
          email: string | null;
          isActive: boolean;
          leadId:
            | string
            | null;
        }
      | null = null;

    if (data.clientId) {
      client =
        await prisma.client.findUnique({
          where: {
            id:
              data.clientId,
          },

          select: {
            id: true,

            clientCode:
              true,

            name: true,

            mobile: true,

            email: true,

            isActive:
              true,

            leadId: true,
          },
        });

      if (!client) {
        throw new Error(
          "Client Not Found"
        );
      }

      if (!client.isActive) {
        throw new Error(
          "Inactive Client Cannot Start Trial"
        );
      }
    }

    /* ============================
       EFFECTIVE LEAD / CLIENT

       If lead already converted,
       automatically attach its
       client.

       If client came from lead,
       automatically preserve the
       original lead relation.
    ============================ */

    let effectiveLeadId:
      | string
      | undefined =
      lead?.id ||
      undefined;

    let effectiveClientId:
      | string
      | undefined =
      client?.id ||
      undefined;

    /*
     * Lead already converted
     */
    if (
      lead?.client &&
      !effectiveClientId
    ) {
      if (
        !lead.client
          .isActive
      ) {
        throw new Error(
          "Converted Client Is Inactive"
        );
      }

      effectiveClientId =
        lead.client.id;
    }

    /*
     * Client originated from
     * an existing lead.
     */
    if (
      client?.leadId &&
      !effectiveLeadId
    ) {
      effectiveLeadId =
        client.leadId;

      const linkedLead =
        await prisma.lead.findUnique({
          where: {
            id:
              client.leadId,
          },

          select: {
            id: true,

            assignedEmployeeId:
              true,

            stage: true,
          },
        });

      if (!linkedLead) {
        throw new Error(
          "Client Source Lead Not Found"
        );
      }

      await checkLeadAccess(
        linkedLead.assignedEmployeeId,
        currentEmployee
      );
    }

    /*
     * If both were supplied,
     * they must belong to the
     * same lead/client journey.
     */
    if (
      lead &&
      client &&
      client.leadId &&
      client.leadId !==
        lead.id
    ) {
      throw new Error(
        "Selected Client Does Not Belong To Selected Lead"
      );
    }

    if (
      lead?.client &&
      client &&
      lead.client.id !==
        client.id
    ) {
      throw new Error(
        "Selected Lead Is Already Linked To Another Client"
      );
    }

    /* ============================
       DIRECT CLIENT SECURITY

       Client without source lead:
       Employee cannot pick random
       company clients.

       ADMIN / HR / TL can create
       direct client trial.
    ============================ */

    if (
      client &&
      !client.leadId &&
      roleName ===
        "EMPLOYEE"
    ) {
      throw new Error(
        "Employee Can Start Client Trial Only From Own Lead"
      );
    }

    /* ============================
       PRODUCT
    ============================ */

    const product =
      await prisma.product.findUnique({
        where: {
          id:
            data.productId,
        },

        select: {
          id: true,

          productCode:
            true,

          name: true,

          isActive:
            true,

          isTrialAvailable:
            true,
        },
      });

    if (!product) {
      throw new Error(
        "Product Not Found"
      );
    }

    if (!product.isActive) {
      throw new Error(
        "Inactive Product Cannot Start Trial"
      );
    }

    if (
      !product.isTrialAvailable
    ) {
      throw new Error(
        "Trial Not Available For This Product"
      );
    }

    /* ============================
       EMPLOYEE ASSIGNMENT

       EMPLOYEE:
       always self.

       Management:
       selected employee,
       otherwise lead owner,
       otherwise self.
    ============================ */

    let assignedEmployeeId:
      string;

    if (
      roleName ===
      "EMPLOYEE"
    ) {
      assignedEmployeeId =
        currentEmployee.id;
    } else {
      assignedEmployeeId =
        data.employeeId ||
        lead?.assignedEmployeeId ||
        currentEmployee.id;
    }

    const assignedEmployee =
      await prisma.employee.findUnique({
        where: {
          id:
            assignedEmployeeId,
        },

        select: {
          id: true,

          employeeCode:
            true,

          name: true,

          isActive:
            true,

          reportingManagerId:
            true,
        },
      });

    if (
      !assignedEmployee ||
      !assignedEmployee.isActive
    ) {
      throw new Error(
        "Assigned Employee Not Found Or Inactive"
      );
    }

    /* ============================
       TEAM LEADER ASSIGNMENT
    ============================ */

    if (
      roleName ===
      "TEAM_LEADER"
    ) {
      const allowedIds =
        await getAllowedEmployeeIds(
          currentEmployee
        );

      if (
        !allowedIds ||
        !allowedIds.includes(
          assignedEmployeeId
        )
      ) {
        throw new Error(
          "You Can Assign Trial Only To Yourself Or Your Team"
        );
      }
    }

    /* ============================
       DUPLICATE ACTIVE TRIAL

       Same Lead + Product
       OR
       Same Client + Product
    ============================ */

    const subjectFilters:
      any[] = [];

    if (
      effectiveLeadId
    ) {
      subjectFilters.push({
        leadId:
          effectiveLeadId,
      });
    }

    if (
      effectiveClientId
    ) {
      subjectFilters.push({
        clientId:
          effectiveClientId,
      });
    }

    const activeTrial =
      await prisma.trial.findFirst({
        where: {
          productId:
            data.productId,

          status:
            "ACTIVE",

          OR:
            subjectFilters,
        },

        select: {
          id: true,

          trialCode:
            true,
        },
      });

    if (activeTrial) {
      throw new Error(
        `Active Trial Already Exists (${activeTrial.trialCode})`
      );
    }

    /* ============================
       DATES
    ============================ */

    const startDate =
      new Date();

    const endDate =
      new Date(
        startDate
      );

    endDate.setDate(
      endDate.getDate() +
        trialDays
    );

    /* ============================
       TRIAL CODE
    ============================ */

    const trialCode =
      await generateTrialCode();

    /* ============================
       CREATE
    ============================ */

    const trial =
      await prisma.trial.create({
        data: {
          trialCode,

          leadId:
            effectiveLeadId,

          clientId:
            effectiveClientId,

          productId:
            data.productId,

          employeeId:
            assignedEmployeeId,

          startDate,

          endDate,

          trialDays,

          status:
            "ACTIVE",

          remarks:
            data.remarks
              ?.trim() ||
            undefined,
        },

        include: {
          lead: {
            select: {
              id: true,

              leadCode:
                true,

              name: true,

              mobile: true,

              email: true,

              stage: true,

              isConverted:
                true,
            },
          },

          client: {
            select: {
              id: true,

              clientCode:
                true,

              name: true,

              mobile: true,

              email: true,
            },
          },

          product: {
            select: {
              id: true,

              productCode:
                true,

              name: true,

              type: true,
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
      });

    return {
      success: true,

      message:
        "Trial Started Successfully",

      trial,
    };
  };

/* ============================
   GET TRIALS
============================ */

export const getTrials =
  async (
    page = 1,
    limit = 10,

    status?: string,
    search?: string,
    employeeId?: string,

    currentEmployee?:
      CurrentEmployee
  ) => {
    if (!currentEmployee) {
      throw new Error(
        "Authenticated Employee Not Found"
      );
    }

    await expireOldTrials();

    const safePage =
      Math.max(
        Number(page) || 1,
        1
      );

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 10,
          1
        ),
        100
      );

    const skip =
      (safePage - 1) *
      safeLimit;

    const where: any =
      {};

    /* ============================
       ROLE FILTER
    ============================ */

    const allowedIds =
      await getAllowedEmployeeIds(
        currentEmployee
      );

    if (
      allowedIds !== null
    ) {
      where.employeeId = {
        in:
          allowedIds,
      };
    }

    /* ============================
       EMPLOYEE FILTER
    ============================ */

    if (employeeId) {
      await checkTrialAccess(
        employeeId,
        currentEmployee
      );

      where.employeeId =
        employeeId;
    }

    /* ============================
       STATUS FILTER
    ============================ */

    if (status) {
      const normalizedStatus =
        status.toUpperCase();

      const allowedStatuses = [
        "ACTIVE",
        "COMPLETED",
        "EXPIRED",
        "CANCELLED",
      ];

      if (
        !allowedStatuses.includes(
          normalizedStatus
        )
      ) {
        throw new Error(
          "Invalid Trial Status"
        );
      }

      where.status =
        normalizedStatus;
    }

    /* ============================
       SEARCH

       Trial Code
       Lead
       Client
       Product
       Employee
    ============================ */

    if (
      search?.trim()
    ) {
      const value =
        search.trim();

      where.OR = [
        {
          trialCode: {
            contains:
              value,

            mode:
              "insensitive",
          },
        },

        {
          lead: {
            is: {
              leadCode: {
                contains:
                  value,

                mode:
                  "insensitive",
              },
            },
          },
        },

        {
          lead: {
            is: {
              name: {
                contains:
                  value,

                mode:
                  "insensitive",
              },
            },
          },
        },

        {
          lead: {
            is: {
              mobile: {
                contains:
                  value,
              },
            },
          },
        },

        {
          client: {
            is: {
              clientCode: {
                contains:
                  value,

                mode:
                  "insensitive",
              },
            },
          },
        },

        {
          client: {
            is: {
              name: {
                contains:
                  value,

                mode:
                  "insensitive",
              },
            },
          },
        },

        {
          client: {
            is: {
              mobile: {
                contains:
                  value,
              },
            },
          },
        },

        {
          product: {
            name: {
              contains:
                value,

              mode:
                "insensitive",
            },
          },
        },

        {
          employee: {
            is: {
              name: {
                contains:
                  value,

                mode:
                  "insensitive",
              },
            },
          },
        },
      ];
    }

    /* ============================
       DATA
    ============================ */

    const [
      trials,
      total,
    ] =
      await Promise.all([
        prisma.trial.findMany({
          where,

          skip,

          take:
            safeLimit,

          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            lead: {
              select: {
                id: true,

                leadCode:
                  true,

                name: true,

                mobile: true,

                email: true,

                stage: true,

                isConverted:
                  true,
              },
            },

            client: {
              select: {
                id: true,

                clientCode:
                  true,

                name: true,

                mobile: true,

                email: true,
              },
            },

            product: {
              select: {
                id: true,

                productCode:
                  true,

                name: true,

                type: true,
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

        prisma.trial.count({
          where,
        }),
      ]);

    return {
      success: true,

      total,

      page:
        safePage,

      limit:
        safeLimit,

      totalPages:
        Math.ceil(
          total /
            safeLimit
        ),

      trials,
    };
  };

/* ============================
   GET TRIAL DETAILS
============================ */

export const getTrialById =
  async (
    id: string,

    currentEmployee:
      CurrentEmployee
  ) => {
    await expireOldTrials();

    const trial =
      await prisma.trial.findUnique({
        where: {
          id,
        },

        include: {
          lead: {
            select: {
              id: true,

              leadCode:
                true,

              name: true,

              mobile: true,

              email: true,

              city: true,

              state: true,

              address: true,

              stage: true,

              isConverted:
                true,

              assignedEmployeeId:
                true,
            },
          },

          client: {
            select: {
              id: true,

              clientCode:
                true,

              name: true,

              mobile: true,

              email: true,

              city: true,

              state: true,

              address: true,

              isActive:
                true,
            },
          },

          product: {
            select: {
              id: true,

              productCode:
                true,

              name: true,

              type: true,

              price: true,

              durationDays:
                true,

              isTrialAvailable:
                true,
            },
          },

          employee: {
            select: {
              id: true,

              employeeCode:
                true,

              name: true,

              email: true,

              mobile: true,
            },
          },
        },
      });

    if (!trial) {
      throw new Error(
        "Trial Not Found"
      );
    }

    await checkTrialAccess(
      trial.employeeId,
      currentEmployee
    );

    return {
      success: true,

      trial,
    };
  };

/* ============================
   EXTEND TRIAL
============================ */

export const extendTrial =
  async (
    id: string,

    trialDays: number,

    remarks:
      | string
      | undefined,

    currentEmployee:
      CurrentEmployee
  ) => {
    if (
      !canManageTrials(
        currentEmployee
      )
    ) {
      throw new Error(
        "Trial Management Access Denied"
      );
    }

    const days =
      Number(
        trialDays
      );

    validateTrialDays(
      days
    );

    await expireOldTrials();

    const trial =
      await prisma.trial.findUnique({
        where: {
          id,
        },
      });

    if (!trial) {
      throw new Error(
        "Trial Not Found"
      );
    }

    await checkTrialAccess(
      trial.employeeId,
      currentEmployee
    );

    if (
      trial.status !==
      "ACTIVE"
    ) {
      throw new Error(
        "Only Active Trial Can Be Extended"
      );
    }

    const endDate =
      new Date(
        trial.endDate
      );

    endDate.setDate(
      endDate.getDate() +
        days
    );

    const oldRemarks =
      trial.remarks
        ?.trim() ||
      "";

    const newRemarks =
      remarks?.trim() ||
      "";

    const finalRemarks =
      newRemarks
        ? oldRemarks
          ? `${oldRemarks}\nExtension: ${newRemarks}`
          : `Extension: ${newRemarks}`
        : oldRemarks ||
          undefined;

    const updatedTrial =
      await prisma.trial.update({
        where: {
          id,
        },

        data: {
          endDate,

          trialDays:
            trial.trialDays +
            days,

          extensionCount: {
            increment:
              1,
          },

          remarks:
            finalRemarks,
        },

        include: {
          lead: {
            select: {
              id: true,

              leadCode:
                true,

              name: true,

              mobile: true,

              stage: true,

              isConverted:
                true,
            },
          },

          client: {
            select: {
              id: true,

              clientCode:
                true,

              name: true,

              mobile: true,
            },
          },

          product: {
            select: {
              id: true,

              productCode:
                true,

              name: true,
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
      });

    return {
      success: true,

      message:
        "Trial Extended Successfully",

      trial:
        updatedTrial,
    };
  };

/* ============================
   COMPLETE TRIAL
============================ */

export const completeTrial =
  async (
    id: string,

    currentEmployee:
      CurrentEmployee
  ) => {
    if (
      !canManageTrials(
        currentEmployee
      )
    ) {
      throw new Error(
        "Trial Management Access Denied"
      );
    }

    await expireOldTrials();

    const trial =
      await prisma.trial.findUnique({
        where: {
          id,
        },
      });

    if (!trial) {
      throw new Error(
        "Trial Not Found"
      );
    }

    await checkTrialAccess(
      trial.employeeId,
      currentEmployee
    );

    if (
      trial.status ===
      "COMPLETED"
    ) {
      throw new Error(
        "Trial Already Completed"
      );
    }

    if (
      trial.status ===
      "CANCELLED"
    ) {
      throw new Error(
        "Cancelled Trial Cannot Be Completed"
      );
    }

    if (
      trial.status ===
      "EXPIRED"
    ) {
      throw new Error(
        "Expired Trial Cannot Be Completed"
      );
    }

    const updatedTrial =
      await prisma.trial.update({
        where: {
          id,
        },

        data: {
          status:
            "COMPLETED",
        },

        include: {
          lead: {
            select: {
              id: true,

              leadCode:
                true,

              name: true,

              mobile: true,

              stage: true,

              isConverted:
                true,
            },
          },

          client: {
            select: {
              id: true,

              clientCode:
                true,

              name: true,

              mobile: true,
            },
          },

          product: {
            select: {
              id: true,

              productCode:
                true,

              name: true,
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
      });

    return {
      success: true,

      message:
        "Trial Completed Successfully",

      trial:
        updatedTrial,
    };
  };