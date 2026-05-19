"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AosProvider() {
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    void import("aos").then(({ default: AOS }) => {
      if (!mounted) return;

      AOS.init({
        duration: 650,
        easing: "ease-out-cubic",
        once: true,
        offset: 70,
      });
      AOS.refreshHard();
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void import("aos").then(({ default: AOS }) => {
      requestAnimationFrame(() => AOS.refreshHard());
    });
  }, [pathname]);

  return null;
}
