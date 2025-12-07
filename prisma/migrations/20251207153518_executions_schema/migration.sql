/*
  Warnings:

  - The values [COMPLETED] on the enum `ExecutionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `inngestId` on the `execution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inngestEventId]` on the table `execution` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inngestEventId` to the `execution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExecutionStatus_new" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');
ALTER TABLE "public"."execution" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "execution" ALTER COLUMN "status" TYPE "ExecutionStatus_new" USING ("status"::text::"ExecutionStatus_new");
ALTER TYPE "ExecutionStatus" RENAME TO "ExecutionStatus_old";
ALTER TYPE "ExecutionStatus_new" RENAME TO "ExecutionStatus";
DROP TYPE "public"."ExecutionStatus_old";
ALTER TABLE "execution" ALTER COLUMN "status" SET DEFAULT 'RUNNING';
COMMIT;

-- DropIndex
DROP INDEX "execution_inngestId_key";

-- AlterTable
ALTER TABLE "execution" DROP COLUMN "inngestId",
ADD COLUMN     "inngestEventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "execution_inngestEventId_key" ON "execution"("inngestEventId");
