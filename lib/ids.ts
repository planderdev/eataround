// 화면에 보이는 번호(R-000012 예약, I-000003 문의, V-000005 후기)와 DB 행 번호를 오간다.

export type IdPrefix = "R" | "I" | "V";

export function formatPrefixedId(prefix: IdPrefix, id: number) {
  return `${prefix}-${id.toString().padStart(6, "0")}`;
}

/** "R-000012", "12" 모두 12로 읽는다. 접두어가 다르거나 형식이 틀리면 null. */
export function parsePrefixedId(prefix: IdPrefix, value: unknown) {
  let text: string;
  try {
    text = decodeURIComponent(String(value ?? "")).trim();
  } catch {
    return null;
  }
  const match = new RegExp(`^(?:${prefix}-)?0*([1-9]\\d{0,15})$`).exec(text);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
}
