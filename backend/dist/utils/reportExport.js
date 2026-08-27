"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrialExcelReport = exports.createClientExcelReport = exports.createLeadExcelReport = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
/* ============================
   DATE FORMAT
============================ */
const formatDate = (value) => {
    if (!value) {
        return "";
    }
    return value.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
/* ============================
   LEAD EXCEL EXPORT
============================ */
const createLeadExcelReport = async ({ data, filters = {}, }) => {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator =
        "MFS CRM";
    workbook.created =
        new Date();
    const worksheet = workbook.addWorksheet("Lead Report");
    /* ============================
       TITLE
    ============================ */
    worksheet.mergeCells("A1:Q1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value =
        "MFS CRM - LEAD REPORT";
    titleCell.font = {
        bold: true,
        size: 18,
    };
    titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    worksheet.getRow(1).height = 30;
    /* ============================
       REPORT INFORMATION
    ============================ */
    worksheet.mergeCells("A2:Q2");
    worksheet.getCell("A2").value =
        `Generated On: ${formatDate(new Date())}`;
    worksheet.getCell("A2").alignment = {
        horizontal: "center",
    };
    worksheet.mergeCells("A3:Q3");
    worksheet.getCell("A3").value =
        `Total Records: ${data.length}`;
    worksheet.getCell("A3").font = {
        bold: true,
    };
    worksheet.getCell("A3").alignment = {
        horizontal: "center",
    };
    /* ============================
       FILTER INFORMATION
    ============================ */
    const filterParts = [];
    if (filters.fromDate ||
        filters.toDate) {
        filterParts.push(`Date: ${filters.fromDate ||
            "Beginning"} to ${filters.toDate ||
            "Today"}`);
    }
    if (filters.employeeName) {
        filterParts.push(`Employee: ${filters.employeeName}`);
    }
    if (filters.statusName) {
        filterParts.push(`Status: ${filters.statusName}`);
    }
    if (filters.stage) {
        filterParts.push(`Stage: ${filters.stage}`);
    }
    if (filters.sourceName) {
        filterParts.push(`Source: ${filters.sourceName}`);
    }
    if (filters.search) {
        filterParts.push(`Search: ${filters.search}`);
    }
    worksheet.mergeCells("A4:Q4");
    worksheet.getCell("A4").value =
        filterParts.length > 0
            ? filterParts.join(" | ")
            : "Filters: All Leads";
    worksheet.getCell("A4").alignment = {
        horizontal: "center",
    };
    /* ============================
       EMPTY ROW
    ============================ */
    worksheet.addRow([]);
    /* ============================
       TABLE HEADER
    ============================ */
    const headerRow = worksheet.addRow([
        "S.No.",
        "Lead Code",
        "Name",
        "Mobile",
        "Email",
        "Status",
        "Stage",
        "Source",
        "Employee Code",
        "Assigned Employee",
        "City",
        "State",
        "Address",
        "Converted",
        "Last Call",
        "Next Follow-up",
        "Created At",
        "Remarks",
    ]);
    headerRow.font = {
        bold: true,
    };
    headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
    };
    headerRow.height =
        24;
    /* ============================
       DATA
    ============================ */
    data.forEach((lead, index) => {
        worksheet.addRow([
            index + 1,
            lead.leadCode,
            lead.name ||
                "",
            lead.mobile,
            lead.email ||
                "",
            lead.status
                ?.name ||
                "",
            lead.stage,
            lead.source
                ?.name ||
                "",
            lead
                .assignedEmployee
                ?.employeeCode ||
                "",
            lead
                .assignedEmployee
                ?.name ||
                "",
            lead.city ||
                "",
            lead.state ||
                "",
            lead.address ||
                "",
            lead.isConverted
                ? "Yes"
                : "No",
            formatDate(lead.lastCallAt),
            formatDate(lead.nextFollowUp),
            formatDate(lead.createdAt),
            lead.remarks ||
                "",
        ]);
    });
    /* ============================
       COLUMN WIDTHS
    ============================ */
    const widths = [
        8,
        16,
        24,
        16,
        28,
        20,
        18,
        20,
        18,
        24,
        18,
        18,
        35,
        12,
        22,
        22,
        22,
        40,
    ];
    worksheet.columns.forEach((column, index) => {
        column.width =
            widths[index] ||
                18;
    });
    /* ============================
       FREEZE HEADER
    ============================ */
    worksheet.views = [
        {
            state: "frozen",
            ySplit: 6,
        },
    ];
    /* ============================
       AUTO FILTER
    ============================ */
    if (data.length > 0) {
        worksheet.autoFilter = {
            from: {
                row: 6,
                column: 1,
            },
            to: {
                row: 6,
                column: 18,
            },
        };
    }
    /* ============================
       ROW ALIGNMENT
    ============================ */
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 6) {
            row.alignment = {
                vertical: "top",
            };
        }
    });
    /* ============================
       BUFFER
    ============================ */
    const buffer = await workbook.xlsx
        .writeBuffer();
    return buffer;
};
exports.createLeadExcelReport = createLeadExcelReport;
/* ============================
   CLIENT EXCEL EXPORT
============================ */
const createClientExcelReport = async ({ data, filters = {}, }) => {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator =
        "MFS CRM";
    workbook.created =
        new Date();
    const worksheet = workbook.addWorksheet("Client Report");
    /* ============================
       TITLE
    ============================ */
    worksheet.mergeCells("A1:O1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value =
        "MFS CRM - CLIENT REPORT";
    titleCell.font = {
        bold: true,
        size: 18,
    };
    titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    worksheet.getRow(1).height = 30;
    /* ============================
       GENERATED DATE
    ============================ */
    worksheet.mergeCells("A2:O2");
    worksheet.getCell("A2").value =
        `Generated On: ${formatDate(new Date())}`;
    worksheet.getCell("A2").alignment = {
        horizontal: "center",
    };
    /* ============================
       TOTAL RECORDS
    ============================ */
    worksheet.mergeCells("A3:O3");
    worksheet.getCell("A3").value =
        `Total Records: ${data.length}`;
    worksheet.getCell("A3").font = {
        bold: true,
    };
    worksheet.getCell("A3").alignment = {
        horizontal: "center",
    };
    /* ============================
       FILTERS
    ============================ */
    const filterParts = [];
    if (filters.fromDate ||
        filters.toDate) {
        filterParts.push(`Date: ${filters.fromDate ||
            "Beginning"} to ${filters.toDate ||
            "Today"}`);
    }
    if (filters.employeeName) {
        filterParts.push(`Employee: ${filters.employeeName}`);
    }
    if (filters.status) {
        filterParts.push(`Status: ${filters.status}`);
    }
    if (filters.search) {
        filterParts.push(`Search: ${filters.search}`);
    }
    worksheet.mergeCells("A4:O4");
    worksheet.getCell("A4").value =
        filterParts.length > 0
            ? filterParts.join(" | ")
            : "Filters: All Clients";
    worksheet.getCell("A4").alignment = {
        horizontal: "center",
    };
    /* ============================
       EMPTY ROW
    ============================ */
    worksheet.addRow([]);
    /* ============================
       HEADER
    ============================ */
    const headerRow = worksheet.addRow([
        "S.No.",
        "Client Code",
        "Name",
        "Mobile",
        "Email",
        "Status",
        "Source Lead",
        "Employee Code",
        "Employee",
        "City",
        "State",
        "Address",
        "Orders",
        "Trials",
        "Services",
        "Created At",
    ]);
    headerRow.font = {
        bold: true,
    };
    headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    headerRow.height =
        24;
    /* ============================
       DATA
    ============================ */
    data.forEach((client, index) => {
        worksheet.addRow([
            index + 1,
            client.clientCode,
            client.name,
            client.mobile,
            client.email ||
                "",
            client.isActive
                ? "ACTIVE"
                : "INACTIVE",
            client.lead
                ?.leadCode ||
                "",
            client.lead
                ?.assignedEmployee
                ?.employeeCode ||
                "",
            client.lead
                ?.assignedEmployee
                ?.name ||
                "",
            client.city ||
                "",
            client.state ||
                "",
            client.address ||
                "",
            client._count
                ?.orders ||
                0,
            client._count
                ?.trials ||
                0,
            client._count
                ?.services ||
                0,
            formatDate(client.createdAt),
        ]);
    });
    /* ============================
       WIDTHS
    ============================ */
    const widths = [
        8,
        16,
        24,
        16,
        28,
        14,
        16,
        18,
        24,
        18,
        18,
        35,
        10,
        10,
        10,
        22,
    ];
    worksheet.columns.forEach((column, index) => {
        column.width =
            widths[index] ||
                18;
    });
    /* ============================
       FREEZE HEADER
    ============================ */
    worksheet.views = [
        {
            state: "frozen",
            ySplit: 6,
        },
    ];
    /* ============================
       AUTO FILTER
    ============================ */
    if (data.length > 0) {
        worksheet.autoFilter = {
            from: {
                row: 6,
                column: 1,
            },
            to: {
                row: 6,
                column: 16,
            },
        };
    }
    /* ============================
       BUFFER
    ============================ */
    const buffer = await workbook.xlsx
        .writeBuffer();
    return buffer;
};
exports.createClientExcelReport = createClientExcelReport;
/* ============================
   TRIAL EXCEL EXPORT
============================ */
const createTrialExcelReport = async ({ data, filters = {}, }) => {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator =
        "MFS CRM";
    workbook.created =
        new Date();
    const worksheet = workbook.addWorksheet("Trial Report");
    worksheet.mergeCells("A1:O1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value =
        "MFS CRM - TRIAL / DEMO REPORT";
    titleCell.font = {
        bold: true,
        size: 18,
    };
    titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    worksheet.getRow(1).height = 30;
    worksheet.mergeCells("A2:O2");
    worksheet.getCell("A2").value =
        `Generated On: ${formatDate(new Date())}`;
    worksheet.getCell("A2").alignment = {
        horizontal: "center",
    };
    worksheet.mergeCells("A3:O3");
    worksheet.getCell("A3").value =
        `Total Records: ${data.length}`;
    worksheet.getCell("A3").font = {
        bold: true,
    };
    worksheet.getCell("A3").alignment = {
        horizontal: "center",
    };
    const filterParts = [];
    if (filters.fromDate ||
        filters.toDate) {
        filterParts.push(`Date: ${filters.fromDate ||
            "Beginning"} to ${filters.toDate ||
            "Today"}`);
    }
    if (filters.employeeName) {
        filterParts.push(`Employee: ${filters.employeeName}`);
    }
    if (filters.trialStatus) {
        filterParts.push(`Status: ${filters.trialStatus}`);
    }
    if (filters.productName) {
        filterParts.push(`Product: ${filters.productName}`);
    }
    if (filters.search) {
        filterParts.push(`Search: ${filters.search}`);
    }
    worksheet.mergeCells("A4:O4");
    worksheet.getCell("A4").value =
        filterParts.length > 0
            ? filterParts.join(" | ")
            : "Filters: All Trials";
    worksheet.getCell("A4").alignment = {
        horizontal: "center",
    };
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
        "S.No.",
        "Trial Code",
        "Subject Type",
        "Lead / Client Code",
        "Name",
        "Mobile",
        "Product Code",
        "Product",
        "Employee Code",
        "Employee",
        "Start Date",
        "End Date",
        "Trial Days",
        "Extensions",
        "Status",
        "Remarks",
    ]);
    headerRow.font = {
        bold: true,
    };
    headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    headerRow.height =
        24;
    data.forEach((trial, index) => {
        const subjectType = trial.lead
            ? "LEAD"
            : trial.client
                ? "CLIENT"
                : "";
        const subjectCode = trial.lead
            ?.leadCode ||
            trial.client
                ?.clientCode ||
            "";
        const subjectName = trial.lead
            ?.name ||
            trial.client
                ?.name ||
            "";
        const subjectMobile = trial.lead
            ?.mobile ||
            trial.client
                ?.mobile ||
            "";
        worksheet.addRow([
            index + 1,
            trial.trialCode,
            subjectType,
            subjectCode,
            subjectName,
            subjectMobile,
            trial.product
                .productCode,
            trial.product
                .name,
            trial.employee
                ?.employeeCode ||
                "",
            trial.employee
                ?.name ||
                "",
            formatDate(trial.startDate),
            formatDate(trial.endDate),
            trial.trialDays,
            trial.extensionCount,
            trial.status,
            trial.remarks ||
                "",
        ]);
    });
    const widths = [
        8,
        16,
        14,
        18,
        24,
        16,
        18,
        24,
        18,
        24,
        22,
        22,
        12,
        12,
        16,
        40,
    ];
    worksheet.columns.forEach((column, index) => {
        column.width =
            widths[index] ||
                18;
    });
    worksheet.views = [
        {
            state: "frozen",
            ySplit: 6,
        },
    ];
    if (data.length > 0) {
        worksheet.autoFilter = {
            from: {
                row: 6,
                column: 1,
            },
            to: {
                row: 6,
                column: 16,
            },
        };
    }
    const buffer = await workbook.xlsx
        .writeBuffer();
    return buffer;
};
exports.createTrialExcelReport = createTrialExcelReport;
