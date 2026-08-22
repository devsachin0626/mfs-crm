import prisma from "../../config/prisma";

import type {
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../../types/branch.types";

export const createBranch = async (
  data: CreateBranchRequest
) => {
  const nameExists =
    await prisma.branch.findFirst({
      where: {
        name: data.name,
      },
    });

  if (nameExists) {
    throw new Error(
      "Branch Name Already Exists"
    );
  }

  const codeExists =
    await prisma.branch.findUnique({
      where: {
        branchCode: data.branchCode,
      },
    });

  if (codeExists) {
    throw new Error(
      "Branch Code Already Exists"
    );
  }

  const branch =
    await prisma.branch.create({
      data: {
        name: data.name,
        branchCode: data.branchCode,
        address: data.address,
        city: data.city,
        state: data.state,
        isActive:
          data.isActive ?? true,
      },
    });

  return {
    success: true,
    message:
      "Branch Created Successfully",
    branch,
  };
};

export const getBranches =
  async () => {
    const branches =
      await prisma.branch.findMany({
        orderBy: {
          name: "asc",
        },
      });

    return {
      success: true,
      branches,
    };
  };

export const getBranchById =
  async (id: string) => {
    const branch =
      await prisma.branch.findUnique({
        where: { id },
      });

    if (!branch) {
      throw new Error(
        "Branch Not Found"
      );
    }

    return {
      success: true,
      branch,
    };
  };

export const updateBranch = async (
  id: string,
  data: UpdateBranchRequest
) => {
  const existingBranch =
    await prisma.branch.findUnique({
      where: { id },
    });

  if (!existingBranch) {
    throw new Error(
      "Branch Not Found"
    );
  }

  if (data.branchCode) {
    const codeExists =
      await prisma.branch.findFirst({
        where: {
          branchCode:
            data.branchCode,
          NOT: {
            id,
          },
        },
      });

    if (codeExists) {
      throw new Error(
        "Branch Code Already Exists"
      );
    }
  }

  const branch =
    await prisma.branch.update({
      where: { id },

      data: {
        name: data.name,
        branchCode:
          data.branchCode,
        address: data.address,
        city: data.city,
        state: data.state,
        isActive:
          data.isActive,
      },
    });

  return {
    success: true,
    message:
      "Branch Updated Successfully",
    branch,
  };
};