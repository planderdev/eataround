"use client";

import { useMemo, useState } from "react";
import { RiArchiveLine, RiSave3Line } from "@remixicon/react";
import { notifyAdminToast } from "@/lib/admin/toast";
import {
  type DiscountTier,
  type PackageOption,
  type PackageOptionCategory,
  type PackageProgram,
} from "@/lib/data";
import { formatWon } from "@/lib/format";
import { withBasePath } from "@/lib/paths";

const optionCategoryOrder: PackageOptionCategory[] = ["lodging", "meal", "transport", "extra"];
const optionCategoryLabel: Record<PackageOptionCategory, string> = {
  lodging: "숙박",
  meal: "식사",
  transport: "이동",
  extra: "기타",
};

type AdminPackageFormProps = {
  programs: PackageProgram[];
  options: PackageOption[];
  discountTiers: DiscountTier[];
};

export function AdminPackageForm({ programs, options, discountTiers }: AdminPackageFormProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [memo, setMemo] = useState("");
  const [previewPeople, setPreviewPeople] = useState(20);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(() => programs.slice(0, 2).map((program) => program.id));
  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => options.filter((option) => option.category === "meal").slice(0, 1).map((option) => option.id));
  const [tierRates, setTierRates] = useState<Record<string, number>>(() =>
    Object.fromEntries(discountTiers.map((tier) => [tier.label, Math.round(tier.rate * 100)])),
  );
  const [submitting, setSubmitting] = useState(false);

  const groupedOptions = useMemo(() => {
    const grouped = new Map<PackageOptionCategory, PackageOption[]>();
    for (const option of options) {
      const category = option.category ?? "extra";
      grouped.set(category, [...(grouped.get(category) ?? []), option]);
    }
    return optionCategoryOrder
      .map((category) => ({ category, items: grouped.get(category) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [options]);

  const selectedProgramObjects = useMemo(() => programs.filter((program) => selectedPrograms.includes(program.id)), [programs, selectedPrograms]);
  const selectedOptionObjects = useMemo(() => options.filter((option) => selectedOptions.includes(option.id)), [options, selectedOptions]);

  const tier = useMemo(() => {
    const sorted = [...discountTiers].sort((a, b) => b.min - a.min);
    return sorted.find((item) => previewPeople >= item.min) ?? sorted.at(-1) ?? null;
  }, [discountTiers, previewPeople]);

  const subtotal = useMemo(() => {
    const programTotal = selectedProgramObjects.reduce((sum, program) => sum + (program.type === "강의" ? program.basePrice : program.basePrice * previewPeople), 0);
    const optionTotal = selectedOptionObjects.reduce((sum, option) => sum + (option.priceType === "flat" ? option.price : option.price * previewPeople), 0);
    return programTotal + optionTotal;
  }, [previewPeople, selectedOptionObjects, selectedProgramObjects]);

  const previewRate = tier ? (tierRates[tier.label] ?? Math.round(tier.rate * 100)) / 100 : 0;
  const previewTotal = Math.round(subtotal * (1 - previewRate));

  function toggleProgram(id: string) {
    setSelectedPrograms((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleOption(id: string) {
    setSelectedOptions((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      notifyAdminToast("패키지명을 입력해 주세요.", "error");
      return;
    }
    if (!selectedPrograms.length) {
      notifyAdminToast("프로그램을 1개 이상 선택해 주세요.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(withBasePath("/api/admin/packages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code: code || title.toLowerCase().replace(/\s+/g, "-"),
          memo,
          programIds: selectedPrograms,
          optionIds: selectedOptions,
          discountTiers: discountTiers.map((tier) => ({
            label: tier.label,
            min: tier.min,
            rate: (tierRates[tier.label] ?? Math.round(tier.rate * 100)) / 100,
          })),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? "패키지를 저장했습니다.", "success");
        return;
      }
      notifyAdminToast(data.message ?? "패키지 저장에 실패했습니다.", "error");
    } catch {
      notifyAdminToast("네트워크 오류로 저장하지 못했습니다.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-package-form" data-admin-own-action onSubmit={submit}>
      <section className="admin-package-form-section">
        <header>
          <h3>기본 정보</h3>
          <small>패키지명과 코드는 견적 요청 화면에 노출됩니다.</small>
        </header>
        <div className="admin-package-basic-grid">
          <label>
            <span>패키지명</span>
            <input onChange={(event) => setTitle(event.target.value)} placeholder="예: 기업·기관 1박 2일 워크숍" required value={title} />
          </label>
          <label>
            <span>코드</span>
            <input onChange={(event) => setCode(event.target.value)} placeholder="자동 생성" value={code} />
          </label>
        </div>
        <label className="admin-package-memo">
          <span>운영 메모</span>
          <textarea
            onChange={(event) => setMemo(event.target.value)}
            placeholder="견적 검토 시 참고할 내부 메모"
            rows={2}
            value={memo}
          />
        </label>
      </section>

      <section className="admin-package-form-section">
        <header>
          <h3>프로그램 선택</h3>
          <small>{selectedPrograms.length}개 선택됨</small>
        </header>
        <div className="admin-package-program-grid">
          {programs.map((program) => (
            <button
              className="admin-package-program-card"
              data-active={selectedPrograms.includes(program.id)}
              key={program.id}
              onClick={() => toggleProgram(program.id)}
              type="button"
            >
              <span>{program.duration}</span>
              <strong>{program.title}</strong>
              <small>{program.type} 프로그램</small>
              <b>{formatWon(program.basePrice)}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-package-form-section">
        <header>
          <h3>옵션</h3>
          <small>숙박·식사·이동·기타 카테고리별로 분리되어 견적 요청에 노출됩니다.</small>
        </header>
        <div className="admin-package-option-groups">
          {groupedOptions.map((group) => (
            <section className="admin-package-option-group" data-category={group.category} key={group.category}>
              <header>
                <strong>{optionCategoryLabel[group.category]}</strong>
              </header>
              <div className="admin-package-option-list">
                {group.items.map((option) => (
                  <label key={option.id} data-active={selectedOptions.includes(option.id)}>
                    <input checked={selectedOptions.includes(option.id)} onChange={() => toggleOption(option.id)} type="checkbox" />
                    <span>
                      <b>{option.title}</b>
                      <small>{option.description}</small>
                    </span>
                    <em>{option.priceType === "flat" ? formatWon(option.price) : `${formatWon(option.price)} / 인`}</em>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="admin-package-form-section">
        <header>
          <h3>인원 구간 할인</h3>
          <small>인원에 따른 단체 할인율을 조정할 수 있습니다.</small>
        </header>
        <div className="admin-package-tier-grid">
          {discountTiers.map((tier) => (
            <label key={tier.label}>
              <span>{tier.label}</span>
              <div>
                <input
                  inputMode="numeric"
                  onChange={(event) => {
                    const raw = Number(event.target.value.replace(/[^0-9]/g, ""));
                    setTierRates((current) => ({ ...current, [tier.label]: Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0)) }));
                  }}
                  value={tierRates[tier.label] ?? Math.round(tier.rate * 100)}
                />
                <i>%</i>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="admin-package-form-section admin-package-preview-section">
        <header>
          <h3>견적 미리보기</h3>
          <small>현재 선택값으로 예상 견적을 즉시 계산합니다.</small>
        </header>
        <div className="admin-package-preview-controls">
          <label>
            <span>예상 인원</span>
            <input
              inputMode="numeric"
              min={1}
              onChange={(event) => setPreviewPeople(Math.max(1, Number(event.target.value.replace(/[^0-9]/g, "")) || 1))}
              type="number"
              value={previewPeople}
            />
          </label>
        </div>
        <dl className="admin-package-preview-summary">
          <div>
            <dt>프로그램</dt>
            <dd>{selectedProgramObjects.length}개 · {selectedProgramObjects.map((p) => p.title).join(", ") || "선택 없음"}</dd>
          </div>
          <div>
            <dt>옵션</dt>
            <dd>{selectedOptionObjects.length ? selectedOptionObjects.map((o) => o.title).join(", ") : "선택 없음"}</dd>
          </div>
          <div>
            <dt>적용 할인</dt>
            <dd>{tier?.label ?? "할인 없음"} {previewRate > 0 ? `-${Math.round(previewRate * 100)}%` : ""}</dd>
          </div>
          <div className="admin-package-preview-total">
            <dt>예상 합계</dt>
            <dd>{formatWon(previewTotal)}</dd>
          </div>
        </dl>
      </section>

      <div className="admin-package-form-actions">
        <button className="admin-action-button ghost" type="button">
          <RiArchiveLine size={14} />
          임시저장
        </button>
        <button className="admin-action-button primary" disabled={submitting} type="submit">
          <RiSave3Line size={14} />
          {submitting ? "저장 중..." : "패키지 저장"}
        </button>
      </div>
    </form>
  );
}
