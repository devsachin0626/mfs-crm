import prisma from "../../config/prisma";
import { comparePassword } from "../../utils/password";
import {
  generateToken,
  generateImpersonationToken,
} from "../../utils/jwt";
import { hashPassword } from "../../utils/password";

interface LoginDto {
  employeeCode: string;
  password: string;
}

export const login = async ({ employeeCode, password }: LoginDto) => {
  // Validation
  if (!employeeCode || !password) {
    throw new Error("Employee Code and Password are required");
  }

  // Find Employee
  const employee = await prisma.employee.findUnique({
    where: {
      employeeCode,
    },
    include: {
      role: true,
      branch: true,
    },
  });

  if (!employee) {
    throw new Error("Invalid Employee Code or Password");
  }

  // Account Status
  if (!employee.isActive || employee.status !== "ACTIVE") {
    throw new Error("Employee account is inactive");
  }

  // Password Check
  const passwordMatched = await comparePassword(
    password,
    employee.password
  );

  if (!passwordMatched) {
    throw new Error("Invalid Employee Code or Password");
  }

  // JWT Token
  const token = generateToken({
    id: employee.id,
    employeeCode: employee.employeeCode,
    roleId: employee.roleId,
  });

  return {
    success: true,
    message: "Login Successful",

    token,

    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      mobile: employee.mobile,
      email: employee.email,
      role: employee.role.name,
      branch: employee.branch.name,
      profileImage: employee.profileImage,
    },
  };
};

export const changePassword = async (
  employeeId: string,
  oldPassword: string,
  newPassword: string
) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee Not Found");
  }

  const passwordMatched = await comparePassword(
    oldPassword,
    employee.password
  );

  if (!passwordMatched) {
    throw new Error("Old Password is Incorrect");
  }

  
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  if (oldPassword === newPassword) {
    throw new Error("New password cannot be the same as old password");
  }


  const hashedPassword = await hashPassword(newPassword);

  await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    success: true,
    message: "Password Changed Successfully",
  };
};


export const resetEmployeePassword = async (
  employeeCode: string,
  newPassword: string
) => {
  if (!employeeCode || !newPassword) {
    throw new Error(
      "Employee Code and New Password are required"
    );
  }

  if (newPassword.length < 8) {
    throw new Error(
      "Password must be at least 8 characters long"
    );
  }

  const employee =
    await prisma.employee.findUnique({
      where: {
        employeeCode,
      },
    });

  if (!employee) {
    throw new Error(
      "Employee Not Found"
    );
  }

  const hashedPassword =
    await hashPassword(
      newPassword
    );

  await prisma.employee.update({
    where: {
      id: employee.id,
    },

    data: {
      password:
        hashedPassword,
    },
  });

  return {
    success: true,
    message:
      "Employee Password Reset Successfully",
  };
};

export const impersonateEmployee =
  async (
    adminId: string,
    employeeId: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ) => {
    const admin =
      await prisma.employee.findUnique({
        where: {
          id:
            adminId,
        },

        include: {
          role: true,
        },
      });

    if (
      !admin ||
      admin.role.name !==
        "ADMIN"
    ) {
      throw new Error(
        "Admin access required"
      );
    }

    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            employeeId,
        },

        include: {
          role: true,
          branch: true,
        },
      });

    if (!employee) {
      throw new Error(
        "Employee Not Found"
      );
    }

    if (
      employee.id ===
      admin.id
    ) {
      throw new Error(
        "You are already logged in as this admin"
      );
    }

    if (
      !employee.isActive ||
      employee.status !==
        "ACTIVE"
    ) {
      throw new Error(
        "Employee account is inactive"
      );
    }

    const token =
      generateImpersonationToken({
        id:
          employee.id,

        employeeCode:
          employee.employeeCode,

        roleId:
          employee.roleId,

        impersonatorId:
          admin.id,
      });

    await prisma.activityLog.create({
      data: {
        employeeId:
          admin.id,

        module:
          "AUTH",

        action:
          "IMPERSONATE_EMPLOYEE",

        recordId:
          employee.id,

        ipAddress:
          metadata
            ?.ipAddress ||
          null,

        userAgent:
          metadata
            ?.userAgent ||
          null,
      },
    });

    return {
      success: true,

      message:
        `Logged in as ${employee.name}`,

      token,

      employee: {
        id:
          employee.id,

        employeeCode:
          employee.employeeCode,

        name:
          employee.name,

        mobile:
          employee.mobile,

        email:
          employee.email,

        role:
          employee.role.name,

        branch:
          employee.branch.name,

        profileImage:
          employee.profileImage,
      },

      impersonation: {
        impersonatorId:
          admin.id,

        impersonatorName:
          admin.name,

        expiresInMinutes:
          60,
      },
    };
  };
