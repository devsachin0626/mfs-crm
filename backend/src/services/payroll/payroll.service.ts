import prisma from "../../config/prisma";

import {
  PayrollStatus,
} from "@prisma/client";

import type {
  CreatePayrollRequest,
  UpdatePayrollRequest,
} from "../../types/payroll.types";

import {
  calculatePayrollPolicy,
} from "./payroll-policy.service";

import type {
  CurrentEmployee,
} from "../../types/current-employee.types";

/* ============================
   CURRENT EMPLOYEE
============================ */



/* ============================
   ROLE NAME
============================ */

const getRoleName = (
  currentEmployee:
    CurrentEmployee
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
   PAYROLL ACCESS IDS

   ADMIN / HR
   -> ALL

   EMPLOYEE
   -> SELF

   TEAM LEADER
   -> SELF + TEAM
============================ */

const getPayrollEmployeeIds =
  async (
    currentEmployee:
      CurrentEmployee
  ) => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    if (
      roleName ===
        "ADMIN" ||
      roleName ===
        "HR"
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
   CHECK VIEW ACCESS
============================ */

const checkPayrollAccess =
  async (
    employeeId: string,

    currentEmployee:
      CurrentEmployee
  ) => {
    const allowedIds =
      await getPayrollEmployeeIds(
        currentEmployee
      );

    if (
      allowedIds === null
    ) {
      return;
    }

    if (
      !allowedIds.includes(
        employeeId
      )
    ) {
      throw new Error(
        "Payroll Access Denied"
      );
    }
  };

/* ============================
   CHECK MANAGEMENT ACCESS
============================ */

const checkPayrollManageAccess =
  (
    currentEmployee:
      CurrentEmployee
  ) => {
    const roleName =
      getRoleName(
        currentEmployee
      );

    if (
      roleName !==
        "ADMIN" &&
      roleName !==
        "HR"
    ) {
      throw new Error(
        "Payroll Management Access Denied"
      );
    }
  };

/* ============================
   PERIOD VALIDATION
============================ */

const validatePayrollPeriod =
  (
    month: number,
    year: number
  ) => {
    if (
      !Number.isInteger(
        month
      ) ||
      month < 1 ||
      month > 12
    ) {
      throw new Error(
        "Invalid Payroll Month"
      );
    }

    if (
      !Number.isInteger(
        year
      ) ||
      year < 2000 ||
      year > 2100
    ) {
      throw new Error(
        "Invalid Payroll Year"
      );
    }
  };

/* ============================
   PAYROLL PREVIEW
============================ */

export const previewPayroll =
  async (
    employeeId: string,

    month: number,

    year: number,

    incentive: number = 0,

    bonus: number = 0,

    deduction: number = 0,

    currentEmployee:
      CurrentEmployee
  ) => {
    checkPayrollManageAccess(
      currentEmployee
    );

    validatePayrollPeriod(
      month,
      year
    );

    /* ============================
       DUPLICATE CHECK
    ============================ */

    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          employeeId_month_year:
            {
              employeeId,
              month,
              year,
            },
        },
      });

    if (
      existingPayroll
    ) {
      throw new Error(
        "Payroll Already Exists For This Employee And Month"
      );
    }

    /* ============================
       POLICY ENGINE
    ============================ */

    const policy =
      await calculatePayrollPolicy({
        employeeId,

        month,

        year,

        incentive,

        bonus,

        deduction,

        currentEmployee,
      });

    return {
      success: true,

      employee:
        policy.employee,

      month:
        policy.month,

      year:
        policy.year,

      period:
        policy.period,

      attendance:
        policy.attendance,

      leaveBalance:
        policy.leaveBalance,

      salary:
        policy.salary,
    };
  };

/* ============================
   CREATE PAYROLL
============================ */

