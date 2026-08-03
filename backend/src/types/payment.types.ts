export interface CreatePaymentRequest {
  orderId: string;

  amount: number;

  paymentMode:
    | "CASH"
    | "UPI"
    | "BANK_TRANSFER"
    | "CHEQUE";

  transactionId?: string;

  remarks?: string;
}