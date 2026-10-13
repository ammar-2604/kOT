import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "Karachi Oil Trading — Fleet Management MVP",
  description: "Enterprise fleet management, vehicle registration, driver status, and live assignment tracking for Karachi Oil Trading.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-slate-900 min-h-screen">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
