import prisma from "../../config/prisma";
import { comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
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
    throw new Error("Invalid Employee Code");
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
    throw new Error("Invalid Password");
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