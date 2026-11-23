import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

// 로그인 비밀번호 확인과 연속 실패 잠금. 같은 이메일을 같은 접속 주소(IP)에서 5번 연속 틀리면
// 그 주소에서는 30분 동안 로그인을 막는다. 회원·관리자 로그인이 같은 규칙을 쓴다.
// - 계정 하나만 보고 잠그면 남이 관리자 이메일로 일부러 틀려 관리자를 잠글 수 있어 접속 주소까지 묶는다.
// - 없는 이메일도 똑같이 세고 같은 문구를 돌려줘, 응답으로 가입 여부를 알 수 없게 한다.

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 30;

export type LoginUserRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  member_type: "personal" | "company";
  role: "user" | "admin";
};

type LoginCheck =
  | { ok: true; user: LoginUserRow }
  | { ok: false; status: 401 | 429; message: string };

const WRONG_CREDENTIALS = "이메일 또는 비밀번호를 확인해 주세요.";

/** 접속 주소. Vercel은 x-vercel-forwarded-for·x-real-ip에 실제 접속 주소를 넣는다. */
export function clientKeyOf(request: Request) {
  const headers = request.headers;
  const raw =
    headers.get("x-vercel-forwarded-for") ?? headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0] ?? "";
  const value = raw.trim().slice(0, 64);
  return value || "unknown";
}

function formatUnlockTime(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(value);
}

function lockedMessage(until: Date) {
  return `비밀번호를 ${MAX_FAILED_LOGINS}번 잘못 입력해 로그인이 잠겼습니다. ${formatUnlockTime(until)} 이후 다시 시도해 주세요.`;
}

/**
 * 이메일·비밀번호를 확인한다. allow는 비밀번호가 맞은 뒤 추가 조건(예: 관리자 권한)을 본다.
 * 추가 조건에 걸린 경우는 비밀번호 실패로 세지 않는다.
 */
export async function checkLogin(
  request: Request,
  rawEmail: string,
  password: string,
  allow: (user: LoginUserRow) => boolean = () => true,
): Promise<LoginCheck> {
  const pool = getPool();
  const email = rawEmail.trim().toLowerCase().slice(0, 190);
  const clientKey = clientKeyOf(request);

  const [attempts] = await pool.query<(RowDataPacket & { locked_until: Date | null })[]>(
    "select locked_until from login_attempts where email = ? and client_key = ? limit 1",
    [email, clientKey],
  );
  const lockedUntil = attempts[0]?.locked_until;
  // 잠긴 동안에는 비밀번호가 맞아도 들여보내지 않는다(맞는지 여부도 알리지 않는다).
  if (lockedUntil && lockedUntil.getTime() > Date.now()) {
    return { ok: false, status: 429, message: lockedMessage(lockedUntil) };
  }

  const [rows] = await pool.query<LoginUserRow[]>(
    "select id, email, name, password_hash, member_type, role from users where email = ? limit 1",
    [rawEmail],
  );
  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    // 잠금 시간이 지난 기록은 0부터 다시 센다. 한 문장으로 고쳐 동시 요청에도 횟수가 빠지지 않는다.
    const [updated] = await pool.query<(RowDataPacket & { failed_count: number; locked_until: Date | null })[]>(
      `insert into login_attempts (email, client_key, failed_count, locked_until, updated_at)
       values (?, ?, 1, null, now())
       on conflict (email, client_key) do update
         set failed_count = case when login_attempts.locked_until is not null and login_attempts.locked_until <= now()
                                 then 1 else login_attempts.failed_count + 1 end,
             locked_until = case
               when (case when login_attempts.locked_until is not null and login_attempts.locked_until <= now()
                          then 1 else login_attempts.failed_count + 1 end) >= ?
                 then now() + make_interval(mins => ?)
               else null
             end,
             updated_at = now()
       returning failed_count, locked_until`,
      [email, clientKey, MAX_FAILED_LOGINS, LOCK_MINUTES],
    );
    // 오래된 실패 기록은 가끔 정리한다(하루 지난 것).
    if (Math.random() < 0.02) {
      await pool.execute("delete from login_attempts where updated_at < now() - interval '1 day'").catch(() => undefined);
    }
    const state = updated[0];
    if (state?.locked_until) return { ok: false, status: 429, message: lockedMessage(state.locked_until) };
    const left = MAX_FAILED_LOGINS - (state?.failed_count ?? 0);
    return {
      ok: false,
      status: 401,
      message: left <= 2 ? `${WRONG_CREDENTIALS} ${left}번 더 틀리면 ${LOCK_MINUTES}분 동안 로그인이 잠깁니다.` : WRONG_CREDENTIALS,
    };
  }

  if (!allow(user)) return { ok: false, status: 401, message: WRONG_CREDENTIALS };

  await pool.execute("delete from login_attempts where email = ? and client_key = ?", [email, clientKey]);
  return { ok: true, user };
}
