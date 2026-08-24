-- AlterTable
ALTER TABLE "payrolls" ADD COLUMN     "actualLateCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "allowedEarlyGoingCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "allowedLateCount" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "earlyGoingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "excessLateCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lateDeduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paidLeaveDays" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3),
ADD COLUMN     "scheduledWorkingDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unpaidLeaveDays" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "employee_leave_balances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "openingBalance" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "creditedLeave" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "usedPaidLeave" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "closingBalance" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_leave_balances_employeeId_idx" ON "employee_leave_balances"("employeeId");

-- CreateIndex
CREATE INDEX "employee_leave_balances_month_year_idx" ON "employee_leave_balances"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "employee_leave_balances_employeeId_month_year_key" ON "employee_leave_balances"("employeeId", "month", "year");

-- AddForeignKey
ALTER TABLE "employee_leave_balances" ADD CONSTRAINT "employee_leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
