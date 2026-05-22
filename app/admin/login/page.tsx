import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { withBasePath } from "@/lib/paths";
import Link from "next/link";

export const metadata: Metadata = {
  title: "관리자 로그인",
};

export default function AdminLoginPage() {
  return (
    <section className="admin-login-layout" aria-label="관리자 로그인">
      <aside className="admin-login-visual">
        <img className="admin-login-visual-bg" src={withBasePath("/assets/images/3e88beb9ca1ae.jpg")} alt="" />
        <Link className="admin-login-brand" href="/">
          <img src={withBasePath("/assets/images/logo.png")} alt="eat.around" width={500} height={74} />
          <span>Admin Console</span>
        </Link>
        <div>
          <span>OPERATIONS</span>
          <strong>예약, 견적, 상품, 콘텐츠를 한 흐름에서 관리합니다.</strong>
          <p>이더라운드 운영팀 전용 콘솔입니다. 관리자 작업은 감사 로그와 권한 정책 기준으로 기록됩니다.</p>
        </div>
      </aside>
      <article className="admin-login-card">
        <div>
          <span>SUPER_ADMIN / OPERATOR</span>
          <h1>관리자 로그인</h1>
          <p>관리자 계정은 일반회원 및 기업회원 계정과 분리해 운영합니다.</p>
        </div>
        <AdminLoginForm />
        <small>로그인 실패 5회 시 30분 동안 계정이 잠깁니다.</small>
      </article>
    </section>
  );
}
