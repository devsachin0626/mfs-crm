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
exports.resetEmployeePassword = exports.changePassword = exports.me = exports.login = void 0;
const authService = __importStar(require("../../services/auth/auth.service"));
// Login
const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Login Failed",
        });
    }
};
exports.login = login;
// Current Logged In Employee
const me = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            employee: req.employee,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};
exports.me = me;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const result = await authService.changePassword(req.employee.id, oldPassword, newPassword);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Password Change Failed",
        });
    }
};
exports.changePassword = changePassword;
const resetEmployeePassword = async (req, res) => {
    try {
        const { employeeCode, newPassword, } = req.body;
        const result = await authService.resetEmployeePassword(employeeCode, newPassword);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res
            .status(400)
            .json({
            success: false,
            message: error.message,
        });
    }
};
exports.resetEmployeePassword = resetEmployeePassword;
