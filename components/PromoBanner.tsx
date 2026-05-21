import Link from "next/link";
import { RiArrowRightLine, RiDiscountPercentLine, RiParentLine, RiRainyLine, RiTeamLine } from "@remixicon/react";
import { userRoutes } from "@/lib/routes";

const promoItems = [
  {
    title: "마감임박",
    description: "잔여석 1자리 체험만 빠르게 확인하세요.",
    href: `${userRoutes.experiences}?seat=last`,
    icon: RiDiscountPercentLine,
    tone: "urgent",
  },
  {
    title: "비오는날",
    description: "실내 중심 체험으로 날씨 걱정 없이 예약하세요.",
    href: `${userRoutes.experiences}?weather=rain`,
    icon: RiRainyLine,
    tone: "rain",
  },
  {
    title: "가족",
    description: "아이와 함께 참여하기 좋은 로컬체험을 모았습니다.",
    href: `${userRoutes.experiences}?target=family`,
    icon: RiParentLine,
    tone: "family",
  },
  {
    title: "단체",
    description: "기업·기관 일정은 인원과 기간에 맞춰 견적을 요청하세요.",
    href: userRoutes.b2bQuote,
    icon: RiTeamLine,
    tone: "group",
  },
] as const;

export function PromoBanner() {
  return (
    <section className="page-section promo-banner" aria-labelledby="promo-banner-title" data-aos="fade-up">
      <div className="promo-banner-heading">
        <span className="eyebrow">Special Offers</span>
        <h2 id="promo-banner-title">특가/이벤트 바로가기</h2>
      </div>
      <div className="promo-banner-grid">
        {promoItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link className="promo-banner-card" data-tone={item.tone} href={item.href} key={item.title}>
              <span className="promo-banner-icon">
                <Icon size={22} />
              </span>
              <span className="promo-banner-copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <RiArrowRightLine aria-hidden size={18} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
