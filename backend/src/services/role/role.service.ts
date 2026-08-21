import prisma from "../../config/prisma";

import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../../types/role.types";

export const createRole = async (
  data: CreateRoleRequest
) => {
  const existingRole =
    await prisma.role.findUnique({
      where: {
        name: data.name,
      },
    });

  if (existingRole) {
    throw new Error(
      "Role Already Exists"
    );
  }

  const role =
    await prisma.role.create({
      data: {
        name: data.name,
        description:
          data.description,
      },
    });

  return {
    success: true,
    message:
      "Role Created Successfully",
    role,
  };
};

export const getRoles =
  async () => {
    const roles =
      await prisma.role.findMany({
        orderBy: {
          name: "asc",
        },
      });

    return {
      success: true,
      roles,
    };
  };

export const getRoleById =
  async (id: string) => {
    const role =
      await prisma.role.findUnique({
        where: { id },

        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

    if (!role) {
      throw new Error(
        "Role Not Found"
      );
    }

    return {
      success: true,
      role,
    };
  };

export const updateRole = async (
  id: string,
  data: UpdateRoleRequest
) => {
  const roleExists =
    await prisma.role.findUnique({
      where: { id },
    });

  if (!roleExists) {
    throw new Error(
      "Role Not Found"
    );
  }

  if (data.name) {
    const nameExists =
      await prisma.role.findFirst({
        where: {
          name: data.name,
          NOT: {
            id,
          },
        },
      });

    if (nameExists) {
      throw new Error(
        "Role Name Already Exists"
      );
    }
  }

  const role =
    await prisma.role.update({
      where: { id },

      data: {
        name: data.name,
        description:
          data.description,
      },
    });

  return {
    success: true,
    message:
      "Role Updated Successfully",
    role,
  };
};