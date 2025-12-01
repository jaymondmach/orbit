-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "outputJson" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';