export const createPayroll =
  async (
    data:
      CreatePayrollRequest,

    currentEmployee:
      CurrentEmployee
  ) => {
    checkPayrollManageAccess(
      currentEmployee
    );

    validatePayrollPeriod(
      data.month,
      data.year
    );

    /* ============================
       DUPLICATE CHECK
    ============================ */

    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          employeeId_month_year:
            {
              employeeId:
                data.employeeId,

              month:
                data.month,

              year:
                data.year,
            },
        },
      });

    if (
      existingPayroll
    ) {
      throw new Error(
        "Payroll Already Exists For This Employee And Month"
      );
    }

    /* ============================
       IMPORTANT

       Salary / attendance values
       frontend se nahi lenge.

       Backend policy engine
       sab calculate karega.
    ============================ */

    const policy =
      await calculatePayrollPolicy({
        employeeId:
          data.employeeId,

        month:
          data.month,

        year:
          data.year,

        incentive:
          Number(
            data.incentive ||
              0
          ),

        bonus:
          Number(
            data.bonus ||
              0
          ),

        deduction:
          Number(
            data.deduction ||
              0
          ),

        currentEmployee,
      });

    /* ============================
       TRANSACTION

       Payroll
       +
       Leave Balance
    ============================ */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /* ============================
             SAVE LEAVE BALANCE
          ============================ */

          await tx.employeeLeaveBalance.upsert({
            where: {
              employeeId_month_year:
                {
                  employeeId:
                    data.employeeId,

                  month:
                    data.month,

                  year:
                    data.year,
                },
            },

            create: {
              employeeId:
                data.employeeId,

              month:
                data.month,

              year:
                data.year,

              openingBalance:
                policy
                  .leaveBalance
                  .openingBalance,

              creditedLeave:
                policy
                  .leaveBalance
                  .creditedLeave,

              usedPaidLeave:
                policy
                  .leaveBalance
                  .usedPaidLeave,

              closingBalance:
                policy
                  .leaveBalance
                  .closingBalance,
            },

            update: {
              openingBalance:
                policy
                  .leaveBalance
                  .openingBalance,

              creditedLeave:
                policy
                  .leaveBalance
                  .creditedLeave,

              usedPaidLeave:
                policy
                  .leaveBalance
                  .usedPaidLeave,

              closingBalance:
                policy
                  .leaveBalance
                  .closingBalance,
            },
          });

          /* ============================
             CREATE PAYROLL
          ============================ */

          const payroll =
            await tx.payroll.create({
              data: {
                employeeId:
                  data.employeeId,

                month:
                  data.month,

                year:
                  data.year,

                periodStart:
                  policy
                    .period
                    .start,

                periodEnd:
                  policy
                    .period
                    .end,

                basicSalary:
                  policy
                    .salary
                    .basicSalary,

                /*
                 * Existing workingDays
                 * compatibility field.
                 */

                workingDays:
                  policy
                    .attendance
                    .scheduledWorkingDays,

                scheduledWorkingDays:
                  policy
                    .attendance
                    .scheduledWorkingDays,

                presentDays:
                  policy
                    .attendance
                    .presentDays,

                lateDays:
                  policy
                    .attendance
                    .lateDays,

                halfDays:
                  policy
                    .attendance
                    .halfDays,

                leaveDays:
                  policy
                    .attendance
                    .approvedLeaveDays,

                absentDays:
                  policy
                    .attendance
                    .absentDays,

                paidLeaveDays:
                  policy
                    .attendance
                    .paidLeaveDays,

                unpaidLeaveDays:
                  policy
                    .attendance
                    .unpaidLeaveDays,

                actualLateCount:
                  policy
                    .attendance
                    .actualLateCount,

                allowedLateCount:
                  policy
                    .attendance
                    .allowedLateCount,

                excessLateCount:
                  policy
                    .attendance
                    .excessLateCount,

                earlyGoingCount:
                  policy
                    .attendance
                    .earlyGoingCount,

                allowedEarlyGoingCount:
                  policy
                    .attendance
                    .allowedEarlyGoingCount,

                grossSalary:
                  policy
                    .salary
                    .grossSalary,

                incentive:
                  policy
                    .salary
                    .incentive,

                bonus:
                  policy
                    .salary
                    .bonus,

                deduction:
                  policy
                    .salary
                    .otherDeduction,

                lateDeduction:
                  policy
                    .salary
                    .lateDeduction,

                netSalary:
                  policy
                    .salary
                    .netSalary,

                /*
                 * New payroll always
                 * starts as PENDING.
                 */

                status:
                  PayrollStatus.PENDING,

                remarks:
                  data.remarks,
              },

              include: {
                employee: {
                  select: {
                    id: true,

                    employeeCode:
                      true,

                    name: true,

                    mobile: true,

                    email: true,

                    salary: true,

                    role: {
                      select: {
                        name: true,
                      },
                    },

                    branch: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            });

          return payroll;
        }
      );

    return {
      success: true,

      message:
        "Payroll Created Successfully",

      payroll:
        result,

      leaveBalance:
        policy.leaveBalance,
    };
  };

