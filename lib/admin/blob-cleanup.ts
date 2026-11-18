import "server-only";
import { del } from "@vercel/blob";
import { UPLOAD_FOLDERS } from "@/lib/admin/upload-rules";
import type { DbConnection } from "@/lib/db";

// 더 이상 쓰지 않는 업로드 파일을 Vercel Blob에서 지운다.
// 지우는 대상은 관리자 화면에서 올린 파일뿐이다. "주소로 추가"한 외부 이미지는 건드리지 않는다.

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const BLOB_DELETE_TIMEOUT_MS = 5000;

/**
 * 파일을 어떻게 처리했는지.
 * - `deleted`: 저장소에서 지웠다.
 * - `in-use`: 다른 곳에서 아직 쓰고 있어 남겼다.
 * - `external`: 우리 저장소 파일이 아니어서 건드리지 않았다.
 * - `no-storage`: 저장소가 연결되지 않은 환경이라 건너뛰었다.
 * - `failed`: 지우려 했지만 실패했다(서버 로그에 남긴다).
 */
export type BlobCleanupResult = "deleted" | "in-use" | "external" | "no-storage" | "failed";

/** 관리자 업로드로 만들어진 주소인지 확인한다: Blob 공개 호스트이고 경로가 업로드 폴더로 시작해야 한다. */
export function isUploadedBlobUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || !url.hostname.endsWith(BLOB_HOST_SUFFIX)) return false;
  if (url.hostname.length === BLOB_HOST_SUFFIX.length) return false;
  const [folder, file] = url.pathname.slice(1).split("/");
  return Boolean(file) && (UPLOAD_FOLDERS as readonly string[]).includes(folder);
}

/**
 * 이 주소를 아직 쓰는 곳이 있는지 확인한다.
 * 갤러리 행을 지운 뒤 같은 트랜잭션 안에서 불러, 방금 지운 행은 세지 않게 한다.
 */
export async function isImageUrlInUse(connection: DbConnection, imageUrl: string) {
  const [rows] = await connection.query<{ in_use: boolean }[]>(
    `select (
       exists (select 1 from product_images where image_url = ?)
       or exists (select 1 from products where image_url = ?)
       or exists (select 1 from banners where image_url = ? or position(? in host_images::text) > 0)
       or exists (select 1 from events where image_url = ?)
       or exists (select 1 from collections where image_url = ?)
       or exists (select 1 from journals where image_url = ?)
       or exists (select 1 from categories where icon_asset = ?)
     ) as in_use`,
    Array(8).fill(imageUrl),
  );
  return Boolean(rows[0]?.in_use);
}

/**
 * 업로드 파일 한 개를 저장소에서 지운다. DB 변경을 커밋한 뒤에 부른다.
 * 실패해도 예외를 던지지 않는다. 화면에서는 이미 빠진 사진이므로 요청을 실패로 만들지 않는다.
 */
export async function removeUploadedBlob(imageUrl: string): Promise<Exclude<BlobCleanupResult, "in-use">> {
  if (!isUploadedBlobUrl(imageUrl)) return "external";
  if (!process.env.BLOB_READ_WRITE_TOKEN) return "no-storage";
  // SDK는 저장소 오류가 나면 길게 재시도한다. 관리자 요청이 그동안 붙잡히지 않도록 시간을 제한한다.
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`저장소가 ${BLOB_DELETE_TIMEOUT_MS / 1000}초 안에 응답하지 않았습니다.`));
    }, BLOB_DELETE_TIMEOUT_MS);
  });
  try {
    const request = del(imageUrl, { abortSignal: controller.signal });
    // 시간 제한이 먼저 끝난 뒤 뒤늦게 나는 오류가 처리되지 않은 거부로 남지 않게 한다.
    request.catch(() => undefined);
    await Promise.race([request, timeout]);
    return "deleted";
  } catch (error) {
    console.error("[blob-cleanup] 저장소 파일을 지우지 못했습니다.", imageUrl, error);
    return "failed";
  } finally {
    clearTimeout(timer);
  }
}
