"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { DatePicker } from "@/components/DatePicker";
import {
  experienceCategories,
  pricePresetOptions,
  regionGroups,
  reservationTypeOptions,
} from "@/lib/experience-filters";
import { withBasePath } from "@/lib/paths";

type ScheduleRow = {
  id: string;
  date: string;
  timeLabel: string;
  capacity: string;
  maxTeams: string;
  teamCapacity: string;
  price: string;
  reservationType: typeof reservationTypeOptions[number]["value"];
};

function makeScheduleRow(seed: Partial<ScheduleRow> = {}): ScheduleRow {
  return {
    id: `s-${Math.random().toString(36).slice(2, 9)}`,
    date: "",
    timeLabel: "",
    capacity: "",
    maxTeams: "",
    teamCapacity: "",
    price: "",
    reservationType: "approval",
    ...seed,
  };
}

type SubmitState = {
  tone: "idle" | "success" | "error";
  message: string;
};

const productTabs = [
  { id: "basic", label: "기본 정보" },
  { id: "media", label: "미디어" },
  { id: "content", label: "상세 콘텐츠" },
  { id: "booking", label: "가격·예약" },
  { id: "schedules", label: "회차·재고" },
  { id: "relations", label: "연관 설정" },
] as const;

const regionFormOptions = regionGroups.flatMap((group) => [
  { value: group.value, label: `${group.label} 전체`, group: group.label },
  ...group.areas.map((area) => ({ value: area, label: area, group: group.label })),
]);

const categoryFormOptions = experienceCategories.filter((option) => option.value !== "");

