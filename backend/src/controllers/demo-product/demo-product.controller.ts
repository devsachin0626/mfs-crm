import type {
  Request,
  Response,
} from "express";

import {
  createDemoProduct,
  deleteDemoProduct,
  getActiveDemoProducts,
  getDemoProductById,
  getDemoProducts,
  toggleDemoProduct,
  updateDemoProduct,
} from "../../services/demo-product/demo-product.service";

/* ============================
   GET ALL DEMO PRODUCTS
============================ */

export const getDemoProductsController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search
          : undefined;

      let isActive:
        | boolean
        | undefined;

      if (
        req.query.isActive !==
        undefined
      ) {
        isActive =
          String(
            req.query.isActive
          ) === "true";
      }

      const result =
        await getDemoProducts({
          search,
          isActive,
        });

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed To Fetch Demo Products",
      });
    }
  };

/* ============================
   GET ACTIVE DEMO PRODUCTS
============================ */

export const getActiveDemoProductsController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await getActiveDemoProducts();

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed To Fetch Active Demo Products",
      });
    }
  };

/* ============================
   GET BY ID
============================ */

export const getDemoProductByIdController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        res.status(400).json({
          success: false,

          message:
            "Demo Product ID Is Required",
        });

        return;
      }

      const result =
        await getDemoProductById(
          id
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,

        message:
          error?.message ||
          "Demo Product Not Found",
      });
    }
  };

/* ============================
   CREATE
============================ */

export const createDemoProductController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        code,
        name,
        description,
        isActive,
        sortOrder,
      } = req.body || {};

      if (
        !code ||
        !String(code).trim()
      ) {
        res.status(400).json({
          success: false,

          message:
            "Demo Product Code Is Required",
        });

        return;
      }

      if (
        !name ||
        !String(name).trim()
      ) {
        res.status(400).json({
          success: false,

          message:
            "Demo Product Name Is Required",
        });

        return;
      }

      const parsedSortOrder =
        sortOrder ===
          undefined ||
        sortOrder ===
          null ||
        sortOrder ===
          ""
          ? 0
          : Number(
              sortOrder
            );

      if (
        Number.isNaN(
          parsedSortOrder
        )
      ) {
        res.status(400).json({
          success: false,

          message:
            "Sort Order Must Be A Valid Number",
        });

        return;
      }

      const result =
        await createDemoProduct({
          code:
            String(
              code
            ),

          name:
            String(
              name
            ),

          description:
            description ===
              undefined ||
            description ===
              null
              ? null
              : String(
                  description
                ),

          isActive:
            typeof isActive ===
            "boolean"
              ? isActive
              : true,

          sortOrder:
            parsedSortOrder,
        });

      res
        .status(201)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Demo Product Creation Failed",
      });
    }
  };

/* ============================
   UPDATE
============================ */

export const updateDemoProductController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        res.status(400).json({
          success: false,

          message:
            "Demo Product ID Is Required",
        });

        return;
      }

      const {
        code,
        name,
        description,
        isActive,
        sortOrder,
      } = req.body || {};

      const payload: {
        code?: string;
        name?: string;
        description?:
          | string
          | null;
        isActive?: boolean;
        sortOrder?: number;
      } = {};

      if (
        code !==
        undefined
      ) {
        payload.code =
          String(
            code
          );
      }

      if (
        name !==
        undefined
      ) {
        payload.name =
          String(
            name
          );
      }

      if (
        description !==
        undefined
      ) {
        payload.description =
          description ===
          null
            ? null
            : String(
                description
              );
      }

      if (
        typeof isActive ===
        "boolean"
      ) {
        payload.isActive =
          isActive;
      }

      if (
        sortOrder !==
        undefined
      ) {
        const parsedSortOrder =
          Number(
            sortOrder
          );

        if (
          Number.isNaN(
            parsedSortOrder
          )
        ) {
          res.status(400).json({
            success: false,

            message:
              "Sort Order Must Be A Valid Number",
          });

          return;
        }

        payload.sortOrder =
          parsedSortOrder;
      }

      const result =
        await updateDemoProduct(
          id,
          payload
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Demo Product Update Failed",
      });
    }
  };

/* ============================
   TOGGLE STATUS
============================ */

export const toggleDemoProductController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        res.status(400).json({
          success: false,

          message:
            "Demo Product ID Is Required",
        });

        return;
      }

      const result =
        await toggleDemoProduct(
          id
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Demo Product Status Update Failed",
      });
    }
  };

/* ============================
   DELETE
============================ */

export const deleteDemoProductController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        res.status(400).json({
          success: false,

          message:
            "Demo Product ID Is Required",
        });

        return;
      }

      const result =
        await deleteDemoProduct(
          id
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Demo Product Delete Failed",
      });
    }
  };