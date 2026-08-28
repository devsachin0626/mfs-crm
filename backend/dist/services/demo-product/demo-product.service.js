"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDemoProduct = exports.deleteDemoProduct = exports.updateDemoProduct = exports.createDemoProduct = exports.getDemoProductById = exports.getActiveDemoProducts = exports.getDemoProducts = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/* ============================
   GET ALL
============================ */
const getDemoProducts = async (query = {}) => {
    const { search, isActive, } = query;
    const demoProducts = await prisma_1.default.demoProduct.findMany({
        where: {
            ...(typeof isActive ===
                "boolean"
                ? {
                    isActive,
                }
                : {}),
            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            code: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),
        },
        orderBy: [
            {
                sortOrder: "asc",
            },
            {
                name: "asc",
            },
        ],
    });
    return {
        success: true,
        demoProducts,
    };
};
exports.getDemoProducts = getDemoProducts;
/* ============================
   GET ACTIVE
============================ */
const getActiveDemoProducts = async () => {
    const demoProducts = await prisma_1.default.demoProduct.findMany({
        where: {
            isActive: true,
        },
        orderBy: [
            {
                sortOrder: "asc",
            },
            {
                name: "asc",
            },
        ],
    });
    return {
        success: true,
        demoProducts,
    };
};
exports.getActiveDemoProducts = getActiveDemoProducts;
/* ============================
   GET BY ID
============================ */
const getDemoProductById = async (id) => {
    const demoProduct = await prisma_1.default.demoProduct.findUnique({
        where: {
            id,
        },
    });
    if (!demoProduct) {
        throw new Error("Demo Product Not Found");
    }
    return {
        success: true,
        demoProduct,
    };
};
exports.getDemoProductById = getDemoProductById;
/* ============================
   CREATE
============================ */
const createDemoProduct = async (data) => {
    const code = data.code
        .trim()
        .toUpperCase();
    const name = data.name.trim();
    if (!code) {
        throw new Error("Demo Product Code Is Required");
    }
    if (!name) {
        throw new Error("Demo Product Name Is Required");
    }
    /* ============================
       DUPLICATE CHECK
    ============================ */
    const existing = await prisma_1.default.demoProduct.findFirst({
        where: {
            OR: [
                {
                    code,
                },
                {
                    name: {
                        equals: name,
                        mode: "insensitive",
                    },
                },
            ],
        },
    });
    if (existing) {
        if (existing.code ===
            code) {
            throw new Error("Demo Product Code Already Exists");
        }
        throw new Error("Demo Product Name Already Exists");
    }
    const demoProduct = await prisma_1.default.demoProduct.create({
        data: {
            code,
            name,
            description: data.description
                ?.trim() ||
                null,
            isActive: data.isActive ??
                true,
            sortOrder: data.sortOrder ??
                0,
        },
    });
    return {
        success: true,
        message: "Demo Product Created Successfully",
        demoProduct,
    };
};
exports.createDemoProduct = createDemoProduct;
/* ============================
   UPDATE
============================ */
const updateDemoProduct = async (id, data) => {
    const existing = await prisma_1.default.demoProduct.findUnique({
        where: {
            id,
        },
    });
    if (!existing) {
        throw new Error("Demo Product Not Found");
    }
    const code = data.code !==
        undefined
        ? data.code
            .trim()
            .toUpperCase()
        : undefined;
    const name = data.name !==
        undefined
        ? data.name.trim()
        : undefined;
    if (code !== undefined &&
        !code) {
        throw new Error("Demo Product Code Is Required");
    }
    if (name !== undefined &&
        !name) {
        throw new Error("Demo Product Name Is Required");
    }
    /* ============================
       DUPLICATE CHECK
    ============================ */
    if (code !== undefined ||
        name !== undefined) {
        const duplicate = await prisma_1.default.demoProduct.findFirst({
            where: {
                id: {
                    not: id,
                },
                OR: [
                    ...(code
                        ? [
                            {
                                code,
                            },
                        ]
                        : []),
                    ...(name
                        ? [
                            {
                                name: {
                                    equals: name,
                                    mode: "insensitive",
                                },
                            },
                        ]
                        : []),
                ],
            },
        });
        if (duplicate) {
            if (code &&
                duplicate.code ===
                    code) {
                throw new Error("Demo Product Code Already Exists");
            }
            throw new Error("Demo Product Name Already Exists");
        }
    }
    const demoProduct = await prisma_1.default.demoProduct.update({
        where: {
            id,
        },
        data: {
            ...(code !==
                undefined
                ? {
                    code,
                }
                : {}),
            ...(name !==
                undefined
                ? {
                    name,
                }
                : {}),
            ...(data.description !==
                undefined
                ? {
                    description: data.description
                        ?.trim() ||
                        null,
                }
                : {}),
            ...(data.isActive !==
                undefined
                ? {
                    isActive: data.isActive,
                }
                : {}),
            ...(data.sortOrder !==
                undefined
                ? {
                    sortOrder: data.sortOrder,
                }
                : {}),
        },
    });
    return {
        success: true,
        message: "Demo Product Updated Successfully",
        demoProduct,
    };
};
exports.updateDemoProduct = updateDemoProduct;
/* ============================
   DELETE
============================ */
const deleteDemoProduct = async (id) => {
    const existing = await prisma_1.default.demoProduct.findUnique({
        where: {
            id,
        },
        include: {
            _count: {
                select: {
                    trials: true,
                },
            },
        },
    });
    if (!existing) {
        throw new Error("Demo Product Not Found");
    }
    /*
     * Historical trial me product
     * use ho chuka hai to hard delete
     * nahi karenge.
     */
    if (existing._count
        .trials > 0) {
        throw new Error("This Demo Product Is Used In Trial History. Deactivate It Instead Of Deleting.");
    }
    await prisma_1.default.demoProduct.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Demo Product Deleted Successfully",
    };
};
exports.deleteDemoProduct = deleteDemoProduct;
/* ============================
   TOGGLE ACTIVE
============================ */
const toggleDemoProduct = async (id) => {
    const existing = await prisma_1.default.demoProduct.findUnique({
        where: {
            id,
        },
    });
    if (!existing) {
        throw new Error("Demo Product Not Found");
    }
    const demoProduct = await prisma_1.default.demoProduct.update({
        where: {
            id,
        },
        data: {
            isActive: !existing.isActive,
        },
    });
    return {
        success: true,
        message: demoProduct.isActive
            ? "Demo Product Activated Successfully"
            : "Demo Product Deactivated Successfully",
        demoProduct,
    };
};
exports.toggleDemoProduct = toggleDemoProduct;