type ProductTab = (typeof productTabs)[number]["id"];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProductForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [pricePreset, setPricePreset] = useState("");
  const [reservationType, setReservationType] = useState<typeof reservationTypeOptions[number]["value"]>("approval");
  const [schedules, setSchedules] = useState<ScheduleRow[]>(() => [makeScheduleRow()]);

  function updateSchedule(id: string, patch: Partial<ScheduleRow>) {
    setSchedules((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addScheduleRow() {
    setSchedules((current) => [...current, makeScheduleRow()]);
  }

  function removeScheduleRow(id: string) {
    setSchedules((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  }
  const [startDate, setStartDate] = useState("2026-05-23");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [activeTab, setActiveTab] = useState<ProductTab>("basic");
  const [imageUrl, setImageUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ tone: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitState({ tone: "idle", message: "" });

    const productSlug = slug || slugify(title);

    try {
      const response = await fetch(withBasePath("/api/admin/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: productSlug,
          title,
          region,
          category,
          price: Number(price),
          pricePreset,
          reservationType,
          duration: `${startDate} - ${endDate}`,
          badge: "신규",
          imageUrl,
          summary,
          description,
          tags,
          schedules: schedules
            .filter((row) => row.date && row.timeLabel)
            .map((row) => ({
              date: row.date,
              label: row.timeLabel,
              capacity: Number(row.capacity) || 0,
              maxTeams: Number(row.maxTeams) || 1,
              teamCapacity: Number(row.teamCapacity) || 0,
              price: Number(row.price) || Number(price) || 0,
              reservationType: row.reservationType,
            })),
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmitState({ tone: "error", message: data.message ?? "상품 등록 정보를 확인해주세요." });
        return;
      }

      setSubmitState({ tone: "success", message: data.message ?? "상품 등록 요청이 완료되었습니다." });
      setTitle("");
      setSlug("");
      setRegion("");
      setCategory("");
      setPrice("");
      setImageUrl("");
      setSummary("");
      setDescription("");
      setTags([]);
      router.refresh();
    } catch {
      setSubmitState({ tone: "error", message: "상품 등록 요청 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-inline-form admin-product-form" id="admin-product-form" onSubmit={handleSubmit}>
      <div className="admin-product-form-tabs" role="tablist" aria-label="상품 등록 단계">
        {productTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            data-active={activeTab === tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-product-basic-fields" data-active={activeTab === "basic"}>
        <input aria-label="상품명" placeholder="상품명" required value={title} onChange={(event) => setTitle(event.target.value)} />
        <input
          aria-label="슬러그"
          placeholder="URL 슬러그"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          onBlur={() => setSlug((current) => current || slugify(title))}
        />
        <select aria-label="지역" required value={region} onChange={(event) => setRegion(event.target.value)}>
          <option value="" disabled>
            지역 선택
          </option>
          {regionGroups.map((group) => (
            <optgroup key={group.value} label={group.label}>
              <option value={group.value}>{group.label} 전체</option>
              {group.areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select aria-label="카테고리" required value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="" disabled>
            카테고리 선택
          </option>
          {categoryFormOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          aria-label="가격"
          inputMode="numeric"
          placeholder="기본 가격"
          required
          value={price}
          onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ""))}
        />
        <DatePicker defaultValue={startDate} label="판매 시작일" name="productStartDate" onChange={setStartDate} />
        <DatePicker defaultValue={endDate} label="판매 종료일" name="productEndDate" onChange={setEndDate} />
      </div>
      <div className="admin-product-form-sections">
        <section data-active={activeTab === "media"}>
          <span>미디어</span>
          <input aria-label="대표 이미지 URL" onChange={(event) => setImageUrl(event.target.value)} placeholder="대표 이미지 주소 (https://...)" value={imageUrl} />
          <small>이미지 파일 업로드와 상품별 갤러리는 저장소가 없어 아직 연결되지 않았습니다. 대표 이미지는 주소(URL)로 등록합니다.</small>
        </section>

        <section data-active={activeTab === "content"}>
          <span>상세 콘텐츠</span>
          <input aria-label="한 줄 요약" maxLength={500} onChange={(event) => setSummary(event.target.value)} placeholder="목록 카드에 보이는 한 줄 요약" value={summary} />
          <textarea aria-label="상품 소개" onChange={(event) => setDescription(event.target.value)} placeholder="상품 소개를 입력하세요." value={description} />
          <small>추천 대상·일정·포함/불포함·FAQ 같은 항목별 상세 콘텐츠 편집은 아직 연결되지 않았습니다.</small>
        </section>

        <section data-active={activeTab === "booking"}>
          <span>가격·예약</span>
          <div className="admin-radio-grid">
            {reservationTypeOptions.map((item) => (
              <label key={item.value}>
                <input
                  checked={reservationType === item.value}
                  name="bookingMode"
                  onChange={() => setReservationType(item.value)}
                  type="radio"
                />
                {item.label}
              </label>
            ))}
          </div>
          <div className="admin-chip-options" role="group" aria-label="가격 구간 (리스트 필터 노출용)">
            {pricePresetOptions.map((item) => (
              <label key={item.value}>
                <input
                  checked={pricePreset === item.value}
                  name="pricePreset"
                  onChange={() => setPricePreset((current) => (current === item.value ? "" : item.value))}
                  type="checkbox"
                />
                {item.label}
              </label>
            ))}
          </div>
        </section>

        <section data-active={activeTab === "schedules"}>
          <span>회차·재고</span>
          <div className="admin-schedule-rows">
            {schedules.map((row, index) => (
              <div className="admin-schedule-row" key={row.id}>
                <header>
                  <strong>회차 {index + 1}</strong>
                  <button
                    aria-label={`회차 ${index + 1} 삭제`}
                    className="admin-icon-button"
                    disabled={schedules.length === 1}
                    onClick={() => removeScheduleRow(row.id)}
                    type="button"
                  >
                    <RiDeleteBinLine size={14} />
                  </button>
                </header>
                <div className="admin-schedule-row-grid">
                  <DatePicker
                    label="운영일"
                    name={`schedule-date-${row.id}`}
                    onChange={(value) => updateSchedule(row.id, { date: value })}
                    value={row.date}
                  />
                  <label>
                    <span>회차 시간</span>
                    <input
                      onChange={(event) => updateSchedule(row.id, { timeLabel: event.target.value })}
                      placeholder="오전 10:30"
                      value={row.timeLabel}
                    />
                  </label>
                  <label>
                    <span>총 좌석</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) => updateSchedule(row.id, { capacity: event.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="12"
                      value={row.capacity}
                    />
                  </label>
                  <label>
                    <span>최대 팀</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) => updateSchedule(row.id, { maxTeams: event.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="3"
                      value={row.maxTeams}
                    />
                  </label>
                  <label>
                    <span>팀당 인원</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) => updateSchedule(row.id, { teamCapacity: event.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="4"
                      value={row.teamCapacity}
                    />
                  </label>
                  <label>
                    <span>회차 가격</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) => updateSchedule(row.id, { price: event.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="68000"
                      value={row.price}
                    />
                  </label>
                  <label>
                    <span>예약 유형</span>
                    <select
                      onChange={(event) => updateSchedule(row.id, { reservationType: event.target.value as ScheduleRow["reservationType"] })}
                      value={row.reservationType}
                    >
                      {reservationTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
            <button className="admin-schedule-add" onClick={addScheduleRow} type="button">
              <RiAddLine size={16} />
              회차 추가
            </button>
          </div>
        </section>

        <section data-active={activeTab === "relations"}>
          <span>연관 설정</span>
          <div className="admin-chip-options">
            {["마감임박", "1자리 남음", "가족 추천", "특가", "프리미엄", "웰니스"].map((item) => (
              <label key={item}>
                <input
                  checked={tags.includes(item)}
                  onChange={(event) => setTags((current) => (event.target.checked ? [...current, item] : current.filter((tag) => tag !== item)))}
                  type="checkbox"
                />
                {item}
              </label>
            ))}
          </div>
        </section>
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "저장중" : "상품 저장"}
      </button>
      {submitState.message ? (
        <p className="admin-form-message" data-tone={submitState.tone}>
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}
