import prisma from "../../config/prisma";

import type {
  CreateDemoProductRequest,
  DemoProductQuery,
  UpdateDemoProductRequest,
} from "../../types/demo-product.types";

/* ============================
   GET ALL
============================ */

export const getDemoProducts =
  async (
    query: DemoProductQuery = {}
  ) => {
    const {
      search,
      isActive,
    } = query;

    const demoProducts =
      await prisma.demoProduct.findMany({
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
                      contains:
                        search,
                      mode: "insensitive",
                    },
                  },

                  {
                    code: {
                      contains:
                        search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },

        orderBy: [
          {
            sortOrder:
              "asc",
          },

          {
            name:
              "asc",
          },
        ],
      });

    return {
      success: true,

      demoProducts,
    };
  };

/* ============================
   GET ACTIVE
============================ */

export const getActiveDemoProducts =
  async () => {
    const demoProducts =
      await prisma.demoProduct.findMany({
        where: {
          isActive: true,
        },

        orderBy: [
          {
            sortOrder:
              "asc",
          },

          {
            name:
              "asc",
          },
        ],
      });

    return {
      success: true,

      demoProducts,
    };
  };

/* ============================
   GET BY ID
============================ */

export const getDemoProductById =
  async (
    id: string
  ) => {
    const demoProduct =
      await prisma.demoProduct.findUnique({
        where: {
          id,
        },
      });

    if (!demoProduct) {
      throw new Error(
        "Demo Product Not Found"
      );
    }

    return {
      success: true,

      demoProduct,
    };
  };

/* ============================
   CREATE
============================ */

export const createDemoProduct =
  async (
    data: CreateDemoProductRequest
  ) => {
    const code =
      data.code
        .trim()
        .toUpperCase();

    const name =
      data.name.trim();

    if (!code) {
      throw new Error(
        "Demo Product Code Is Required"
      );
    }

    if (!name) {
      throw new Error(
        "Demo Product Name Is Required"
      );
    }

    /* ============================
       DUPLICATE CHECK
    ============================ */

    const existing =
      await prisma.demoProduct.findFirst({
        where: {
          OR: [
            {
              code,
            },

            {
              name: {
                equals:
                  name,
                mode:
                  "insensitive",
              },
            },
          ],
        },
      });

    if (existing) {
      if (
        existing.code ===
        code
      ) {
        throw new Error(
          "Demo Product Code Already Exists"
        );
      }

      throw new Error(
        "Demo Product Name Already Exists"
      );
    }

    const demoProduct =
      await prisma.demoProduct.create({
        data: {
          code,

          name,

          description:
            data.description
              ?.trim() ||
            null,

          isActive:
            data.isActive ??
            true,

          sortOrder:
            data.sortOrder ??
            0,
        },
      });

    return {
      success: true,

      message:
        "Demo Product Created Successfully",

      demoProduct,
    };
  };

/* ============================
   UPDATE
============================ */

export const updateDemoProduct =
  async (
    id: string,
    data: UpdateDemoProductRequest
  ) => {
    const existing =
      await prisma.demoProduct.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new Error(
        "Demo Product Not Found"
      );
    }

    const code =
      data.code !==
      undefined
        ? data.code
            .trim()
            .toUpperCase()
        : undefined;

    const name =
      data.name !==
      undefined
        ? data.name.trim()
        : undefined;

    if (
      code !== undefined &&
      !code
    ) {
      throw new Error(
        "Demo Product Code Is Required"
      );
    }

    if (
      name !== undefined &&
      !name
    ) {
      throw new Error(
        "Demo Product Name Is Required"
      );
    }

    /* ============================
       DUPLICATE CHECK
    ============================ */

    if (
      code !== undefined ||
      name !== undefined
    ) {
      const duplicate =
        await prisma.demoProduct.findFirst({
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
                        equals:
                          name,
                        mode:
                          "insensitive" as const,
                      },
                    },
                  ]
                : []),
            ],
          },
        });

      if (duplicate) {
        if (
          code &&
          duplicate.code ===
            code
        ) {
          throw new Error(
            "Demo Product Code Already Exists"
          );
        }

        throw new Error(
          "Demo Product Name Already Exists"
        );
      }
    }

    const demoProduct =
      await prisma.demoProduct.update({
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
                description:
                  data.description
                    ?.trim() ||
                  null,
              }
            : {}),

          ...(data.isActive !==
          undefined
            ? {
                isActive:
                  data.isActive,
              }
            : {}),

          ...(data.sortOrder !==
          undefined
            ? {
                sortOrder:
                  data.sortOrder,
              }
            : {}),
        },
      });

    return {
      success: true,

      message:
        "Demo Product Updated Successfully",

      demoProduct,
    };
  };

/* ============================
   DELETE
============================ */

export const deleteDemoProduct =
  async (
    id: string
  ) => {
    const existing =
      await prisma.demoProduct.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              trials:
                true,
            },
          },
        },
      });

    if (!existing) {
      throw new Error(
        "Demo Product Not Found"
      );
    }

    /*
     * Historical trial me product
     * use ho chuka hai to hard delete
     * nahi karenge.
     */

    if (
      existing._count
        .trials > 0
    ) {
      throw new Error(
        "This Demo Product Is Used In Trial History. Deactivate It Instead Of Deleting."
      );
    }

    await prisma.demoProduct.delete({
      where: {
        id,
      },
    });

    return {
      success: true,

      message:
        "Demo Product Deleted Successfully",
    };
  };

/* ============================
   TOGGLE ACTIVE
============================ */

export const toggleDemoProduct =
  async (
    id: string
  ) => {
    const existing =
      await prisma.demoProduct.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new Error(
        "Demo Product Not Found"
      );
    }

    const demoProduct =
      await prisma.demoProduct.update({
        where: {
          id,
        },

        data: {
          isActive:
            !existing.isActive,
        },
      });

    return {
      success: true,

      message:
        demoProduct.isActive
          ? "Demo Product Activated Successfully"
          : "Demo Product Deactivated Successfully",

      demoProduct,
    };
  };