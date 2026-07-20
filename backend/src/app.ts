import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import path from "path";
import leadRoutes from "./routes/lead.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import clientRoutes from "./routes/client.routes";
import productRoutes from "./routes/product.routes";



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/leads", leadRoutes);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MFS CRM Backend Running Successfully 🚀",
  });
});

export default app;