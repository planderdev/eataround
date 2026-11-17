"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiBookOpenLine,
  RiBuilding2Line,
  RiBusLine,
  RiCarLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiFileTextLine,
  RiGiftLine,
  RiGroupLine,
  RiHomeOfficeLine,
  RiHotelBedLine,
  RiHotelLine,
  RiLock2Line,
  RiMoreLine,
  RiQuestionLine,
  RiTaxiLine,
  RiSubtractLine,
  RiTeamLine,
  RiUserStarLine,
} from "@remixicon/react";
import { DatePicker } from "@/components/DatePicker";
import { FormField } from "@/components/FormField";
import {
  discountTiers as fallbackDiscountTiers,
  packageOptions as fallbackPackageOptions,
  packagePrograms as fallbackPackagePrograms,
  type DiscountTier,
  type PackageOption,
  type PackageOptionCategory,
  type PackageProgram,
} from "@/lib/data";
import { formatWon } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

const optionCategoryOrder: PackageOptionCategory[] = ["lodging", "meal", "transport", "extra"];
const optionCategoryMeta: Record<PackageOptionCategory, { label: string; description: string }> = {
  lodging: { label: "숙박", description: "1박 기준 인원 단위 견적" },
  meal: { label: "식사", description: "로컬 식당 또는 케이터링" },
  transport: { label: "이동", description: "단체 차량·셔틀 운영" },
  extra: { label: "기타", description: "현장 기록·운영 보조" },
};

function groupOptionsByCategory(options: PackageOption[]) {
  const grouped = new Map<PackageOptionCategory, PackageOption[]>();
  for (const option of options) {
    const category = option.category ?? "extra";
    const bucket = grouped.get(category) ?? [];
    bucket.push(option);
    grouped.set(category, bucket);
  }
  return optionCategoryOrder
    .map((category) => ({ category, items: grouped.get(category) ?? [] }))
    .filter((group) => group.items.length > 0);
}

type QuoteBuilderProps = {
  programs?: PackageProgram[];
  options?: PackageOption[];
  tiers?: DiscountTier[];
  fullscreen?: boolean;
};

const quoteSteps = ["기간 선택", "인원 입력", "프로그램 선택", "옵션 선택", "요청 정보 확인"];

