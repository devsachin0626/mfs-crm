import prisma from "../../config/prisma";
import { UpdateServiceRequest } from "../../types/service.types";

/* ============================
   GET ALL SERVICES
============================ */

export const getServices = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      {
        client: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        product: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const total = await prisma.serviceActivation.count({
    where,
  });

  const services = await prisma.serviceActivation.findMany({
    where,

    include: {
      client: true,
      product: true,
      employee: true,
      order: true,
    },

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
    services,
  };
};

/* ============================
   GET SERVICE BY ID
============================ */

export const getServiceById = async (id: string) => {
  const service = await prisma.serviceActivation.findUnique({
    where: {
      id,
    },

    include: {
      client: true,

      product: true,

      employee: true,

      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },

          payments: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Service Not Found");
  }

  return {
    success: true,
    service,
  };
};

/* ============================
   UPDATE SERVICE
============================ */

export const updateService = async (
  id: string,
  data: UpdateServiceRequest
) => {
  const service = await prisma.serviceActivation.findUnique({
    where: {
      id,
    },
  });

  if (!service) {
    throw new Error("Service Not Found");
  }

  const updatedService = await prisma.serviceActivation.update({
    where: {
      id,
    },

    data: {
      endDate:
        data.endDate !== undefined
          ? new Date(data.endDate)
          : service.endDate,

      remarks:
        data.remarks !== undefined
          ? data.remarks
          : service.remarks,

      isActive:
        data.isActive !== undefined
          ? data.isActive
          : service.isActive,
    },

    include: {
      client: true,
      product: true,
      employee: true,
      order: true,
    },
  });

  return {
    success: true,
    message: "Service Updated Successfully",
    service: updatedService,
  };
};