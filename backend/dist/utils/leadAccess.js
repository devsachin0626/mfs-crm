"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLeadAccess = exports.getLeadAccessWhere = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getLeadAccessWhere = async (employee) => {
    const roleName = employee.role?.name;
    // ADMIN / HR → All Leads
    if (roleName === "ADMIN" ||
        roleName === "HR") {
        return {};
    }
    // EMPLOYEE → Only Own Leads
    if (roleName === "EMPLOYEE") {
        return {
            assignedEmployeeId: employee.id,
        };
    }
    // TEAM LEADER → Own + Team
    if (roleName === "TEAM_LEADER") {
        const teamMembers = await prisma_1.default.employee.findMany({
            where: {
                reportingManagerId: employee.id,
            },
            select: {
                id: true,
            },
        });
        const employeeIds = [
            employee.id,
            ...teamMembers.map((employee) => employee.id),
        ];
        return {
            assignedEmployeeId: {
                in: employeeIds,
            },
        };
    }
    // Unknown role → No Leads
    return {
        id: {
            in: [],
        },
    };
};
exports.getLeadAccessWhere = getLeadAccessWhere;
const checkLeadAccess = async (leadId, employee) => {
    const accessWhere = await (0, exports.getLeadAccessWhere)(employee);
    const lead = await prisma_1.default.lead.findFirst({
        where: {
            AND: [
                {
                    id: leadId,
                },
                accessWhere,
            ],
        },
        select: {
            id: true,
            leadCode: true,
            assignedEmployeeId: true,
            stage: true,
            isConverted: true,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    return lead;
};
exports.checkLeadAccess = checkLeadAccess;
