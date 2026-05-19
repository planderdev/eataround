import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

type SignupPayload = {
  memberType?: "personal" | "company";
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  organizationName?: string;
  businessNumber?: string;
  marketingConsent?: boolean;
};

function normalize(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as SignupPayload;
  const email = normalize(payload.email);
  const password = normalize(payload.password);
  const name = normalize(payload.name);
  const memberType = payload.memberType === "company" ? "company" : "personal";
  const phone = normalize(payload.phone);
  const organizationName = normalize(payload.organizationName);
  const businessNumber = normalize(payload.businessNumber);

  if (!email || !password || !name) {
    return NextResponse.json({ ok: false, message: "이름, 이메일, 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const passwordRuleCount = [/[A-Za-z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;

  if (password.length < 10 || passwordRuleCount < 2) {
    return NextResponse.json({ ok: false, message: "비밀번호는 10자 이상이며 영문, 숫자, 특수문자 중 2종 이상을 포함해야 합니다." }, { status: 400 });
  }

  if (memberType === "company" && (!organizationName || !businessNumber)) {
    return NextResponse.json({ ok: false, message: "기업·기관 회원은 기관명과 사업자등록번호를 입력해 주세요." }, { status: 400 });
  }

  if (hasDatabaseConfig()) {
    const pool = getPool();
    try {
      await pool.execute(
        `insert into users
          (member_type, email, password_hash, name, phone, organization_name, business_number, company_approved)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memberType,
          email,
          hashPassword(password),
          name,
          phone,
          memberType === "company" ? organizationName : null,
          memberType === "company" ? businessNumber : null,
          memberType === "company" ? 0 : 1,
        ],
      );
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
        return NextResponse.json({ ok: false, message: "이미 가입된 이메일입니다." }, { status: 409 });
      }
      throw error;
    }
  }

  return NextResponse.json({
    ok: true,
    message: hasDatabaseConfig()
      ? memberType === "company"
        ? "기업·기관 가입 신청이 접수되었습니다. 담당자가 확인 후 안내드립니다."
        : "회원가입이 완료되었습니다."
      : "가입 신청이 접수되었습니다.",
  });
}
