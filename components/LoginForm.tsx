"use client";

import { useState } from "react";
import Link from "next/link";
import { RiBuilding2Line, RiLock2Line, RiMailLine, RiUser3Line } from "@remixicon/react";
import { EmailSuggestionInput } from "@/components/EmailSuggestionInput";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

type LoginMode = "personal" | "company";

const loginModeContent = {
  personal: {
    label: "일반회원",
    emailLabel: "이메일",
    emailPlaceholder: "hello@eataround.co.kr",
    passwordPlaceholder: "비밀번호",
    submitLabel: "로그인",
    note: "예약, 찜, 후기 내역을 이어서 확인할 수 있어요.",
    icon: RiUser3Line,
  },
  company: {
    label: "기업·단체 로그인",
    emailLabel: "담당자 이메일",
    emailPlaceholder: "company@eataround.co.kr",
    passwordPlaceholder: "기업·단체 비밀번호",
    submitLabel: "기업·단체 로그인",
    note: "승인된 기업·기관회원은 견적 내역과 단체 상담을 확인할 수 있어요.",
    icon: RiBuilding2Line,
  },
};

export function LoginForm() {
  const [loginMode, setLoginMode] = useState<LoginMode>("personal");
  const [rememberId, setRememberId] = useState(false);
  const content = loginModeContent[loginMode];
  const ModeIcon = content.icon;

  return (
    <div className="auth-card">
      <div className="segmented" role="tablist" aria-label="로그인 유형">
        {(["personal", "company"] as const).map((mode) => (
          <button
            aria-selected={loginMode === mode}
            data-active={loginMode === mode ? "true" : "false"}
            key={mode}
            onClick={() => setLoginMode(mode)}
            role="tab"
            type="button"
          >
            {loginModeContent[mode].label}
          </button>
        ))}
      </div>

      <p className="auth-mode-note" role="status">
        <ModeIcon aria-hidden size={18} />
        {content.note}
      </p>

      <form className="auth-form">
        <input name="memberType" type="hidden" value={loginMode} />
        <div className="field">
          <label className="field-label" htmlFor="login-email">
            <RiMailLine size={18} />
            {content.emailLabel}
          </label>
          <EmailSuggestionInput id="login-email" name="email" placeholder={content.emailPlaceholder} />
        </div>
        <label className="field">
          <span>
            <RiLock2Line size={18} />
            비밀번호
          </span>
          <input autoComplete="current-password" name="password" placeholder={content.passwordPlaceholder} type="password" />
        </label>
        <label className="auth-remember">
          <input checked={rememberId} name="rememberId" onChange={(event) => setRememberId(event.target.checked)} type="checkbox" />
          <span>아이디 저장하기</span>
        </label>
        <button className="primary-button full" type="button">
          {content.submitLabel}
        </button>
      </form>

      {loginMode === "personal" ? (
        <div className="auth-social-section">
          <strong className="auth-social-title">소셜 아이디로 로그인</strong>
          <div className="auth-socials">
            <button aria-label="카카오로 로그인" data-provider="kakao" type="button">
              <span className="auth-social-mark" data-provider="kakao">
                <img alt="" aria-hidden="true" src={withBasePath("/assets/images/login-kakao.svg")} />
              </span>
            </button>
            <button aria-label="네이버로 로그인" data-provider="naver" type="button">
              <span className="auth-social-mark" data-provider="naver">
                <img alt="" aria-hidden="true" src={withBasePath("/assets/images/login-naver.svg")} />
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-company-panel">
          <RiBuilding2Line aria-hidden size={20} />
          <span>
            <strong>기업·기관회원 승인이 필요해요</strong>
            <small>가입 신청 후 승인된 계정으로 단체 견적과 예약 내역을 관리할 수 있습니다.</small>
          </span>
          <Link href={userRoutes.signupCorporate}>기업·기관 가입</Link>
        </div>
      )}

      <div className="auth-links">
        <Link href={userRoutes.signup}>회원가입</Link>
        <Link href="/auth/find-password">비밀번호 찾기</Link>
      </div>
    </div>
  );
}
