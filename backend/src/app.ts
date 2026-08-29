import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import leadRoutes from "./routes/lead.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import clientRoutes from "./routes/client.routes";
import productRoutes from "./routes/product.routes";
import trialRoutes from "./routes/trial.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import serviceRoutes from "./routes/service.routes";
import attendanceRoutes from "./routes/attendance.routes";
import targetRoutes from "./routes/target.routes";
import leaveRoutes from "./routes/leave.routes";
import payrollRoutes from "./routes/payroll.routes";
import holidayRoutes from "./routes/holiday.routes";
import notificationRoutes from "./routes/notification.routes";
import leadSourceRoutes from "./routes/lead-source.routes";
import leadStatusRoutes from "./routes/lead-status.routes";
import importBatchRoutes from "./routes/import-batch.routes";
import leadAssignmentHistoryRoutes from "./routes/lead-assignment-history.routes";
import leadHistoryRoutes from "./routes/lead-history.routes";
import followUpRoutes from "./routes/follow-up.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import branchRoutes from "./routes/branch.routes";
import roleRoutes from "./routes/role.routes";
import reportRoutes from "./routes/report.routes";
import settingsRoutes from "./routes/settings.routes";
import demoProductRoutes from "./routes/demo-product.routes";
import { allowedCorsOrigins, requestBodyLimit } from "./config/env";
import { uploadsDirectory } from "./config/paths";



















const app = express();

// Middleware
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedCorsOrigins().includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed by CORS policy") as Error & {
        statusCode: number;
      };
      error.statusCode = 403;
      callback(error);
    },
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT_PER_MINUTE || 600),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again shortly." },
  })
);
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));
app.use("/uploads", express.static(uploadsDirectory, { index: false, fallthrough: false }));
app.use("/api/leads", leadRoutes);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);
app.use("/api/trials", trialRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/lead-sources", leadSourceRoutes);
app.use("/api/lead-statuses", leadStatusRoutes);
app.use("/api/import-batches", importBatchRoutes);
app.use(
  "/api/demo-products",
  demoProductRoutes
);

app.use(
  "/api/lead-assignment-history",
  leadAssignmentHistoryRoutes
);
app.use("/api/lead-history", leadHistoryRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use(
  "/api/branches",
  branchRoutes
);

app.use(
  "/api/roles",
  roleRoutes
);
app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);





// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MFS CRM Backend Running Successfully 🚀",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

export default app;
