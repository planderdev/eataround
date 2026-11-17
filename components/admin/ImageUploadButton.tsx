"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { notifyAdminToast } from "@/lib/admin/toast";
import {
  UPLOAD_CONTENT_TYPES,
  UPLOAD_EXTENSIONS,
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_LABEL,
  UPLOAD_TYPE_LABEL,
  type UploadFolder,
} from "@/lib/admin/upload-rules";
import { withBasePath } from "@/lib/paths";

type ImageUploadButtonProps = {
  folder: UploadFolder;
  /** 업로드가 끝난 이미지의 공개 주소를 넘겨준다. 호출한 쪽이 입력란에 넣고 기존 저장 버튼으로 저장한다. */
  onUploaded: (url: string) => void;
  label?: string;
};

const UPLOAD_ENDPOINT = "/api/admin/uploads";

/** 이미지 파일을 골라 Vercel Blob에 올리고 주소를 돌려준다. 저장소가 없는 환경에서는 올리지 않고 이유를 안내한다. */
export function ImageUploadButton({ folder, onUploaded, label = "파일 선택" }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const busy = progress !== null;

  async function handleFile(file: File) {
    if (!UPLOAD_CONTENT_TYPES.includes(file.type)) {
      notifyAdminToast(`이미지 파일만 올릴 수 있습니다. (${UPLOAD_TYPE_LABEL})`, "error");
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      notifyAdminToast(`파일이 너무 큽니다. ${UPLOAD_MAX_LABEL} 이하의 이미지를 올려 주세요.`, "error");
      return;
    }

    setProgress(0);
    try {
      // 저장소가 연결된 환경인지 먼저 확인한다. 연결되지 않았으면 올린 것처럼 보이지 않게 이유만 안내한다.
      const status = (await fetch(withBasePath(UPLOAD_ENDPOINT))
        .then((response) => response.json())
        .catch(() => null)) as { enabled?: boolean; message?: string } | null;
      if (!status?.enabled) {
        notifyAdminToast(status?.message ?? "이 환경에서는 업로드할 수 없습니다.", "warning");
        return;
      }

      // 원본 파일명은 쓰지 않는다. 폴더와 시각으로 만든 이름에 서버가 난수 접미사를 붙여 저장한다.
      const pathname = `${folder}/${Date.now().toString(36)}.${UPLOAD_EXTENSIONS[file.type]}`;
      const blob = await upload(pathname, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: withBasePath(UPLOAD_ENDPOINT),
        multipart: file.size > 4 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      onUploaded(blob.url);
      notifyAdminToast("이미지를 올렸습니다. 저장 버튼을 눌러야 반영됩니다.", "success");
    } catch (error) {
      console.warn("Image upload failed.", error);
      notifyAdminToast("이미지를 올리지 못했습니다. 잠시 후 다시 시도하거나 이미지 주소를 직접 입력해 주세요.", "error");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <span className="admin-image-upload">
      <input
        accept={UPLOAD_CONTENT_TYPES.join(",")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
        ref={inputRef}
        type="file"
      />
      <button className="admin-action-button ghost" disabled={busy} onClick={() => inputRef.current?.click()} type="button">
        {busy ? `올리는 중... ${progress}%` : label}
      </button>
      <small>
        {UPLOAD_TYPE_LABEL} · 최대 {UPLOAD_MAX_LABEL}
      </small>
    </span>
  );
}
