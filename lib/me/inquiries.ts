import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool } from "@/lib/db";
import { formatPrefixedId, parsePrefixedId } from "@/lib/ids";
import { userRoutes } from "@/lib/routes";
import type { ApiTone, Inquiry } from "@/types/api";

// 마이페이지 문의 내역. 회원 본인의 문의와 관리자 답변을 읽는다.

type InquiryRow = RowDataPacket & {
  id: number;
  inquiry_type: "product" | "event" | "package" | "general";
  title: string;
  body: string;
  status: "open" | "answered" | "closed";
  answer: string | null;
  created_at: Date;
};

/** 문의 상태의 화면 이름과 색. 마이페이지 요약 숫자(lib/me/overview.ts)도 이 표를 쓴다. */
export const INQUIRY_STATUS: Record<InquiryRow["status"], { label: string; tone: ApiTone }> = {
  open: { label: "답변 대기", tone: "pending" },
  answered: { label: "답변 완료", tone: "received" },
  closed: { label: "상담 완료", tone: "done" },
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "short" }).format(value);
}

function rowToInquiry(row: InquiryRow, full: boolean): Inquiry {
  const status = INQUIRY_STATUS[row.status] ?? INQUIRY_STATUS.open;
  const id = formatPrefixedId("I", row.id);
  // 본문 앞줄은 연락처·희망일정 같은 접수 정보라(app/api/inquiry) 목록 미리보기에서는 문의 내용 첫 줄을 보여 준다.
  const lines = row.body.split("\n").map((line) => line.trim()).filter(Boolean);
  const message = lines.find((line) => !/^(연락처|희망일정|인원|상품):/.test(line)) ?? lines[0] ?? "";
  return {
    id,
    title: row.title,
    inquiryType: row.inquiry_type,
    status: status.label,
    statusTone: status.tone,
    preview: full ? row.body : message,
    createdAt: formatDateTime(row.created_at),
    answer: row.answer ?? undefined,
    href: `${userRoutes.me}/inquiries/${id}`,
  };
}

export function parseInquiryId(value: string) {
  return parsePrefixedId("I", value);
}

export async function listMyInquiries(userId: number) {
  const [rows] = await getPool().query<InquiryRow[]>(
    `select id, inquiry_type, title, body, status, answer, created_at
       from inquiries
      where user_id = ?
      order by created_at desc
      limit 100`,
    [userId],
  );
  return rows.map((row) => rowToInquiry(row, false));
}

export async function findMyInquiry(userId: number, inquiryId: number) {
  const [rows] = await getPool().query<InquiryRow[]>(
    `select id, inquiry_type, title, body, status, answer, created_at
       from inquiries
      where id = ? and user_id = ?
      limit 1`,
    [inquiryId, userId],
  );
  return rows[0] ? rowToInquiry(rows[0], true) : null;
}
