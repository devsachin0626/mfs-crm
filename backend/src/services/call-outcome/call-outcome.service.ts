import prisma from "../../config/prisma";

import type {
  CallOutcomeInput,
  UpdateCallOutcomeInput,
} from "../../types/call-outcome.types";

const makeCode = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);

const validateStatus = async (
  leadStatusId?: string | null
) => {
  if (!leadStatusId) return;

  const status =
    await prisma.leadStatus.findUnique({
      where: { id: leadStatusId },
      select: { id: true },
    });

  if (!status) {
    throw new Error(
      "Selected lead status not found"
    );
  }
};

export const getCallOutcomes = async (
  includeInactive = false
) => {
  const callOutcomes =
    await prisma.callOutcome.findMany({
      where: includeInactive
        ? undefined
        : { isActive: true },
      include: {
        leadStatus: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

  return {
    success: true,
    callOutcomes,
  };
};

export const createCallOutcome = async (
  data: CallOutcomeInput
) => {
  const name = data.name?.trim();
  const code = makeCode(name || "");

  if (!name || !code) {
    throw new Error(
      "Call outcome name is required"
    );
  }

  await validateStatus(
    data.leadStatusId
  );

  const duplicate =
    await prisma.callOutcome.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { code },
        ],
      },
    });

  if (duplicate) {
    throw new Error(
      "Call outcome already exists"
    );
  }

  const callOutcome =
    await prisma.callOutcome.create({
      data: {
        code,
        name,
        description:
          data.description?.trim() || null,
        color: data.color || "#2563eb",
        leadStatusId:
          data.leadStatusId || null,
        requiresFollowUp:
          data.requiresFollowUp ?? false,
        marksLeadLost:
          data.marksLeadLost ?? false,
        sortOrder:
          Number(data.sortOrder) || 0,
        isActive:
          data.isActive ?? true,
      },
      include: { leadStatus: true },
    });

  return {
    success: true,
    message:
      "Call outcome created successfully",
    callOutcome,
  };
};

export const updateCallOutcome = async (
  id: string,
  data: UpdateCallOutcomeInput
) => {
  const existing =
    await prisma.callOutcome.findUnique({
      where: { id },
    });

  if (!existing) {
    throw new Error(
      "Call outcome not found"
    );
  }

  await validateStatus(
    data.leadStatusId
  );

  const name = data.name?.trim();

  if (data.name !== undefined && !name) {
    throw new Error(
      "Call outcome name is required"
    );
  }

  if (name) {
    const duplicate =
      await prisma.callOutcome.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (duplicate) {
      throw new Error(
        "Call outcome name already exists"
      );
    }
  }

  const callOutcome =
    await prisma.callOutcome.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(data.description !== undefined && {
          description:
            data.description?.trim() || null,
        }),
        ...(data.color !== undefined && {
          color: data.color || null,
        }),
        ...(data.leadStatusId !== undefined && {
          leadStatusId:
            data.leadStatusId || null,
        }),
        ...(data.requiresFollowUp !== undefined && {
          requiresFollowUp:
            data.requiresFollowUp,
        }),
        ...(data.marksLeadLost !== undefined && {
          marksLeadLost:
            data.marksLeadLost,
        }),
        ...(data.sortOrder !== undefined && {
          sortOrder:
            Number(data.sortOrder) || 0,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
      include: { leadStatus: true },
    });

  return {
    success: true,
    message:
      "Call outcome updated successfully",
    callOutcome,
  };
};

export const deleteCallOutcome = async (
  id: string
) => {
  const existing =
    await prisma.callOutcome.findUnique({
      where: { id },
    });

  if (!existing) {
    throw new Error(
      "Call outcome not found"
    );
  }

  const usageCount =
    await prisma.leadHistory.count({
      where: {
        callOutcome:
          existing.code,
      },
    });

  if (existing.isSystem || usageCount > 0) {
    const callOutcome =
      await prisma.callOutcome.update({
        where: { id },
        data: { isActive: false },
      });

    return {
      success: true,
      message:
        "Used outcome was deactivated to preserve call history",
      callOutcome,
    };
  }

  await prisma.callOutcome.delete({
    where: { id },
  });

  return {
    success: true,
    message:
      "Call outcome deleted successfully",
  };
};
