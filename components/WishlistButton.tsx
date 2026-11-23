"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiHeart3Fill, RiHeart3Line } from "@remixicon/react";
import { ApiError, readWishlistCache, toggleWishlist } from "@/lib/api/me";
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
    } catch (error) {
      // 로그인이 필요할 때만 로그인 화면으로 보낸다. 다른 실패는 이유만 알린다.
      if (error instanceof ApiError && error.status === 401) {
        window.dispatchEvent(new CustomEvent("site-toast", { detail: "로그인 후 이용 가능합니다." }));
        router.push(`${userRoutes.login}?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else {
        window.dispatchEvent(
          new CustomEvent("site-toast", {
            detail: error instanceof Error && error.message ? error.message : "찜을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          }),
        );
      }
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
