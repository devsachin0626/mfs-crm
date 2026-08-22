import prisma from "../config/prisma";

interface CurrentEmployee {
  id: string;

  role: {
    name: string;
  };
}

export const getLeadAccessWhere = async (
  employee: CurrentEmployee
) => {
  const roleName =
    employee.role?.name;

  // ADMIN / HR → All Leads
  if (
    roleName === "ADMIN" ||
    roleName === "HR"
  ) {
    return {};
  }

  // EMPLOYEE → Only Own Leads
  if (roleName === "EMPLOYEE") {
    return {
      assignedEmployeeId:
        employee.id,
    };
  }

  // TEAM LEADER → Own + Team
  if (
    roleName === "TEAM_LEADER"
  ) {
    const teamMembers =
      await prisma.employee.findMany({
        where: {
          reportingManagerId:
            employee.id,
        },

        select: {
          id: true,
        },
      });

    const employeeIds = [
      employee.id,
      ...teamMembers.map(
        (employee) =>
          employee.id
      ),
    ];

    return {
      assignedEmployeeId: {
        in: employeeIds,
      },
    };
  }

  // Unknown role → No Leads
  return {
    id: {
      in: [],
    },
  };
};

export const checkLeadAccess = async (
  leadId: string,
  employee: CurrentEmployee
) => {
  const accessWhere =
    await getLeadAccessWhere(employee);

  const lead =
    await prisma.lead.findFirst({
      where: {
        AND: [
          {
            id: leadId,
          },
          accessWhere,
        ],
      },

      select: {
        id: true,
        leadCode: true,
        assignedEmployeeId: true,
        stage: true,
        isConverted: true,
      },
    });

  if (!lead) {
    throw new Error(
      "Lead Not Found"
    );
  }

  return lead;
};