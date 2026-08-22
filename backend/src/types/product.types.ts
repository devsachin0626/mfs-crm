import { ProductType } from "@prisma/client";

export interface CreateProductRequest {
  name: string;
  type: ProductType;

  description?: string;

  price: number;

  gst?: number;

  durationDays?: number;

  isTrialAvailable?: boolean;

  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  type?: ProductType;

  description?: string;

  price?: number;

  gst?: number;

  durationDays?: number;

  isTrialAvailable?: boolean;

  isActive?: boolean;
}

export interface ProductQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
}