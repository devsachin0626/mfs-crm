import { Router } from "express";

import {
  createImportBatchController,
  getImportBatchesController,
  getImportBatchByIdController,
  updateImportBatchController,
  deleteImportBatchController,
} from "../controllers/import-batch/import-batch.controller";

const router = Router();

// Create Import Batch
router.post("/", createImportBatchController);

// Get All Import Batches
router.get("/", getImportBatchesController);

// Get Import Batch By ID
router.get("/:id", getImportBatchByIdController);

// Update Import Batch
router.put("/:id", updateImportBatchController);

// Delete Import Batch
router.delete("/:id", deleteImportBatchController);

export default router;