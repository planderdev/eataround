"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiHeart3Line } from "@remixicon/react";
import { readWishlistCache } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";

type HeaderWishlistProps = {
  onNavigate?: () => void;
};

export function HeaderWishlist({ onNavigate }: HeaderWishlistProps) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function refresh() {
      setCount(readWishlistCache().size);
    }
    refresh();
    window.addEventListener("wishlist:changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("wishlist:changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link
      className="header-wishlist"
      href={`${userRoutes.me}/wishlist`}
      aria-label={count > 0 ? `찜 ${count}개` : "찜 목록"}
      data-tooltip={count > 0 ? `찜 ${count}개` : "찜 목록"}
      onClick={onNavigate}
    >
      <RiHeart3Line size={20} />
      {mounted && count > 0 ? <span className="header-wishlist-badge">{count > 99 ? "99+" : count}</span> : null}
    </Link>
  );
}
