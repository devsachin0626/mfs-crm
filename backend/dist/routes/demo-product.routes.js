"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const demo_product_controller_1 = require("../controllers/demo-product/demo-product.controller");
const router = (0, express_1.Router)();
/* ============================
   AUTHENTICATION
============================ */
router.use(auth_middleware_1.authenticate);
/* ============================
   GET ACTIVE DEMO PRODUCTS

   Used by Trial Create/Edit
   dropdown.

   Logged-in users can access.
============================ */
router.get("/active", demo_product_controller_1.getActiveDemoProductsController);
/* ============================
   ADMIN ONLY ROUTES
============================ */
router.get("/", (0, role_middleware_1.authorize)("ADMIN"), demo_product_controller_1.getDemoProductsController);
/* ============================
   CREATE
============================ */
router.post("/", (0, role_middleware_1.authorize)("ADMIN"), demo_product_controller_1.createDemoProductController);
/* ============================
   GET BY ID
============================ */
router.get("/:id", (0, role_middleware_1.authorize)("ADMIN"), demo_product_controller_1.getDemoProductByIdController);
/* ============================
   UPDATE
============================ */
router.put("/:id", (0, role_middleware_1.authorize)("ADMIN"), demo_product_controller_1.updateDemoProductController);
/* ============================
   TOGGLE ACTIVE / INACTIVE
============================ */
router.patch("/:id/toggle", (0, role_middleware_1.authorize)("ADMIN"), demo_product_controller_1.toggleDemoProductController);
/* ============================
   DELETE
============================ */
router.delete("/:id", (0, role_middleware_1.authorize)("ADMIN"), demo_product_controller_1.deleteDemoProductController);
exports.default = router;
