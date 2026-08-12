"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const password_2 = require("../../utils/password");
const login = async ({ employeeCode, password }) => {
    // Validation
    if (!employeeCode || !password) {
        throw new Error("Employee Code and Password are required");
    }
    // Find Employee
    const employee = await prisma_1.default.employee.findUnique({
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
    const passwordMatched = await (0, password_1.comparePassword)(password, employee.password);
    if (!passwordMatched) {
        throw new Error("Invalid Password");
    }
    // JWT Token
    const token = (0, jwt_1.generateToken)({
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
exports.login = login;
const changePassword = async (employeeId, oldPassword, newPassword) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    const passwordMatched = await (0, password_1.comparePassword)(oldPassword, employee.password);
    if (!passwordMatched) {
        throw new Error("Old Password is Incorrect");
    }
    if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    if (oldPassword === newPassword) {
        throw new Error("New password cannot be the same as old password");
    }
    const hashedPassword = await (0, password_2.hashPassword)(newPassword);
    await prisma_1.default.employee.update({
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
exports.changePassword = changePassword;
