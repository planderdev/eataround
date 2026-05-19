"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;

      const id = decodeURIComponent(link.hash.slice(1));
      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();

      const headerHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      );
      const offset = Number.isNaN(headerHeight) ? 96 : headerHeight + 58;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