const fullscreenSteps = [
  {
    label: "견적 안내",
    title: "맞춤 견적에 필요한 질문을 시작할게요.",
    description: "단체 방문 조건을 순서대로 정리하면 운영팀이 일정 가능 여부와 예상 견적을 더 정확하게 안내할 수 있습니다.",
  },
  {
    label: "방문 목적",
    title: "이번 제주 방문의 목적은 무엇인가요?",
    description: "워크숍, 교육, 리워드 여행처럼 가장 가까운 목적을 선택해 주세요.",
  },
  {
    label: "방문 희망 인원",
    title: "몇 명이 함께 방문하나요?",
    description: "확정 전이라면 예상 인원으로 입력해도 괜찮습니다.",
  },
  {
    label: "방문 희망 기간",
    title: "방문을 희망하는 기간을 알려주세요.",
    description: "운영 가능한 호스트와 공간을 기준으로 일정을 확인합니다.",
  },
  {
    label: "전체 예산",
    title: "전체 예산 범위가 있다면 알려주세요.",
    description: "항공, 숙소, 차량 포함 여부가 정해지지 않아도 현재 기준으로 입력해 주세요.",
  },
  {
    label: "항공 희망 여부",
    title: "항공권 섭외도 함께 필요할까요?",
    description: "필요 여부만 먼저 확인하고, 세부 시간대는 담당자가 다시 확인합니다.",
  },
  {
    label: "차량 희망 선택",
    title: "이동 차량은 어떤 형태가 좋을까요?",
    description: "인원과 일정에 맞춰 버스, 밴, 개별 이동 중 선택할 수 있습니다.",
  },
  {
    label: "숙소 컨디션",
    title: "선호하는 숙소 조건을 선택해 주세요.",
    description: "객실 구성이나 단체 숙소 형태를 기준으로 추천 범위를 좁힙니다.",
  },
  {
    label: "숙소 조식 이용 여부",
    title: "숙소 조식 이용을 원하시나요?",
    description: "조식 포함 여부는 숙소 추천과 식사 예산 산정에 반영됩니다.",
  },
  {
    label: "가이드 희망 여부",
    title: "현장 가이드나 운영 스태프가 필요할까요?",
    description: "대규모 이동이나 다중 프로그램 운영 시 가이드 동행을 추천합니다.",
  },
  {
    label: "강의 선택",
    title: "포함하고 싶은 강의가 있나요?",
    description: "로컬 브랜드, 식문화, 조직 워크숍에 맞는 강의를 선택해 주세요.",
  },
  {
    label: "체험 선택",
    title: "함께 진행할 체험을 선택해 주세요.",
    description: "여러 개를 조합할 수 있으며, 선택한 프로그램은 예상 견적에 반영됩니다.",
  },
  {
    label: "조식 외 식사 예산",
    title: "조식 외 식사 예산은 어느 정도가 좋을까요?",
    description: "점심, 저녁, 케이터링 구성의 기준으로 사용합니다.",
  },
  {
    label: "기타 요청사항",
    title: "추가로 필요한 내용을 남겨주세요.",
    description: "희망 지역, 행사 분위기, 참여자 특성처럼 담당자가 알아야 할 내용을 적어주세요.",
  },
  {
    label: "기관 명",
    title: "견적을 받을 기관명을 입력해 주세요.",
    description: "기업, 기관, 단체명을 기준으로 견적 요청을 접수합니다.",
  },
  {
    label: "담당자 + 연락처",
    title: "담당자 정보를 알려주세요.",
    description: "운영팀이 가능 일정과 최종 견적을 확인해 연락드립니다.",
  },
];

const purposeChoices = [
  { label: "워크숍 / 팀빌딩", description: "조직 교류와 팀 활동 중심", icon: RiTeamLine },
  { label: "교육 / 강의", description: "인사이트 세션과 현장 학습 중심", icon: RiBookOpenLine },
  { label: "리워드 여행", description: "임직원 보상과 휴식 중심", icon: RiGiftLine },
  { label: "고객 초청", description: "파트너, 고객 대상 프로그램", icon: RiUserStarLine },
  { label: "기타 단체 행사", description: "목적을 담당자와 함께 구체화", icon: RiMoreLine },
];

const flightChoices = [
  { label: "필요 없음", description: "현지 일정만 견적에 포함", icon: RiCloseLine },
  { label: "필요", description: "항공 일정까지 함께 검토", icon: RiCheckLine },
  { label: "미정", description: "가능성만 열어두고 상담", icon: RiQuestionLine },
];

const vehicleChoices = [
  { label: "45인승 전세 버스", description: "20명 이상 단체 이동에 적합", icon: RiBusLine, optionId: "transport-bus" },
  { label: "12인승 프라이빗 밴", description: "소규모 그룹 이동에 적합", icon: RiTaxiLine, optionId: "transport-van" },
  { label: "개별 이동", description: "차량 섭외 없이 일정만 구성", icon: RiCarLine },
  { label: "미정", description: "인원 확정 후 추천", icon: RiQuestionLine },
];

const lodgingChoices = [
  { label: "2인실 기준", description: "호텔 또는 스테이 2인 1실", icon: RiHotelBedLine, optionId: "lodging-standard" },
  { label: "3인실 이상", description: "예산 중심 객실 구성", icon: RiHotelLine, optionId: "lodging-standard" },
  { label: "단체 펜션", description: "공용 공간이 필요한 그룹", icon: RiHomeOfficeLine, optionId: "lodging-pension" },
  { label: "숙소 불필요", description: "당일 또는 자체 숙소 이용", icon: RiCloseLine },
];

