"use client";

import { useMemo, useState } from "react";
import {
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiGroupLine,
  RiLock2Line,
} from "@remixicon/react";
import { DatePicker } from "@/components/DatePicker";
import {
  discountTiers as fallbackDiscountTiers,
  packageOptions as fallbackPackageOptions,
  packagePrograms as fallbackPackagePrograms,
  type DiscountTier,
  type PackageOption,
  type PackageProgram,
} from "@/lib/data";
import { formatWon } from "@/lib/format";
import { withBasePath } from "@/lib/paths";

type QuoteBuilderProps = {
  programs?: PackageProgram[];
  options?: PackageOption[];
  tiers?: DiscountTier[];
};

const quoteSteps = ["기간 선택", "인원 입력", "프로그램 선택", "옵션 선택", "요청 정보 확인"];

type DiscountRow = {
  label: string;
  rate: string;
  min: number;
  max?: number;
};

const discountRows: DiscountRow[] = [
  { label: "1~9명", rate: "정상", min: 1, max: 9 },
  { label: "10~19명", rate: "5%", min: 10, max: 19 },
  { label: "20~29명", rate: "10%", min: 20, max: 29 },
  { label: "30~49명", rate: "15%", min: 30, max: 49 },
  { label: "50+명", rate: "별도 문의", min: 50 },
];

function isDiscountRowActive(row: DiscountRow, people: number) {
  return people >= row.min && (row.max === undefined || people <= row.max);
}

