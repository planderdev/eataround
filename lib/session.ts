import { cookies } from "next/headers";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { verifySessionToken } from "@/lib/session-token";

export const SESSION_COOKIE = "session";

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  member_type: "personal" | "company";
  company_approved: number;
  role: "user" | "admin";
};

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  memberType: "personal" | "company";
  companyApproved: boolean;
  role: "user" | "admin";
};

function readSessionCookie(request?: Request): string | undefined {
  if (request) {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return undefined;
    const match = cookieHeader.split(/;\s*/).find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
    return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : undefined;
  }
  return undefined;
}

export async function getSessionUser(request?: Request): Promise<SessionUser | null> {
  let token = readSessionCookie(request);

  if (!token) {
    try {
      const store = await cookies();
      token = store.get(SESSION_COOKIE)?.value;
    } catch {
      token = undefined;
    }
  }

  const email = verifySessionToken(token)?.email;
  if (!email) return null;

  if (!hasDatabaseConfig()) {
    return {
      id: 0,
      email,
      name: email.split("@")[0] ?? "회원",
      memberType: "personal",
      companyApproved: true,
      role: "user",
    };
  }

  const pool = getPool();
  const [rows] = await pool.query<UserRow[]>(
    "select id, email, name, member_type, company_approved, role from users where email = ? limit 1",
    [email],
  );
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    memberType: row.member_type,
    companyApproved: row.company_approved === 1,
    role: row.role,
  };
}

/** 관리자 세션인지 확인한다. DB가 연결된 환경에서 관리자 쓰기 API를 보호할 때 쓴다. */
export async function getAdminSessionUser(request?: Request) {
  const session = await getSessionUser(request);
  return session?.role === "admin" ? session : null;
}
