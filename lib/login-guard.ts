import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

// 로그인 비밀번호 확인과 연속 실패 잠금. 같은 계정에서 5번 연속 틀리면 30분 동안 로그인을 막는다.
// 회원·관리자 로그인이 같은 규칙을 쓴다. 없는 이메일은 기록할 곳이 없으므로 같은 오류 문구만 돌려준다.

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 30;

export type LoginUserRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  member_type: "personal" | "company";
  role: "user" | "admin";
  failed_login_count: number;
  locked_until: Date | null;
};

type LoginCheck =
  | { ok: true; user: LoginUserRow }
  | { ok: false; status: 401 | 429; message: string };

const WRONG_CREDENTIALS = "이메일 또는 비밀번호를 확인해 주세요.";

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
export async function checkLogin(email: string, password: string, allow: (user: LoginUserRow) => boolean = () => true): Promise<LoginCheck> {
  const pool = getPool();
  const [rows] = await pool.query<LoginUserRow[]>(
    `select id, email, name, password_hash, member_type, role, failed_login_count, locked_until
       from users where email = ? limit 1`,
    [email],
  );
  const user = rows[0];
  if (!user) return { ok: false, status: 401, message: WRONG_CREDENTIALS };

  // 잠긴 동안에는 비밀번호가 맞아도 들여보내지 않는다(맞는지 여부도 알리지 않는다).
  if (user.locked_until && user.locked_until.getTime() > Date.now()) {
    return { ok: false, status: 429, message: lockedMessage(user.locked_until) };
  }

  if (!verifyPassword(password, user.password_hash)) {
    // 잠금 시간이 지난 계정은 0부터 다시 센다. 같은 행을 한 문장으로 고쳐 동시 요청에도 횟수가 빠지지 않는다.
    const [updated] = await pool.query<(RowDataPacket & { failed_login_count: number; locked_until: Date | null })[]>(
      `update users
          set failed_login_count = case when locked_until is not null and locked_until <= now() then 1 else failed_login_count + 1 end,
              locked_until = case
                when (case when locked_until is not null and locked_until <= now() then 1 else failed_login_count + 1 end) >= ?
                  then now() + make_interval(mins => ?)
                else null
              end
        where id = ?
        returning failed_login_count, locked_until`,
      [MAX_FAILED_LOGINS, LOCK_MINUTES, user.id],
    );
    const state = updated[0];
    if (state?.locked_until) return { ok: false, status: 429, message: lockedMessage(state.locked_until) };
    const left = MAX_FAILED_LOGINS - (state?.failed_login_count ?? 0);
    return {
      ok: false,
      status: 401,
      message: left <= 2 ? `${WRONG_CREDENTIALS} ${left}번 더 틀리면 ${LOCK_MINUTES}분 동안 로그인이 잠깁니다.` : WRONG_CREDENTIALS,
    };
  }

  if (!allow(user)) return { ok: false, status: 401, message: WRONG_CREDENTIALS };

  if (user.failed_login_count || user.locked_until) {
    await pool.execute("update users set failed_login_count = 0, locked_until = null where id = ?", [user.id]);
  }
  return { ok: true, user };
}
