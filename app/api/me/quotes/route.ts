import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { quoteHistory } from "@/lib/mypage-data";
import { userRoutes } from "@/lib/routes";
import { getSessionUser } from "@/lib/session";
import type { ApiTone, Quote } from "@/types/api";

export const runtime = "nodejs";

type QuoteRow = RowDataPacket & {
  id: number;
  organization_name: string | null;
  contact_name: string | null;
  people: number;
  start_date: string | null;
  end_date: string | null;
  estimated_total: number | null;
  status: "requested" | "reviewing" | "sent" | "accepted" | "closed";
  updated_at: Date;
  program_ids: string | null;
};

const STATUS_LABEL: Record<QuoteRow["status"], { label: string; tone: ApiTone }> = {
  requested: { label: "검토 중", tone: "pending" },
  reviewing: { label: "운영팀 검토", tone: "pending" },
  sent: { label: "견적서 수신", tone: "received" },
  accepted: { label: "확정", tone: "confirmed" },
  closed: { label: "종료", tone: "done" },
};

function formatPeriod(start: string | null, end: string | null) {
  if (!start) return "기간 미정";
  if (!end || start === end) return start;
  return `${start} - ${end}`;
}

function formatWonAmount(value: number | null | undefined) {
  if (!value) return "별도 협의";
  return `${value.toLocaleString("ko-KR")}원`;
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);

  if (!hasDatabaseConfig() || !session) {
    return NextResponse.json(quoteHistory);
  }

  const pool = getPool();
  const [rows] = await pool.query<QuoteRow[]>(
    `select id, organization_name, contact_name, people, start_date, end_date,
            estimated_total, status, updated_at, program_ids
       from quote_requests
      where user_id = ?
      order by updated_at desc
      limit 100`,
    [session.id],
  );

  if (!rows.length) {
    return NextResponse.json([] as Quote[]);
  }

  const items: Quote[] = rows.map((row) => {
    const status = STATUS_LABEL[row.status] ?? STATUS_LABEL.requested;
    let programLabel = "패키지 구성";
    try {
      const ids = row.program_ids ? (JSON.parse(row.program_ids) as string[]) : [];
      if (ids.length) programLabel = `${ids.length}개 프로그램`;
    } catch {
      // keep default label
    }

    return {
      id: `Q-${row.id.toString().padStart(6, "0")}`,
      title: row.organization_name ?? "단체 견적 요청",
      status: status.label,
      statusTone: status.tone,
      program: programLabel,
      period: formatPeriod(row.start_date, row.end_date),
      people: `${row.people}명`,
      estimatedTotal: formatWonAmount(row.estimated_total),
      manager: row.contact_name ?? "운영팀",
      lastUpdated: row.updated_at.toISOString().replace("T", " ").slice(0, 16),
      href: userRoutes.b2bQuote,
      timeline: ["요청 접수", "운영팀 검토", "견적서 발송", "확정"],
    };
  });

  return NextResponse.json(items);
}
