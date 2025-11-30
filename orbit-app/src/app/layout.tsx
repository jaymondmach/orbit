import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit – AI planner",
  description:
    "Turn rough ideas and goals into realistic AI-generated plans you can actually follow.",
  icons: {
    icon: "/orbit-high-res-favicon.png", // <-- your custom favicon
    shortcut: "/orbit-high-res-favicon.png",
    apple: "/orbit-high-res-favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
