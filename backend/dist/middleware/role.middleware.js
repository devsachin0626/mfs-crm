"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => (req, res, next) => {
    if (!req.employee) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    const employeeRole = req.employee.role.name;
    if (!roles.includes(employeeRole)) {
        res.status(403).json({
            success: false,
            message: "Access Denied",
        });
        return;
    }
    next();
};
exports.authorize = authorize;
