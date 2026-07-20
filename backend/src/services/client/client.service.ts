import prisma from "../../config/prisma";
import { CreateClientRequest, ClientQuery } from "../../types/client.types";





export const createClient = async (data: CreateClientRequest) => {
  // Mobile Duplicate Check
  const existingClient = await prisma.client.findFirst({
    where: {
      mobile: data.mobile,
    },
  });

  if (existingClient) {
    throw new Error("Client Already Exists");
  }

  // Lead Validation (Optional)
  if (data.leadId) {
    const lead = await prisma.lead.findUnique({
      where: {
        id: data.leadId,
      },
    });

    if (!lead) {
      throw new Error("Lead Not Found");
    }

    if (lead.isConverted) {
      throw new Error("Lead Already Converted");
    }
  }

  // Client Code Generate
  const totalClients = await prisma.client.count();

  const clientCode = `CL${String(totalClients + 1).padStart(5, "0")}`;

  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        clientCode,

        leadId: data.leadId,

        name: data.name,
        mobile: data.mobile,
        email: data.email,

        city: data.city,
        state: data.state,
        address: data.address,

        panNumber: data.panNumber,
        aadhaarNumber: data.aadhaarNumber,
      },
    });

    // Lead → Client Conversion
    if (data.leadId) {
      await tx.lead.update({
        where: {
          id: data.leadId,
        },
        data: {
          isConverted: true,
          stage: "CONVERTED",
        },
      });
    }

    return client;
  });

  return {
    success: true,
    message: "Client Created Successfully",
    client: result,
  };
};


export const getClients = async (query: ClientQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

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
        clientCode: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lead: {
          select: {
            leadCode: true,
            name: true,
          },
        },
      },
    }),

    prisma.client.count({ where }),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    clients,
  };
};

export const getClientById = async (id: string) => {
  const client = await prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      lead: true,
      orders: true,
      services: true,
    },
  });

  if (!client) {
    throw new Error("Client Not Found");
  }

  return {
    success: true,
    client,
  };
};

import { UpdateClientRequest } from "../../types/client.types";

export const updateClient = async (
  id: string,
  data: UpdateClientRequest
) => {
  const existingClient = await prisma.client.findUnique({
    where: { id },
  });

  if (!existingClient) {
    throw new Error("Client Not Found");
  }

  // Mobile Duplicate Check
  if (data.mobile) {
    const mobileExists = await prisma.client.findFirst({
      where: {
        mobile: data.mobile,
        NOT: {
          id,
        },
      },
    });

    if (mobileExists) {
      throw new Error("Mobile Number Already Exists");
    }
  }

  const client = await prisma.client.update({
    where: { id },
    data,
  });

  return {
    success: true,
    message: "Client Updated Successfully",
    client,
  };
};