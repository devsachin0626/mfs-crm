"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProductStatus = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createProduct = async (data) => {
    // Duplicate Name Check
    const existingProduct = await prisma_1.default.product.findUnique({
        where: {
            name: data.name,
        },
    });
    if (existingProduct) {
        throw new Error("Product Already Exists");
    }
    // Price Validation
    if (Number(data.price) <= 0) {
        throw new Error("Price must be greater than 0");
    }
    // GST Validation
    const gst = Number(data.gst ?? 18);
    if (gst < 0 || gst > 100) {
        throw new Error("Invalid GST Percentage");
    }
    // Duration Validation
    if (data.durationDays !== undefined &&
        Number(data.durationDays) < 0) {
        throw new Error("Duration cannot be negative");
    }
    // Product Code Generate
    const totalProducts = await prisma_1.default.product.count();
    const productCode = `PRD${String(totalProducts + 1).padStart(5, "0")}`;
    const product = await prisma_1.default.product.create({
        data: {
            productCode,
            name: data.name,
            type: data.type,
            description: data.description,
            price: data.price,
            gst,
            durationDays: data.durationDays,
            isTrialAvailable: data.isTrialAvailable ?? false,
            isActive: data.isActive ?? true,
        },
    });
    return {
        success: true,
        message: "Product Created Successfully",
        product,
    };
};
exports.createProduct = createProduct;
const getProducts = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (query.search) {
        where.OR = [
            {
                name: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                productCode: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];
    }
    if (query.isActive !== undefined) {
        where.isActive = query.isActive === "true";
    }
    const [products, total] = await Promise.all([
        prisma_1.default.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma_1.default.product.count({ where }),
    ]);
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        products,
    };
};
exports.getProducts = getProducts;
const getProductById = async (id) => {
    const product = await prisma_1.default.product.findUnique({
        where: {
            id,
        },
        include: {
            orderItems: true,
            serviceActivations: true,
        },
    });
    if (!product) {
        throw new Error("Product Not Found");
    }
    return {
        success: true,
        product,
    };
};
exports.getProductById = getProductById;
const updateProduct = async (id, data) => {
    const existingProduct = await prisma_1.default.product.findUnique({
        where: { id },
    });
    if (!existingProduct) {
        throw new Error("Product Not Found");
    }
    if (data.name) {
        const duplicate = await prisma_1.default.product.findFirst({
            where: {
                name: data.name,
                NOT: {
                    id,
                },
            },
        });
        if (duplicate) {
            throw new Error("Product Name Already Exists");
        }
    }
    if (data.price !== undefined && Number(data.price) <= 0) {
        throw new Error("Price must be greater than 0");
    }
    if (data.gst !== undefined &&
        (Number(data.gst) < 0 || Number(data.gst) > 100)) {
        throw new Error("Invalid GST Percentage");
    }
    const product = await prisma_1.default.product.update({
        where: { id },
        data,
    });
    return {
        success: true,
        message: "Product Updated Successfully",
        product,
    };
};
exports.updateProduct = updateProduct;
const toggleProductStatus = async (id) => {
    const product = await prisma_1.default.product.findUnique({
        where: { id },
    });
    if (!product) {
        throw new Error("Product Not Found");
    }
    const updatedProduct = await prisma_1.default.product.update({
        where: { id },
        data: {
            isActive: !product.isActive,
        },
    });
    return {
        success: true,
        message: `Product ${updatedProduct.isActive ? "Activated" : "Deactivated"} Successfully`,
        product: updatedProduct,
    };
};
exports.toggleProductStatus = toggleProductStatus;
