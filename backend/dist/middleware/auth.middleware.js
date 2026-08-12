"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Access Token Required",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const payload = (0, jwt_1.verifyToken)(token);
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: payload.id,
            },
            include: {
                role: true,
                branch: true,
            },
        });
        if (!employee) {
            res.status(401).json({
                success: false,
                message: "Employee Not Found",
            });
            return;
        }
        if (!employee.isActive || employee.status !== "ACTIVE") {
            res.status(401).json({
                success: false,
                message: "Employee Account Inactive",
            });
            return;
        }
        req.employee = employee;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or Expired Token",
        });
    }
};
exports.authenticate = authenticate;
