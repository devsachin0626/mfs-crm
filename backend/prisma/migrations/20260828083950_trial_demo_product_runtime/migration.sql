-- DropForeignKey
ALTER TABLE "trials" DROP CONSTRAINT "trials_productId_fkey";

-- AlterTable
ALTER TABLE "trials" ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
