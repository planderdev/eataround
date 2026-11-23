import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { readProfile } from "@/lib/me/profile";
import { myProfile } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";
import type { ProfilePayload } from "@/types/api";

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(request: Request) {
  // DB가 없는 샘플 모드는 예시 프로필을 보여 준다.
  if (!hasDatabaseConfig()) return NextResponse.json({ ...myProfile, marketing: true });

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);

  const profile = await readProfile(user.id);
  if (!profile) return fail("회원 정보를 찾을 수 없습니다.", 404);
  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const payload = ((await request.json().catch(() => ({}))) ?? {}) as ProfilePayload;
  const { password: _password, ...profilePayload } = payload;

  if (!hasDatabaseConfig()) {
    return NextResponse.json({
      ...myProfile,
      ...profilePayload,
      marketing: profilePayload.marketing ?? true,
    });
  }

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);

  // 마케팅 수신 동의는 저장할 칸이 아직 없다. 저장한 척하지 않고 알린다.
  if (profilePayload.marketing !== undefined) {
    return fail("마케팅 수신 동의는 아직 저장할 수 없습니다.", 501);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (profilePayload.name !== undefined) {
    const name = String(profilePayload.name).trim();
    if (!name || name.length > 80) return fail("이름은 1~80자로 입력해 주세요.", 400);
    updates.push("name = ?");
    values.push(name);
  }
  if (profilePayload.phone !== undefined) {
    const phone = String(profilePayload.phone).trim();
    if (!/^[0-9+\-\s]{8,20}$/.test(phone)) return fail("연락처를 다시 확인해 주세요.", 400);
    updates.push("phone = ?");
    values.push(phone);
  }
  if (profilePayload.organization !== undefined) {
    // 일반회원은 소속을 비워 둘 수 있고, 기업·단체회원은 기관명이 있어야 한다.
    const organization = String(profilePayload.organization).trim();
    if (organization.length > 160) return fail("소속은 160자 이내로 입력해 주세요.", 400);
    if (!organization && user.memberType === "company") return fail("기관명을 입력해 주세요.", 400);
    updates.push("organization_name = ?");
    values.push(organization || null);
  }

  if (!updates.length) return fail("바꿀 정보가 없습니다.", 400);

  await getPool().execute(`update users set ${updates.join(", ")}, updated_at = now() where id = ?`, [...values, user.id]);

  const profile = await readProfile(user.id);
  if (!profile) return fail("회원 정보를 찾을 수 없습니다.", 404);
  return NextResponse.json(profile);
}
