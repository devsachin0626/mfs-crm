export interface Payment {
  id: number;
  amount: number;
  mode: "UPI" | "Bank Transfer";
  verified: boolean;
}