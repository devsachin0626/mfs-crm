"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDemoProductController = exports.toggleDemoProductController = exports.updateDemoProductController = exports.createDemoProductController = exports.getDemoProductByIdController = exports.getActiveDemoProductsController = exports.getDemoProductsController = void 0;
const demo_product_service_1 = require("../../services/demo-product/demo-product.service");
/* ============================
   GET ALL DEMO PRODUCTS
============================ */
const getDemoProductsController = async (req, res) => {
    try {
        const search = typeof req.query.search ===
            "string"
            ? req.query.search
            : undefined;
        let isActive;
        if (req.query.isActive !==
            undefined) {
            isActive =
                String(req.query.isActive) === "true";
        }
        const result = await (0, demo_product_service_1.getDemoProducts)({
            search,
            isActive,
        });
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message ||
                "Failed To Fetch Demo Products",
        });
    }
};
exports.getDemoProductsController = getDemoProductsController;
/* ============================
   GET ACTIVE DEMO PRODUCTS
============================ */
const getActiveDemoProductsController = async (_req, res) => {
    try {
        const result = await (0, demo_product_service_1.getActiveDemoProducts)();
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message ||
                "Failed To Fetch Active Demo Products",
        });
    }
};
exports.getActiveDemoProductsController = getActiveDemoProductsController;
/* ============================
   GET BY ID
============================ */
const getDemoProductByIdController = async (req, res) => {
    try {
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Demo Product ID Is Required",
            });
            return;
        }
        const result = await (0, demo_product_service_1.getDemoProductById)(id);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error?.message ||
                "Demo Product Not Found",
        });
    }
};
exports.getDemoProductByIdController = getDemoProductByIdController;
/* ============================
   CREATE
============================ */
const createDemoProductController = async (req, res) => {
    try {
        const { code, name, description, isActive, sortOrder, } = req.body || {};
        if (!code ||
            !String(code).trim()) {
            res.status(400).json({
                success: false,
                message: "Demo Product Code Is Required",
            });
            return;
        }
        if (!name ||
            !String(name).trim()) {
            res.status(400).json({
                success: false,
                message: "Demo Product Name Is Required",
            });
            return;
        }
        const parsedSortOrder = sortOrder ===
            undefined ||
            sortOrder ===
                null ||
            sortOrder ===
                ""
            ? 0
            : Number(sortOrder);
        if (Number.isNaN(parsedSortOrder)) {
            res.status(400).json({
                success: false,
                message: "Sort Order Must Be A Valid Number",
            });
            return;
        }
        const result = await (0, demo_product_service_1.createDemoProduct)({
            code: String(code),
            name: String(name),
            description: description ===
                undefined ||
                description ===
                    null
                ? null
                : String(description),
            isActive: typeof isActive ===
                "boolean"
                ? isActive
                : true,
            sortOrder: parsedSortOrder,
        });
        res
            .status(201)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Demo Product Creation Failed",
        });
    }
};
exports.createDemoProductController = createDemoProductController;
/* ============================
   UPDATE
============================ */
const updateDemoProductController = async (req, res) => {
    try {
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Demo Product ID Is Required",
            });
            return;
        }
        const { code, name, description, isActive, sortOrder, } = req.body || {};
        const payload = {};
        if (code !==
            undefined) {
            payload.code =
                String(code);
        }
        if (name !==
            undefined) {
            payload.name =
                String(name);
        }
        if (description !==
            undefined) {
            payload.description =
                description ===
                    null
                    ? null
                    : String(description);
        }
        if (typeof isActive ===
            "boolean") {
            payload.isActive =
                isActive;
        }
        if (sortOrder !==
            undefined) {
            const parsedSortOrder = Number(sortOrder);
            if (Number.isNaN(parsedSortOrder)) {
                res.status(400).json({
                    success: false,
                    message: "Sort Order Must Be A Valid Number",
                });
                return;
            }
            payload.sortOrder =
                parsedSortOrder;
        }
        const result = await (0, demo_product_service_1.updateDemoProduct)(id, payload);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Demo Product Update Failed",
        });
    }
};
exports.updateDemoProductController = updateDemoProductController;
/* ============================
   TOGGLE STATUS
============================ */
const toggleDemoProductController = async (req, res) => {
    try {
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Demo Product ID Is Required",
            });
            return;
        }
        const result = await (0, demo_product_service_1.toggleDemoProduct)(id);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Demo Product Status Update Failed",
        });
    }
};
exports.toggleDemoProductController = toggleDemoProductController;
/* ============================
   DELETE
============================ */
const deleteDemoProductController = async (req, res) => {
    try {
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Demo Product ID Is Required",
            });
            return;
        }
        const result = await (0, demo_product_service_1.deleteDemoProduct)(id);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Demo Product Delete Failed",
        });
    }
};
exports.deleteDemoProductController = deleteDemoProductController;