/* ============================
   GET PAYROLLS
============================ */

export const getPayrolls =
  async (
    page: number,

    limit: number,

    search:
      | string
      | undefined,

    month:
      | number
      | undefined,

    year:
      | number
      | undefined,

    status:
      | PayrollStatus
      | undefined,

    employeeId:
      | string
      | undefined,

    currentEmployee:
      CurrentEmployee
  ) => {
    const safePage =
      Math.max(
        Number(page) ||
          1,
        1
      );

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) ||
            10,
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
       ROLE ACCESS
    ============================ */

    const allowedIds =
      await getPayrollEmployeeIds(
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

    if (
      employeeId
    ) {
      await checkPayrollAccess(
        employeeId,
        currentEmployee
      );

      where.employeeId =
        employeeId;
    }

    /* ============================
       SEARCH
    ============================ */

    if (search) {
      where.employee = {
        OR: [
          {
            name: {
              contains:
                search,

              mode:
                "insensitive",
            },
          },

          {
            employeeCode: {
              contains:
                search,

              mode:
                "insensitive",
            },
          },

          {
            mobile: {
              contains:
                search,
            },
          },
        ],
      };
    }

    /* ============================
       MONTH
    ============================ */

    if (
      month !==
      undefined
    ) {
      if (
        month < 1 ||
        month > 12
      ) {
        throw new Error(
          "Invalid Payroll Month"
        );
      }

      where.month =
        month;
    }

    /* ============================
       YEAR
    ============================ */

    if (
      year !==
      undefined
    ) {
      where.year =
        year;
    }

    /* ============================
       STATUS
    ============================ */

    if (status) {
      if (
        !Object.values(
          PayrollStatus
        ).includes(
          status
        )
      ) {
        throw new Error(
          "Invalid Payroll Status"
        );
      }

      where.status =
        status;
    }

    const [
      payrolls,
      total,
    ] =
      await Promise.all([
        prisma.payroll.findMany({
          where,

          include: {
            employee: {
              select: {
                id: true,

                employeeCode:
                  true,

                name: true,

                mobile: true,

                email: true,

                salary: true,

                role: {
                  select: {
                    name: true,
                  },
                },

                branch: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },

          orderBy: [
            {
              year:
                "desc",
            },

            {
              month:
                "desc",
            },

            {
              createdAt:
                "desc",
            },
          ],

          skip,

          take:
            safeLimit,
        }),

        prisma.payroll.count({
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

      payrolls,
    };
  };

/* ============================
   GET PAYROLL BY ID
============================ */

export const getPayrollById =
  async (
    id: string,

    currentEmployee:
      CurrentEmployee
  ) => {
    const payroll =
      await prisma.payroll.findUnique({
        where: {
          id,
        },

        include: {
          employee: {
            select: {
              id: true,

              employeeCode:
                true,

              name: true,

              mobile: true,

              email: true,

              salary: true,

              role: {
                select: {
                  name: true,
                },
              },

              branch: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!payroll) {
      throw new Error(
        "Payroll Not Found"
      );
    }

    await checkPayrollAccess(
      payroll.employeeId,
      currentEmployee
    );

    return {
      success: true,

      payroll,
    };
  };

/* ============================
   UPDATE PAYROLL
============================ */

export const updatePayroll =
  async (
    id: string,

    data:
      UpdatePayrollRequest,

    currentEmployee:
      CurrentEmployee
  ) => {
    checkPayrollManageAccess(
      currentEmployee
    );

    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          id,
        },
      });

    if (
      !existingPayroll
    ) {
      throw new Error(
        "Payroll Not Found"
      );
    }

    /* ============================
       PAID = FULL LOCK
    ============================ */

    if (
      existingPayroll.status ===
      PayrollStatus.PAID
    ) {
      throw new Error(
        "Paid Payroll Cannot Be Modified"
      );
    }

    /* ============================
       STATUS TRANSITIONS
    ============================ */

    let newStatus:
      PayrollStatus =
      existingPayroll.status;

    if (
      data.status !==
      undefined
    ) {
      const allowedTransitions: Record<
        PayrollStatus,
        PayrollStatus[]
      > = {
        PENDING: [
          PayrollStatus.GENERATED,
        ],

        GENERATED: [
          PayrollStatus.APPROVED,
        ],

        APPROVED: [
          PayrollStatus.PAID,
        ],

        PAID: [],
      };

      if (
        data.status !==
          existingPayroll.status &&
        !allowedTransitions[
          existingPayroll.status
        ].includes(
          data.status
        )
      ) {
        throw new Error(
          `Invalid Payroll Status Transition: ${existingPayroll.status} -> ${data.status}`
        );
      }

      newStatus =
        data.status;
    }

    /* ============================
       ONLY ADJUSTMENTS CAN CHANGE

       Attendance / Salary base /
       Period cannot be manually
       manipulated after generation.
    ============================ */

    const incentive =
      data.incentive !==
      undefined
        ? Math.max(
            Number(
              data.incentive
            ),
            0
          )
        : Number(
            existingPayroll.incentive
          );

    const bonus =
      data.bonus !==
      undefined
        ? Math.max(
            Number(
              data.bonus
            ),
            0
          )
        : Number(
            existingPayroll.bonus
          );

    const deduction =
      data.deduction !==
      undefined
        ? Math.max(
            Number(
              data.deduction
            ),
            0
          )
        : Number(
            existingPayroll.deduction
          );

    const grossSalary =
      Number(
        existingPayroll.grossSalary
      );

    const lateDeduction =
      Number(
        existingPayroll.lateDeduction
      );

    const netSalary =
      Number(
        Math.max(
          grossSalary +
            incentive +
            bonus -
            deduction -
            lateDeduction,

          0
        ).toFixed(2)
      );

    const payroll =
      await prisma.payroll.update({
        where: {
          id,
        },

        data: {
          incentive,

          bonus,

          deduction,

          netSalary,

          status:
            newStatus,

          ...(data.remarks !==
            undefined && {
            remarks:
              data.remarks,
          }),
        },

        include: {
          employee: {
            select: {
              id: true,

              employeeCode:
                true,

              name: true,

              mobile: true,

              email: true,
            },
          },
        },
      });

    return {
      success: true,

      message:
        newStatus !==
        existingPayroll.status
          ? `Payroll Status Updated To ${newStatus}`
          : "Payroll Updated Successfully",

      payroll,
    };
  };

  /* ============================
   RECALCULATE PAYROLL

   Only PENDING payroll can be
   recalculated from latest:
   - Attendance
   - Leave
   - Settings
   - Employee Salary
============================ */

export const recalculatePayroll =
  async (
    id: string,
    currentEmployee:
      CurrentEmployee
  ) => {
    checkPayrollManageAccess(
      currentEmployee
    );

    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          id,
        },
      });

    if (!existingPayroll) {
      throw new Error(
        "Payroll Not Found"
      );
    }

    /* ============================
       ONLY PENDING
    ============================ */

    if (
      existingPayroll.status !==
      PayrollStatus.PENDING
    ) {
      throw new Error(
        "Only Pending Payroll Can Be Recalculated"
      );
    }

    /* ============================
       POLICY ENGINE

       Preserve manual:
       - Incentive
       - Bonus
       - Deduction
    ============================ */

    const policy =
      await calculatePayrollPolicy({
        employeeId:
          existingPayroll.employeeId,

        month:
          existingPayroll.month,

        year:
          existingPayroll.year,

        incentive:
          Number(
            existingPayroll.incentive
          ),

        bonus:
          Number(
            existingPayroll.bonus
          ),

        deduction:
          Number(
            existingPayroll.deduction
          ),

        currentEmployee,
      });

    /* ============================
       TRANSACTION
    ============================ */

    const payroll =
      await prisma.$transaction(
        async (tx) => {
          /* ============================
             UPDATE LEAVE BALANCE
          ============================ */

          await tx.employeeLeaveBalance.upsert({
            where: {
              employeeId_month_year:
                {
                  employeeId:
                    existingPayroll.employeeId,

                  month:
                    existingPayroll.month,

                  year:
                    existingPayroll.year,
                },
            },

            create: {
              employeeId:
                existingPayroll.employeeId,

              month:
                existingPayroll.month,

              year:
                existingPayroll.year,

              openingBalance:
                policy.leaveBalance
                  .openingBalance,

              creditedLeave:
                policy.leaveBalance
                  .creditedLeave,

              usedPaidLeave:
                policy.leaveBalance
                  .usedPaidLeave,

              closingBalance:
                policy.leaveBalance
                  .closingBalance,
            },

            update: {
              openingBalance:
                policy.leaveBalance
                  .openingBalance,

              creditedLeave:
                policy.leaveBalance
                  .creditedLeave,

              usedPaidLeave:
                policy.leaveBalance
                  .usedPaidLeave,

              closingBalance:
                policy.leaveBalance
                  .closingBalance,
            },
          });

          /* ============================
             UPDATE PAYROLL SNAPSHOT
          ============================ */

          return tx.payroll.update({
            where: {
              id,
            },

            data: {
              periodStart:
                policy.period.start,

              periodEnd:
                policy.period.end,

              basicSalary:
                policy.salary
                  .basicSalary,

              workingDays:
                policy.attendance
                  .scheduledWorkingDays,

              scheduledWorkingDays:
                policy.attendance
                  .scheduledWorkingDays,

              presentDays:
                policy.attendance
                  .presentDays,

              lateDays:
                policy.attendance
                  .lateDays,

              halfDays:
                policy.attendance
                  .halfDays,

              leaveDays:
                policy.attendance
                  .approvedLeaveDays,

              absentDays:
                policy.attendance
                  .absentDays,

              paidLeaveDays:
                policy.attendance
                  .paidLeaveDays,

              unpaidLeaveDays:
                policy.attendance
                  .unpaidLeaveDays,

              actualLateCount:
                policy.attendance
                  .actualLateCount,

              allowedLateCount:
                policy.attendance
                  .allowedLateCount,

              excessLateCount:
                policy.attendance
                  .excessLateCount,

              earlyGoingCount:
                policy.attendance
                  .earlyGoingCount,

              allowedEarlyGoingCount:
                policy.attendance
                  .allowedEarlyGoingCount,

              grossSalary:
                policy.salary
                  .grossSalary,

              /*
               * Preserve manual
               * adjustment values,
               * but use policy output.
               */

              incentive:
                policy.salary
                  .incentive,

              bonus:
                policy.salary
                  .bonus,

              deduction:
                policy.salary
                  .otherDeduction,

              lateDeduction:
                policy.salary
                  .lateDeduction,

              netSalary:
                policy.salary
                  .netSalary,
            },

            include: {
              employee: {
                select: {
                  id: true,

                  employeeCode:
                    true,

                  name: true,

                  mobile: true,

                  email: true,

                  salary: true,

                  role: {
                    select: {
                      name: true,
                    },
                  },

                  branch: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });
        }
      );

    return {
      success: true,

      message:
        "Payroll Recalculated Successfully",

      payroll,

      leaveBalance:
        policy.leaveBalance,
    };
  };