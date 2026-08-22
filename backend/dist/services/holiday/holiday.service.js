"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHoliday = exports.updateHoliday = exports.getHolidayById = exports.getHolidays = exports.createHoliday = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createHoliday = async (data) => {
    const holiday = await prisma_1.default.holiday.create({
        data: {
            title: data.title,
            holidayDate: new Date(data.holidayDate),
            description: data.description,
        },
    });
    return {
        success: true,
        message: "Holiday Created Successfully",
        holiday,
    };
};
exports.createHoliday = createHoliday;
const getHolidays = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search by Holiday Title
    if (search) {
        where.title = {
            contains: search,
            mode: "insensitive",
        };
    }
    // Total Holidays
    const total = await prisma_1.default.holiday.count({
        where,
    });
    // Get Holidays
    const holidays = await prisma_1.default.holiday.findMany({
        where,
        orderBy: {
            holidayDate: "asc",
        },
        skip,
        take: limit,
    });
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        holidays,
    };
};
exports.getHolidays = getHolidays;
const getHolidayById = async (id) => {
    const holiday = await prisma_1.default.holiday.findUnique({
        where: {
            id,
        },
    });
    if (!holiday) {
        throw new Error("Holiday Not Found");
    }
    return {
        success: true,
        holiday,
    };
};
exports.getHolidayById = getHolidayById;
const updateHoliday = async (id, data) => {
    // Check Holiday Exists
    const existingHoliday = await prisma_1.default.holiday.findUnique({
        where: {
            id,
        },
    });
    if (!existingHoliday) {
        throw new Error("Holiday Not Found");
    }
    // Update Holiday
    const holiday = await prisma_1.default.holiday.update({
        where: {
            id,
        },
        data: {
            ...(data.title !== undefined && {
                title: data.title,
            }),
            ...(data.holidayDate !== undefined && {
                holidayDate: new Date(data.holidayDate),
            }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
        },
    });
    return {
        success: true,
        message: "Holiday Updated Successfully",
        holiday,
    };
};
exports.updateHoliday = updateHoliday;
const deleteHoliday = async (id) => {
    // Check Holiday Exists
    const existingHoliday = await prisma_1.default.holiday.findUnique({
        where: {
            id,
        },
    });
    if (!existingHoliday) {
        throw new Error("Holiday Not Found");
    }
    // Delete Holiday
    const holiday = await prisma_1.default.holiday.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Holiday Deleted Successfully",
        holiday,
    };
};
exports.deleteHoliday = deleteHoliday;
