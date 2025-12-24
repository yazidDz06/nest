-- DropForeignKey
ALTER TABLE "Film" DROP CONSTRAINT "Film_authorId_fkey";

-- AlterTable
ALTER TABLE "Film" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Film" ADD CONSTRAINT "Film_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
