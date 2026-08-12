"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const import_batch_controller_1 = require("../controllers/import-batch/import-batch.controller");
const router = (0, express_1.Router)();
// Create Import Batch
router.post("/", import_batch_controller_1.createImportBatchController);
// Get All Import Batches
router.get("/", import_batch_controller_1.getImportBatchesController);
// Get Import Batch By ID
router.get("/:id", import_batch_controller_1.getImportBatchByIdController);
// Update Import Batch
router.put("/:id", import_batch_controller_1.updateImportBatchController);
// Delete Import Batch
router.delete("/:id", import_batch_controller_1.deleteImportBatchController);
exports.default = router;
