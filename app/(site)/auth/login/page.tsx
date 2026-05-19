import type { Metadata } from "next";
import Link from "next/link";
import { RiKakaoTalkFill, RiLock2Line, RiMailLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <section className="page-section auth-page">
      <SectionHeader eyebrow="Login" title="로그인" description="예약, 찜, 견적 내역을 이어서 확인하세요." level="h1" />

      <div className="auth-card">
        <div className="segmented" role="tablist" aria-label="로그인 유형">
          <button data-active="true" type="button">
            일반회원
          </button>
          <button type="button">기업·단체 로그인</button>
        </div>

        <form className="auth-form">
          <label className="field">
            <span>
              <RiMailLine size={18} />
              이메일
            </span>
            <input autoComplete="email" name="email" placeholder="hello@eataround.co.kr" type="email" />
          </label>
          <label className="field">
            <span>
              <RiLock2Line size={18} />
              비밀번호
            </span>
            <input autoComplete="current-password" name="password" placeholder="비밀번호" type="password" />
          </label>
          <button className="primary-button full" type="button">
            로그인
          </button>
        </form>

        <div className="auth-socials">
          <button type="button">
            <RiKakaoTalkFill size={18} />
            카카오로 계속하기
          </button>
          <button type="button">네이버</button>
          <button type="button">구글</button>
        </div>

        <div className="auth-links">
          <Link href={userRoutes.signup}>회원가입</Link>
          <Link href="/auth/find-password">비밀번호 찾기</Link>
        </div>
      </div>
    </section>
  );
}
