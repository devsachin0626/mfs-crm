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
exports.toggleProductStatus = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const productService = __importStar(require("../../services/product/product.service"));
// Create Product
const createProduct = async (req, res) => {
    try {
        const result = await productService.createProduct(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Product Creation Failed",
        });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to Fetch Products",
        });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const result = await productService.getProductById(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || "Product Not Found",
        });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const result = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Product Update Failed",
        });
    }
};
exports.updateProduct = updateProduct;
const toggleProductStatus = async (req, res) => {
    try {
        const result = await productService.toggleProductStatus(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Product Status Update Failed",
        });
    }
};
exports.toggleProductStatus = toggleProductStatus;
