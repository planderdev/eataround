"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiHeart3Fill, RiHeart3Line } from "@remixicon/react";
import { readWishlistCache, toggleWishlist } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";

type WishlistButtonProps = {
  slug: string;
  label?: string;
  className?: string;
  showLabel?: boolean;
};

export function WishlistButton({ className = "", label = "찜하기", showLabel = false, slug }: WishlistButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSaved(readWishlistCache().has(slug));
  }, [slug]);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (pending) return;
    setPending(true);

    try {
      const result = await toggleWishlist(slug);
      setSaved(result.saved);
      window.dispatchEvent(new Event("wishlist:changed"));
      window.dispatchEvent(
        new CustomEvent("site-toast", {
          detail: result.saved ? "찜 목록에 저장했습니다." : "찜 목록에서 삭제했습니다.",
        }),
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("site-toast", {
          detail: "로그인 후 이용 가능합니다.",
        }),
      );
      router.push(`${userRoutes.login}?redirect=${encodeURIComponent(window.location.pathname)}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      aria-pressed={saved}
      aria-label={saved ? "찜 해제" : label}
      className={["wishlist-button", className].filter(Boolean).join(" ")}
      data-saved={saved}
      disabled={pending}
      type="button"
      onClick={handleClick}
    >
      {saved ? <RiHeart3Fill size={18} /> : <RiHeart3Line size={18} />}
      {showLabel ? <span>{saved ? "저장됨" : label}</span> : null}
    </button>
  );
}
