import prisma from "../../config/prisma";

import type {
  ImportLeadsRequest,
  PreviewLeadImportRequest,
} from "../../types/leadImport.types";

/* ============================
   NORMALIZE MOBILE
============================ */

const normalizeMobile = (
  value: string
) => {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
};

/* ============================
   PREVIEW IMPORT
============================ */

export const previewLeadImport = async (
  data: PreviewLeadImportRequest
) => {
  const rows = data.rows || [];

  if (!rows.length) {
    throw new Error(
      "No rows found for import"
    );
  }

  const normalizedRows =
    rows.map((row, index) => {
      const mobile =
        normalizeMobile(
          row.mobile
        );

      const errors: string[] =
        [];

      if (!mobile) {
        errors.push(
          "Mobile is required"
        );
      }

      if (
        mobile &&
        mobile.length !== 10
      ) {
        errors.push(
          "Mobile must contain 10 digits"
        );
      }

      return {
        rowNumber:
          index + 1,

        ...row,

        mobile,

        errors,
      };
    });

  /* ============================
     DUPLICATES INSIDE FILE
  ============================ */

  const mobileCount =
    new Map<
      string,
      number
    >();

  normalizedRows.forEach(
    (row) => {
      if (!row.mobile) return;

      mobileCount.set(
        row.mobile,
        (mobileCount.get(
          row.mobile
        ) || 0) + 1
      );
    }
  );

  /* ============================
     DATABASE DUPLICATES
  ============================ */

  const mobiles =
    normalizedRows
      .map(
        (row) =>
          row.mobile
      )
      .filter(Boolean);

  const existingLeads =
    await prisma.lead.findMany({
      where: {
        mobile: {
          in: mobiles,
        },
      },

      select: {
        id: true,
        leadCode: true,
        mobile: true,
        name: true,
      },
    });

  const existingMap =
    new Map(
      existingLeads.map(
        (lead) => [
          normalizeMobile(
            lead.mobile
          ),
          lead,
        ]
      )
    );

  const previewRows =
    normalizedRows.map(
      (row) => {
        const fileDuplicate =
          row.mobile
            ? (mobileCount.get(
                row.mobile
              ) || 0) > 1
            : false;

        const existingLead =
          row.mobile
            ? existingMap.get(
                row.mobile
              )
            : undefined;

        const databaseDuplicate =
          Boolean(existingLead);

        const isValid =
          row.errors.length ===
            0 &&
          !fileDuplicate &&
          !databaseDuplicate;

        return {
          ...row,

          fileDuplicate,

          databaseDuplicate,

          duplicateLead:
            existingLead ||
            null,

          isValid,
        };
      }
    );

  const validRows =
    previewRows.filter(
      (row) =>
        row.isValid
    ).length;

  const invalidRows =
    previewRows.filter(
      (row) =>
        row.errors.length > 0
    ).length;

  const duplicates =
    previewRows.filter(
      (row) =>
        row.fileDuplicate ||
        row.databaseDuplicate
    ).length;

  return {
    success: true,

    summary: {
      total:
        previewRows.length,

      valid:
        validRows,

      invalid:
        invalidRows,

      duplicates,
    },

    rows:
      previewRows,
  };
};

/* ============================
   IMPORT LEADS
============================ */

export const importLeads = async (
  data: ImportLeadsRequest,
  importedById: string
) => {
  if (!data.rows?.length) {
    throw new Error(
      "No rows found for import"
    );
  }

  const importer =
    await prisma.employee.findUnique({
      where: {
        id: importedById,
      },

      select: {
        id: true,
      },
    });

  if (!importer) {
    throw new Error(
      "Importing Employee Not Found"
    );
  }

  if (
    data.assignedEmployeeId
  ) {
    const employee =
      await prisma.employee.findUnique({
        where: {
          id:
            data.assignedEmployeeId,
        },

        select: {
          id: true,
          isActive: true,
        },
      });

    if (!employee) {
      throw new Error(
        "Assigned Employee Not Found"
      );
    }

    if (
      !employee.isActive
    ) {
      throw new Error(
        "Cannot assign imported leads to inactive employee"
      );
    }
  }

  let defaultStatus =
    await prisma.leadStatus.findFirst({
      where: {
        isActive: true,
      },

      orderBy: {
        sortOrder: "asc",
      },
    });

  if (!defaultStatus) {
    throw new Error(
      "No active Lead Status found"
    );
  }

  const preview =
    await previewLeadImport({
      rows: data.rows,
    });

  const validRows =
    preview.rows.filter(
      (row) =>
        row.isValid
    );

  const duplicateCount =
    preview.rows.filter(
      (row) =>
        row.fileDuplicate ||
        row.databaseDuplicate
    ).length;

  const failedCount =
    preview.rows.filter(
      (row) =>
        row.errors.length > 0
    ).length;

  if (
    validRows.length === 0
  ) {
    throw new Error(
      "No valid leads available for import"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const batch =
          await tx.importBatch.create({
            data: {
              fileName:
                data.fileName,

              totalRecords:
                data.rows.length,

              imported:
                validRows.length,

              duplicates:
                duplicateCount,

              failed:
                failedCount,

              importedById,
            },
          });

        const lastLead =
          await tx.lead.findFirst({
            orderBy: {
              createdAt: "desc",
            },

            select: {
              leadCode: true,
            },
          });

        let counter = 1;

        if (
          lastLead?.leadCode
        ) {
          const match =
            lastLead.leadCode.match(
              /(\d+)$/
            );

          if (match) {
            counter =
              Number(match[1]) +
              1;
          }
        }

        for (
          const row of
          validRows
        ) {
          const leadCode =
            `LD${String(
              counter
            ).padStart(
              6,
              "0"
            )}`;

          counter++;

          await tx.lead.create({
            data: {
              leadCode,

              name:
                row.name ||
                null,

              mobile:
                row.mobile,

              email:
                row.email ||
                null,

              city:
                row.city ||
                null,

              state:
                row.state ||
                null,

              address:
                row.address ||
                null,

              sourceId:
                row.sourceId ||
                data.sourceId ||
                null,

              statusId:
                defaultStatus.id,

              assignedEmployeeId:
                data.assignedEmployeeId ||
                null,

              importBatchId:
                batch.id,

              stage: "NEW",

              isDuplicate:
                false,

              remarks:
                row.remarks ||
                null,
            },
          });
        }

        return batch;
      }
    );

  return {
    success: true,

    message:
      `${validRows.length} leads imported successfully`,

    batch:
      result,

    summary: {
      total:
        data.rows.length,

      imported:
        validRows.length,

      duplicates:
        duplicateCount,

      failed:
        failedCount,
    },
  };
};

/* ============================
   GET IMPORT BATCHES
============================ */

export const getImportBatches =
  async () => {
    const batches =
      await prisma.importBatch.findMany({
        include: {
          importedBy: {
            select: {
              id: true,
              employeeCode: true,
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 50,
      });

    return {
      success: true,
      batches,
    };
  };