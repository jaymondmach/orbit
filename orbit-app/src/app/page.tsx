"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Home() {
  const year = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate]")
    );

    // Respect reduced motion settings
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Stagger by DOM order: top → bottom
    elements.forEach((el, index) => {
      el.style.transitionDelay = `${index * 80}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen text-orbit-text">
      {/* Top nav */}
      <header>
        <div
          className="orbit-container flex h-24 items-center justify-between"
          data-animate
        >
          {/* Logo only */}
          <div className="flex items-center">
            <Image
              src="/orbit-high-res-transparent.png"
              alt="Orbit"
              width={160}
              height={160}
              priority
              className="w-auto h-8 sm:h-10"
            />
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-10 text-md text-orbit-muted">
            <button
              onClick={() => scrollToSection("product")}
              className="hover:text-white transition"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection("use-cases")}
              className="hover:text-white transition"
            >
              Use cases
            </button>
            <button
              onClick={() => scrollToSection("roadmap")}
              className="hover:text-white transition"
            >
              Roadmap
            </button>
          </nav>

          {/* Right buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-sm text-orbit-muted hover:border-white/40 hover:text-white transition">
              Log in
            </button>
            <Link href="/app/plans">
              <button className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90 transition">
                Launch Orbit
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="orbit-container py-10 sm:py-14 lg:py-16 space-y-12">
        {/* Hero */}
        <section
          className="flex flex-col items-start gap-10 lg:flex-row lg:items-center"
          data-animate
        >
          {/* Left - copy */}
          <div className="flex-1 space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-orbit-border bg-black/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orbit-pink" />
              <span className="text-[11px] text-orbit-muted">
                From &quot;I want to...&quot; → clear plan
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-semibold leading-tight tracking-tight">
                Turn rough goals into
                <span className="block bg-orbit-accent bg-clip-text text-transparent">
                  AI-generated step-by-step plans.
                </span>
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-orbit-muted">
                Orbit is an AI planner for anyone with a goal. Whether you want
                to get fitter, change careers, save money, launch a project, or
                just stop procrastinating on something big, Orbit turns your
                thoughts into milestones, timelines, and daily actions you can
                actually follow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center justify-center rounded-full bg-orbit-accent px-5 py-2.5 text-sm font-semibold text-black shadow-orbit-card hover:opacity-90 transition bg-orbit-accent">
                Start a new plan
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-sm font-medium text-orbit-muted hover:border-white/40 hover:text-white transition">
                View example plan
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-orbit-muted">
              <span>
                For personal goals, projects, careers, habits, and more.
              </span>
              <span className="hidden sm:inline-block">
                No jargon—just a clear path from where you are to where you want
                to be.
              </span>
            </div>
          </div>

          {/* Right - example plan card */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="orbit-card relative p-4 sm:p-5 lg:p-6" data-animate>
              {/* small halo */}
              <div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-orbit-accent opacity-20 blur-3xl" />

              <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-orbit-muted">
                      Plan preview
                    </p>
                    <h2 className="text-sm font-semibold">
                      Goal: Get fitter in 12 weeks
                    </h2>
                    <p className="text-2xs text-orbit-muted">
                      Input: &quot;I want to feel healthier, lose a bit of
                      weight, and have more energy by summer.&quot;
                    </p>
                  </div>
                  <span className="rounded-full border border-orbit-border px-3 py-1 text-2xs text-orbit-muted">
                    Status:{" "}
                    <span className="text-emerald-400 font-medium">
                      Generated
                    </span>
                  </span>
                </div>

                {/* Sections */}
                <div className="space-y-3 text-[11px] text-orbit-muted">
                  {/* Milestones */}
                  <div className="rounded-xl border border-orbit-border bg-orbit-surfaceMuted/70 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs uppercase tracking-[0.18em]">
                        Big milestones
                      </span>
                      <span className="text-2xs text-orbit-muted">
                        3 phases
                      </span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      <li>• Week 1–4: Build basic routine &amp; consistency</li>
                      <li>
                        • Week 5–8: Increase intensity &amp; track progress
                      </li>
                      <li>• Week 9–12: Lock in habits &amp; maintain</li>
                    </ul>
                  </div>

                  {/* Rhythm */}
                  <div className="rounded-xl border border-orbit-border bg-orbit-surfaceMuted/70 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs uppercase tracking-[0.18em]">
                        Weekly rhythm
                      </span>
                      <span className="text-2xs">Simple routine</span>
                    </div>
                    <ol className="mt-1 space-y-0.5">
                      <li>1. 3x short workouts you can actually stick to</li>
                      <li>2. 2x light movement days (walks, stretching)</li>
                      <li>
                        3. 1x weekly check-in to review energy &amp; habits
                      </li>
                      <li>4. 1x flexible rest day with no guilt</li>
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="rounded-xl border border-orbit-border bg-orbit-surfaceMuted/70 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs uppercase tracking-[0.18em]">
                        Today&apos;s starting steps
                      </span>
                      <span className="text-2xs">4 quick wins</span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      <li>▢ Pick your workout days for this week</li>
                      <li>▢ Set a 10–15 minute walk for tomorrow</li>
                      <li>▢ Choose 1 simple food habit to improve</li>
                      <li>▢ Add a weekly reminder to check in with Orbit</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product – What Orbit gives you */}
        <section
          id="product"
          className="orbit-section space-y-4 p-4 sm:p-6 rounded-3xl"
          data-animate
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              What Orbit&apos;s AI gives you
            </h2>
            <p className="hidden sm:block text-2xs text-orbit-muted">
              For anyone who wants a clear path instead of vague intentions.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            <div className="orbit-card p-4 sm:p-5 space-y-2" data-animate>
              <p className="text-2xs uppercase tracking-[0.18em] text-orbit-muted">
                01 · Clarity
              </p>
              <h3 className="text-sm font-semibold">A structured plan</h3>
              <p className="text-xs text-orbit-muted">
                Orbit takes all the thoughts in your head and organizes them
                into clear phases, milestones, and priorities so you know what
                comes first.
              </p>
            </div>

            <div className="orbit-card p-4 sm:p-5 space-y-2" data-animate>
              <p className="text-2xs uppercase tracking-[0.18em] text-orbit-muted">
                02 · Direction
              </p>
              <h3 className="text-sm font-semibold">
                Daily &amp; weekly actions
              </h3>
              <p className="text-xs text-orbit-muted">
                Instead of a vague &quot;I should work on this,&quot; you get
                concrete actions broken down into days and weeks, sized for real
                life.
              </p>
            </div>

            <div className="orbit-card p-4 sm:p-5 space-y-2" data-animate>
              <p className="text-2xs uppercase tracking-[0.18em] text-orbit-muted">
                03 · Momentum
              </p>
              <h3 className="text-sm font-semibold">Progress you can see</h3>
              <p className="text-xs text-orbit-muted">
                Orbit keeps your plan organized so you can come back, see what
                you&apos;ve done, and know exactly what to do next without
                starting over.
              </p>
            </div>
          </div>
        </section>

        {/* ---- line break ---- */}
        <div className="h-px w-full bg-orbit-border/60" />

        {/* How it works (also part of Product) */}
        <section
          className="orbit-section space-y-5 p-4 sm:p-6 rounded-3xl"
          data-animate
        >
          <h2 className="text-lg sm:text-xl font-semibold">How Orbit works</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Tell Orbit what you want",
                body: "Type like you would text a friend: what you want to change, fix, or achieve. No special format needed.",
              },
              {
                step: "02",
                title: "Choose the pace and depth",
                body: "Short push, gentle pace, or full transformation—Orbit adjusts how detailed and intense your plan is.",
              },
              {
                step: "03",
                title: "Get a plan you can follow",
                body: "Orbit turns your goal into milestones, timelines, and simple next actions you can actually stick to.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="orbit-card p-4 sm:p-5 space-y-3"
                data-animate
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-orbit-border px-2.5 py-1 text-2xs text-orbit-muted">
                  <span className="bg-orbit-accent bg-clip-text text-transparent font-semibold">
                    {item.step}
                  </span>
                  <span>Step</span>
                </div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-orbit-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- line break ---- */}
        <div className="h-px w-full bg-orbit-border/60" />

        {/* Examples: what you can use Orbit for */}
        <section
          id="use-cases"
          className="orbit-section space-y-5 p-4 sm:p-6 rounded-3xl"
          data-animate
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              What you can use Orbit for
            </h2>
            <p className="hidden sm:block text-2xs text-orbit-muted">
              A few examples—Orbit doesn&apos;t care what the goal is.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                label: "Health",
                title: "Get fitter without going extreme",
                prompt: `"I want to feel better in my body, lose a bit of weight, and not be tired all the time over the next 3–4 months."`,
              },
              {
                label: "Money",
                title: "Save money without hating life",
                prompt: `"I want to save $5,000 in a year while still being able to go out sometimes and not feel super restricted."`,
              },
              {
                label: "Career",
                title: "Change jobs or level up",
                prompt: `"I want to switch from my current job into a different field, but I don't know what steps to take or where to start."`,
              },
              {
                label: "Projects & habits",
                title: "Finish the thing you keep putting off",
                prompt: `"I want to finally finish my side project and build a simple routine around it instead of random bursts."`,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="orbit-card p-4 sm:p-5 space-y-3"
                data-animate
              >
                <span className="inline-flex items-center rounded-full border border-orbit-border px-2.5 py-1 text-2xs text-orbit-muted">
                  {item.label}
                </span>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-orbit-muted leading-relaxed">
                  Example input: <span className="italic">{item.prompt}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- line break ---- */}
        <div className="h-px w-full bg-orbit-border/60" />

        {/* Built for real life — roadmap-ish section */}
        <section
          id="roadmap"
          className="orbit-section space-y-5 p-4 sm:p-6 rounded-3xl"
          data-animate
        >
          <h2 className="text-lg sm:text-xl font-semibold">
            Built for real life
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Do I need to know how to plan?",
                body: "Nope. You just describe what you want, how much time you have, and roughly how intense you want it to be. Orbit handles the structure so you don't have to be a “planner” person.",
              },
              {
                title: "What if my life is busy and messy?",
                body: "Orbit assumes you have limited time, changing energy, and other responsibilities. Plans are meant to be flexible, not perfectionist checklists that make you feel bad.",
              },
              {
                title: "Can I come back to the same plan?",
                body: "Yes. Orbit is designed so you can reopen a plan, see where you left off, and get your next few steps without rebuilding everything from scratch.",
              },
              {
                title: "Is this only for “big” goals?",
                body: "Not at all. Orbit works for big life shifts and small stuff: resetting your sleep schedule, cleaning your space, learning a skill, or finally sending those emails you've been avoiding.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="orbit-card p-4 sm:p-5 space-y-2"
                data-animate
              >
                <h3 className="text-sm font-semibold text-orbit-text">
                  {item.title}
                </h3>
                <p className="text-xs text-orbit-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Official footer */}
      <footer id="footer" className="pt-8 pb-6 mt-8" data-animate>
        <div className="orbit-container flex flex-col gap-8">
          {/* Top row */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Brand / blurb */}
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center gap-2">
                <Image
                  src="/orbit-high-res-transparent.png"
                  alt="Orbit"
                  width={160}
                  height={160}
                  className="w-auto h-8 sm:h-9"
                />
              </div>
              <p className="text-xs text-orbit-muted">
                Turn rough ideas and goals into clear, realistic plans you can
                actually follow—without needing to be a planner or a PM.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full border border-orbit-border bg-black/60 px-3 py-1 text-[11px] text-orbit-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Prototype · Actively in development</span>
              </span>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-orbit-muted">
                  Product
                </p>
                <div className="flex flex-col gap-1.5">
                  <button className="text-left text-orbit-muted hover:text-white">
                    How it works
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Example plans
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Roadmap
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-orbit-muted">
                  Use cases
                </p>
                <div className="flex flex-col gap-1.5">
                  <button className="text-left text-orbit-muted hover:text-white">
                    Personal goals
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Side projects
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Career moves
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-orbit-muted">
                  Resources
                </p>
                <div className="flex flex-col gap-1.5">
                  <button className="text-left text-orbit-muted hover:text-white">
                    Getting started
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    FAQs
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Changelog
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-orbit-muted">
                  Company
                </p>
                <div className="flex flex-col gap-1.5">
                  <button className="text-left text-orbit-muted hover:text-white">
                    About Orbit
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Contact
                  </button>
                  <button className="text-left text-orbit-muted hover:text-white">
                    Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-orbit-muted">
            <span>© {year} Orbit. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button className="hover:text-white">Status</button>
              <button className="hover:text-white">Terms</button>
              <button className="hover:text-white">Privacy</button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
