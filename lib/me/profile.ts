import "server-only";
import { getPool, type RowDataPacket } from "@/lib/db";
import type { Profile } from "@/types/api";

type ProfileRow = RowDataPacket & {
  name: string;
  email: string;
  phone: string | null;
  organization_name: string | null;
  member_type: "personal" | "company";
  company_approved: number;
  created_at: string | Date;
};

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return `${parts.year}.${parts.month}.${parts.day}`;
}

export async function readProfile(userId: number): Promise<Profile | null> {
  const [rows] = await getPool().query<ProfileRow[]>(
    "select name, email, phone, organization_name, member_type, company_approved, created_at from users where id = ? limit 1",
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    name: row.name,
    organization: row.organization_name ?? "",
    memberType: row.member_type === "company" ? "기업회원" : "일반회원",
    email: row.email,
    phone: row.phone ?? "",
    joinedAt: formatDate(row.created_at),
    // 포인트·쿠폰은 아직 저장하는 곳이 없다.
    point: "0P",
    couponCount: 0,
    verified: row.member_type === "company" ? Boolean(row.company_approved) : true,
    marketing: false,
  };
}
