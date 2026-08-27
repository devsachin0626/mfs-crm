/* ============================
   REPORT TYPES

   Reports Module:
   ADMIN ONLY
============================ */

/* ============================
   REPORT TYPE
============================ */

export type ReportType =
  | "LEAD"
  | "CLIENT"
  | "TRIAL"
  | "FOLLOW_UP"
  | "PAYMENT"
  | "EMPLOYEE"
  | "BROKERAGE";

/* ============================
   EXPORT FORMAT
============================ */

export type ReportExportFormat =
  | "xlsx"
  | "csv"
  | "pdf";

/* ============================
   COMMON REPORT FILTERS
============================ */

export interface ReportFilters {
  /* Pagination */

  page?: number;

  limit?: number;

  /* Search */

  search?: string;

  /* Date */

  fromDate?: string;

  toDate?: string;

  /* Employee */

  employeeId?: string;

  /* Team */

  teamLeaderId?: string;

  /* Lead / Client */

  status?: string;

  stage?: string;

  source?: string;

  /* Product */

  productId?: string;

  /* Report specific */

  paymentStatus?: string;

  trialStatus?: string;

  followUpStatus?: string;
}

/* ============================
   REPORT REQUEST
============================ */

export interface ReportRequest
  extends ReportFilters {
  reportType: ReportType;
}

/* ============================
   EXPORT REQUEST
============================ */

export interface ReportExportRequest
  extends ReportFilters {
  reportType: ReportType;

  format: ReportExportFormat;
}

/* ============================
   PAGINATION
============================ */

export interface ReportPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

/* ============================
   REPORT META

   Used on screen and
   inside exported reports.
============================ */

export interface ReportMeta {
  reportType: ReportType;

  reportTitle: string;

  generatedAt: string;

  generatedBy: {
    id: string;

    name: string;

    employeeCode?: string | null;
  };

  filters: {
    fromDate?: string;

    toDate?: string;

    employeeId?: string;

    employeeName?: string;

    teamLeaderId?: string;

    teamLeaderName?: string;

    status?: string;

    stage?: string;

    source?: string;

    productId?: string;

    productName?: string;

    paymentStatus?: string;

    trialStatus?: string;

    followUpStatus?: string;

    search?: string;
  };

  totalRecords: number;
}

/* ============================
   LEAD REPORT ROW
============================ */

export interface LeadReportRow {
  id: string;

  leadCode: string;

  name: string | null;

  mobile: string;

  email: string | null;

  city: string | null;

  state: string | null;

  source: string | null;

  status: string | null;

  stage: string;

  isConverted: boolean;

  assignedEmployee: {
    id: string;

    employeeCode: string;

    name: string;
  } | null;

  createdAt: Date;

  updatedAt: Date;
}

/* ============================
   CLIENT REPORT ROW
============================ */

export interface ClientReportRow {
  id: string;

  clientCode: string;

  name: string;

  mobile: string;

  email: string | null;

  city: string | null;

  state: string | null;

  isActive: boolean;

  employee: {
    id: string;

    employeeCode: string;

    name: string;
  } | null;

  createdAt: Date;

  updatedAt: Date;
}

/* ============================
   TRIAL REPORT ROW
============================ */

export interface TrialReportRow {
  id: string;

  trialCode: string;

  lead: {
    id: string;

    leadCode: string;

    name: string | null;

    mobile: string;
  } | null;

  client: {
    id: string;

    clientCode: string;

    name: string;

    mobile: string;
  } | null;

  product: {
    id: string;

    productCode: string;

    name: string;
  };

  employee: {
    id: string;

    employeeCode: string;

    name: string;
  } | null;

  startDate: Date;

  endDate: Date;

  trialDays: number;

  extensionCount: number;

  status: string;

  remarks: string | null;

  createdAt: Date;
}

/* ============================
   FOLLOW-UP REPORT ROW
============================ */

export interface FollowUpReportRow {
  id: string;

  leadId?: string | null;

  clientId?: string | null;

  subjectName: string;

  subjectCode: string;

  mobile: string;

  employee: {
    id: string;

    employeeCode: string;

    name: string;
  } | null;

  followUpDate: Date;

  status: string;

  remarks?: string | null;

  createdAt: Date;
}

/* ============================
   PAYMENT REPORT ROW
============================ */

export interface PaymentReportRow {
  id: string;

  paymentCode?: string | null;

  client: {
    id: string;

    clientCode: string;

    name: string;

    mobile: string;
  } | null;

  employee: {
    id: string;

    employeeCode: string;

    name: string;
  } | null;

  product: {
    id: string;

    productCode: string;

    name: string;
  } | null;

  amount: number;

  status: string;

  paymentDate?: Date | null;

  createdAt: Date;
}

/* ============================
   EMPLOYEE REPORT ROW
============================ */

export interface EmployeeReportRow {
  id: string;

  employeeCode: string;

  name: string;

  email: string | null;

  mobile: string | null;

  role: string;

  isActive: boolean;

  totalLeads: number;

  interestedLeads: number;

  convertedLeads: number;

  totalClients: number;

  totalTrials: number;

  activeTrials: number;

  totalPayments: number;

  totalRevenue: number;
}

/* ============================
   BROKERAGE REPORT ROW
============================ */

export interface BrokerageReportRow {
  employeeId: string;

  employeeCode: string;

  employeeName: string;

  totalClients: number;

  totalTransactions: number;

  grossBrokerage: number;

  netBrokerage: number;

  fromDate?: Date;

  toDate?: Date;
}

/* ============================
   REPORT ROW UNION
============================ */

export type ReportRow =
  | LeadReportRow
  | ClientReportRow
  | TrialReportRow
  | FollowUpReportRow
  | PaymentReportRow
  | EmployeeReportRow
  | BrokerageReportRow;

/* ============================
   REPORT RESPONSE
============================ */

export interface ReportResponse<
  T = ReportRow,
> {
  success: boolean;

  meta: ReportMeta;

  pagination: ReportPagination;

  data: T[];
}

/* ============================
   REPORT SUMMARY
============================ */

export interface ReportSummary {
  totalRecords: number;

  totalLeads?: number;

  interestedLeads?: number;

  convertedLeads?: number;

  totalClients?: number;

  totalTrials?: number;

  activeTrials?: number;

  completedTrials?: number;

  totalFollowUps?: number;

  pendingFollowUps?: number;

  totalPayments?: number;

  totalPaymentAmount?: number;

  grossBrokerage?: number;

  netBrokerage?: number;
}

/* ============================
   EXPORT RESULT
============================ */

export interface ReportExportResult {
  fileName: string;

  contentType: string;

  buffer: Buffer;
}