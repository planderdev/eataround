import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { getPool, hasDatabaseConfig } from "@/lib/db";

const SESSION_COOKIE = "session";
const SESSION_PREFIX = "sess:";

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

export function encodeSessionToken(email: string) {
  return `${SESSION_PREFIX}${Buffer.from(email, "utf8").toString("base64url")}`;
}

export function decodeSessionToken(token: string | undefined | null) {
  if (!token || !token.startsWith(SESSION_PREFIX)) return null;
  try {
    return Buffer.from(token.slice(SESSION_PREFIX.length), "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function readSessionCookie(request?: Request): string | undefined {
  if (request) {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return undefined;
    const match = cookieHeader.split(/;\s*/).find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : undefined;
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

  const email = decodeSessionToken(token);
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
