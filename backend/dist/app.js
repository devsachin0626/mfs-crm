"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const path_1 = __importDefault(require("path"));
const lead_routes_1 = __importDefault(require("./routes/lead.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const trial_routes_1 = __importDefault(require("./routes/trial.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const target_routes_1 = __importDefault(require("./routes/target.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const payroll_routes_1 = __importDefault(require("./routes/payroll.routes"));
const holiday_routes_1 = __importDefault(require("./routes/holiday.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const lead_source_routes_1 = __importDefault(require("./routes/lead-source.routes"));
const lead_status_routes_1 = __importDefault(require("./routes/lead-status.routes"));
const import_batch_routes_1 = __importDefault(require("./routes/import-batch.routes"));
const lead_assignment_history_routes_1 = __importDefault(require("./routes/lead-assignment-history.routes"));
const lead_history_routes_1 = __importDefault(require("./routes/lead-history.routes"));
const follow_up_routes_1 = __importDefault(require("./routes/follow-up.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api/leads", lead_routes_1.default);
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/employees", employee_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/clients", client_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/trials", trial_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/services", service_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/targets", target_routes_1.default);
app.use("/api/leaves", leave_routes_1.default);
app.use("/api/payroll", payroll_routes_1.default);
app.use("/api/holidays", holiday_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/lead-sources", lead_source_routes_1.default);
app.use("/api/lead-statuses", lead_status_routes_1.default);
app.use("/api/import-batches", import_batch_routes_1.default);
app.use("/api/lead-assignment-history", lead_assignment_history_routes_1.default);
app.use("/api/lead-history", lead_history_routes_1.default);
app.use("/api/follow-ups", follow_up_routes_1.default);
// Health Check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MFS CRM Backend Running Successfully 🚀",
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
