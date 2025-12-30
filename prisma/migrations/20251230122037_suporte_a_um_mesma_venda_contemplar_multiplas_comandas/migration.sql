/*
  Warnings:

  - You are about to drop the column `cameFromBill` on the `sale_products` table. All the data in the column will be lost.
  - You are about to drop the column `origin_bill_id` on the `sales` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_origin_bill_id_fkey";

-- DropIndex
DROP INDEX "sales_origin_bill_id_key";

-- AlterTable
ALTER TABLE "sale_products" DROP COLUMN "cameFromBill",
ADD COLUMN     "origin_bill_id" TEXT;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "origin_bill_id";

-- AddForeignKey
ALTER TABLE "sale_products" ADD CONSTRAINT "sale_products_origin_bill_id_fkey" FOREIGN KEY ("origin_bill_id") REFERENCES "bills"("bill_id") ON DELETE SET NULL ON UPDATE CASCADE;
