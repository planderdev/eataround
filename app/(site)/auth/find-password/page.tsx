import type { Metadata } from "next";
import Link from "next/link";
import { RiMailSendLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
};

export default function FindPasswordPage() {
  return (
    <section className="page-section auth-page">
      <SectionHeader eyebrow="Password" title="비밀번호 재설정" description="가입한 이메일로 재설정 링크를 받을 수 있습니다." level="h1" />
      <div className="auth-card">
        <form className="auth-form">
          <label className="field">
            <span>
              <RiMailSendLine size={18} />
              이메일
            </span>
            <input autoComplete="email" name="email" placeholder="hello@eataround.co.kr" type="email" />
          </label>
          <button className="primary-button full" type="button">
            재설정 링크 받기
          </button>
        </form>
        <div className="auth-links">
          <Link href={userRoutes.login}>로그인으로 돌아가기</Link>
        </div>
      </div>
    </section>
  );
}
