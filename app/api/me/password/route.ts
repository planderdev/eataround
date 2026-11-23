import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig, type RowDataPacket } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSessionUser } from "@/lib/session";

type PasswordRow = RowDataPacket & { password_hash: string };

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    nextPassword?: string;
  };

  if (!payload.currentPassword || !payload.nextPassword || payload.nextPassword.length < 10) {
    return fail("현재 비밀번호와 10자 이상의 새 비밀번호를 입력해 주세요.", 400);
  }

  // DB가 없는 샘플 모드에는 바꿀 계정이 없다. 바뀐 것처럼 응답하지 않는다.
  if (!hasDatabaseConfig()) {
    return fail("샘플 모드에서는 비밀번호를 바꿀 수 없습니다.", 501);
  }

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);

  const pool = getPool();
  const [rows] = await pool.query<PasswordRow[]>("select password_hash from users where id = ? limit 1", [user.id]);
  const row = rows[0];
  if (!row || !verifyPassword(payload.currentPassword, row.password_hash)) {
    return fail("현재 비밀번호가 맞지 않습니다.", 400);
  }
  if (payload.currentPassword === payload.nextPassword) {
    return fail("새 비밀번호가 현재 비밀번호와 같습니다.", 400);
  }

  await pool.execute("update users set password_hash = ?, updated_at = now() where id = ?", [hashPassword(payload.nextPassword), user.id]);
  return NextResponse.json({ ok: true, message: "비밀번호가 변경되었습니다." });
}
