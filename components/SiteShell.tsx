"use client";

import { usePathname } from "next/navigation";
import { AosProvider } from "@/components/AosProvider";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Toaster } from "@/components/Toaster";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const chromelessRoutes = new Set(["/b2b/quote"]);

function normalizePathname(pathname: string | null) {
  if (!pathname) return "";

  let normalized = pathname;

  if (basePath && (normalized === basePath || normalized.startsWith(`${basePath}/`))) {
    normalized = normalized.slice(basePath.length) || "/";
  }

  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isChromeless = chromelessRoutes.has(normalizePathname(pathname));

  return (
    <>
      {!isChromeless ? <a className="skip-to-content" href="#main-content">본문으로 건너뛰기</a> : null}
      <AosProvider />
      {!isChromeless ? <SmoothScroll /> : null}
      {!isChromeless ? <Header /> : null}
      <main data-chromeless={isChromeless ? "true" : undefined} id="main-content" tabIndex={-1}>
        {children}
      </main>
      {!isChromeless ? <Footer /> : null}
      {!isChromeless ? <BottomNav /> : null}
      <Toaster />
    </>
  );
}
