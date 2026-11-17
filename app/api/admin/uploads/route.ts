import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { adminError, requireAdmin } from "@/lib/admin/guard";
import { UPLOAD_CONTENT_TYPES, UPLOAD_MAX_BYTES, UPLOAD_PATH_PATTERN } from "@/lib/admin/upload-rules";
import { hasDatabaseConfig } from "@/lib/db";

// 관리자 이미지 업로드용 토큰 발급.
// 파일은 브라우저가 Vercel Blob으로 직접 올린다(함수 요청 본문 4.5MB 제한을 피하기 위해).
// 이 라우트는 관리자에게만, 정해진 폴더·이미지 형식·크기로만 쓸 수 있는 일회용 토큰을 내준다.

const NO_STORAGE_MESSAGE = "이 환경에서는 업로드할 수 없습니다. 파일 저장소(BLOB_READ_WRITE_TOKEN)가 연결되지 않았습니다. 이미지 주소를 직접 입력해 주세요.";
const NO_DATABASE_MESSAGE = "이 환경에서는 업로드할 수 없습니다. DB가 없는 샘플 모드에서는 관리자 확인을 할 수 없습니다.";

function unavailableReason() {
  if (!hasDatabaseConfig()) return NO_DATABASE_MESSAGE;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NO_STORAGE_MESSAGE;
  return null;
}

/** 업로드를 쓸 수 있는 환경인지 화면이 미리 확인한다. */
export async function GET(request: Request) {
  if (hasDatabaseConfig()) {
    const denied = await requireAdmin(request);
    if (denied) return denied;
  }
  const reason = unavailableReason();
  return NextResponse.json({ ok: true, enabled: !reason, message: reason ?? undefined });
}

export async function POST(request: Request) {
  const reason = unavailableReason();
  if (reason) return adminError(reason, 503);

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  // 업로드 완료 콜백은 쓰지 않는다. 주소는 화면이 받아 기존 저장 흐름으로 DB에 넣는다.
  if (!body || body.type !== "blob.generate-client-token") return adminError("업로드 요청 형식이 올바르지 않습니다.", 400);

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!UPLOAD_PATH_PATTERN.test(pathname)) throw new Error("허용되지 않은 업로드 경로입니다.");
        return {
          allowedContentTypes: UPLOAD_CONTENT_TYPES,
          maximumSizeInBytes: UPLOAD_MAX_BYTES,
          // 같은 이름으로 올려도 덮어쓰지 않도록 저장 이름에 난수 접미사를 붙인다.
          addRandomSuffix: true,
          // 토큰은 파일 한 개를 올릴 동안만 쓰면 되므로 10분만 유효하게 한다.
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return adminError(error instanceof Error ? error.message : "업로드 토큰을 만들지 못했습니다.", 400);
  }
}
