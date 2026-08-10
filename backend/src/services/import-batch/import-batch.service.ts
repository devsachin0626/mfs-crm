import prisma from "../../config/prisma";
import { CreateImportBatchRequest ,UpdateImportBatchRequest} from "../../types/import-batch.types";

export const createImportBatch = async (
  data: CreateImportBatchRequest
) => {
  // Check Employee exists
  const employee = await prisma.employee.findUnique({
    where: {
      id: data.importedById,
    },
  });

  if (!employee) {
    throw new Error("Employee Not Found");
  }

  // Create Import Batch
  const importBatch = await prisma.importBatch.create({
    data: {
      fileName: data.fileName,
      totalRecords: data.totalRecords,
      imported: data.imported ?? 0,
      duplicates: data.duplicates ?? 0,
      failed: data.failed ?? 0,
      importedById: data.importedById,
    },
  });

  return {
    success: true,
    message: "Import Batch Created Successfully",
    importBatch,
  };
};

export const getImportBatches = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: {
    fileName?: {
      contains: string;
      mode: "insensitive";
    };
  } = {};

  // Search by file name
  if (search) {
    where.fileName = {
      contains: search,
      mode: "insensitive",
    };
  }

  // Total count
  const total = await prisma.importBatch.count({
    where,
  });

  // Get Import Batches
  const importBatches = await prisma.importBatch.findMany({
    where,

    orderBy: {
      createdAt: "desc",
    },

    skip,
    take: limit,
  });

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    importBatches,
  };
};

export const getImportBatchById = async (id: string) => {
  const importBatch = await prisma.importBatch.findUnique({
    where: {
      id,
    },
  });

  if (!importBatch) {
    throw new Error("Import Batch Not Found");
  }

  return {
    success: true,
    importBatch,
  };
};


export const updateImportBatch = async (
  id: string,
  data: UpdateImportBatchRequest
) => {
  // Check Import Batch Exists
  const existingImportBatch = await prisma.importBatch.findUnique({
    where: {
      id,
    },
  });

  if (!existingImportBatch) {
    throw new Error("Import Batch Not Found");
  }

  // If importedById is being updated,
  // verify that Employee exists
  if (data.importedById !== undefined) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: data.importedById,
      },
    });

    if (!employee) {
      throw new Error("Employee Not Found");
    }
  }

  // Update Import Batch
  const importBatch = await prisma.importBatch.update({
    where: {
      id,
    },

    data: {
      ...(data.fileName !== undefined && {
        fileName: data.fileName,
      }),

      ...(data.totalRecords !== undefined && {
        totalRecords: data.totalRecords,
      }),

      ...(data.imported !== undefined && {
        imported: data.imported,
      }),

      ...(data.duplicates !== undefined && {
        duplicates: data.duplicates,
      }),

      ...(data.failed !== undefined && {
        failed: data.failed,
      }),

      ...(data.importedById !== undefined && {
        importedById: data.importedById,
      }),
    },
  });

  return {
    success: true,
    message: "Import Batch Updated Successfully",
    importBatch,
  };
};

export const deleteImportBatch = async (id: string) => {
  // Check Import Batch Exists
  const existingImportBatch = await prisma.importBatch.findUnique({
    where: {
      id,
    },
  });

  if (!existingImportBatch) {
    throw new Error("Import Batch Not Found");
  }

  // Delete Import Batch
  const importBatch = await prisma.importBatch.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Import Batch Deleted Successfully",
    importBatch,
  };
};