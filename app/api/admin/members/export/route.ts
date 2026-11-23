import { NextResponse } from "next/server";
import { adminError, requireAdmin } from "@/lib/admin/guard";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

export const runtime = "nodejs";

type MemberRow = RowDataPacket & {
  id: number;
  member_type: "personal" | "company";
  name: string;
  email: string;
  phone: string | null;
  organization_name: string | null;
  business_number: string | null;
  company_approved: number;
  company_rejected_reason: string | null;
  created_at: Date;
};

const HEADERS = ["회원번호", "회원 유형", "이름", "이메일", "연락처", "소속·기관명", "사업자등록번호", "기업 승인", "가입일"];

/** 엑셀이 =, +, -, @로 시작하는 칸을 수식으로 실행하지 않게 앞에 '를 붙이고, 쉼표·따옴표·줄바꿈은 감싼다. */
function csvCell(value: unknown) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function approvalLabel(row: MemberRow) {
  if (row.member_type !== "company") return "";
  if (row.company_approved) return "승인";
  return row.company_rejected_reason ? "반려" : "승인 대기";
}

/** 회원 목록 CSV(엑셀에서 바로 열리도록 UTF-8 BOM 포함). type=general|corporate|all */
export async function GET(request: Request) {
  if (!hasDatabaseConfig()) return adminError("DB가 연결된 환경에서만 회원을 내보낼 수 있습니다.", 501);

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const type = new URL(request.url).searchParams.get("type") ?? "all";
  if (!["general", "corporate", "all"].includes(type)) return adminError("회원 유형이 올바르지 않습니다.", 400);

  const where = type === "general" ? "and member_type = 'personal'" : type === "corporate" ? "and member_type = 'company'" : "";
  const [rows] = await getPool().query<MemberRow[]>(
    `select id, member_type, name, email, phone, organization_name, business_number,
            company_approved, company_rejected_reason, created_at
       from users
      where role <> 'admin' ${where}
      order by created_at desc, id desc`,
  );

  const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" });
  const lines = [
    HEADERS.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.member_type === "company" ? "기업·단체회원" : "일반회원",
        row.name,
        row.email,
        row.phone,
        row.organization_name,
        row.business_number,
        approvalLabel(row),
        dateFormat.format(row.created_at),
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  const label = type === "general" ? "일반회원" : type === "corporate" ? "기업회원" : "전체회원";
  const fileName = `eataround-${label}-${dateFormat.format(new Date())}.csv`;
  return new NextResponse(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members.csv"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}
