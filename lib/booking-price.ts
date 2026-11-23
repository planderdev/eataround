// 예약 금액 규칙. 상세 화면(표시)과 예약 API(저장)가 같은 계산을 쓰도록 한곳에 둔다.
// 서버는 화면이 보낸 합계를 믿지 않고, DB의 회차 가격과 아래 규칙으로 다시 계산한다.

export type BookingOptionKey = "adult" | "teen" | "child" | "privateGuide";
export type BookingOptionCounts = Record<BookingOptionKey, number>;

export const PRIVATE_GUIDE_PRICE = 50000;
const TEEN_RATE = 0.85;
const CHILD_RATE = 0.7;
const MAX_COUNT = 999;

export const recommendedBookingOptions = [
  {
    title: "제주 로컬 키친 근처 산책 코스",
    summary: "체험 전후로 함께 둘러보기 좋은 동네 산책 루트",
    price: 30500,
    image: "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
  },
  {
    title: "공항 출발 프라이빗 픽업",
    summary: "차량 이동이 필요한 팀을 위한 편도 픽업 옵션",
    price: 34800,
    image: "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
  },
  {
    title: "로컬 마켓 티켓 포함 코스",
    summary: "체험 후 로컬 마켓에서 사용할 수 있는 연계 티켓",
    price: 40661,
    image: "https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg",
  },
] as const;

export function bookingOptionPrices(basePrice: number): Record<BookingOptionKey, number> {
  return {
    adult: basePrice,
    teen: Math.round(basePrice * TEEN_RATE),
    child: Math.round(basePrice * CHILD_RATE),
    privateGuide: PRIVATE_GUIDE_PRICE,
  };
}

function toCount(value: unknown) {
  const count = Number(value ?? 0);
  if (!Number.isInteger(count) || count < 0 || count > MAX_COUNT) return null;
  return count;
}

/**
 * 화면이 보낸 인원 구성을 검사한다. options가 없으면(이전 예약 화면) people을 성인 인원으로 본다.
 * 잘못된 값이면 null.
 */
export function normalizeBookingCounts(options: unknown, people: unknown): BookingOptionCounts | null {
  if (options && typeof options === "object") {
    const raw = options as Partial<Record<BookingOptionKey, unknown>>;
    const counts = {
      adult: toCount(raw.adult),
      teen: toCount(raw.teen),
      child: toCount(raw.child),
      privateGuide: toCount(raw.privateGuide),
    };
    if (Object.values(counts).some((count) => count === null)) return null;
    return counts as BookingOptionCounts;
  }

  const adult = toCount(people ?? 1);
  if (adult === null) return null;
  return { adult, teen: 0, child: 0, privateGuide: 0 };
}

export function bookingPeople(counts: BookingOptionCounts) {
  return counts.adult + counts.teen + counts.child;
}

/** 알 수 없는 추천 옵션 이름은 버린다. */
export function normalizeRecommendedOptions(titles: unknown): string[] {
  if (!Array.isArray(titles)) return [];
  const known = new Set<string>(recommendedBookingOptions.map((item) => item.title));
  return [...new Set(titles.filter((title): title is string => typeof title === "string" && known.has(title)))];
}

export function calculateBookingTotal(basePrice: number, counts: BookingOptionCounts, recommendedTitles: string[] = []) {
  const prices = bookingOptionPrices(basePrice);
  const optionAmount = (Object.keys(prices) as BookingOptionKey[]).reduce((sum, key) => sum + prices[key] * counts[key], 0);
  const recommendedAmount = recommendedBookingOptions.reduce(
    (sum, item) => sum + (recommendedTitles.includes(item.title) ? item.price : 0),
    0,
  );
  return optionAmount + recommendedAmount;
}

/** 관리자가 볼 수 있게 예약 메모에 남기는 구성 요약. */
export function describeBooking(counts: BookingOptionCounts, recommendedTitles: string[]) {
  const parts = [
    counts.adult ? `성인 ${counts.adult}` : "",
    counts.teen ? `청소년 ${counts.teen}` : "",
    counts.child ? `아동 ${counts.child}` : "",
    counts.privateGuide ? `프라이빗 안내 ${counts.privateGuide}` : "",
  ].filter(Boolean);
  const extras = recommendedTitles.length ? ` / 추가: ${recommendedTitles.join(", ")}` : "";
  return `구성: ${parts.join(", ") || "-"}${extras}`.slice(0, 480);
}
