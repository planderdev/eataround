// 상품 상세 내용(product_detail_items)과 소개 칸의 편집 규칙. 화면(편집기)과 API가 같은 규칙을 쓴다.

export const DETAIL_TYPES = ["highlight", "included", "excluded", "notice", "recommended", "schedule", "point", "course", "faq"] as const;
export type DetailType = (typeof DETAIL_TYPES)[number];

export type DetailItem = {
  type: DetailType;
  label?: string;
  body: string;
  meta?: string;
  note?: string;
};

/** 화면 이름과 각 칸의 뜻(lib/content.ts가 상세 화면에 그리는 방식과 같다). */
export const DETAIL_TYPE_META: Record<DetailType, { title: string; page: string; label?: string; body: string; meta?: string; note?: string }> = {
  highlight: { title: "하이라이트", page: "상품 상세", body: "내용" },
  included: { title: "포함 사항", page: "상품 상세", body: "내용" },
  excluded: { title: "불포함 사항", page: "상품 상세", body: "내용" },
  notice: { title: "이용 안내", page: "상품 상세", body: "내용" },
  recommended: { title: "추천 대상", page: "상품 상세", body: "내용" },
  schedule: { title: "진행 일정", page: "상품 상세", label: "시간", body: "내용" },
  point: { title: "체험 포인트", page: "로컬체험 상세", label: "제목", body: "설명" },
  course: { title: "코스", page: "로컬체험 상세", label: "제목", body: "설명", meta: "소요 시간", note: "요약" },
  faq: { title: "자주 묻는 질문", page: "로컬체험 상세", label: "질문", body: "답변" },
};

export const DETAIL_LIMITS = { label: 160, body: 500, meta: 80, note: 200, perType: 30 };

/** products 표의 소개 칸. 키는 화면·API 이름, 값은 DB 칸과 길이 제한. */
export const PRODUCT_TEXT_FIELDS = {
  description: { column: "description", label: "상품 소개", max: 5000, multiline: true },
  region: { column: "region", label: "지역", max: 80, required: true },
  category: { column: "category", label: "카테고리", max: 80, required: true },
  duration: { column: "duration", label: "소요 시간", max: 80 },
  hostName: { column: "host_name", label: "호스트 이름", max: 160 },
  hostDescription: { column: "host_description", label: "호스트 소개", max: 500, multiline: true },
  placeName: { column: "place_name", label: "장소 이름", max: 160 },
  placeAddress: { column: "place_address", label: "장소 주소", max: 300 },
  kicker: { column: "kicker", label: "상단 한 줄 문구", max: 160 },
  groupLabel: { column: "group_label", label: "인원 안내", max: 80 },
  bookingDeadline: { column: "booking_deadline", label: "예약 마감 안내", max: 80 },
  courseIntro: { column: "course_intro", label: "코스 소개", max: 300, multiline: true },
} as const;

export type ProductTextKey = keyof typeof PRODUCT_TEXT_FIELDS;
export type ProductTextFields = Partial<Record<ProductTextKey, string>>;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** 받은 항목을 검사해 저장할 형태로 바꾼다. 문제가 있으면 오류 문구를 돌려준다. */
export function normalizeDetailItems(raw: unknown): DetailItem[] | string {
  if (!Array.isArray(raw)) return "상세 항목 목록이 올바르지 않습니다.";
  const items: DetailItem[] = [];
  const counts = new Map<DetailType, number>();
  for (const entry of raw) {
    const value = (entry ?? {}) as Record<string, unknown>;
    const type = value.type as DetailType;
    if (!DETAIL_TYPES.includes(type)) return "알 수 없는 상세 항목 종류가 있습니다.";
    const meta = DETAIL_TYPE_META[type];
    const item: DetailItem = { type, body: clean(value.body) };
    if (meta.label) item.label = clean(value.label);
    if (meta.meta) item.meta = clean(value.meta);
    if (meta.note) item.note = clean(value.note);

    // 빈 줄은 저장하지 않는다.
    if (!item.body && !item.label && !item.meta && !item.note) continue;
    if (!item.body) return `${meta.title}: ${meta.body}을(를) 입력해 주세요.`;
    if (meta.label && !item.label) return `${meta.title}: ${meta.label}을(를) 입력해 주세요.`;
    if (item.body.length > DETAIL_LIMITS.body) return `${meta.title}: ${meta.body}은(는) ${DETAIL_LIMITS.body}자 이내로 입력해 주세요.`;
    if ((item.label?.length ?? 0) > DETAIL_LIMITS.label) return `${meta.title}: ${meta.label}은(는) ${DETAIL_LIMITS.label}자 이내로 입력해 주세요.`;
    if ((item.meta?.length ?? 0) > DETAIL_LIMITS.meta) return `${meta.title}: ${meta.meta}은(는) ${DETAIL_LIMITS.meta}자 이내로 입력해 주세요.`;
    if ((item.note?.length ?? 0) > DETAIL_LIMITS.note) return `${meta.title}: ${meta.note}은(는) ${DETAIL_LIMITS.note}자 이내로 입력해 주세요.`;

    const count = (counts.get(type) ?? 0) + 1;
    if (count > DETAIL_LIMITS.perType) return `${meta.title}은(는) ${DETAIL_LIMITS.perType}개까지 넣을 수 있습니다.`;
    counts.set(type, count);
    items.push(item);
  }
  return items;
}

/** 소개 칸을 검사한다. 보낸 칸만 바꾸며, 빈 값은 비운다(필수 칸은 비울 수 없다). */
export function normalizeProductFields(raw: unknown): ProductTextFields | string {
  if (raw === undefined) return {};
  if (!raw || typeof raw !== "object") return "상품 소개 칸이 올바르지 않습니다.";
  const fields: ProductTextFields = {};
  for (const [key, spec] of Object.entries(PRODUCT_TEXT_FIELDS) as [ProductTextKey, (typeof PRODUCT_TEXT_FIELDS)[ProductTextKey]][]) {
    const value = (raw as Record<string, unknown>)[key];
    if (value === undefined) continue;
    if (value !== null && typeof value !== "string") return `${spec.label} 값이 올바르지 않습니다.`;
    const text = clean(value);
    if ("required" in spec && spec.required && !text) return `${spec.label}을(를) 입력해 주세요.`;
    if (text.length > spec.max) return `${spec.label}은(는) ${spec.max}자 이내로 입력해 주세요.`;
    fields[key] = text;
  }
  return fields;
}
