import type { Metadata } from "next";
import Link from "next/link";
import { RiKakaoTalkFill, RiLock2Line, RiMailLine } from "@remixicon/react";
import { EmailSuggestionInput } from "@/components/EmailSuggestionInput";
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
          <div className="field">
            <label className="field-label" htmlFor="login-email">
              <RiMailLine size={18} />
              이메일
            </label>
            <EmailSuggestionInput id="login-email" name="email" placeholder="hello@eataround.co.kr" />
          </div>
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
            <span className="auth-social-mark" data-provider="kakao">
              <RiKakaoTalkFill size={16} />
            </span>
            <span>카카오로 계속하기</span>
          </button>
          <button type="button">
            <span className="auth-social-mark" data-provider="naver">N</span>
            <span>네이버로 계속하기</span>
          </button>
          <button type="button">
            <span className="auth-social-mark" data-provider="google">
              <svg aria-hidden viewBox="0 0 48 48">
                <path
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  fill="#ffc107"
                />
                <path
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  fill="#ff3d00"
                />
                <path
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  fill="#4caf50"
                />
                <path
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  fill="#1976d2"
                />
              </svg>
            </span>
            <span>구글로 계속하기</span>
          </button>
        </div>

        <div className="auth-links">
          <Link href={userRoutes.signup}>회원가입</Link>
          <Link href="/auth/find-password">비밀번호 찾기</Link>
        </div>
      </div>
    </section>
  );
}
