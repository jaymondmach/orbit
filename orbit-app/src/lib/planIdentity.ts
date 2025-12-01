// src/lib/planIdentity.ts

export type PlanIdentity = {
  emoji: string;
  badgeClass: string;
};

export function getPlanIdentity(goalInput: string): PlanIdentity {
  const g = goalInput.toLowerCase();

  if (g.match(/gym|workout|weight|muscle|fitness|health|run|running|cardio/)) {
    return {
      emoji: "🏋️",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#34d399,#059669_60%,#022c22)]",
    };
  }

  if (g.match(/money|save|savings|debt|budget|invest|investment|tfsa|rrsp/)) {
    return {
      emoji: "💰",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#facc15,#eab308_60%,#451a03)]",
    };
  }

  if (g.match(/job|career|promotion|interview|resume|network/)) {
    return {
      emoji: "💼",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#38bdf8,#0ea5e9_60%,#022c44)]",
    };
  }

  if (
    g.match(
      /code|coding|programming|next\.js|react|saas|app|project|developer|dev/
    )
  ) {
    return {
      emoji: "💻",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#a855f7,#6366f1_60%,#020617)]",
    };
  }

  if (g.match(/school|study|exam|finals|assignment|grade|university|college/)) {
    return {
      emoji: "📚",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#f97316,#fb923c_60%,#3b0a0a)]",
    };
  }

  if (g.match(/sleep|routine|habit|habits|productivity|focus|burnout/)) {
    return {
      emoji: "🌙",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#4f46e5,#22d3ee_60%,#020617)]",
    };
  }

  return {
    emoji: "🎯",
    badgeClass:
      "bg-[radial-gradient(circle_at_top,#ff6cab,#7366ff_60%,#050308)]",
  };
}
