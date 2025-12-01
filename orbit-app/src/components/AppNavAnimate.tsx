// src/components/AppNavAnimate.tsx
"use client";

import { useEffect } from "react";

export function AppNavAnimate() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate]")
    );

    if (!elements.length) return;

    // Respect reduced-motion
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

    // Stagger by DOM order: top → bottom (same as Home)
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

  return null;
}
