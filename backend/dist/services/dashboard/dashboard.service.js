"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getDashboardStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const [totalEmployees, totalLeads, totalFollowUps, pendingFollowUps, todayFollowUps, convertedLeads, lostLeads,] = await Promise.all([
        prisma_1.default.employee.count({
            where: {
                isActive: true,
            },
        }),
        prisma_1.default.lead.count(),
        prisma_1.default.followUp.count(),
        prisma_1.default.followUp.count({
            where: {
                isCompleted: false,
            },
        }),
        prisma_1.default.followUp.count({
            where: {
                followUpDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        }),
        prisma_1.default.lead.count({
            where: {
                stage: "CONVERTED",
            },
        }),
        prisma_1.default.lead.count({
            where: {
                stage: "LOST",
            },
        }),
    ]);
    return {
        success: true,
        stats: {
            totalEmployees,
            totalLeads,
            totalFollowUps,
            pendingFollowUps,
            todayFollowUps,
            convertedLeads,
            lostLeads,
        },
    };
};
exports.getDashboardStats = getDashboardStats;
