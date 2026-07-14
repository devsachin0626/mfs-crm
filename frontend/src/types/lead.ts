export type LeadStatus =
  | "New"
  | "Interested"
  | "Not Interested"
  | "Busy"
  | "DND"
  | "Invalid Number"
  | "Switch Off"
  | "Not Reachable"
  | "NPC"
  | "Follow-up"
  | "Callback";

export type TrialType =
  | "None"
  | "1 Day"
  | "2 Days"
  | "3 Days";

export type ProductType =
  | "Demat"
  | "Research"
  | "Pre IPO"
  | "SIP"
  | "Mutual Fund"
  | "Insurance"
  | "Loan"
  | "PMS";

export interface Lead {
  id: number;
  name?: string;
  mobile: string;
  email?: string;
  city?: string;
  state?: string;

  status: LeadStatus;

  assignedEmployeeId: number;

  followUpDate?: string;

  callbackTime?: string;

  trial?: TrialType;

  product?: ProductType;

  remarks?: string;

  createdAt: string;

  updatedAt: string;
}