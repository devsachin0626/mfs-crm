import prisma from "../../config/prisma";

import type {
  ReportFilters,
} from "../../types/report.types";

/* ============================
   PAGINATION
============================ */

const getPagination = (
  page?: number,
  limit?: number
) => {
  const safePage =
    Math.max(
      Number(page) || 1,
      1
    );

  const safeLimit =
    Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

  return {
    page: safePage,

    limit: safeLimit,

    skip:
      (safePage - 1) *
      safeLimit,
  };
};

/* ============================
   DATE FILTER
============================ */

const getDateFilter = (
  fromDate?: string,
  toDate?: string
) => {
  if (
    !fromDate &&
    !toDate
  ) {
    return undefined;
  }

  const createdAt: {
    gte?: Date;
    lte?: Date;
  } = {};

  if (fromDate) {
    const start =
      new Date(
        `${fromDate}T00:00:00`
      );

    if (
      Number.isNaN(
        start.getTime()
      )
    ) {
      throw new Error(
        "Invalid From Date"
      );
    }

    createdAt.gte =
      start;
  }

  if (toDate) {
    const end =
      new Date(
        `${toDate}T23:59:59.999`
      );

    if (
      Number.isNaN(
        end.getTime()
      )
    ) {
      throw new Error(
        "Invalid To Date"
      );
    }

    createdAt.lte =
      end;
  }

  if (
    createdAt.gte &&
    createdAt.lte &&
    createdAt.gte >
      createdAt.lte
  ) {
    throw new Error(
      "From Date Cannot Be After To Date"
    );
  }

  return createdAt;
};

/* ============================
   REPORT FILTER OPTIONS

   ADMIN ONLY route will use
   this service.
============================ */

export const getReportFilterOptions =
  async () => {
    const [
      employees,
      leadStatuses,
      leadSources,
      products,
    ] =
      await Promise.all([
        prisma.employee.findMany({
          where: {
            isActive:
              true,
          },

          select: {
            id: true,

            employeeCode:
              true,

            name: true,

            role: {
              select: {
                name: true,
              },
            },
          },

          orderBy: {
            name: "asc",
          },
        }),

        prisma.leadStatus.findMany({
          where: {
            isActive:
              true,
          },

          select: {
            id: true,

            name: true,

            color: true,

            sortOrder:
              true,
          },

          orderBy: [
            {
              sortOrder:
                "asc",
            },
            {
              name: "asc",
            },
          ],
        }),

        prisma.leadSource.findMany({
          where: {
            isActive:
              true,
          },

          select: {
            id: true,

            name: true,
          },

          orderBy: {
            name: "asc",
          },
        }),

        prisma.product.findMany({
          where: {
            isActive:
              true,
          },

          select: {
            id: true,

            productCode:
              true,

            name: true,

            type: true,
          },

          orderBy: {
            name: "asc",
          },
        }),
      ]);

    return {
      success: true,

      filters: {
        employees,

        leadStatuses,

        leadStages: [
          "NEW",
          "WORKING",
          "FOLLOW_UP",
          "CONVERTED",
          "LOST",
        ],

        leadSources,

        callOutcomes: [
          "CONNECTED",
          "NO_ANSWER",
          "BUSY",
          "CALL_BACK",
          "INTERESTED",
          "DEMO",
          "NOT_INTERESTED",
          "WRONG_NUMBER",
        ],

        trialStatuses: [
          "ACTIVE",
          "COMPLETED",
          "EXPIRED",
          "CANCELLED",
        ],

        paymentStatuses: [
          "PENDING",
          "PARTIAL",
          "PAID",
          "REFUNDED",
        ],

        products,
      },
    };
  };

/* ============================
   LEAD REPORT WHERE
============================ */

