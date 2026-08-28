-- AlterTable
ALTER TABLE "trials" ADD COLUMN     "demoProductId" TEXT;

-- CreateTable
CREATE TABLE "demo_products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demo_products_code_key" ON "demo_products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "demo_products_name_key" ON "demo_products"("name");

-- CreateIndex
CREATE INDEX "trials_demoProductId_idx" ON "trials"("demoProductId");

-- AddForeignKey
ALTER TABLE "trials" ADD CONSTRAINT "trials_demoProductId_fkey" FOREIGN KEY ("demoProductId") REFERENCES "demo_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
