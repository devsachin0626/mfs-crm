"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetEmployeePassword = exports.uploadProfileImage = exports.restoreEmployee = exports.deactivateEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const employeeService = __importStar(require("../../services/employee/employee.service"));
// Create Employee
const createEmployee = async (req, res) => {
    try {
        const result = await employeeService.createEmployee(req.body, req.employee.id);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Employee Creation Failed",
        });
    }
};
exports.createEmployee = createEmployee;
const getEmployees = async (req, res) => {
    try {
        const result = await employeeService.getEmployees((req.query));
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await employeeService.getEmployeeById(id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getEmployeeById = getEmployeeById;
const updateEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await employeeService.updateEmployee(id, req.body, req.employee.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Employee Update Failed",
        });
    }
};
exports.updateEmployee = updateEmployee;
const deactivateEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await employeeService.deactivateEmployee(id, req.employee.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to Deactivate Employee",
        });
    }
};
exports.deactivateEmployee = deactivateEmployee;
// Restore Employee
const restoreEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await employeeService.restoreEmployee(id, req.employee.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to Restore Employee",
        });
    }
};
exports.restoreEmployee = restoreEmployee;
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("Please upload an image");
        }
        const result = await employeeService.uploadProfileImage(req.employee.id, req.file.filename);
        res.status(200).json({
            ...result,
            employee: {
                ...result.employee,
                profileImage: `${req.protocol}://${req.get("host")}/uploads/${result.employee.profileImage}`,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Profile Image Upload Failed",
        });
    }
};
exports.uploadProfileImage = uploadProfileImage;
const resetEmployeePassword = async (req, res) => {
    try {
        const id = req.params.id;
        const { newPassword } = req.body;
        const result = await employeeService.resetEmployeePassword(id, newPassword);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Password Reset Failed",
        });
    }
};
exports.resetEmployeePassword = resetEmployeePassword;
