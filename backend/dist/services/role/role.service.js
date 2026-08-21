"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRole = exports.getRoleById = exports.getRoles = exports.createRole = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createRole = async (data) => {
    const existingRole = await prisma_1.default.role.findUnique({
        where: {
            name: data.name,
        },
    });
    if (existingRole) {
        throw new Error("Role Already Exists");
    }
    const role = await prisma_1.default.role.create({
        data: {
            name: data.name,
            description: data.description,
        },
    });
    return {
        success: true,
        message: "Role Created Successfully",
        role,
    };
};
exports.createRole = createRole;
const getRoles = async () => {
    const roles = await prisma_1.default.role.findMany({
        orderBy: {
            name: "asc",
        },
    });
    return {
        success: true,
        roles,
    };
};
exports.getRoles = getRoles;
const getRoleById = async (id) => {
    const role = await prisma_1.default.role.findUnique({
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
        throw new Error("Role Not Found");
    }
    return {
        success: true,
        role,
    };
};
exports.getRoleById = getRoleById;
const updateRole = async (id, data) => {
    const roleExists = await prisma_1.default.role.findUnique({
        where: { id },
    });
    if (!roleExists) {
        throw new Error("Role Not Found");
    }
    if (data.name) {
        const nameExists = await prisma_1.default.role.findFirst({
            where: {
                name: data.name,
                NOT: {
                    id,
                },
            },
        });
        if (nameExists) {
            throw new Error("Role Name Already Exists");
        }
    }
    const role = await prisma_1.default.role.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
        },
    });
    return {
        success: true,
        message: "Role Updated Successfully",
        role,
    };
};
exports.updateRole = updateRole;
