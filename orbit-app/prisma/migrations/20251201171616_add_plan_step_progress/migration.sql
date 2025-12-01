-- CreateTable
CREATE TABLE "PlanStepProgress" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanStepProgress_planId_stepIndex_key" ON "PlanStepProgress"("planId", "stepIndex");

-- AddForeignKey
ALTER TABLE "PlanStepProgress" ADD CONSTRAINT "PlanStepProgress_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
