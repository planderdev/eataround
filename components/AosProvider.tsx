"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISIBLE_ATTR = "data-aos-visible";
const PENDING_ATTR = "data-aos-pending";
const REFRESH_DELAYS = [0, 80, 220, 520];

function createAosRuntime() {
  if (typeof document === "undefined") return () => {};

  const timers = new Set<number>();
  let frame = 0;

  function addTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function reveal(target: HTMLElement) {
    if (target.getAttribute(VISIBLE_ATTR) === "true" || target.getAttribute(PENDING_ATTR) === "true") return;

    const delay = Number(target.getAttribute("data-aos-delay") ?? "0") || 0;
    if (delay > 0) {
      target.setAttribute(PENDING_ATTR, "true");
      addTimer(() => {
        target.removeAttribute(PENDING_ATTR);
        target.setAttribute(VISIBLE_ATTR, "true");
      }, delay);
      return;
    }

    target.setAttribute(VISIBLE_ATTR, "true");
  }

  function isInInitialViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportHeight * 1.08 && rect.bottom >= -80;
  }

  if (typeof IntersectionObserver === "undefined") {
    document.querySelectorAll<HTMLElement>("[data-aos]").forEach(reveal);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        reveal(target);
        observer.unobserve(target);
      }
    },
    { threshold: 0, rootMargin: "0px 0px 18% 0px" },
  );

  function scan() {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-aos]"));
    for (const element of elements) {
      if (element.getAttribute(VISIBLE_ATTR) === "true") continue;
      if (isInInitialViewport(element)) {
        reveal(element);
        continue;
      }
      observer.observe(element);
    }
  }

  function scheduleScan() {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      scan();
    });
  }

  const mutationObserver = new MutationObserver(scheduleScan);
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("load", scheduleScan);
  window.addEventListener("resize", scheduleScan);
  REFRESH_DELAYS.forEach((delay) => addTimer(scheduleScan, delay));
  scheduleScan();

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    mutationObserver.disconnect();
    observer.disconnect();
    window.removeEventListener("load", scheduleScan);
    window.removeEventListener("resize", scheduleScan);
  };
}

export function AosProvider() {
  const pathname = usePathname();

  useEffect(() => {
    return createAosRuntime();
  }, [pathname]);

  return null;
}
