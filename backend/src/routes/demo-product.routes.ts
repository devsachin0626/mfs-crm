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
  createDemoProductController,
  deleteDemoProductController,
  getActiveDemoProductsController,
  getDemoProductByIdController,
  getDemoProductsController,
  toggleDemoProductController,
  updateDemoProductController,
} from "../controllers/demo-product/demo-product.controller";

const router =
  Router();

/* ============================
   AUTHENTICATION
============================ */

router.use(
  authenticate
);

/* ============================
   GET ACTIVE DEMO PRODUCTS

   Used by Trial Create/Edit
   dropdown.

   Logged-in users can access.
============================ */

router.get(
  "/active",
  getActiveDemoProductsController
);

/* ============================
   ADMIN ONLY ROUTES
============================ */

router.get(
  "/",
  authorize("ADMIN"),
  getDemoProductsController
);

/* ============================
   CREATE
============================ */

router.post(
  "/",
  authorize("ADMIN"),
  createDemoProductController
);

/* ============================
   GET BY ID
============================ */

router.get(
  "/:id",
  authorize("ADMIN"),
  getDemoProductByIdController
);

/* ============================
   UPDATE
============================ */

router.put(
  "/:id",
  authorize("ADMIN"),
  updateDemoProductController
);

/* ============================
   TOGGLE ACTIVE / INACTIVE
============================ */

router.patch(
  "/:id/toggle",
  authorize("ADMIN"),
  toggleDemoProductController
);

/* ============================
   DELETE
============================ */

router.delete(
  "/:id",
  authorize("ADMIN"),
  deleteDemoProductController
);

export default router;