import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

const STATUS_LABEL: Record<InquiryRow["status"], { label: string; tone: ApiTone }> = {
  open: { label: "답변 대기", tone: "pending" },
  answered: { label: "답변 완료", tone: "received" },
  closed: { label: "상담 완료", tone: "done" },
};

function parseNumericId(id: string) {
  const decoded = decodeURIComponent(id);
  const match = decoded.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function rowToInquiry(row: InquiryRow): Inquiry {
  const status = STATUS_LABEL[row.status] ?? STATUS_LABEL.open;
  const id = `I-${row.id.toString().padStart(6, "0")}`;
  return {
    id,
    title: row.title,
    inquiryType: row.inquiry_type,
    status: status.label,
    statusTone: status.tone,
    preview: row.body,
    createdAt: row.created_at.toISOString().replace("T", " ").slice(0, 16),
    href: `${userRoutes.me}/inquiries/${id}`,
  };
}

function findMock(id: string) {
  return inquiryHistory.find((inquiry) => inquiry.id === decodeURIComponent(id));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await getSessionUser();

  if (hasDatabaseConfig() && session) {
    const numericId = parseNumericId(id);
    if (numericId) {
      const pool = getPool();
      try {
        const [rows] = await pool.query<InquiryRow[]>(
          `select id, inquiry_type, title, body, status, created_at
             from inquiries
            where id = ? and user_id = ?
            limit 1`,
          [numericId, session.id],
        );
        if (rows[0]) return NextResponse.json(rowToInquiry(rows[0]));
      } catch {
        // fall through to mock
      }
    }
  }

  const mock = findMock(id);
  if (!mock) {
    return NextResponse.json({ ok: false, message: "문의 내역을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(mock);
}
