/*
  Warnings:

  - The values [OFFICE,HOME,OUTDOOR,SUCCULENT,TROPICAL] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('VAN_PHONG', 'TRONG_NHA', 'NGOAI_TROI', 'SEN_DA_XUONG_RONG', 'NHIET_DOI');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "Category_new" USING (
  CASE "category"::text
    WHEN 'OFFICE' THEN 'VAN_PHONG'::"Category_new"
    WHEN 'HOME' THEN 'TRONG_NHA'::"Category_new"
    WHEN 'OUTDOOR' THEN 'NGOAI_TROI'::"Category_new"
    WHEN 'SUCCULENT' THEN 'SEN_DA_XUONG_RONG'::"Category_new"
    WHEN 'TROPICAL' THEN 'NHIET_DOI'::"Category_new"
  END
);
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;
