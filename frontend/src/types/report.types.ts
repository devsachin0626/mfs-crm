/* ============================
   REPORT TYPES
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
   COMMON OPTION
============================ */

export interface ReportOption {
  id: string;
  name: string;
}

/* ============================
   EMPLOYEE OPTION
============================ */

export interface ReportEmployeeOption {
  id: string;

  employeeCode: string;

  name: string;

  role?: {
    name: string;
  } | null;
}

/* ============================
   LEAD STATUS OPTION
============================ */

export interface ReportLeadStatusOption {
  id: string;

  name: string;

  color?: string | null;

  sortOrder?: number | null;
}

/* ============================
   LEAD SOURCE OPTION
============================ */

export interface ReportLeadSourceOption {
  id: string;

  name: string;
}

/* ============================
   PRODUCT OPTION
============================ */

export interface ReportProductOption {
  id: string;

  productCode: string;

  name: string;

  type?: string | null;
}

/* ============================
   REPORT FILTER OPTIONS
============================ */

export interface ReportFilterOptions {
  employees: ReportEmployeeOption[];

  leadStatuses: ReportLeadStatusOption[];

  leadStages: string[];

  leadSources: ReportLeadSourceOption[];

  callOutcomes: string[];

  trialStatuses: string[];

  paymentStatuses: string[];

  products: ReportProductOption[];
}

/* ============================
   FILTER OPTIONS RESPONSE
============================ */

export interface ReportFilterOptionsResponse {
  success: boolean;

  filters: ReportFilterOptions;
}

/* ============================
   REPORT FILTERS
============================ */

export interface ReportFilters {
  page?: number;

  limit?: number;

  search?: string;

  fromDate?: string;

  toDate?: string;

  employeeId?: string;

  teamLeaderId?: string;

  status?: string;

  stage?: string;

  source?: string;

  productId?: string;

  paymentStatus?: string;

  trialStatus?: string;

  followUpStatus?: string;
}

/* ============================
   LEAD REPORT STATUS
============================ */

export interface LeadReportStatus {
  id: string;

  name: string;

  color?: string | null;
}

/* ============================
   LEAD REPORT SOURCE
============================ */

export interface LeadReportSource {
  id: string;

  name: string;
}

/* ============================
   LEAD REPORT EMPLOYEE
============================ */

export interface LeadReportEmployee {
  id: string;

  employeeCode: string;

  name: string;
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

  address: string | null;

  stage: string;

  isConverted: boolean;

  lastCallAt: string | null;

  nextFollowUp: string | null;

  remarks: string | null;

  createdAt: string;

  updatedAt: string;

  source: LeadReportSource | null;

  status: LeadReportStatus | null;

  assignedEmployee:
    | LeadReportEmployee
    | null;
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
   APPLIED FILTERS
============================ */

export interface AppliedReportFilters {
  fromDate?: string;

  toDate?: string;

  employeeId?: string;

  status?: string;

  stage?: string;

  source?: string;

  search?: string;
}

/* ============================
   LEAD REPORT RESPONSE
============================ */

export interface LeadReportResponse {
  success: boolean;

  reportType: "LEAD";

  reportTitle: string;

  generatedAt: string;

  filters: AppliedReportFilters;

  pagination: ReportPagination;

  data: LeadReportRow[];
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
   REPORT STATE
============================ */

export interface ReportState {
  filterOptions: ReportFilterOptions | null;

  leadReport: LeadReportResponse | null;

  clientReport: ClientReportResponse | null;

  trialReport: TrialReportResponse | null;

  filters: ReportFilters;

  loading: boolean;

  filtersLoading: boolean;

  downloading: boolean;

  error: string | null;
}
/* ============================
   DEFAULT FILTERS
============================ */

export const DEFAULT_REPORT_FILTERS: ReportFilters =
  {
    page: 1,

    limit: 20,

    search: "",

    fromDate: "",

    toDate: "",

    employeeId: "",

    status: "",

    stage: "",

    source: "",

    productId: "",

    paymentStatus: "",

    trialStatus: "",

    followUpStatus: "",
  };


  /* ============================
   CLIENT REPORT EMPLOYEE
============================ */

export interface ClientReportEmployee {
  id: string;

  employeeCode: string;

  name: string;
}

/* ============================
   CLIENT REPORT LEAD
============================ */

export interface ClientReportLead {
  id: string;

  leadCode: string;

  name: string | null;

  assignedEmployee:
    | ClientReportEmployee
    | null;
}

/* ============================
   CLIENT REPORT COUNTS
============================ */

export interface ClientReportCounts {
  orders: number;

  trials: number;

  services: number;
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

  address: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;

  lead:
    | ClientReportLead
    | null;

  _count: ClientReportCounts;
}

/* ============================
   CLIENT APPLIED FILTERS
============================ */

export interface ClientAppliedReportFilters {
  fromDate?: string;

  toDate?: string;

  employeeId?: string;

  status?: string;

  search?: string;
}

/* ============================
   CLIENT REPORT RESPONSE
============================ */

export interface ClientReportResponse {
  success: boolean;

  reportType: "CLIENT";

  reportTitle: string;

  generatedAt: string;

  filters: ClientAppliedReportFilters;

  pagination: ReportPagination;

  data: ClientReportRow[];
}


/* ============================
   TRIAL REPORT SUBJECT
============================ */

export interface TrialReportLead {
  id: string;
  leadCode: string;
  name: string | null;
  mobile: string;
}

export interface TrialReportClient {
  id: string;
  clientCode: string;
  name: string;
  mobile: string;
}

export interface TrialReportProduct {
  id: string;
  productCode: string;
  name: string;
  type?: string | null;
}

export interface TrialReportEmployee {
  id: string;
  employeeCode: string;
  name: string;
}

/* ============================
   TRIAL REPORT ROW
============================ */

export interface TrialReportRow {
  id: string;

  trialCode: string;

  startDate: string;

  endDate: string;

  trialDays: number;

  extensionCount: number;

  status: string;

  remarks: string | null;

  createdAt: string;

  updatedAt: string;

  lead:
    | TrialReportLead
    | null;

  client:
    | TrialReportClient
    | null;

  product: TrialReportProduct;

  employee:
    | TrialReportEmployee
    | null;
}

/* ============================
   TRIAL REPORT RESPONSE
============================ */

export interface TrialReportResponse {
  success: boolean;

  reportType: "TRIAL";

  reportTitle: string;

  generatedAt: string;

  filters: {
    fromDate?: string;
    toDate?: string;
    employeeId?: string;
    trialStatus?: string;
    productId?: string;
    search?: string;
  };

  pagination: ReportPagination;

  data: TrialReportRow[];
}