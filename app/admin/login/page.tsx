import type { Metadata } from "next";
import { withBasePath } from "@/lib/paths";
import Link from "next/link";

export const metadata: Metadata = {
  title: "관리자 로그인",
};

export default function AdminLoginPage() {
  return (
    <section className="admin-login-card" aria-label="관리자 로그인">
      <Link className="admin-login-brand" href="/">
        <img src={withBasePath("/assets/images/logo.png")} alt="eat.around" width={500} height={74} />
        <span>Admin Console</span>
      </Link>
      <div>
        <span>SUPER_ADMIN / OPERATOR</span>
        <h1>관리자 로그인</h1>
        <p>관리자 계정은 일반회원 및 기업회원 계정과 분리해 운영합니다.</p>
      </div>
      <form className="admin-login-form">
        <label>
          <span>이메일</span>
          <input autoComplete="email" defaultValue="hello@eataround.co.kr" name="email" type="email" />
        </label>
        <label>
          <span>비밀번호</span>
          <input autoComplete="current-password" name="password" placeholder="최소 10자" type="password" />
        </label>
        <button type="button">로그인</button>
      </form>
      <small>로그인 실패 5회 시 30분 동안 계정이 잠깁니다.</small>
    </section>
  );
}