const buildLeadWhere =
  async (
    filters: ReportFilters
  ) => {
    const where: any =
      {};

    /* DATE */

    const createdAt =
      getDateFilter(
        filters.fromDate,
        filters.toDate
      );

    if (createdAt) {
      where.createdAt =
        createdAt;
    }

    /* EMPLOYEE */

    if (
      filters.employeeId
    ) {
      const employee =
        await prisma.employee.findUnique({
          where: {
            id:
              filters.employeeId,
          },

          select: {
            id: true,
          },
        });

      if (!employee) {
        throw new Error(
          "Employee Not Found"
        );
      }

      where.assignedEmployeeId =
        filters.employeeId;
    }

    /* LEAD STATUS

       filters.status stores
       LeadStatus ID.
    */

    if (filters.status) {
      const status =
        await prisma.leadStatus.findUnique({
          where: {
            id:
              filters.status,
          },

          select: {
            id: true,
          },
        });

      if (!status) {
        throw new Error(
          "Lead Status Not Found"
        );
      }

      where.statusId =
        filters.status;
    }

    /* STAGE */

    if (filters.stage) {
      const allowedStages = [
        "NEW",
        "WORKING",
        "FOLLOW_UP",
        "CONVERTED",
        "LOST",
      ];

      const stage =
        filters.stage
          .trim()
          .toUpperCase();

      if (
        !allowedStages.includes(
          stage
        )
      ) {
        throw new Error(
          "Invalid Lead Stage"
        );
      }

      where.stage =
        stage;
    }

    /* SOURCE

       filters.source stores
       LeadSource ID.
    */

    if (filters.source) {
      const source =
        await prisma.leadSource.findUnique({
          where: {
            id:
              filters.source,
          },

          select: {
            id: true,
          },
        });

      if (!source) {
        throw new Error(
          "Lead Source Not Found"
        );
      }

      where.sourceId =
        filters.source;
    }

    /* SEARCH */

    if (
      filters.search?.trim()
    ) {
      const search =
        filters.search.trim();

      where.OR = [
        {
          leadCode: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          name: {
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

        {
          email: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          city: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          assignedEmployee: {
            is: {
              name: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          },
        },

        {
          status: {
            name: {
              contains:
                search,

              mode:
                "insensitive",
            },
          },
        },
      ];
    }

    return where;
  };

/* ============================
   GET LEAD REPORT

   Screen preview:
   paginated
============================ */

export const getLeadReport =
  async (
    filters: ReportFilters = {}
  ) => {
    const {
      page,
      limit,
      skip,
    } =
      getPagination(
        filters.page,
        filters.limit
      );

    const where =
      await buildLeadWhere(
        filters
      );

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

          orderBy: {
            createdAt:
              "desc",
          },

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

            lastCallAt:
              true,

            nextFollowUp:
              true,

            remarks: true,

            createdAt:
              true,

            updatedAt:
              true,

            source: {
              select: {
                id: true,

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

            assignedEmployee: {
              select: {
                id: true,

                employeeCode:
                  true,

                name: true,
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

      reportType:
        "LEAD",

      reportTitle:
        "Lead Report",

      generatedAt:
        new Date()
          .toISOString(),

      filters: {
        fromDate:
          filters.fromDate,

        toDate:
          filters.toDate,

        employeeId:
          filters.employeeId,

        status:
          filters.status,

        stage:
          filters.stage,

        source:
          filters.source,

        search:
          filters.search,
      },

      pagination: {
        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total /
              limit
          ),
      },

      data:
        leads,
    };
  };

/* ============================
   GET ALL LEADS FOR EXPORT

   NO PAGINATION

   Same filters as screen.
============================ */

export const getLeadReportExportData =
  async (
    filters: ReportFilters = {}
  ) => {
    const where =
      await buildLeadWhere(
        filters
      );

    const leads =
      await prisma.lead.findMany({
        where,

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
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

          lastCallAt:
            true,

          nextFollowUp:
            true,

          remarks: true,

          createdAt:
            true,

          source: {
            select: {
              name: true,
            },
          },

          status: {
            select: {
              name: true,
            },
          },

          assignedEmployee: {
            select: {
              employeeCode:
                true,

              name: true,
            },
          },
        },
      });

    return {
      success: true,

      reportType:
        "LEAD",

      reportTitle:
        "Lead Report",

      generatedAt:
        new Date()
          .toISOString(),

      totalRecords:
        leads.length,

      data:
        leads,
    };
  };

  /* ============================
   CLIENT REPORT WHERE
============================ */

const buildClientWhere =
  async (
    filters: ReportFilters
  ) => {
    const where: any = {};

    /* DATE */

    const createdAt =
      getDateFilter(
        filters.fromDate,
        filters.toDate
      );

    if (createdAt) {
      where.createdAt =
        createdAt;
    }

    /* EMPLOYEE
       Source Lead owner
    */

    if (
      filters.employeeId
    ) {
      const employee =
        await prisma.employee.findUnique({
          where: {
            id:
              filters.employeeId,
          },

          select: {
            id: true,
          },
        });

      if (!employee) {
        throw new Error(
          "Employee Not Found"
        );
      }

      where.lead = {
        is: {
          assignedEmployeeId:
            filters.employeeId,
        },
      };
    }

    /* CLIENT ACTIVE STATUS */

    if (
      filters.status
    ) {
      const status =
        filters.status
          .trim()
          .toUpperCase();

      if (
        status === "ACTIVE"
      ) {
        where.isActive =
          true;
      } else if (
        status === "INACTIVE"
      ) {
        where.isActive =
          false;
      } else {
        throw new Error(
          "Invalid Client Status"
        );
      }
    }

    /* SEARCH */

    if (
      filters.search?.trim()
    ) {
      const search =
        filters.search.trim();

      where.OR = [
        {
          clientCode: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          name: {
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

        {
          email: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          city: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          lead: {
            is: {
              leadCode: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          },
        },

        {
          lead: {
            is: {
              assignedEmployee: {
                is: {
                  name: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },
              },
            },
          },
        },
      ];
    }

    return where;
  };

/* ============================
   GET CLIENT REPORT
============================ */

export const getClientReport =
  async (
    filters: ReportFilters = {}
  ) => {
    const {
      page,
      limit,
      skip,
    } =
      getPagination(
        filters.page,
        filters.limit
      );

    const where =
      await buildClientWhere(
        filters
      );

    const [
      clients,
      total,
    ] =
      await Promise.all([
        prisma.client.findMany({
          where,

          skip,

          take:
            limit,

          orderBy: {
            createdAt:
              "desc",
          },

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

            createdAt:
              true,

            updatedAt:
              true,

            lead: {
              select: {
                id: true,

                leadCode:
                  true,

                name: true,

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

            _count: {
              select: {
                orders: true,

                trials: true,

                services: true,
              },
            },
          },
        }),

        prisma.client.count({
          where,
        }),
      ]);

    return {
      success: true,

      reportType:
        "CLIENT",

      reportTitle:
        "Client Report",

      generatedAt:
        new Date()
          .toISOString(),

      filters: {
        fromDate:
          filters.fromDate,

        toDate:
          filters.toDate,

        employeeId:
          filters.employeeId,

        status:
          filters.status,

        search:
          filters.search,
      },

      pagination: {
        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total /
              limit
          ),
      },

      data:
        clients,
    };
  };

/* ============================
   CLIENT EXPORT DATA
   NO PAGINATION
============================ */

export const getClientReportExportData =
  async (
    filters: ReportFilters = {}
  ) => {
    const where =
      await buildClientWhere(
        filters
      );

    const clients =
      await prisma.client.findMany({
        where,

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
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

          createdAt:
            true,

          lead: {
            select: {
              leadCode:
                true,

              assignedEmployee: {
                select: {
                  employeeCode:
                    true,

                  name: true,
                },
              },
            },
          },

          _count: {
            select: {
              orders: true,

              trials: true,

              services: true,
            },
          },
        },
      });

    return {
      success: true,

      reportType:
        "CLIENT",

      reportTitle:
        "Client Report",

      generatedAt:
        new Date()
          .toISOString(),

      totalRecords:
        clients.length,

      data:
        clients,
    };
  };

  /* ============================
   TRIAL REPORT WHERE
============================ */

const buildTrialWhere =
  async (
    filters: ReportFilters
  ) => {
    const where: any = {};

    /* DATE */

    const createdAt =
      getDateFilter(
        filters.fromDate,
        filters.toDate
      );

    if (createdAt) {
      where.createdAt =
        createdAt;
    }

    /* EMPLOYEE */

    if (
      filters.employeeId
    ) {
      const employee =
        await prisma.employee.findUnique({
          where: {
            id:
              filters.employeeId,
          },

          select: {
            id: true,
          },
        });

      if (!employee) {
        throw new Error(
          "Employee Not Found"
        );
      }

      where.employeeId =
        filters.employeeId;
    }

    /* TRIAL STATUS */

    if (
      filters.trialStatus
    ) {
      const status =
        filters.trialStatus
          .trim()
          .toUpperCase();

      const allowedStatuses = [
        "ACTIVE",
        "COMPLETED",
        "EXPIRED",
        "CANCELLED",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        throw new Error(
          "Invalid Trial Status"
        );
      }

      where.status =
        status;
    }

    /* PRODUCT */

    if (
      filters.productId
    ) {
      const product =
        await prisma.product.findUnique({
          where: {
            id:
              filters.productId,
          },

          select: {
            id: true,
          },
        });

      if (!product) {
        throw new Error(
          "Product Not Found"
        );
      }

      where.productId =
        filters.productId;
    }

    /* SEARCH */

    if (
      filters.search?.trim()
    ) {
      const search =
        filters.search.trim();

      where.OR = [
        {
          trialCode: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          lead: {
            is: {
              leadCode: {
                contains:
                  search,

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
                  search,

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
                  search,
              },
            },
          },
        },

        {
          client: {
            is: {
              clientCode: {
                contains:
                  search,

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
                  search,

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
                  search,
              },
            },
          },
        },

        {
          product: {
            name: {
              contains:
                search,

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
                  search,

                mode:
                  "insensitive",
              },
            },
          },
        },
      ];
    }

    return where;
  };

/* ============================
   GET TRIAL REPORT
============================ */

export const getTrialReport =
  async (
    filters: ReportFilters = {}
  ) => {
    const {
      page,
      limit,
      skip,
    } =
      getPagination(
        filters.page,
        filters.limit
      );

    const where =
      await buildTrialWhere(
        filters
      );

    const [
      trials,
      total,
    ] =
      await Promise.all([
        prisma.trial.findMany({
          where,

          skip,

          take:
            limit,

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,

            trialCode:
              true,

            startDate:
              true,

            endDate:
              true,

            trialDays:
              true,

            extensionCount:
              true,

            status:
              true,

            remarks:
              true,

            createdAt:
              true,

            updatedAt:
              true,

            lead: {
              select: {
                id: true,

                leadCode:
                  true,

                name: true,

                mobile: true,
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

      reportType:
        "TRIAL",

      reportTitle:
        "Trial / Demo Report",

      generatedAt:
        new Date()
          .toISOString(),

      filters: {
        fromDate:
          filters.fromDate,

        toDate:
          filters.toDate,

        employeeId:
          filters.employeeId,

        trialStatus:
          filters.trialStatus,

        productId:
          filters.productId,

        search:
          filters.search,
      },

      pagination: {
        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total /
              limit
          ),
      },

      data:
        trials,
    };
  };

/* ============================
   TRIAL EXPORT DATA
   NO PAGINATION
============================ */

export const getTrialReportExportData =
  async (
    filters: ReportFilters = {}
  ) => {
    const where =
      await buildTrialWhere(
        filters
      );

    const trials =
      await prisma.trial.findMany({
        where,

        orderBy: {
          createdAt:
            "desc",
        },

        select: {
          trialCode:
            true,

          startDate:
            true,

          endDate:
            true,

          trialDays:
            true,

          extensionCount:
            true,

          status:
            true,

          remarks:
            true,

          createdAt:
            true,

          lead: {
            select: {
              leadCode:
                true,

              name: true,

              mobile: true,
            },
          },

          client: {
            select: {
              clientCode:
                true,

              name: true,

              mobile: true,
            },
          },

          product: {
            select: {
              productCode:
                true,

              name: true,

              type: true,
            },
          },

          employee: {
            select: {
              employeeCode:
                true,

              name: true,
            },
          },
        },
      });

    return {
      success: true,

      reportType:
        "TRIAL",

      reportTitle:
        "Trial / Demo Report",

      generatedAt:
        new Date()
          .toISOString(),

      totalRecords:
        trials.length,

      data:
        trials,
    };
  };