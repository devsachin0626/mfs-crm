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
exports.convertLeadToClient = exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const clientService = __importStar(require("../../services/client/client.service"));
/* ============================
   CREATE CLIENT
============================ */
const createClient = async (req, res) => {
    try {
        const result = await clientService.createClient(req.body);
        res
            .status(201)
            .json(result);
    }
    catch (error) {
        res
            .status(400)
            .json({
            success: false,
            message: error.message ||
                "Client Creation Failed",
        });
    }
};
exports.createClient = createClient;
/* ============================
   GET CLIENTS
============================ */
const getClients = async (req, res) => {
    try {
        const result = await clientService.getClients(req.query);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res
            .status(500)
            .json({
            success: false,
            message: error.message ||
                "Failed to Fetch Clients",
        });
    }
};
exports.getClients = getClients;
/* ============================
   GET CLIENT BY ID
============================ */
const getClientById = async (req, res) => {
    try {
        const result = await clientService.getClientById(req.params.id);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res
            .status(404)
            .json({
            success: false,
            message: error.message ||
                "Client Not Found",
        });
    }
};
exports.getClientById = getClientById;
/* ============================
   UPDATE CLIENT
============================ */
const updateClient = async (req, res) => {
    try {
        const result = await clientService.updateClient(req.params.id, req.body);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res
            .status(400)
            .json({
            success: false,
            message: error.message ||
                "Client Update Failed",
        });
    }
};
exports.updateClient = updateClient;
/* ============================
   CONVERT LEAD TO CLIENT
============================ */
const convertLeadToClient = async (req, res) => {
    try {
        const { leadId } = req.params;
        const employeeId = req
            .user?.id ||
            req
                .employee?.id;
        if (!employeeId) {
            res
                .status(401)
                .json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await clientService.convertLeadToClient(leadId, employeeId, req.body);
        res
            .status(201)
            .json(result);
    }
    catch (error) {
        res
            .status(400)
            .json({
            success: false,
            message: error.message ||
                "Lead Conversion Failed",
        });
    }
};
exports.convertLeadToClient = convertLeadToClient;
