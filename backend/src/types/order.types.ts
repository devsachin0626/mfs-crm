export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  clientId: string;
  employeeId: string;

  discount?: number;

  remarks?: string;

  items: CreateOrderItem[];
}


export interface UpdateOrderRequest {
  discount?: number;
  remarks?: string;
}