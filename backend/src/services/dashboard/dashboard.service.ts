import prisma from "../../config/prisma";
export const getDashboardStats = async () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);

  tomorrow.setDate(today.getDate() + 1);

  const [
    totalEmployees,
    totalLeads,
    totalFollowUps,
    pendingFollowUps,
    todayFollowUps,
    convertedLeads,
    lostLeads,
  ] = await Promise.all([
    prisma.employee.count({
      where: {
        isActive: true,
      },
    }),

    prisma.lead.count(),

    prisma.followUp.count(),

    prisma.followUp.count({
      where: {
        isCompleted: false,
      },
    }),

    prisma.followUp.count({
      where: {
        followUpDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),

    prisma.lead.count({
      where: {
        stage: "CONVERTED",
      },
    }),

    prisma.lead.count({
      where: {
        stage: "LOST",
      },
    }),
  ]);

  return {
    success: true,
    stats: {
      totalEmployees,
      totalLeads,
      totalFollowUps,
      pendingFollowUps,
      todayFollowUps,
      convertedLeads,
      lostLeads,
    },
  };
};