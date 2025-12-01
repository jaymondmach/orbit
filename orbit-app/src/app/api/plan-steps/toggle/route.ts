// src/app/api/plan-steps/toggle/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";

export async function POST(req: Request) {
  try {
    const { dbUser } = await getOrCreateCurrentUser();
    const body = await req.json();

    const planId = body.planId as string | undefined;
    const stepIndex = body.stepIndex as number | undefined;
    const completed = body.completed as boolean | undefined;

    if (!planId || typeof stepIndex !== "number") {
      return NextResponse.json(
        { error: "Missing planId or stepIndex" },
        { status: 400 }
      );
    }

    // Make sure the plan belongs to this user
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId: dbUser.id },
      select: { id: true },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found for this user" },
        { status: 404 }
      );
    }

    if (completed) {
      // mark as completed (upsert)
      await prisma.planStepProgress.upsert({
        where: {
          planId_stepIndex: {
            planId,
            stepIndex,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          planId,
          stepIndex,
          completedAt: new Date(),
        },
      });
    } else {
      // uncheck: set completedAt null (or delete row, your call)
      await prisma.planStepProgress.updateMany({
        where: {
          planId,
          stepIndex,
        },
        data: {
          completedAt: null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error toggling step progress", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