const yesNoChoices = [
  { label: "필요", description: "견적에 포함해 검토", icon: RiCheckLine },
  { label: "필요 없음", description: "현재 견적에서 제외", icon: RiCloseLine },
  { label: "미정", description: "상담 후 확정", icon: RiQuestionLine },
];

const mealBudgetChoices = [
  { label: "1인 2만원대", description: "간단한 로컬 식사 중심", optionId: "meal-local" },
  { label: "1인 3만원대", description: "단체 식사와 예약 세팅", optionId: "meal-local" },
  { label: "1인 5만원대", description: "코스 또는 케이터링 구성", optionId: "meal-catering" },
  { label: "미정", description: "프로그램 확정 후 추천" },
];

type FullscreenChoice = {
  label: string;
  description?: string;
  icon?: RemixiconComponentType;
};

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

function FullscreenChoiceGrid({
  choices,
  value,
  onChange,
}: {
  choices: FullscreenChoice[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="quote-fullscreen-choice-grid">
      {choices.map((choice) => {
        const Icon = choice.icon;

        return (
          <button
            className="quote-fullscreen-choice"
            data-active={value === choice.label}
            key={choice.label}
            onClick={() => onChange(choice.label)}
            type="button"
          >
            {Icon ? (
              <span className="quote-fullscreen-choice-icon" aria-hidden="true">
                <Icon size={24} />
              </span>
            ) : null}
            <div>
              <strong>{choice.label}</strong>
              {choice.description ? <span>{choice.description}</span> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FullscreenProgramList({
  emptyText,
  onToggle,
  programs,
  selectedIds,
}: {
  emptyText: string;
  onToggle: (id: string) => void;
  programs: PackageProgram[];
  selectedIds: string[];
}) {
  if (!programs.length) {
    return <p className="quote-fullscreen-empty">{emptyText}</p>;
  }

  return (
    <div className="quote-fullscreen-program-list">
      {programs.map((program) => (
        <button
          className="quote-fullscreen-program"
          data-active={selectedIds.includes(program.id)}
          key={program.id}
          onClick={() => onToggle(program.id)}
          type="button"
        >
          <span>
            <strong>{program.title}</strong>
            <small>
              {program.type} · {program.duration}
            </small>
          </span>
          <b>{program.type === "강의" ? formatWon(program.basePrice) : `${formatWon(program.basePrice)} / 인`}</b>
        </button>
      ))}
    </div>
  );
}

export function QuoteBuilder({ programs = fallbackPackagePrograms, options = fallbackPackageOptions, tiers = fallbackDiscountTiers, fullscreen = false }: QuoteBuilderProps) {
  const router = useRouter();
  const initialPrograms = programs.length ? programs : fallbackPackagePrograms;
  const initialOptions = options.length ? options : fallbackPackageOptions;
  const initialTiers = tiers.length ? tiers : fallbackDiscountTiers;
  const [memberMode, setMemberMode] = useState<"company" | "personal">("company");
  const [selectedIds, setSelectedIds] = useState(initialPrograms.slice(0, 2).map((program) => program.id));
  const [selectedOptionIds, setSelectedOptionIds] = useState(["meal-local"]);
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
  const [visitPurpose, setVisitPurpose] = useState(purposeChoices[0].label);
  const [flightPreference, setFlightPreference] = useState(flightChoices[0].label);
  const [vehiclePreference, setVehiclePreference] = useState(vehicleChoices[0].label);
  const [lodgingPreference, setLodgingPreference] = useState(lodgingChoices[0].label);
  const [breakfastPreference, setBreakfastPreference] = useState(yesNoChoices[0].label);
  const [guidePreference, setGuidePreference] = useState(yesNoChoices[0].label);
  const [mealBudget, setMealBudget] = useState(mealBudgetChoices[1].label);

  const selectedPrograms = initialPrograms.filter((program) => selectedIds.includes(program.id));
  const selectedOptions = initialOptions.filter((option) => selectedOptionIds.includes(option.id));
  const lecturePrograms = initialPrograms.filter((program) => program.type === "강의");
  const experiencePrograms = initialPrograms.filter((program) => program.type !== "강의");
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

  function setOptionCategorySelection(category: PackageOptionCategory, ids: string[]) {
    const validIds = ids.filter((id) => initialOptions.some((option) => option.id === id));
    setSelectedOptionIds((current) => {
      const preserved = current.filter((id) => initialOptions.find((option) => option.id === id)?.category !== category);
      return [...preserved, ...validIds];
    });
  }

  function buildFullscreenMemo() {
    const lectureTitles = selectedPrograms.filter((program) => program.type === "강의").map((program) => program.title);
    const experienceTitles = selectedPrograms.filter((program) => program.type !== "강의").map((program) => program.title);
    return [
      `방문 목적: ${visitPurpose}`,
      `방문 희망 인원: ${people}명`,
      `방문 희망 기간: ${startDate} - ${endDate}`,
      `항공 희망 여부: ${flightPreference}`,
      `차량 희망 선택: ${vehiclePreference}`,
      `숙소 컨디션: ${lodgingPreference}`,
      `숙소 조식 이용 여부: ${breakfastPreference}`,
      `가이드 희망 여부: ${guidePreference}`,
      `강의 선택: ${lectureTitles.length ? lectureTitles.join(", ") : "선택 없음"}`,
      `체험 선택: ${experienceTitles.length ? experienceTitles.join(", ") : "선택 없음"}`,
      `조식 외 식사 예산: ${mealBudget}`,
      requestMemo.trim() ? `기타 요청사항: ${requestMemo.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submitQuote() {
    if (!canRequestQuote) {
      setMessage("기업·기관회원으로 로그인하면 단체 견적 요청을 접수할 수 있습니다.");
      return;
    }

    if (!fullscreen && (!organizationName.trim() || !contactName.trim() || !contactPhone.trim())) {
      setStep(5);
      setMessage("기관명, 담당자, 연락처를 입력해 주세요.");
      return;
    }

    if (!organizationName.trim()) {
      setStep(fullscreen ? 15 : 5);
      setMessage("기관명을 입력해 주세요.");
      return;
    }

    if (!contactName.trim() || !contactPhone.trim()) {
      setStep(fullscreen ? 16 : 5);
      setMessage("담당자와 연락처를 입력해 주세요.");
      return;
    }

    setMessage("단체 견적 요청을 접수하고 있습니다.");

    try {
      const response = await fetch(withBasePath("/api/quotes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          contactName,
          contactPhone,
          budget,
          requestMemo: fullscreen ? buildFullscreenMemo() : requestMemo,
          programIds: selectedIds,
          optionIds: selectedOptionIds,
          people,
          startDate,
          endDate,
          estimatedTotal: total,
        }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json") ? ((await response.json().catch(() => ({}))) as { message?: string }) : {};
      const isStaticPreviewMiss = response.status === 404 && !contentType.includes("application/json");

      if (response.ok || isStaticPreviewMiss) {
        router.push(`${userRoutes.b2bQuoteComplete}?people=${people}`);
        return;
      }

      if (!response.ok) {
        setMessage(result.message ?? "견적 요청 정보를 다시 확인해 주세요.");
        return;
      }
    } catch {
      setMessage("일시적으로 견적 요청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  function renderFullscreenStep() {
    if (step === 1) {
      return (
        <div className="quote-fullscreen-intro">
          <div>
            <strong>16개 질문</strong>
            <span>목적, 일정, 예산, 이동, 숙소, 프로그램, 담당자 정보</span>
          </div>
          <div>
            <strong>예상 견적</strong>
            <span>선택한 인원과 프로그램을 기준으로 즉시 계산</span>
          </div>
          <div>
            <strong>운영팀 검토</strong>
            <span>접수 후 가능 일정과 최종 견적을 안내</span>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return <FullscreenChoiceGrid choices={purposeChoices} onChange={setVisitPurpose} value={visitPurpose} />;
    }

    if (step === 3) {
      return (
        <div className="quote-fullscreen-counter" aria-label="방문 희망 인원">
          <button aria-label="인원 줄이기" onClick={() => setPeople((current) => Math.max(1, current - 1))} type="button">
            <RiSubtractLine size={22} />
          </button>
          <label>
            <span>방문 인원</span>
            <input min={1} onChange={(event) => setPeople(Math.max(1, Number(event.target.value)))} type="number" value={people} />
          </label>
          <button aria-label="인원 늘리기" onClick={() => setPeople((current) => current + 1)} type="button">
            <RiAddLine size={22} />
          </button>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="quote-fullscreen-date-fields">
          <DatePicker label="시작일" onChange={setStartDate} value={startDate} />
          <DatePicker label="종료일" min={startDate} onChange={setEndDate} value={endDate} />
        </div>
      );
    }

    if (step === 5) {
      return (
        <FormField className="quote-fullscreen-field" label="전체 예산">
          <input onChange={(event) => setBudget(event.target.value)} placeholder="예: 2,000만원 이내" value={budget} />
        </FormField>
      );
    }

    if (step === 6) {
      return <FullscreenChoiceGrid choices={flightChoices} onChange={setFlightPreference} value={flightPreference} />;
    }

    if (step === 7) {
      return (
        <FullscreenChoiceGrid
          choices={vehicleChoices}
          onChange={(value) => {
            const choice = vehicleChoices.find((item) => item.label === value);
            setVehiclePreference(value);
            setOptionCategorySelection("transport", choice?.optionId ? [choice.optionId] : []);
          }}
          value={vehiclePreference}
        />
      );
    }

    if (step === 8) {
      return (
        <FullscreenChoiceGrid
          choices={lodgingChoices}
          onChange={(value) => {
            const choice = lodgingChoices.find((item) => item.label === value);
            setLodgingPreference(value);
            setOptionCategorySelection("lodging", choice?.optionId ? [choice.optionId] : []);
          }}
          value={lodgingPreference}
        />
      );
    }

    if (step === 9) {
      return <FullscreenChoiceGrid choices={yesNoChoices} onChange={setBreakfastPreference} value={breakfastPreference} />;
    }

    if (step === 10) {
      return <FullscreenChoiceGrid choices={yesNoChoices} onChange={setGuidePreference} value={guidePreference} />;
    }

    if (step === 11) {
      return <FullscreenProgramList emptyText="선택 가능한 강의가 없습니다." onToggle={toggleProgram} programs={lecturePrograms} selectedIds={selectedIds} />;
    }

    if (step === 12) {
      return <FullscreenProgramList emptyText="선택 가능한 체험이 없습니다." onToggle={toggleProgram} programs={experiencePrograms} selectedIds={selectedIds} />;
    }

    if (step === 13) {
      return (
        <FullscreenChoiceGrid
          choices={mealBudgetChoices}
          onChange={(value) => {
            const choice = mealBudgetChoices.find((item) => item.label === value);
            setMealBudget(value);
            setOptionCategorySelection("meal", choice?.optionId ? [choice.optionId] : []);
          }}
          value={mealBudget}
        />
      );
    }

    if (step === 14) {
      return (
        <FormField className="quote-fullscreen-field" label="기타 요청사항">
          <textarea
            onChange={(event) => setRequestMemo(event.target.value)}
            placeholder="희망 지역, 행사 분위기, 참여자 특성, 피하고 싶은 조건 등을 남겨주세요."
            value={requestMemo}
          />
        </FormField>
      );
    }

    if (step === 15) {
      return (
        <FormField className="quote-fullscreen-field" label="기관 명" required>
          <input onChange={(event) => setOrganizationName(event.target.value)} placeholder="기관 또는 회사명을 입력하세요" value={organizationName} />
        </FormField>
      );
    }

    return (
      <div className="quote-fullscreen-final">
        <div className="quote-fullscreen-contact-grid">
          <FormField className="quote-fullscreen-field" label="담당자" required>
            <input onChange={(event) => setContactName(event.target.value)} placeholder="담당자명" value={contactName} />
          </FormField>
          <FormField className="quote-fullscreen-field" label="연락처" required>
            <input onChange={(event) => setContactPhone(event.target.value)} placeholder="010-0000-0000" value={contactPhone} />
          </FormField>
        </div>
        <dl className="quote-fullscreen-review">
          <div>
            <dt>기관</dt>
            <dd>{organizationName || "미입력"}</dd>
          </div>
          <div>
            <dt>인원 / 기간</dt>
            <dd>
              {people}명 · {startDate} - {endDate}
            </dd>
          </div>
          <div>
            <dt>프로그램</dt>
            <dd>{selectedPrograms.length}개 선택</dd>
          </div>
          <div>
            <dt>예상 합계</dt>
            <dd>{formatWon(total)}</dd>
          </div>
        </dl>
      </div>
    );
  }

  if (fullscreen) {
    const activeStep = fullscreenSteps[step - 1] ?? fullscreenSteps[0];
    const isFirstStep = step === 1;
    const isLastStep = step === fullscreenSteps.length;
    const progress = Math.round((step / fullscreenSteps.length) * 100);

    return (
      <div className="quote-fullscreen">
        <aside className="quote-fullscreen-rail" aria-label="견적 질문 흐름">
          <Link aria-label="B2B 홈으로" className="quote-fullscreen-mark" href={userRoutes.b2b}>
            ea
          </Link>
          <ol className="quote-fullscreen-step-map">
            {fullscreenSteps.map((item, index) => {
              const stepNumber = index + 1;
              return (
                <li data-active={step === stepNumber} data-complete={step > stepNumber} key={item.label}>
                  <button aria-current={step === stepNumber ? "step" : undefined} onClick={() => setStep(stepNumber)} title={item.label} type="button">
                    <span>{stepNumber}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="quote-fullscreen-stage" aria-labelledby="quote-fullscreen-title">
          <header className="quote-fullscreen-topbar">
            <button aria-label="이전 질문" className="quote-fullscreen-icon-button" disabled={isFirstStep} onClick={() => setStep((current) => Math.max(1, current - 1))} type="button">
              <RiArrowLeftLine size={22} />
            </button>
            <span>
              {step.toString().padStart(2, "0")} / {fullscreenSteps.length.toString().padStart(2, "0")} · {activeStep.label}
            </span>
            <Link aria-label="견적 요청 나가기" className="quote-fullscreen-icon-button" href={userRoutes.b2b}>
              <RiCloseLine size={22} />
            </Link>
          </header>

          <div className="quote-fullscreen-body">
            <div className="quote-fullscreen-copy">
              <span className="eyebrow">B2B Quote</span>
              <h1 id="quote-fullscreen-title">{activeStep.title}</h1>
              <p>{activeStep.description}</p>
            </div>
            <div className="quote-fullscreen-panel">{renderFullscreenStep()}</div>
          </div>

          <footer className="quote-fullscreen-footer">
            <div className="quote-fullscreen-progress" aria-label={`진행률 ${progress}%`}>
              <span>{activeStep.label}</span>
              <b>
                <i style={{ width: `${progress}%` }} />
              </b>
            </div>
            <div className="quote-fullscreen-actions">
              <button className="secondary-button" disabled={isFirstStep} onClick={() => setStep((current) => Math.max(1, current - 1))} type="button">
                이전
              </button>
              <button className="primary-button" onClick={isLastStep ? submitQuote : () => setStep((current) => Math.min(fullscreenSteps.length, current + 1))} type="button">
                {isLastStep ? "견적 요청하기" : "다음"}
              </button>
            </div>
          </footer>
          {message ? (
            <p aria-live="polite" className="form-message quote-fullscreen-message">
              <RiCheckboxCircleLine size={16} />
              {message}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className="quote-builder">
      <section className="quote-form" aria-label="패키지 견적 요청">
        <div className="quote-login-note">
          {canRequestQuote ? <RiBuilding2Line size={20} /> : <RiLock2Line size={20} />}
          <span>
            <strong>기업·기관회원 전용 단체 견적</strong>
            <small>
              {canRequestQuote
                ? "기간·인원·프로그램을 선택하면 운영팀이 가능 여부와 최종 견적을 안내합니다."
                : "일반회원은 체험 예약과 상담 요청을 이용할 수 있으며, 단체 견적 접수는 기업·기관회원에게 제공됩니다."}
            </small>
          </span>
        </div>

        <div className="segmented quote-access-toggle" role="radiogroup" aria-label="견적 요청 권한">
          <button data-active={memberMode === "company"} onClick={() => setMemberMode("company")} type="button">
            기업·기관회원
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
            <FormField label={<><RiGroupLine size={18} />인원수</>}>
              <input min={1} onChange={(event) => setPeople(Number(event.target.value))} type="number" value={people} />
            </FormField>
            {people >= 50 ? <p className="quote-step-note">50명 이상은 운영 조건 확인 후 별도 견적으로 안내합니다.</p> : null}
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
            <p className="quote-step-note quote-step-note--info">숙박·식사·이동 등 필요한 옵션만 선택하세요. 선택한 옵션은 견적에 즉시 반영됩니다.</p>
            <div className="quote-option-groups">
              {groupOptionsByCategory(initialOptions).map((group) => {
                const meta = optionCategoryMeta[group.category];
                return (
                  <section className="quote-option-group" key={group.category} data-category={group.category}>
                    <header>
                      <strong>{meta.label}</strong>
                      <small>{meta.description}</small>
                    </header>
                    <div className="program-list">
                      {group.items.map((option) => (
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
                );
              })}
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="quote-step-panel" aria-label="요청 정보 확인">
            <div className="form-grid">
              <FormField label={<><RiBuilding2Line size={18} />기관명</>}>
                <input onChange={(event) => setOrganizationName(event.target.value)} placeholder="기관 또는 회사명을 입력하세요" value={organizationName} />
              </FormField>
              <FormField label={<><RiGroupLine size={18} />담당자</>}>
                <input onChange={(event) => setContactName(event.target.value)} placeholder="담당자명" value={contactName} />
              </FormField>
            </div>

            <div className="form-grid">
              <FormField label={<><RiFileTextLine size={18} />연락처</>}>
                <input onChange={(event) => setContactPhone(event.target.value)} placeholder="010-0000-0000" value={contactPhone} />
              </FormField>
              <FormField label={<><RiFileTextLine size={18} />예산</>}>
                <input onChange={(event) => setBudget(event.target.value)} placeholder="예: 2,000만원 이내" value={budget} />
              </FormField>
            </div>

            <FormField label={<><RiFileTextLine size={18} />요청사항</>}>
              <textarea
                onChange={(event) => setRequestMemo(event.target.value)}
                placeholder="희망 지역, 행사 목적, 식사 방식, 이동 조건 등 필요한 내용을 남겨주세요."
                value={requestMemo}
              />
            </FormField>
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

      <div className="quote-summary-column">
        <aside className="quote-summary">
          <span className="eyebrow">견적 요약</span>
          <h2>단체 견적 미리보기</h2>
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
                <dd>별도 상담 후 안내</dd>
              </div>
            ) : null}
            <div className="summary-total">
              <dt>예상 합계</dt>
              <dd>{formatWon(total)}</dd>
            </div>
          </dl>
          <div className="quote-discount-table" aria-label="인원 구간별 할인율">
            <strong>인원별 할인 기준</strong>
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
            <span>운영팀 검토</span>
            <span>최종 견적 안내</span>
          </div>
          <button className="primary-button full" disabled={!canRequestQuote} onClick={submitQuote} type="button">
            <RiFileTextLine size={18} />
            {canRequestQuote ? "단체 견적 요청하기" : "기업·기관회원 전용"}
          </button>
          {message ? (
            <p className="form-message">
              <RiCheckboxCircleLine size={16} />
              {message}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
