import api from "./api";

import type {
  DemoProduct,
} from "../types/settings.types";

/* ============================
   RESPONSE TYPES
============================ */

interface DemoProductListResponse {
  success: boolean;

  demoProducts: DemoProduct[];
}

interface DemoProductResponse {
  success: boolean;

  message?: string;

  demoProduct: DemoProduct;
}

/* ============================
   PAYLOAD
============================ */

export interface DemoProductPayload {
  code: string;

  name: string;

  description?: string | null;

  isActive?: boolean;

  sortOrder?: number;
}

/* ============================
   GET ALL
   ADMIN SETTINGS
============================ */

export const getDemoProducts =
  async (
    params?: {
      search?: string;

      isActive?: boolean;
    }
  ): Promise<
    DemoProduct[]
  > => {
    const response =
      await api.get<DemoProductListResponse>(
        "/demo-products",
        {
          params,
        }
      );

    return (
      response.data
        .demoProducts || []
    );
  };

/* ============================
   GET ACTIVE
   TRIAL / DEMO DROPDOWN
============================ */

export const getActiveDemoProducts =
  async (): Promise<
    DemoProduct[]
  > => {
    const response =
      await api.get<DemoProductListResponse>(
        "/demo-products/active"
      );

    return (
      response.data
        .demoProducts || []
    );
  };

/* ============================
   GET BY ID
============================ */

export const getDemoProductById =
  async (
    id: string
  ): Promise<
    DemoProduct
  > => {
    const response =
      await api.get<DemoProductResponse>(
        `/demo-products/${id}`
      );

    return response.data
      .demoProduct;
  };

/* ============================
   CREATE
============================ */

export const createDemoProduct =
  async (
    data:
      DemoProductPayload
  ): Promise<
    DemoProduct
  > => {
    const response =
      await api.post<DemoProductResponse>(
        "/demo-products",
        data
      );

    return response.data
      .demoProduct;
  };

/* ============================
   UPDATE
============================ */

export const updateDemoProduct =
  async (
    id: string,
    data:
      Partial<DemoProductPayload>
  ): Promise<
    DemoProduct
  > => {
    const response =
      await api.put<DemoProductResponse>(
        `/demo-products/${id}`,
        data
      );

    return response.data
      .demoProduct;
  };

/* ============================
   TOGGLE STATUS
============================ */

export const toggleDemoProduct =
  async (
    id: string
  ): Promise<
    DemoProduct
  > => {
    const response =
      await api.patch<DemoProductResponse>(
        `/demo-products/${id}/toggle`
      );

    return response.data
      .demoProduct;
  };

/* ============================
   DELETE
============================ */

export const deleteDemoProduct =
  async (
    id: string
  ): Promise<void> => {
    await api.delete(
      `/demo-products/${id}`
    );
  };

/* ============================
   SERVICE
============================ */

const demoProductService = {
  getDemoProducts,

  getActiveDemoProducts,

  getDemoProductById,

  createDemoProduct,

  updateDemoProduct,

  toggleDemoProduct,

  deleteDemoProduct,
};

export default demoProductService;