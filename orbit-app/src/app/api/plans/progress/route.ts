// src/app/api/plans/progress/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  planId: string;
  stepIndex: number;
  completed: boolean;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body | null;

    if (!body?.planId || typeof body.stepIndex !== "number") {
      return NextResponse.json(
        { error: "Missing planId or stepIndex." },
        { status: 400 }
      );
    }

    const { planId, stepIndex, completed } = body;

    // Optional: ensure plan exists (and later, belongs to current user)
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { id: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    if (completed) {
      // Mark as done (upsert so it's idempotent)
      await prisma.planStepProgress.upsert({
        where: { planId_stepIndex: { planId, stepIndex } },
        create: {
          planId,
          stepIndex,
          completedAt: new Date(),
        },
        update: {
          completedAt: new Date(),
        },
      });
    } else {
      // Clear completion (simplest: delete row)
      await prisma.planStepProgress.deleteMany({
        where: { planId, stepIndex },
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/plans/progress:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
