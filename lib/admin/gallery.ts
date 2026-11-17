import "server-only";
import { trimmed } from "@/lib/admin/guard";

export { GALLERY_MAX_IMAGES } from "@/lib/admin/gallery-rules";

/** 갤러리에 넣을 이미지 주소를 확인한다. http(s) 주소만 받는다. */
export function parseImageUrl(value: unknown) {
  const url = trimmed(value, 501);
  if (!url || url.length > 500 || !/^https?:\/\/\S+$/i.test(url)) return null;
  return url;
}
