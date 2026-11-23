"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  RiEdit2Line,
  RiLockPasswordLine,
  RiMailLine,
  RiPhoneLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import { StatusBadge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyProfile, updatePassword, updateProfile } from "@/lib/api/me";
import { myProfile } from "@/lib/mypage-data";
import type { Profile } from "@/types/api";

type EditableField = "name" | "organization" | "phone";

const fieldLabels: Record<EditableField, string> = {
  name: "이름",
  organization: "소속",
  phone: "휴대폰",
};

export function ProfileSection() {
  const [profile, setProfile] = useState<Profile>({ ...myProfile, marketing: true });
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  function loadProfile() {
    setLoadStatus("loading");
    fetchMyProfile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  }

  useEffect(loadProfile, []);

  function startEdit(field: EditableField) {
    setEditingField(field);
    setDraftValue(String(profile[field] ?? ""));
    setFeedback("");
  }

  async function saveField() {
    if (!editingField) return;
    const nextValue = draftValue.trim();
    try {
      const nextProfile = await updateProfile({ [editingField]: nextValue });
      setProfile((current) => ({ ...current, ...nextProfile, [editingField]: nextValue }));
      setEditingField(null);
      setFeedback(`${fieldLabels[editingField]} 정보가 저장되었습니다.`);
    } catch (error) {
      setFeedback(errorMessage(error, `${fieldLabels[editingField]} 정보를 저장하지 못했습니다.`));
    }
  }

  async function toggleMarketing() {
    const marketing = !profile.marketing;
    try {
      await updateProfile({ marketing });
      setProfile((current) => ({ ...current, marketing }));
      setFeedback(marketing ? "마케팅 수신에 동의했습니다." : "마케팅 수신 동의를 해제했습니다.");
    } catch (error) {
      setFeedback(errorMessage(error, "마케팅 수신 동의를 저장하지 못했습니다."));
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const nextPassword = String(formData.get("nextPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (nextPassword.length < 10 || nextPassword !== confirmPassword) {
      setPasswordMessage("새 비밀번호는 10자 이상이며 확인 값과 같아야 합니다.");
      return;
    }

    try {
      await updatePassword({
        currentPassword,
        nextPassword,
      });
      setPasswordMessage("");
      setIsPasswordOpen(false);
      setFeedback("비밀번호가 변경되었습니다.");
    } catch (error) {
      setPasswordMessage(errorMessage(error, "비밀번호를 바꾸지 못했습니다."));
    }
  }

  if (loadStatus === "loading") return <SectionSkeleton count={2} />;
  if (loadStatus === "error") return <SectionError onRetry={loadProfile} />;

  return (
    <>
      <div className="me-profile-grid">
        <article className="me-profile-card">
          <header>
            <div>
              <span className="eyebrow">Basic</span>
              <h2>기본 정보</h2>
            </div>
            <StatusBadge tone="confirmed">인증 완료</StatusBadge>
          </header>
          {feedback ? <p className="me-profile-feedback">{feedback}</p> : null}
          <div className="me-profile-form">
            <dl className="me-profile-fields">
              <ProfileField
                editing={editingField === "name"}
                label="이름"
                value={profile.name}
                draftValue={draftValue}
                onCancel={() => setEditingField(null)}
                onChange={setDraftValue}
                onEdit={() => startEdit("name")}
                onSave={saveField}
              />
              <StaticField label="회원 유형" value={profile.memberType} />
              <ProfileField
                editing={editingField === "organization"}
                label="소속"
                value={profile.organization}
                draftValue={draftValue}
                onCancel={() => setEditingField(null)}
                onChange={setDraftValue}
                onEdit={() => startEdit("organization")}
                onSave={saveField}
              />
              <StaticField label="이메일" value={profile.email} />
              <ProfileField
                editing={editingField === "phone"}
                label="휴대폰"
                value={profile.phone}
                draftValue={draftValue}
                onCancel={() => setEditingField(null)}
                onChange={setDraftValue}
                onEdit={() => startEdit("phone")}
                onSave={saveField}
              />
              <StaticField label="가입일" value={profile.joinedAt} />
            </dl>
          </div>
        </article>

        <article className="me-profile-card me-profile-security-card">
          <header>
            <div>
              <span className="eyebrow">Security</span>
              <h2>보안 및 알림</h2>
            </div>
            <RiShieldCheckLine size={22} />
          </header>
          <div className="me-profile-checks">
            <span>
              <RiMailLine size={18} />
              {profile.email}
            </span>
            <span>
              <RiPhoneLine size={18} />
              {profile.phone}
            </span>
            <span>
              <RiShieldCheckLine size={18} />
              본인인증 완료
            </span>
          </div>
          <button className="secondary-button" onClick={() => setIsPasswordOpen(true)} type="button">
            <RiLockPasswordLine size={16} />
            비밀번호 변경
          </button>
        </article>

        <article className="me-profile-card me-profile-card-wide">
          <header>
            <div>
              <span className="eyebrow">Agreement</span>
              <h2>수신 및 개인정보 동의</h2>
            </div>
          </header>
          <dl className="me-profile-consent-list">
            <StaticField label="예약 알림" value="카카오 알림톡 + 이메일 수신" />
            <div className="me-profile-consent-toggle">
              <dt>마케팅 수신</dt>
              <dd>
                <button aria-pressed={Boolean(profile.marketing)} className="toggle-switch" data-active={Boolean(profile.marketing)} onClick={toggleMarketing} type="button">
                  <span />
                </button>
                {profile.marketing ? "이벤트·기획전 소식 수신 동의" : "수신 동의 안 함"}
              </dd>
            </div>
            <StaticField label="개인정보 보관" value="거래 종료 후 법정 기간 보관" />
          </dl>
        </article>
      </div>

      <Modal isOpen={isPasswordOpen} label="비밀번호 변경" onClose={() => setIsPasswordOpen(false)}>
        <form className="me-password-modal" onSubmit={submitPassword}>
          <header>
            <h2>비밀번호 변경</h2>
            <p>현재 비밀번호 확인 후 새 비밀번호를 저장합니다.</p>
          </header>
          <label>
            현재 비밀번호
            <input name="currentPassword" type="password" required />
          </label>
          <label>
            새 비밀번호
            <input name="nextPassword" minLength={10} type="password" required />
          </label>
          <label>
            새 비밀번호 확인
            <input name="confirmPassword" minLength={10} type="password" required />
          </label>
          {passwordMessage ? <p>{passwordMessage}</p> : null}
          <footer>
            <button className="secondary-button" onClick={() => setIsPasswordOpen(false)} type="button">
              취소
            </button>
            <button className="primary-button" type="submit">
              저장
            </button>
          </footer>
        </form>
      </Modal>
    </>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ProfileField({
  draftValue,
  editing,
  label,
  onCancel,
  onChange,
  onEdit,
  onSave,
  value,
}: {
  draftValue: string;
  editing: boolean;
  label: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  value: string;
}) {
  return (
    <div className="me-profile-edit-row">
      <dt>{label}</dt>
      <dd>
        {editing ? (
          <span className="me-profile-inline-edit">
            <input aria-label={`${label} 수정`} onChange={(event) => onChange(event.target.value)} value={draftValue} />
            <button className="primary-button" onClick={onSave} type="button">
              저장
            </button>
            <button className="secondary-button" onClick={onCancel} type="button">
              취소
            </button>
          </span>
        ) : (
          <>
            <span>{value}</span>
            <button aria-label={`${label} 수정`} className="me-profile-edit-button" onClick={onEdit} type="button">
              <RiEdit2Line size={14} />
            </button>
          </>
        )}
      </dd>
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
