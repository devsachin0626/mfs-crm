"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetEmployeePassword = exports.changeEmployeePassword = exports.uploadProfileImage = exports.restoreEmployee = exports.deactivateEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const password_1 = require("../../utils/password");
const createEmployee = async (data, createdById) => {
    const { name, mobile, email, password, gender, dateOfBirth, address, joiningDate, salary, branchId, roleId, reportingManagerId, } = data;
    // Required Validation
    if (!name || !mobile || !password || !branchId || !roleId) {
        throw new Error("Required fields are missing");
    }
    // Mobile Duplicate Check
    const mobileExists = await prisma_1.default.employee.findUnique({
        where: {
            mobile,
        },
    });
    if (mobileExists) {
        throw new Error("Mobile Number already exists");
    }
    // Email Duplicate Check
    if (email) {
        const emailExists = await prisma_1.default.employee.findUnique({
            where: {
                email,
            },
        });
        if (emailExists) {
            throw new Error("Email already exists");
        }
    }
    // Branch Validation
    const branch = await prisma_1.default.branch.findUnique({
        where: {
            id: branchId,
        },
    });
    if (!branch) {
        throw new Error("Invalid Branch");
    }
    // Role Validation
    const role = await prisma_1.default.role.findUnique({
        where: {
            id: roleId,
        },
    });
    if (!role) {
        throw new Error("Invalid Role");
    }
    // Reporting Manager Validation
    if (reportingManagerId) {
        const manager = await prisma_1.default.employee.findUnique({
            where: {
                id: reportingManagerId,
            },
        });
        if (!manager) {
            throw new Error("Invalid Reporting Manager");
        }
    }
    // Generate Employee Code
    const employees = await prisma_1.default.employee.findMany({
        where: {
            employeeCode: {
                startsWith: "MFS",
            },
        },
        orderBy: {
            employeeCode: "desc",
        },
        take: 1,
    });
    let employeeCode = "MFS00001";
    if (employees.length > 0) {
        const lastCode = employees[0].employeeCode;
        const lastNumber = parseInt(lastCode.replace("MFS", ""));
        employeeCode = `MFS${String(lastNumber + 1).padStart(5, "0")}`;
    }
    // Password Hash
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // Create Employee
    const employee = await prisma_1.default.employee.create({
        data: {
            employeeCode,
            name,
            mobile,
            email,
            password: hashedPassword,
            gender,
            dateOfBirth: dateOfBirth
                ? new Date(dateOfBirth)
                : undefined,
            address,
            joiningDate: joiningDate
                ? new Date(joiningDate)
                : undefined,
            salary,
            branchId,
            roleId,
            reportingManagerId,
            createdById,
        },
        include: {
            role: true,
            branch: true,
        },
    });
    return {
        success: true,
        message: "Employee Created Successfully",
        employee: {
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email,
            gender: employee.gender,
            status: employee.status,
            isActive: employee.isActive,
            role: employee.role.name,
            branch: employee.branch.name,
            createdAt: employee.createdAt,
        },
    };
};
exports.createEmployee = createEmployee;
const getEmployees = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    // Search
    if (query.search) {
        where.OR = [
            {
                employeeCode: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
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
                email: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];
    }
    // Status Filter
    if (query.status) {
        where.status = query.status;
    }
    // Role Filter
    if (query.role) {
        where.role = {
            name: query.role,
        };
    }
    // Branch Filter
    if (query.branch) {
        where.branch = {
            name: query.branch,
        };
    }
    const total = await prisma_1.default.employee.count({
        where,
    });
    const employees = await prisma_1.default.employee.findMany({
        where,
        include: {
            role: true,
            branch: true,
            reportingManager: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    return {
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        employees: employees.map((employee) => ({
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email,
            gender: employee.gender,
            status: employee.status,
            isActive: employee.isActive,
            joiningDate: employee.joiningDate,
            role: employee.role.name,
            branch: employee.branch.name,
            reportingManager: employee.reportingManager?.name ?? null,
            createdAt: employee.createdAt,
        })),
    };
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (id) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id,
        },
        include: {
            role: true,
            branch: true,
            reportingManager: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    return {
        success: true,
        employee: {
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email,
            gender: employee.gender,
            dateOfBirth: employee.dateOfBirth,
            address: employee.address,
            profileImage: employee.profileImage,
            joiningDate: employee.joiningDate,
            salary: employee.salary,
            status: employee.status,
            isActive: employee.isActive,
            role: {
                id: employee.role.id,
                name: employee.role.name,
            },
            branch: {
                id: employee.branch.id,
                name: employee.branch.name,
                branchCode: employee.branch.branchCode,
            },
            reportingManager: employee.reportingManager,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
        },
    };
};
exports.getEmployeeById = getEmployeeById;
const updateEmployee = async (id, data, updatedById) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: { id },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Mobile Duplicate
    if (data.mobile) {
        const mobileExists = await prisma_1.default.employee.findFirst({
            where: {
                mobile: data.mobile,
                NOT: {
                    id,
                },
            },
        });
        if (mobileExists) {
            throw new Error("Mobile Number already exists");
        }
    }
    // Email Duplicate
    if (data.email) {
        const emailExists = await prisma_1.default.employee.findFirst({
            where: {
                email: data.email,
                NOT: {
                    id,
                },
            },
        });
        if (emailExists) {
            throw new Error("Email already exists");
        }
    }
    // Branch Validation
    if (data.branchId) {
        const branch = await prisma_1.default.branch.findUnique({
            where: {
                id: data.branchId,
            },
        });
        if (!branch) {
            throw new Error("Invalid Branch");
        }
    }
    // Role Validation
    if (data.roleId) {
        const role = await prisma_1.default.role.findUnique({
            where: {
                id: data.roleId,
            },
        });
        if (!role) {
            throw new Error("Invalid Role");
        }
    }
    // Reporting Manager Validation
    if (data.reportingManagerId) {
        const manager = await prisma_1.default.employee.findUnique({
            where: {
                id: data.reportingManagerId,
            },
        });
        if (!manager) {
            throw new Error("Invalid Reporting Manager");
        }
    }
    const updatedEmployee = await prisma_1.default.employee.update({
        where: { id },
        data: {
            name: data.name,
            mobile: data.mobile,
            email: data.email,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth !== undefined
                ? data.dateOfBirth
                    ? new Date(data.dateOfBirth)
                    : null
                : undefined,
            address: data.address,
            joiningDate: data.joiningDate !== undefined
                ? data.joiningDate
                    ? new Date(data.joiningDate)
                    : null
                : undefined,
            salary: data.salary,
            branchId: data.branchId,
            roleId: data.roleId,
            reportingManagerId: data.reportingManagerId,
            status: data.status,
            isActive: data.isActive,
            updatedById,
        },
        include: {
            role: true,
            branch: true,
            reportingManager: true,
        },
    });
    updatedEmployee.role;
    return {
        success: true,
        message: "Employee Updated Successfully",
        employee: {
            id: updatedEmployee.id,
            employeeCode: updatedEmployee.employeeCode,
            name: updatedEmployee.name,
            mobile: updatedEmployee.mobile,
            email: updatedEmployee.email,
            gender: updatedEmployee.gender,
            status: updatedEmployee.status,
            isActive: updatedEmployee.isActive,
            role: updatedEmployee.role.name,
            branch: updatedEmployee.branch.name,
            reportingManager: updatedEmployee.reportingManager?.name ?? null,
            updatedAt: updatedEmployee.updatedAt,
        },
    };
};
exports.updateEmployee = updateEmployee;
const deactivateEmployee = async (id, updatedById) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (!employee.isActive) {
        throw new Error("Employee Already Inactive");
    }
    await prisma_1.default.employee.update({
        where: {
            id,
        },
        data: {
            isActive: false,
            status: "INACTIVE",
            updatedById,
        },
    });
    return {
        success: true,
        message: "Employee Deactivated Successfully",
    };
};
exports.deactivateEmployee = deactivateEmployee;
const restoreEmployee = async (id, updatedById) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (employee.isActive) {
        throw new Error("Employee Already Active");
    }
    await prisma_1.default.employee.update({
        where: {
            id,
        },
        data: {
            isActive: true,
            status: "ACTIVE",
            updatedById,
        },
    });
    return {
        success: true,
        message: "Employee Restored Successfully",
    };
};
exports.restoreEmployee = restoreEmployee;
const uploadProfileImage = async (employeeId, fileName) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    const updatedEmployee = await prisma_1.default.employee.update({
        where: {
            id: employeeId,
        },
        data: {
            profileImage: fileName,
        },
    });
    return {
        success: true,
        message: "Profile Image Uploaded Successfully",
        employee: {
            id: updatedEmployee.id,
            name: updatedEmployee.name,
            profileImage: updatedEmployee.profileImage,
        },
    };
};
exports.uploadProfileImage = uploadProfileImage;
const changeEmployeePassword = async (employeeId, data) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    const isPasswordValid = await (0, password_1.comparePassword)(data.oldPassword, employee.password);
    if (!isPasswordValid) {
        throw new Error("Old Password is Incorrect");
    }
    const hashedPassword = await (0, password_1.hashPassword)(data.newPassword);
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
exports.changeEmployeePassword = changeEmployeePassword;
const resetEmployeePassword = async (employeeId, newPassword) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
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
        message: "Employee Password Reset Successfully",
    };
};
exports.resetEmployeePassword = resetEmployeePassword;
