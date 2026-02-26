-- CreateEnum
CREATE TYPE "statusUser" AS ENUM ('ACTIVE', 'DISABLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "statusUser" "statusUser" NOT NULL DEFAULT 'ACTIVE';
