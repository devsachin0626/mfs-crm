"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetCycle = void 0;
const getTargetCycle = (month, year) => {
    if (month < 1 ||
        month > 12) {
        throw new Error("Invalid Target Month");
    }
    const periodEnd = new Date(year, month - 1, 25);
    periodEnd.setHours(23, 59, 59, 999);
    const previousMonth = month === 1
        ? 12
        : month - 1;
    const previousYear = month === 1
        ? year - 1
        : year;
    const periodStart = new Date(previousYear, previousMonth - 1, 26);
    periodStart.setHours(0, 0, 0, 0);
    return {
        periodStart,
        periodEnd,
    };
};
exports.getTargetCycle = getTargetCycle;
