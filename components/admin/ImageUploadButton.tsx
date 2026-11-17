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
  onUploaded: (url: string) => void | Promise<unknown>;
  label?: string;
  /** 여러 장을 한 번에 고를 수 있게 한다. 한 장씩 차례로 올리고 올릴 때마다 onUploaded를 부른다. */
  multiple?: boolean;
  /** multiple일 때 한 번에 올릴 수 있는 최대 장수 */
  maxFiles?: number;
};

const UPLOAD_ENDPOINT = "/api/admin/uploads";

/** 이미지 파일을 골라 Vercel Blob에 올리고 주소를 돌려준다. 저장소가 없는 환경에서는 올리지 않고 이유를 안내한다. */
export function ImageUploadButton({ folder, onUploaded, label = "파일 선택", multiple, maxFiles }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const busy = progress !== null;

  async function handleFiles(selected: File[]) {
    let files = selected;
    if (maxFiles !== undefined && files.length > maxFiles) {
      notifyAdminToast(`한 번에 ${maxFiles}장까지 올릴 수 있습니다. 앞의 ${maxFiles}장만 올립니다.`, "warning");
      files = files.slice(0, maxFiles);
    }

    const invalid = files.find((file) => !UPLOAD_CONTENT_TYPES.includes(file.type));
    if (invalid) {
      notifyAdminToast(`이미지 파일만 올릴 수 있습니다. (${UPLOAD_TYPE_LABEL})`, "error");
      return;
    }
    if (files.some((file) => file.size > UPLOAD_MAX_BYTES)) {
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

      for (const [index, file] of files.entries()) {
        // 원본 파일명은 쓰지 않는다. 폴더와 시각으로 만든 이름에 서버가 난수 접미사를 붙여 저장한다.
        const pathname = `${folder}/${Date.now().toString(36)}-${index}.${UPLOAD_EXTENSIONS[file.type]}`;
        const blob = await upload(pathname, file, {
          access: "public",
          contentType: file.type,
          handleUploadUrl: withBasePath(UPLOAD_ENDPOINT),
          multipart: file.size > 4 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress(Math.round((index * 100 + percentage) / files.length)),
        });
        await onUploaded(blob.url);
      }

      notifyAdminToast(
        multiple ? `사진 ${files.length}장을 올렸습니다.` : "이미지를 올렸습니다. 저장 버튼을 눌러야 반영됩니다.",
        "success",
      );
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
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) void handleFiles(files);
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
