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
exports.getCallingQueue = exports.bulkChangeLeadStatus = exports.bulkChangeLeadStage = exports.bulkAssignLeads = exports.changeLeadStatus = exports.getLeadPipeline = exports.getLeadTimeline = exports.getDailyCallingSummary = exports.saveCallOutcome = exports.completeFollowUp = exports.getFollowUps = exports.createFollowUp = exports.changeLeadStage = exports.assignLead = exports.updateLead = exports.getLeadById = exports.getLeads = exports.createLead = void 0;
const leadService = __importStar(require("../../services/lead/lead.service"));
/* ============================
   CREATE LEAD
============================ */
const createLead = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.createLead(req.body, req.employee.id);
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
                "Lead Creation Failed",
        });
    }
};
exports.createLead = createLead;
/* ============================
   GET ALL LEADS
============================ */
const getLeads = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.getLeads(req.query, req.employee);
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
                "Failed to Fetch Leads",
        });
    }
};
exports.getLeads = getLeads;
/* ============================
   GET LEAD BY ID
============================ */
const getLeadById = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.getLeadById(req.params.id, req.employee);
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
                "Lead Not Found",
        });
    }
};
exports.getLeadById = getLeadById;
/* ============================
   UPDATE LEAD
============================ */
const updateLead = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await leadService.updateLead(id, req.body);
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
                "Lead Update Failed",
        });
    }
};
exports.updateLead = updateLead;
/* ============================
   ASSIGN LEAD
============================ */
const assignLead = async (req, res) => {
    try {
        const leadId = req.params.id;
        const result = await leadService.assignLead(leadId, req.body);
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
                "Lead Assignment Failed",
        });
    }
};
exports.assignLead = assignLead;
/* ============================
   CHANGE LEAD STATUS
============================ */
const changeLeadStage = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const { id } = req.params;
        const result = await leadService.changeLeadStage(id, req.employee.id, req.body, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Lead Stage Update Failed",
        });
    }
};
exports.changeLeadStage = changeLeadStage;
/* ============================
   CREATE FOLLOW-UP
============================ */
const createFollowUp = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const leadId = req.params.id;
        const result = await leadService.createFollowUp(leadId, req.employee.id, req.body, req.employee);
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
                "Follow-up Creation Failed",
        });
    }
};
exports.createFollowUp = createFollowUp;
/* ============================
   GET ALL FOLLOW-UPS
============================ */
const getFollowUps = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.getFollowUps({
            page: req.query.page
                ? Number(req.query.page)
                : 1,
            limit: req.query.limit
                ? Number(req.query.limit)
                : 10,
            search: typeof req.query
                .search ===
                "string"
                ? req.query.search
                : undefined,
            employeeId: typeof req.query
                .employeeId ===
                "string"
                ? req.query
                    .employeeId
                : undefined,
            isCompleted: typeof req.query
                .isCompleted ===
                "string"
                ? req.query
                    .isCompleted
                : undefined,
            view: typeof req.query
                .view ===
                "string"
                ? req.query
                    .view
                : undefined,
        }, req.employee);
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
exports.getFollowUps = getFollowUps;
/* ============================
   COMPLETE FOLLOW-UP
============================ */
const completeFollowUp = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.completeFollowUp(req.params.id, req.employee);
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
exports.completeFollowUp = completeFollowUp;
/* ============================
   SAVE CALL OUTCOME
============================ */
const saveCallOutcome = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const { id } = req.params;
        const result = await leadService.saveCallOutcome(id, req.employee.id, req.body, req.employee);
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
exports.saveCallOutcome = saveCallOutcome;
/* ============================
   DAILY CALLING SUMMARY
============================ */
const getDailyCallingSummary = async (req, res) => {
    try {
        if (!req.employee) {
            res
                .status(401)
                .json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const roleName = typeof req.employee
            .role ===
            "string"
            ? req.employee
                .role
            : req.employee
                .role?.name;
        /*
         * Employee can only request
         * their own summary.
         */
        const employeeId = roleName ===
            "EMPLOYEE"
            ? req.employee.id
            : typeof req.query
                .employeeId ===
                "string"
                ? req.query
                    .employeeId
                : req.employee.id;
        const result = await leadService.getDailyCallingSummary(employeeId, req.employee);
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
                "Failed To Load Calling Summary",
        });
    }
};
exports.getDailyCallingSummary = getDailyCallingSummary;
/* ============================
   LEAD TIMELINE
============================ */
const getLeadTimeline = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const { id } = req.params;
        const result = await leadService.getLeadTimeline(id, req.employee);
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
exports.getLeadTimeline = getLeadTimeline;
/* ============================
   GET LEAD PIPELINE
============================ */
const getLeadPipeline = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const roleName = req.employee.role
            ?.name;
        /*
         * Employee cannot manipulate
         * employeeId query parameter.
         */
        const employeeId = roleName ===
            "EMPLOYEE"
            ? req.employee.id
            : typeof req.query
                .employeeId ===
                "string"
                ? req.query
                    .employeeId
                : undefined;
        const search = typeof req.query
            .search ===
            "string"
            ? req.query.search
            : undefined;
        const result = await leadService.getLeadPipeline(employeeId, search, req.employee);
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
exports.getLeadPipeline = getLeadPipeline;
/* ============================
   CHANGE LEAD STAGE
============================ */
const changeLeadStatus = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const leadId = req.params.id;
        const result = await leadService.changeLeadStatus(leadId, req.employee.id, req.body, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Lead Status Update Failed",
        });
    }
};
exports.changeLeadStatus = changeLeadStatus;
/* ============================
   BULK ASSIGN
============================ */
const bulkAssignLeads = async (req, res) => {
    try {
        const result = await leadService.bulkAssignLeads(req.body);
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
exports.bulkAssignLeads = bulkAssignLeads;
/* ============================
   BULK CHANGE STAGE
============================ */
const bulkChangeLeadStage = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.bulkChangeLeadStage(req.body, req.employee.id);
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
exports.bulkChangeLeadStage = bulkChangeLeadStage;
/* ============================
   BULK CHANGE STATUS
============================ */
const bulkChangeLeadStatus = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leadService.bulkChangeLeadStatus(req.body, req.employee.id);
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
exports.bulkChangeLeadStatus = bulkChangeLeadStatus;
/* ============================
 CALLING QUEUE
============================ */
const getCallingQueue = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const page = req.query.page
            ? Number(req.query.page)
            : 1;
        const limit = req.query.limit
            ? Number(req.query.limit)
            : 20;
        const search = typeof req.query
            .search ===
            "string"
            ? req.query.search
            : undefined;
        const employeeId = typeof req.query
            .employeeId ===
            "string"
            ? req.query
                .employeeId
            : undefined;
        const result = await leadService.getCallingQueue({
            page,
            limit,
            search,
            employeeId,
        }, req.employee);
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
                "Failed To Load Calling Queue",
        });
    }
};
exports.getCallingQueue = getCallingQueue;
