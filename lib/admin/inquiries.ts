import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { inquiryHistory } from "@/lib/mypage-data";

// 관리자 고객 문의. 상품 상세·고객센터에서 남긴 문의를 읽고 답변·상태를 저장한다.

export type AdminInquiry = {
  id?: number;
  code: string;
  title: string;
  typeLabel: string;
  statusCode: "open" | "answered" | "closed";
  status: string;
  body: string;
  answer: string;
  memberName: string;
  memberEmail: string;
  createdAt: string;
  answeredAt: string;
};

type InquiryRow = RowDataPacket & {
  id: number;
  inquiry_type: "product" | "event" | "package" | "general";
  title: string;
  body: string;
  status: AdminInquiry["statusCode"];
  answer: string | null;
  answered_at: Date | null;
  created_at: Date;
  user_name: string | null;
  user_email: string | null;
};

export const INQUIRY_TYPE_LABEL: Record<InquiryRow["inquiry_type"], string> = {
  product: "상품 문의",
  event: "행사 문의",
  package: "패키지 문의",
  general: "일반 문의",
};

export const INQUIRY_STATUS_LABEL: Record<AdminInquiry["statusCode"], string> = {
  open: "답변 대기",
  answered: "답변 완료",
  closed: "상담 종료",
};

function formatDateTime(value: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "short" }).format(value);
}

function sampleInquiries(): AdminInquiry[] {
  return inquiryHistory.map((item) => {
    const statusCode = item.statusTone === "pending" ? "open" : item.statusTone === "done" ? "closed" : "answered";
    return {
      code: item.id,
      title: item.title,
      typeLabel: INQUIRY_TYPE_LABEL[item.inquiryType] ?? "일반 문의",
      statusCode,
      status: INQUIRY_STATUS_LABEL[statusCode],
      body: item.preview,
      answer: item.answer ?? "",
      memberName: "예시 회원",
      memberEmail: "-",
      createdAt: item.createdAt,
      answeredAt: "",
    };
  });
}

export async function getAdminInquiries(): Promise<AdminInquiry[]> {
  if (!hasDatabaseConfig()) return sampleInquiries();
  const [rows] = await getPool().query<InquiryRow[]>(
    `select i.id, i.inquiry_type, i.title, i.body, i.status, i.answer, i.answered_at, i.created_at,
            u.name as user_name, u.email as user_email
       from inquiries i
       left join users u on u.id = i.user_id
      order by (i.status = 'open') desc, i.created_at desc
      limit 500`,
  );
  return rows.map((row) => ({
    id: row.id,
    code: `I-${row.id.toString().padStart(6, "0")}`,
    title: row.title,
    typeLabel: INQUIRY_TYPE_LABEL[row.inquiry_type] ?? "일반 문의",
    statusCode: row.status,
    status: INQUIRY_STATUS_LABEL[row.status] ?? "답변 대기",
    body: row.body,
    answer: row.answer ?? "",
    // 비회원 문의는 본문 첫 줄의 연락처로 회신한다.
    memberName: row.user_name ?? "비회원",
    memberEmail: row.user_email ?? "-",
    createdAt: formatDateTime(row.created_at),
    answeredAt: formatDateTime(row.answered_at),
  }));
}
