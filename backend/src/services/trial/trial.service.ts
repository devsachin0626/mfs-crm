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
============================ */

const getAllowedEmployeeIds =
  async (
    currentEmployee: CurrentEmployee
  ): Promise<
    string[] | null
  > => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    /* ADMIN / HR */

    if (
      roleName === "ADMIN" ||
      roleName === "HR"
    ) {
      return null;
    }

    /* EMPLOYEE */

    if (
      roleName ===
      "EMPLOYEE"
    ) {
      return [
        currentEmployee.id,
      ];
    }

    /* TEAM LEADER */

    if (
      roleName ===
      "TEAM_LEADER"
    ) {
      const teamMembers =
        await prisma.employee.findMany({
          where: {
            reportingManagerId:
              currentEmployee.id,

            isActive:
              true,
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
    const now =
      new Date();

    await prisma.trial.updateMany({
      where: {
        status:
          "ACTIVE",

        endDate: {
          lt:
            now,
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

    validateTrialDays(
      Number(
        data.trialDays
      )
    );

    /* ============================
       CLIENT
    ============================ */

    const client =
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

          isActive:
            true,
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
    ============================ */

    let assignedEmployeeId:
      string;

    /*
     * EMPLOYEE:
     * always self assigned.
     *
     * Frontend kisi aur ka
     * employeeId bheje tab bhi
     * backend ignore karega.
     */

    if (
      roleName ===
      "EMPLOYEE"
    ) {
      assignedEmployeeId =
        currentEmployee.id;
    } else {
      assignedEmployeeId =
        data.employeeId ||
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
       TL ASSIGNMENT ACCESS
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
       EXPIRE OLD
    ============================ */

    await expireOldTrials();

    /* ============================
       ACTIVE DUPLICATE

       Same client + same product
       cannot have another ACTIVE
       trial.
    ============================ */

    const activeTrial =
      await prisma.trial.findFirst({
        where: {
          clientId:
            data.clientId,

          productId:
            data.productId,

          status:
            "ACTIVE",
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
        Number(
          data.trialDays
        )
    );

    /* ============================
       CODE
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

          clientId:
            data.clientId,

          productId:
            data.productId,

          employeeId:
            assignedEmployeeId,

          startDate,

          endDate,

          trialDays:
            Number(
              data.trialDays
            ),

          status:
            "ACTIVE",

          remarks:
            data.remarks
              ?.trim() ||
            undefined,
        },

        include: {
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
    if (
      !currentEmployee
    ) {
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
       STATUS
    ============================ */

    if (status) {
      const normalizedStatus =
        status.toUpperCase();

      const statuses = [
        "ACTIVE",
        "COMPLETED",
        "EXPIRED",
        "CANCELLED",
      ];

      if (
        !statuses.includes(
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
          client: {
            name: {
              contains:
                value,

              mode:
                "insensitive",
            },
          },
        },

        {
          client: {
            mobile: {
              contains:
                value,
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
            name: {
              contains:
                value,

              mode:
                "insensitive",
            },
          },
        },
      ];
    }

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

    validateTrialDays(
      Number(
        trialDays
      )
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
        Number(
          trialDays
        )
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
            Number(
              trialDays
            ),

          extensionCount: {
            increment:
              1,
          },

          remarks:
            finalRemarks,
        },

        include: {
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