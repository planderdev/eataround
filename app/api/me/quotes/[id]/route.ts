import { NextResponse } from "next/server";
import type { RowDataPacket } from "@/lib/db";
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
  program_ids: string | string[] | null;
  request_memo: string | null;
};

type RouteContext = {
  params: Promise<{ id: string }>;
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

function parseNumericId(id: string) {
  const decoded = decodeURIComponent(id);
  const match = decoded.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function findMockQuote(id: string) {
  return quoteHistory.find((quote) => quote.id === decodeURIComponent(id));
}

function rowToQuote(row: QuoteRow): Quote {
  const status = STATUS_LABEL[row.status] ?? STATUS_LABEL.requested;
  let programLabel = "패키지 구성";
  try {
    const raw = row.program_ids;
    const ids = Array.isArray(raw) ? raw : raw ? (JSON.parse(raw) as string[]) : [];
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
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await getSessionUser();

  if (hasDatabaseConfig() && session) {
    const numericId = parseNumericId(id);
    if (numericId) {
      const pool = getPool();
      const [rows] = await pool.query<QuoteRow[]>(
        `select id, organization_name, contact_name, people, start_date, end_date,
                estimated_total, status, updated_at, program_ids, request_memo
           from quote_requests
          where id = ? and user_id = ?
          limit 1`,
        [numericId, session.id],
      );
      if (rows[0]) {
        return NextResponse.json(rowToQuote(rows[0]));
      }
    }
  }

  const mock = findMockQuote(id);
  if (!mock) {
    return NextResponse.json({ ok: false, message: "견적 내역을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(mock);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const mock = findMockQuote(id);

  if (!mock) {
    return NextResponse.json({ ok: false, message: "견적 내역을 찾을 수 없습니다." }, { status: 404 });
  }

  const payload = (await request.json().catch(() => ({}))) as Partial<typeof mock>;
  return NextResponse.json({ ...mock, ...payload, id: mock.id });
}
