import api from "./api";

export interface ProductOption {
  id: string;

  productCode: string;

  name: string;

  type?: string;

  price:
    | number
    | string;

  gst?:
    | number
    | string;

  durationDays?:
    | number
    | null;

  isTrialAvailable: boolean;

  isActive: boolean;
}

interface ProductListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  products: ProductOption[];
}

/* ============================
   GET PRODUCT OPTIONS

   Only active + trial-enabled
   products are returned to
   Trial Create page.
============================ */

export const getTrialProductOptions =
  async (): Promise<
    ProductOption[]
  > => {
    const response =
      await api.get<ProductListResponse>(
        "/products",
        {
          params: {
            page: 1,
            limit: 100,
            isActive: true,
          },
        }
      );

    const products =
      response.data.products ||
      [];

    return products.filter(
      (product) =>
        product.isActive &&
        product.isTrialAvailable
    );
  };

/* ============================
   GET ALL ACTIVE PRODUCTS
============================ */

export const getActiveProducts =
  async (): Promise<
    ProductOption[]
  > => {
    const response =
      await api.get<ProductListResponse>(
        "/products",
        {
          params: {
            page: 1,
            limit: 100,
            isActive: true,
          },
        }
      );

    return (
      response.data.products ||
      []
    );
  };