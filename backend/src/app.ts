import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import path from "path";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MFS CRM Backend Running Successfully 🚀",
  });
});

export default app;