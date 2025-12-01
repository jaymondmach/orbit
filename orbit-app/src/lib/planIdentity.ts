// src/lib/planIdentity.ts

export type PlanIdentity = {
  emoji: string;
  tone:
    | "fitness"
    | "money"
    | "career"
    | "skills"
    | "study"
    | "lifestyle"
    | "default";
  badgeClass: string; // background for the big badge
};

export function getPlanIdentity(
  goalInput: string,
  intensity: string
): PlanIdentity {
  const g = goalInput.toLowerCase();

  // Fitness / health
  if (g.match(/gym|workout|weight|muscle|fitness|health|run|running|cardio/)) {
    return {
      emoji: "🏋️",
      tone: "fitness",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#34d399,#059669_60%,#022c22)]",
    };
  }

  // Money / savings / investing
  if (g.match(/money|save|savings|debt|budget|invest|investment|tfsa|rrsp/)) {
    return {
      emoji: "💰",
      tone: "money",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#facc15,#eab308_60%,#451a03)]",
    };
  }

  // Career / job
  if (g.match(/job|career|promotion|interview|resume|network/)) {
    return {
      emoji: "💼",
      tone: "career",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#38bdf8,#0ea5e9_60%,#022c44)]",
    };
  }

  // Coding / skills / projects
  if (
    g.match(
      /code|coding|programming|next\.js|react|saas|app|project|developer|dev/
    )
  ) {
    return {
      emoji: "💻",
      tone: "skills",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#a855f7,#6366f1_60%,#020617)]",
    };
  }

  // Study / school
  if (g.match(/school|study|exam|finals|assignment|grade|university|college/)) {
    return {
      emoji: "📚",
      tone: "study",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#f97316,#fb923c_60%,#3b0a0a)]",
    };
  }

  // Lifestyle / routine / sleep / habits
  if (g.match(/sleep|routine|habit|habits|productivity|focus|burnout/)) {
    return {
      emoji: "🌙",
      tone: "lifestyle",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#4f46e5,#22d3ee_60%,#020617)]",
    };
  }

  // Default
  return {
    emoji: "🎯",
    tone: "default",
    badgeClass:
      "bg-[radial-gradient(circle_at_top,#ff6cab,#7366ff_60%,#050308)]",
  };
}
