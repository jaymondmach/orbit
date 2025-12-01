// src/app/api/plans/generate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  // This will show up in server logs if you forgot to set the key
  console.warn("⚠️ OPENAI_API_KEY is not set. /api/plans/generate will fail.");
}

type GeneratedPlan = {
  summary: string;
  milestones: {
    label: string;
    description: string;
    targetWeek: number;
  }[];
  weeklyRhythm: {
    week: number;
    focus: string;
    actions: string[];
  }[];
  startingSteps: string[];
  obstaclesAndSafeties: {
    obstacle: string;
    workaround: string;
  }[];
  notes: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const planId = body?.planId as string | undefined;
    if (!planId) {
      return NextResponse.json(
        { error: "Missing planId in request body." },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    // Mark as generating
    await prisma.plan.update({
      where: { id: planId },
      data: { status: "generating" },
    });

    const systemPrompt = `
You are Orbit, an AI planner that turns a person's goal into a realistic, kind, step-by-step plan.

User info:
- Goal: ${plan.goalInput}
- Timeframe (weeks): ${plan.timeframeWeeks}
- Intensity: ${plan.intensity} (gentle, steady, or intense)

Rules:
- Be realistic about time and energy.
- Plans should fit around work, school, and real life.
- Focus on clear actions, not vague advice.
- Use simple, direct language.
- Don't assume the user is perfect. Include gentleness, rest, and recovery.

You MUST respond with a single JSON object matching this TypeScript type:

type GeneratedPlan = {
  summary: string;
  milestones: {
    label: string;
    description: string;
    targetWeek: number;
  }[];
  weeklyRhythm: {
    week: number;
    focus: string;
    actions: string[];
  }[];
  startingSteps: string[];
  obstaclesAndSafeties: {
    obstacle: string;
    workaround: string;
  }[];
  notes: string;
};

No extra text. No markdown. Just valid JSON.
`;

    const userPrompt = `
Create a plan for this goal, timeframe, and intensity. Assume the person has limited time and normal life constraints.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("OpenAI error:", response.status, text);
      await prisma.plan.update({
        where: { id: planId },
        data: { status: "error" },
      });
      return NextResponse.json(
        { error: "Failed to generate plan from AI." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent =
      data.choices?.[0]?.message?.content ??
      data.choices?.[0]?.message?.content?.[0]?.text;

    if (!rawContent || typeof rawContent !== "string") {
      await prisma.plan.update({
        where: { id: planId },
        data: { status: "error" },
      });
      return NextResponse.json(
        { error: "AI response did not contain content." },
        { status: 500 }
      );
    }

    let parsed: GeneratedPlan;
    try {
      parsed = JSON.parse(rawContent) as GeneratedPlan;
    } catch (err) {
      console.error("Failed to parse AI JSON:", err, rawContent);
      await prisma.plan.update({
        where: { id: planId },
        data: { status: "error" },
      });
      return NextResponse.json(
        { error: "Failed to parse AI JSON." },
        { status: 500 }
      );
    }

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: {
        status: "ready",
        outputJson: parsed,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        planId: updated.id,
        status: updated.status,
        output: parsed,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error in /api/plans/generate:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
