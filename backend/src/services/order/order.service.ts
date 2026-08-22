import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { CreateOrderRequest,UpdateOrderRequest } from "../../types/order.types";

export const createOrder = async (data: CreateOrderRequest) => {
  // Client Check
  const client = await prisma.client.findUnique({
    where: {
      id: data.clientId,
    },
  });

  if (!client) {
    throw new Error("Client Not Found");
  }

  // Employee Check
  const employee = await prisma.employee.findUnique({
    where: {
      id: data.employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee Not Found");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Order Items Required");
  }

  let subtotal = 0;

  const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      throw new Error("Product Not Found");
    }

    const price = Number(product.price);

    const itemTotal = price * item.quantity;

    subtotal += itemTotal;

    orderItems.push({
      product: {
        connect: {
          id: product.id,
        },
      },
      quantity: item.quantity,
      price: product.price,
      gst: product.gst,
      total: new Prisma.Decimal(itemTotal),
    });
  }

  const discountAmount = data.discount || 0;

  const taxableAmount = subtotal - discountAmount;

  const gstAmount = taxableAmount * 0.18;

  const totalAmount = taxableAmount + gstAmount;

  const count = await prisma.clientOrder.count();

  const orderNumber = `ORD${String(count + 1).padStart(5, "0")}`;

  const order = await prisma.clientOrder.create({
    data: {
      orderNumber,

      client: {
        connect: {
          id: data.clientId,
        },
      },

      employee: {
        connect: {
          id: data.employeeId,
        },
      },

      orderStatus: "PENDING",

      subtotal: new Prisma.Decimal(subtotal),

      discountPercent: null,

      discountAmount: new Prisma.Decimal(discountAmount),

      gstAmount: new Prisma.Decimal(gstAmount),

      totalAmount: new Prisma.Decimal(totalAmount),

      notes: data.remarks,

      items: {
        create: orderItems,
      },
    },

    include: {
      client: true,

      employee: true,

      items: {
        include: {
          product: true,
        },
      },

      payments: true,
    },
  });

  return {
    success: true,
    message: "Order Created Successfully",
    order,
  };
};

export const getOrders = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      {
        orderNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        client: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const total = await prisma.clientOrder.count({
    where,
  });

  const orders = await prisma.clientOrder.findMany({
    where,

    include: {
      client: true,

      employee: true,

      items: {
        include: {
          product: true,
        },
      },

      payments: true,
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
    orders,
  };
};

export const getOrderById = async (id: string) => {
  const order = await prisma.clientOrder.findUnique({
    where: {
      id,
    },

    include: {
      client: true,

      employee: true,

      items: {
        include: {
          product: true,
        },
      },

      payments: true,

      serviceActivations: true,
    },
  });

  if (!order) {
    throw new Error("Order Not Found");
  }

  return {
    success: true,
    order,
  };
};

export const updateOrder = async (
  id: string,
  data: UpdateOrderRequest
) => {
  const order = await prisma.clientOrder.findUnique({
    where: {
      id,
    },
  });

  if (!order) {
    throw new Error("Order Not Found");
  }

  const subtotal = Number(order.subtotal);

  const discountAmount = data.discount ?? Number(order.discountAmount);

  const taxableAmount = subtotal - discountAmount;

  const gstAmount = taxableAmount * 0.18;

  const totalAmount = taxableAmount + gstAmount;

  const updatedOrder = await prisma.clientOrder.update({
    where: {
      id,
    },

    data: {
      discountAmount: new Prisma.Decimal(discountAmount),

      gstAmount: new Prisma.Decimal(gstAmount),

      totalAmount: new Prisma.Decimal(totalAmount),

      notes: data.remarks ?? order.notes,
    },

    include: {
      client: true,

      employee: true,

      items: {
        include: {
          product: true,
        },
      },

      payments: true,
    },
  });

  return {
    success: true,
    message: "Order Updated Successfully",
    order: updatedOrder,
  };
};

export const cancelOrder = async (id: string) => {
  const order = await prisma.clientOrder.findUnique({
    where: {
      id,
    },
  });

  if (!order) {
    throw new Error("Order Not Found");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new Error("Order Already Cancelled");
  }

  const updatedOrder = await prisma.clientOrder.update({
    where: {
      id,
    },

    data: {
      orderStatus: "CANCELLED",
    },

    include: {
      client: true,

      employee: true,

      items: {
        include: {
          product: true,
        },
      },

      payments: true,
    },
  });

  return {
    success: true,
    message: "Order Cancelled Successfully",
    order: updatedOrder,
  };
};