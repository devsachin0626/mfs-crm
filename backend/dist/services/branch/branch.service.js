"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranch = exports.getBranchById = exports.getBranches = exports.createBranch = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createBranch = async (data) => {
    const nameExists = await prisma_1.default.branch.findFirst({
        where: {
            name: data.name,
        },
    });
    if (nameExists) {
        throw new Error("Branch Name Already Exists");
    }
    const codeExists = await prisma_1.default.branch.findUnique({
        where: {
            branchCode: data.branchCode,
        },
    });
    if (codeExists) {
        throw new Error("Branch Code Already Exists");
    }
    const branch = await prisma_1.default.branch.create({
        data: {
            name: data.name,
            branchCode: data.branchCode,
            address: data.address,
            city: data.city,
            state: data.state,
            isActive: data.isActive ?? true,
        },
    });
    return {
        success: true,
        message: "Branch Created Successfully",
        branch,
    };
};
exports.createBranch = createBranch;
const getBranches = async () => {
    const branches = await prisma_1.default.branch.findMany({
        orderBy: {
            name: "asc",
        },
    });
    return {
        success: true,
        branches,
    };
};
exports.getBranches = getBranches;
const getBranchById = async (id) => {
    const branch = await prisma_1.default.branch.findUnique({
        where: { id },
    });
    if (!branch) {
        throw new Error("Branch Not Found");
    }
    return {
        success: true,
        branch,
    };
};
exports.getBranchById = getBranchById;
const updateBranch = async (id, data) => {
    const existingBranch = await prisma_1.default.branch.findUnique({
        where: { id },
    });
    if (!existingBranch) {
        throw new Error("Branch Not Found");
    }
    if (data.branchCode) {
        const codeExists = await prisma_1.default.branch.findFirst({
            where: {
                branchCode: data.branchCode,
                NOT: {
                    id,
                },
            },
        });
        if (codeExists) {
            throw new Error("Branch Code Already Exists");
        }
    }
    const branch = await prisma_1.default.branch.update({
        where: { id },
        data: {
            name: data.name,
            branchCode: data.branchCode,
            address: data.address,
            city: data.city,
            state: data.state,
            isActive: data.isActive,
        },
    });
    return {
        success: true,
        message: "Branch Updated Successfully",
        branch,
    };
};
exports.updateBranch = updateBranch;
