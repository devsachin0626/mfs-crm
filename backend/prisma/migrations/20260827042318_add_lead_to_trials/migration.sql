-- DropForeignKey
ALTER TABLE "trials" DROP CONSTRAINT "trials_clientId_fkey";

-- AlterTable
ALTER TABLE "trials" ADD COLUMN     "leadId" TEXT,
ALTER COLUMN "clientId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "trials_leadId_idx" ON "trials"("leadId");

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
