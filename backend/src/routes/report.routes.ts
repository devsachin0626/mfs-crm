import {
  Router,
} from "express";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";
import {
  downloadLeadReportController,
  getClientReportController,
  getClientReportExportDataController,
  getLeadReportController,
  getReportFilterOptionsController,
  getTrialReportController,
getTrialReportExportDataController,
downloadTrialReportController,
} from "../controllers/report/report.controller";





const router =
  Router();

/* ============================
   ADMIN ONLY
============================ */

router.use(
  authenticate
);

router.use(
  authorize(
    "ADMIN"
  )
);

/* ============================
   FILTER OPTIONS
============================ */

router.get(
  "/filters",
  getReportFilterOptionsController
);

/* ============================
   LEAD REPORT
============================ */

router.get(
  "/leads",
  getLeadReportController
);


/* ============================
   LEAD EXCEL EXPORT
============================ */

router.get(
  "/leads/export",
  downloadLeadReportController
);


/* ============================
   CLIENT REPORT
============================ */

router.get(
  "/clients",
  getClientReportController
);

/* ============================
   CLIENT EXPORT DATA
   Excel route next step
============================ */

router.get(
  "/clients/export-data",
  getClientReportExportDataController
);

router.get(
  "/clients/export",
  downloadLeadReportController
);

/* ============================
   TRIAL / DEMO REPORT
============================ */

router.get(
  "/trials",
  getTrialReportController
);

/* ============================
   TRIAL EXPORT DATA
============================ */

router.get(
  "/trials/export-data",
  getTrialReportExportDataController
);

/* ============================
   TRIAL EXCEL EXPORT
============================ */

router.get(
  "/trials/export",
  downloadTrialReportController
);

export default router;