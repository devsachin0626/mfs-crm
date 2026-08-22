"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLeadAging = void 0;
const calculateLeadAging = (lead) => {
    const now = new Date();
    const activityDate = lead.lastCallAt ||
        lead.updatedAt ||
        lead.createdAt;
    const diffMs = now.getTime() -
        new Date(activityDate).getTime();
    const daysInactive = Math.max(Math.floor(diffMs /
        (1000 *
            60 *
            60 *
            24)), 0);
    const isOverdue = Boolean(lead.nextFollowUp &&
        new Date(lead.nextFollowUp) < now);
    if (isOverdue) {
        return {
            label: "HOT",
            daysInactive,
            isOverdue: true,
            nextFollowUp: lead.nextFollowUp,
            reason: "Follow-up overdue",
        };
    }
    if (lead.nextFollowUp) {
        const nextFollowUp = new Date(lead.nextFollowUp);
        const hoursUntil = (nextFollowUp.getTime() -
            now.getTime()) /
            (1000 * 60 * 60);
        if (hoursUntil >= 0 &&
            hoursUntil <= 24) {
            return {
                label: "HOT",
                daysInactive,
                isOverdue: false,
                nextFollowUp: lead.nextFollowUp,
                reason: "Follow-up due within 24 hours",
            };
        }
    }
    if (daysInactive <= 1) {
        return {
            label: "NEW",
            daysInactive,
            isOverdue: false,
            nextFollowUp: lead.nextFollowUp,
            reason: "Recently active",
        };
    }
    if (daysInactive <= 3) {
        return {
            label: "WARM",
            daysInactive,
            isOverdue: false,
            nextFollowUp: lead.nextFollowUp,
            reason: `${daysInactive} days since last activity`,
        };
    }
    if (daysInactive <= 7) {
        return {
            label: "COLD",
            daysInactive,
            isOverdue: false,
            nextFollowUp: lead.nextFollowUp,
            reason: `${daysInactive} days since last activity`,
        };
    }
    return {
        label: "STALE",
        daysInactive,
        isOverdue: false,
        nextFollowUp: lead.nextFollowUp,
        reason: `${daysInactive}+ days without activity`,
    };
};
exports.calculateLeadAging = calculateLeadAging;