export function QuoteBuilder({ programs = fallbackPackagePrograms, options = fallbackPackageOptions, tiers = fallbackDiscountTiers }: QuoteBuilderProps) {
  const initialPrograms = programs.length ? programs : fallbackPackagePrograms;
  const initialOptions = options.length ? options : fallbackPackageOptions;
  const initialTiers = tiers.length ? tiers : fallbackDiscountTiers;
  const [memberMode, setMemberMode] = useState<"company" | "personal">("company");
  const [selectedIds, setSelectedIds] = useState(initialPrograms.slice(0, 2).map((program) => program.id));
  const [selectedOptionIds, setSelectedOptionIds] = useState(["meal"]);
  const [people, setPeople] = useState(20);
  const [startDate, setStartDate] = useState("2026-06-12");
  const [endDate, setEndDate] = useState("2026-06-13");
  const [organizationName, setOrganizationName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [budget, setBudget] = useState("2,000만원 이내");
  const [requestMemo, setRequestMemo] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);

  const selectedPrograms = initialPrograms.filter((program) => selectedIds.includes(program.id));
  const selectedOptions = initialOptions.filter((option) => selectedOptionIds.includes(option.id));
  const tier = initialTiers.find((item) => people >= item.min) ?? initialTiers.at(-1)!;
  const programSubtotal = selectedPrograms.reduce((sum, program) => {
    if (program.type === "강의") return sum + program.basePrice;
    return sum + program.basePrice * people;
  }, 0);
  const optionSubtotal = selectedOptions.reduce((sum, option) => {
    if (option.priceType === "flat") return sum + option.price;
    return sum + option.price * people;
  }, 0);
  const subtotal = programSubtotal + optionSubtotal;
  const total = useMemo(() => Math.round(subtotal * (1 - tier.rate)), [subtotal, tier.rate]);
  const canRequestQuote = memberMode === "company";

  function toggleProgram(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.length === 1 ? current : current.filter((item) => item !== id);
      return [...current, id];
    });
  }

  function toggleOption(id: string) {
    setSelectedOptionIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function submitQuote() {
    if (!canRequestQuote) {
      setMessage("기업·기관 회원으로 전환하면 견적 요청을 보낼 수 있습니다.");
      return;
    }

    setMessage("견적 요청을 접수하는 중입니다.");
    const response = await fetch(withBasePath("/api/quotes"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberType: memberMode,
        organizationName,
        contactName,
        contactPhone,
        budget,
        requestMemo,
        programIds: selectedIds,
        optionIds: selectedOptionIds,
        people,
        startDate,
        endDate,
        estimatedTotal: total,
      }),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "견적 요청이 접수되었습니다.");
  }

  return (
    <div className="quote-builder">
      <section className="quote-form" aria-label="패키지 견적 요청">
        <div className="quote-login-note">
          {canRequestQuote ? <RiBuilding2Line size={20} /> : <RiLock2Line size={20} />}
          <span>
            <strong>기관 회원 전용 견적</strong>
            <small>{canRequestQuote ? "일정과 예산을 남겨주시면 담당자가 맞춤 프로그램을 안내합니다." : "일반회원은 상담 요청까지만 가능하고 견적 요청은 제한됩니다."}</small>
          </span>
        </div>

        <div className="quote-access-toggle" role="radiogroup" aria-label="견적 요청 권한">
          <button data-active={memberMode === "company"} onClick={() => setMemberMode("company")} type="button">
            기업·기관 로그인
          </button>
          <button data-active={memberMode === "personal"} onClick={() => setMemberMode("personal")} type="button">
            일반회원 보기
          </button>
        </div>

        <ol className="quote-step-indicator" aria-label="견적 요청 단계">
          {quoteSteps.map((label, index) => {
            const stepNumber = index + 1;
            return (
              <li data-active={step === stepNumber} data-complete={step > stepNumber} key={label}>
                <button onClick={() => setStep(stepNumber)} type="button">
                  <span>{stepNumber}</span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        {step === 1 ? (
          <section className="quote-step-panel" aria-label="기간 선택">
            <strong className="program-list-title">기간 선택</strong>
            <div className="date-fields">
              <DatePicker label="시작일" onChange={setStartDate} value={startDate} />
              <DatePicker label="종료일" min={startDate} onChange={setEndDate} value={endDate} />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="quote-step-panel" aria-label="인원 입력">
            <label className="field">
              <span>
                <RiGroupLine size={18} />
                인원수
              </span>
              <input min={1} onChange={(event) => setPeople(Number(event.target.value))} type="number" value={people} />
            </label>
            {people >= 50 ? <p className="quote-step-note">50인 이상은 담당자 별도 상담으로 최종 견적을 안내합니다.</p> : null}
          </section>
        ) : null}

        {step === 3 ? (
          <section className="quote-step-panel" aria-label="프로그램 선택">
            <strong className="program-list-title">프로그램 선택</strong>
            <div className="program-list">
              {initialPrograms.map((program) => (
                <button
                  className="program-option"
                  data-active={selectedIds.includes(program.id)}
                  key={program.id}
                  onClick={() => toggleProgram(program.id)}
                  type="button"
                >
                  <span>
                    <b>{program.title}</b>
                    <small>
                      {program.type} · {program.duration}
                    </small>
                  </span>
                  <strong>{program.type === "강의" ? formatWon(program.basePrice) : `${formatWon(program.basePrice)} / 인`}</strong>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="quote-step-panel" aria-label="옵션 선택">
            <strong className="program-list-title">옵션 선택</strong>
            <div className="program-list">
              {initialOptions.map((option) => (
                <button
                  className="program-option"
                  data-active={selectedOptionIds.includes(option.id)}
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  type="button"
                >
                  <span>
                    <b>{option.title}</b>
                    <small>{option.description}</small>
                  </span>
                  <strong>{option.priceType === "flat" ? formatWon(option.price) : `${formatWon(option.price)} / 인`}</strong>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="quote-step-panel" aria-label="요청 정보 확인">
            <div className="form-grid">
              <label className="field">
                <span>
                  <RiBuilding2Line size={18} />
                  기관명
                </span>
                <input onChange={(event) => setOrganizationName(event.target.value)} placeholder="기관·기업명을 입력하세요" value={organizationName} />
              </label>
              <label className="field">
                <span>
                  <RiGroupLine size={18} />
                  담당자
                </span>
                <input onChange={(event) => setContactName(event.target.value)} placeholder="담당자명" value={contactName} />
              </label>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>
                  <RiFileTextLine size={18} />
                  연락처
                </span>
                <input onChange={(event) => setContactPhone(event.target.value)} placeholder="010-0000-0000" value={contactPhone} />
              </label>
              <label className="field">
                <span>
                  <RiFileTextLine size={18} />
                  예산
                </span>
                <input onChange={(event) => setBudget(event.target.value)} placeholder="예: 2,000만원 이내" value={budget} />
              </label>
            </div>

            <label className="field">
              <span>
                <RiFileTextLine size={18} />
                요청사항
              </span>
              <textarea
                onChange={(event) => setRequestMemo(event.target.value)}
                placeholder="희망 지역, 식사 방식, 이동 조건 등 필요한 내용을 남겨주세요."
                value={requestMemo}
              />
            </label>
          </section>
        ) : null}

        <div className="quote-step-actions">
          <button className="secondary-button" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))} type="button">
            이전
          </button>
          <button className="primary-button" disabled={step === quoteSteps.length} onClick={() => setStep((current) => Math.min(quoteSteps.length, current + 1))} type="button">
            다음
          </button>
        </div>
      </section>

      <aside className="quote-summary">
        <span className="eyebrow">견적 미리보기</span>
        <h2>예상 견적서</h2>
        <dl>
          <div>
            <dt>기간</dt>
            <dd>
              {startDate} - {endDate}
            </dd>
          </div>
          <div>
            <dt>인원</dt>
            <dd>{people}명</dd>
          </div>
          <div>
            <dt>프로그램</dt>
            <dd>{selectedPrograms.length}개</dd>
          </div>
          <div>
            <dt>추가 옵션</dt>
            <dd>{selectedOptions.length ? selectedOptions.map((option) => option.title).join(", ") : "선택 없음"}</dd>
          </div>
          <div>
            <dt>할인</dt>
            <dd>
              {tier.label} {tier.rate ? `-${Math.round(tier.rate * 100)}%` : ""}
            </dd>
          </div>
          {people >= 50 ? (
            <div>
              <dt>안내</dt>
              <dd>담당자 별도 상담</dd>
            </div>
          ) : null}
          <div className="summary-total">
            <dt>예상 합계</dt>
            <dd>{formatWon(total)}</dd>
          </div>
        </dl>
        <div className="quote-discount-table" aria-label="인원 구간별 할인율">
          <strong>인원 구간별 할인율</strong>
          <div>
            {discountRows.map((row) => (
              <span data-active={isDiscountRowActive(row, people)} key={row.label}>
                <b>{row.label}</b>
                <em>{row.rate}</em>
              </span>
            ))}
          </div>
        </div>
        <div className="quote-process" aria-label="견적 진행 단계">
          <span data-active="true">요청 접수</span>
          <span>관리자 검토</span>
          <span>최종 견적서 발송</span>
        </div>
        <button className="primary-button full" disabled={!canRequestQuote} onClick={submitQuote} type="button">
          <RiFileTextLine size={18} />
          {canRequestQuote ? "견적 요청하기" : "기업·기관 회원 전용"}
        </button>
        {message ? (
          <p className="form-message">
            <RiCheckboxCircleLine size={16} />
            {message}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
