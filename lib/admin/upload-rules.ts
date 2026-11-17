// 관리자 이미지 업로드 규칙. 서버(토큰 발급)와 화면(미리 걸러내기)이 같은 값을 쓴다.

/** 이미지를 넣을 수 있는 폴더. Blob 경로의 첫 조각이 된다. */
export const UPLOAD_FOLDERS = ["products", "banners", "curations", "events", "journals", "categories"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const UPLOAD_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export const UPLOAD_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const UPLOAD_MAX_LABEL = "10MB";
export const UPLOAD_TYPE_LABEL = "JPG, PNG, WebP, AVIF, GIF";

/** 서버가 받아들이는 경로: `폴더/영문·숫자 이름.확장자`. 실제 저장 이름에는 서버가 난수 접미사를 붙인다. */
export const UPLOAD_PATH_PATTERN = new RegExp(`^(${UPLOAD_FOLDERS.join("|")})/[a-z0-9-]{1,40}\\.(jpg|png|webp|avif|gif)$`);
