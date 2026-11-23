"use client";

import { safeRedirectPath } from "@/lib/routes";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin/api";

export function AdminLoginForm() {
  const router = useRouter();
  const [remember, setRemember] = useState(true);
  const [failureCount, setFailureCount] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (failureCount >= 5) {
      setMessage("로그인 실패 횟수가 초과되어 30분 잠금 상태입니다.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await adminApi.auth
      .login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        keepSignedIn: remember,
      })
      .catch(() => null)
      .finally(() => setIsSubmitting(false));

    if (!result?.ok) {
      const nextCount = failureCount + 1;
      setFailureCount(nextCount);
      setMessage(`로그인에 실패했습니다. ${nextCount}/5회`);
      return;
    }

    // 세션 쿠키는 서버가 httpOnly로 발급한다.
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    const target = safeRedirectPath(redirect, "/admin/dashboard");
    router.push(target.startsWith("/admin") ? target : "/admin/dashboard");
    router.refresh();
  }

  return (
    <form method="post" className="admin-login-form" onSubmit={submit}>
      <label>
        <span>이메일</span>
        <input autoComplete="email" defaultValue="hello@eataround.co.kr" name="email" required type="email" />
      </label>
      <label>
        <span>비밀번호</span>
        <input autoComplete="current-password" name="password" placeholder="최소 10자" required type="password" />
      </label>
      <label className="admin-login-remember">
        <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
        <span>로그인 상태 유지</span>
      </label>
      {message ? <p className="admin-login-message">{message}</p> : null}
      <button disabled={isSubmitting || failureCount >= 5} type="submit">
        {isSubmitting ? "확인 중" : "로그인"}
      </button>
    </form>
  );
}
