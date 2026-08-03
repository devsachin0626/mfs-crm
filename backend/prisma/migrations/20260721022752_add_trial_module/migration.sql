-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "trials" (
    "id" TEXT NOT NULL,
    "trialCode" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "employeeId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "extensionCount" INTEGER NOT NULL DEFAULT 0,
    "status" "TrialStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trials_trialCode_key" ON "trials"("trialCode");

-- CreateIndex
CREATE INDEX "trials_clientId_idx" ON "trials"("clientId");

-- CreateIndex
CREATE INDEX "trials_productId_idx" ON "trials"("productId");

-- CreateIndex
CREATE INDEX "trials_employeeId_idx" ON "trials"("employeeId");

-- CreateIndex
CREATE INDEX "trials_status_idx" ON "trials"("status");

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
