/*
  Warnings:

  - You are about to drop the column `clusterId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the `Cluster` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_clusterId_fkey";

-- DropIndex
DROP INDEX "Article_clusterId_idx";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "clusterId";

-- DropTable
DROP TABLE "Cluster";
