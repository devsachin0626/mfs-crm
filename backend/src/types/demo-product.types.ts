/* ============================
   DEMO PRODUCT TYPES
============================ */

export interface CreateDemoProductRequest {
  code: string;

  name: string;

  description?: string | null;

  isActive?: boolean;

  sortOrder?: number;
}

export interface UpdateDemoProductRequest {
  code?: string;

  name?: string;

  description?: string | null;

  isActive?: boolean;

  sortOrder?: number;
}

/* ============================
   QUERY
============================ */

export interface DemoProductQuery {
  search?: string;

  isActive?: boolean;
}