"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiShieldCheckLine,
  RiUser3Line,
} from "@remixicon/react";
import { EmailSuggestionInput } from "@/components/EmailSuggestionInput";
import { FormField } from "@/components/FormField";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

type MemberType = "personal" | "company";
type SubmitTone = "idle" | "success" | "error";

type SignupFormProps = {
  initialMemberType?: MemberType;
  lockMemberType?: boolean;
};

const memberTypeText = {
  personal: {
    label: "일반회원",
    description: "로컬체험 예약, 리뷰, 문의 내역을 관리할 수 있어요.",
    icon: RiUser3Line,
  },
  company: {
    label: "기업·기관",
    description: "단체 프로그램 견적 요청과 승인 기반 상담을 이용해요.",
    icon: RiBuilding2Line,
  },
};

function normalize(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getPasswordRuleCount(password: string) {
  return [/[A-Za-z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
}

export function SignupForm({ initialMemberType = "personal", lockMemberType = false }: SignupFormProps) {
  const router = useRouter();
  const [memberType, setMemberType] = useState<MemberType>(initialMemberType);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{ tone: SubmitTone; message: string }>({
    tone: "idle",
    message: "",
  });

  const isCompany = memberType === "company";
  const passwordRuleCount = useMemo(() => getPasswordRuleCount(password), [password]);
  const isPasswordReady = password.length >= 10 && passwordRuleCount >= 2;
  const isPasswordMatched = password.length > 0 && password === passwordConfirm;

  function updateAgreement(name: keyof typeof agreements, checked: boolean) {
    setAgreements((current) => ({ ...current, [name]: checked }));
  }

  function updateMemberType(nextType: MemberType) {
    if (nextType === memberType) return;

    if (lockMemberType) {
      router.push(nextType === "company" ? userRoutes.signupCorporate : userRoutes.signupGeneral);
      return;
    }

    setMemberType(nextType);
    setSubmitState({ tone: "idle", message: "" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = normalize(formData.get("name"));
    const phone = normalize(formData.get("phone"));
    const email = normalize(formData.get("email"));
    const organizationName = normalize(formData.get("organizationName"));
    const businessNumber = normalize(formData.get("businessNumber"));

    if (!name || !email || !password) {
      setSubmitState({ tone: "error", message: "이름, 이메일, 비밀번호를 입력해 주세요." });
      return;
    }

    if (!isPasswordReady) {
      setSubmitState({
        tone: "error",
        message: "비밀번호는 10자 이상이며 영문, 숫자, 특수문자 중 2종 이상을 포함해야 합니다.",
      });
      return;
    }

    if (!isPasswordMatched) {
      setSubmitState({ tone: "error", message: "비밀번호 확인이 일치하지 않습니다." });
      return;
    }

    if (isCompany && (!organizationName || !businessNumber)) {
      setSubmitState({ tone: "error", message: "기업·기관 회원은 기관명과 사업자등록번호를 입력해 주세요." });
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      setSubmitState({ tone: "error", message: "필수 약관에 동의해야 회원가입을 진행할 수 있습니다." });
      return;
    }

    setSubmitting(true);
    setSubmitState({ tone: "idle", message: "가입 정보를 확인하고 있습니다." });

    try {
      const response = await fetch(withBasePath(isCompany ? "/api/auth/signup/corporate" : "/api/auth/signup/general"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberType,
          name,
          phone,
          email,
          password,
          organizationName,
          businessNumber,
          marketingConsent: agreements.marketing,
        }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json") ? ((await response.json().catch(() => ({}))) as { message?: string }) : {};
      const isStaticPreviewMiss = response.status === 404 && !contentType.includes("application/json");

      if (response.ok || isStaticPreviewMiss) {
        router.push(`${userRoutes.signupComplete}?type=${isCompany ? "company" : "personal"}`);
        return;
      }

      setSubmitState({
        tone: "error",
        message: result.message ?? "가입 정보를 다시 확인해 주세요.",
      });
    } catch {
      setSubmitState({ tone: "error", message: "일시적으로 가입 신청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="signup-form" onSubmit={submit}>
      <div className="signup-form-head">
        <span className="eyebrow">Account</span>
        <h2>회원 정보 입력</h2>
        <p>예약과 견적 안내에 필요한 기본 정보를 입력해 주세요.</p>
      </div>

      <div className="signup-type-grid" role="group" aria-label="회원 유형">
        {(["personal", "company"] as const).map((type) => {
          const Icon = memberTypeText[type].icon;
          const selected = memberType === type;

          return (
            <button
              aria-pressed={selected}
              className="signup-type-option"
              data-active={selected ? "true" : "false"}
              key={type}
              onClick={() => updateMemberType(type)}
              type="button"
            >
              <span className="signup-type-icon">
                <Icon size={21} />
              </span>
              <span className="signup-type-copy">
                <strong>{memberTypeText[type].label}</strong>
                <small>{memberTypeText[type].description}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="signup-form-grid">
        <FormField label="이름" required>
          <input autoComplete="name" name="name" placeholder="홍길동" required />
        </FormField>
        <FormField label="휴대폰 번호">
          <input autoComplete="tel" inputMode="tel" name="phone" placeholder="010-0000-0000" />
        </FormField>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="signup-email">
          이메일
          <abbr aria-label="필수" title="필수 입력">*</abbr>
        </label>
        <EmailSuggestionInput id="signup-email" name="email" placeholder="hello@eataround.co.kr" required />
      </div>

      <div className="signup-form-grid">
        <FormField label="비밀번호" required>
          <input
            autoComplete="new-password"
            minLength={10}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="10자 이상"
            required
            type="password"
            value={password}
          />
        </FormField>
        <FormField label="비밀번호 확인" required>
          <input
            autoComplete="new-password"
            name="passwordConfirm"
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="한 번 더 입력"
            required
            type="password"
            value={passwordConfirm}
          />
        </FormField>
      </div>

      <ul className="signup-rule-list" aria-label="비밀번호 규칙">
        <li data-ready={password.length >= 10}>
          <RiCheckboxCircleLine size={16} />
          10자 이상
        </li>
        <li data-ready={passwordRuleCount >= 2}>
          <RiCheckboxCircleLine size={16} />
          영문, 숫자, 특수문자 중 2종 이상
        </li>
        <li data-ready={passwordConfirm.length > 0 && isPasswordMatched}>
          <RiCheckboxCircleLine size={16} />
          비밀번호 확인 일치
        </li>
      </ul>

      {isCompany ? (
        <fieldset className="signup-company-fields">
          <legend>기업·기관 정보</legend>
          <div className="signup-form-grid">
            <FormField label="기관명" required>
              <input name="organizationName" placeholder="기관 또는 회사명" required />
            </FormField>
            <FormField label="사업자등록번호" required>
              <input inputMode="numeric" name="businessNumber" placeholder="000-00-00000" required />
            </FormField>
          </div>
          <p>
            <RiShieldCheckLine size={16} />
            기업·기관 회원은 관리자 승인 후 패키지 견적 요청 기능을 이용할 수 있습니다.
          </p>
        </fieldset>
      ) : null}

      <div className="signup-agreements">
        <label>
          <input
            checked={agreements.terms}
            onChange={(event) => updateAgreement("terms", event.target.checked)}
            type="checkbox"
          />
          <span>이용약관에 동의합니다. <b>필수</b></span>
        </label>
        <label>
          <input
            checked={agreements.privacy}
            onChange={(event) => updateAgreement("privacy", event.target.checked)}
            type="checkbox"
          />
          <span>개인정보 처리방침에 동의합니다. <b>필수</b></span>
        </label>
        <label>
          <input
            checked={agreements.marketing}
            onChange={(event) => updateAgreement("marketing", event.target.checked)}
            type="checkbox"
          />
          <span>이벤트 및 혜택 안내를 받겠습니다. <small>선택</small></span>
        </label>
      </div>

      <button className="primary-button full" disabled={submitting} type="submit">
        {submitting ? "가입 신청 중" : isCompany ? "기업·기관 회원가입" : "일반 회원가입"}
      </button>

      {submitState.message ? (
        <p className="form-message" data-tone={submitState.tone}>
          {submitState.tone === "error" ? <RiErrorWarningLine size={16} /> : <RiCheckboxCircleLine size={16} />}
          {submitState.message}
        </p>
      ) : null}

      <Link className="secondary-button full signup-login-button" href={userRoutes.login}>
        가입된 아이디가 있어요
      </Link>
    </form>
  );
}
