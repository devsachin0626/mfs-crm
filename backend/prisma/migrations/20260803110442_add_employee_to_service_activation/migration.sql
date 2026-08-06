/*
  Warnings:

  - Added the required column `employeeId` to the `service_activations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_activations" ADD COLUMN     "employeeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "service_activations_employeeId_idx" ON "service_activations"("employeeId");

-- AddForeignKey
ALTER TABLE "service_activations" ADD CONSTRAINT "service_activations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
