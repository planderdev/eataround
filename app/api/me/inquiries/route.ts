import { NextResponse } from "next/server";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { inquiryHistory } from "@/lib/mypage-data";
import { userRoutes } from "@/lib/routes";
import { getSessionUser } from "@/lib/session";
import type { ApiTone, Inquiry } from "@/types/api";

export const runtime = "nodejs";

type InquiryRow = RowDataPacket & {
  id: number;
  inquiry_type: "product" | "event" | "package" | "general";
  title: string;
  body: string;
  status: "open" | "answered" | "closed";
  created_at: Date;
};

const STATUS_LABEL: Record<InquiryRow["status"], { label: string; tone: ApiTone }> = {
  open: { label: "답변 대기", tone: "pending" },
  answered: { label: "답변 완료", tone: "received" },
  closed: { label: "상담 완료", tone: "done" },
};

function rowToInquiry(row: InquiryRow): Inquiry {
  const status = STATUS_LABEL[row.status] ?? STATUS_LABEL.open;
  const id = `I-${row.id.toString().padStart(6, "0")}`;
  return {
    id,
    title: row.title,
    inquiryType: row.inquiry_type,
    status: status.label,
    statusTone: status.tone,
    preview: row.body.split("\n").slice(0, 1).join("") ?? "",
    createdAt: row.created_at.toISOString().replace("T", " ").slice(0, 16),
    href: `${userRoutes.me}/inquiries/${id}`,
  };
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);

  if (!hasDatabaseConfig() || !session) {
    return NextResponse.json(inquiryHistory);
  }

  const pool = getPool();
  try {
    const [rows] = await pool.query<InquiryRow[]>(
      `select id, inquiry_type, title, body, status, created_at
         from inquiries
        where user_id = ?
        order by created_at desc
        limit 100`,
      [session.id],
    );
    if (!rows.length) {
      return NextResponse.json([] as Inquiry[]);
    }
    return NextResponse.json(rows.map(rowToInquiry));
  } catch {
    return NextResponse.json(inquiryHistory);
  }
}
