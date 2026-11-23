"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RiBuilding2Line, RiLock2Line, RiMailLine, RiUser3Line } from "@remixicon/react";
import { withBasePath } from "@/lib/paths";
import { safeRedirectPath, userRoutes } from "@/lib/routes";
import { syncWishlistCache } from "@/lib/api/me";
import { notifySessionChanged } from "@/lib/useSession";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMode, setLoginMode] = useState<LoginMode>("personal");
  const [rememberId, setRememberId] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const content = loginModeContent[loginMode];
  const ModeIcon = content.icon;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          keepSignedIn: rememberId,
          memberType: loginMode,
        }),
        credentials: "same-origin",
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "로그인 정보를 다시 확인해 주세요.");
        return;
      }

      notifySessionChanged();
      // 이 브라우저에 남은 다른 회원의 찜 표시를 지우고 내 찜으로 맞춘다.
      void syncWishlistCache(true);
      const redirectTo = safeRedirectPath(searchParams.get("redirect"), userRoutes.me);
      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("일시적으로 로그인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

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

      <form className="auth-form" onSubmit={submit}>
        <input name="memberType" type="hidden" value={loginMode} />
        <div className="field">
          <label className="field-label" htmlFor="login-email">
            <RiMailLine size={18} />
            {content.emailLabel}
          </label>
          <input
            autoComplete="email"
            id="login-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={content.emailPlaceholder}
            type="email"
            value={email}
          />
        </div>
        <label className="field">
          <span>
            <RiLock2Line size={18} />
            비밀번호
          </span>
          <input autoComplete="current-password" name="password" onChange={(event) => setPassword(event.target.value)} placeholder={content.passwordPlaceholder} type="password" value={password} />
        </label>
        <label className="auth-remember">
          <input checked={rememberId} name="rememberId" onChange={(event) => setRememberId(event.target.checked)} type="checkbox" />
          <span>아이디 저장하기</span>
        </label>
        <button className="primary-button full" disabled={submitting} type="submit">
          {submitting ? "로그인 중..." : content.submitLabel}
        </button>
        {message ? <p className="form-message" data-tone="error">{message}</p> : null}
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
