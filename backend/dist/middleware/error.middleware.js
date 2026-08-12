"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const client_1 = require("@prisma/client");
const errorMiddleware = (error, req, res, next) => {
    console.error("❌ Error:", error);
    // Prisma: Record Not Found / Constraint Errors
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            // Unique constraint failed
            case "P2002":
                res.status(409).json({
                    success: false,
                    message: "Duplicate record. This value already exists.",
                });
                return;
            // Record not found
            case "P2025":
                res.status(404).json({
                    success: false,
                    message: "Record not found.",
                });
                return;
            // Foreign key constraint failed
            case "P2003":
                res.status(400).json({
                    success: false,
                    message: "Related record does not exist.",
                });
                return;
            default:
                res.status(400).json({
                    success: false,
                    message: "Database operation failed.",
                    error: error.code,
                });
                return;
        }
    }
    // Prisma Validation Error
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        res.status(400).json({
            success: false,
            message: "Invalid data provided.",
        });
        return;
    }
    // Prisma Initialization Error
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        res.status(500).json({
            success: false,
            message: "Database connection failed.",
        });
        return;
    }
    // Default Error
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};
exports.errorMiddleware = errorMiddleware;
