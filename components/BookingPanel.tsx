"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiAddLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiChat3Line,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiSubtractLine,
} from "@remixicon/react";
import { DatePicker } from "@/components/DatePicker";
import { FormField } from "@/components/FormField";
import { detectBookingMode } from "@/lib/booking-mode";
import type { Experience, ScheduleStock } from "@/lib/data";
import { formatWon, getStockText, getTeamStockText } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

type BookingPanelProps = {
  experience: Experience;
  variant?: "default" | "compact";
};

export function BookingPanel({ experience, variant = "default" }: BookingPanelProps) {
  const mode = detectBookingMode(experience);

  if (mode === "package") {
    return <PackageRedirectPanel experience={experience} />;
  }

  if (mode === "inquiry") {
    return <InquiryPanel experience={experience} />;
  }

  return <SchedulePanel experience={experience} variant={variant} />;
}

function SchedulePanel({ experience, variant = "default" }: BookingPanelProps) {
  const router = useRouter();
  const firstSchedule = experience.schedules[0];
  const [selected, setSelected] = useState<ScheduleStock>(firstSchedule);
  const [selectedDate, setSelectedDate] = useState(firstSchedule?.date ?? "");
  const [people, setPeople] = useState(1);
  const [message, setMessage] = useState("");

  const schedulesByDate = useMemo(() => {
    return experience.schedules.reduce<Record<string, ScheduleStock[]>>((acc, schedule) => {
      acc[schedule.date] = [...(acc[schedule.date] ?? []), schedule];
      return acc;
    }, {});
  }, [experience.schedules]);

  const dateOptions = useMemo(() => Object.keys(schedulesByDate).sort(), [schedulesByDate]);
  const selectedDateSchedules = schedulesByDate[selectedDate] ?? [];
  const remain = selected ? Math.max(selected.capacity - selected.booked, 0) : 0;
  const selectedMaxTeams = selected?.maxTeams ?? 1;
  const selectedReservedTeams = selected?.reservedTeams ?? 0;
  const selectedTeamCapacity = selected?.teamCapacity ?? selected?.capacity ?? 1;
  const selectedRemainingTeams = Math.max(selectedMaxTeams - selectedReservedTeams, 0);
  const selectedIsInquiry = selected?.reservationType === "inquiry";
  const reservationTypeLabel =
    selected?.reservationType === "instant" && !selected.approvalRequired
      ? "즉시예약"
      : selectedIsInquiry
        ? "문의예약"
        : "승인 후 확정";
  const total = useMemo(() => (selected?.price ?? 0) * people, [people, selected?.price]);
  const availableDateLabel = dateOptions.length ? `${formatDateLabel(dateOptions[0])}부터 선택 가능` : "예약 가능한 날짜가 없습니다.";

  function updatePeople(next: number) {
    const maxPeople = Math.min(Math.max(remain, 1), Math.max(selectedTeamCapacity, 1));
    setPeople(Math.max(1, Math.min(next, maxPeople)));
  }

  function chooseDate(date: string) {
    const nextSchedule = schedulesByDate[date]?.find((schedule) => {
      const remainingSeats = schedule.capacity - schedule.booked;
      const remainingTeams = (schedule.maxTeams ?? 1) - (schedule.reservedTeams ?? 0);
      return remainingSeats > 0 && remainingTeams > 0;
    });

    if (!nextSchedule) {
      setMessage("선택한 날짜에는 예약 가능한 회차가 없습니다.");
      return;
    }

    setSelectedDate(date);
    setSelected(nextSchedule);
    setPeople(1);
    setMessage("");
  }

  async function submitReservation() {
    if (!selected) return;

    setMessage("예약 요청을 접수하는 중입니다.");
    try {
      const response = await fetch(withBasePath("/api/reservations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: experience.slug,
          date: selected.date,
          timeLabel: selected.label,
          people,
        }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json") ? ((await response.json().catch(() => ({}))) as { message?: string }) : {};
      const isStaticPreviewMiss = response.status === 404 && !contentType.includes("application/json");

      if (response.ok || isStaticPreviewMiss) {
        router.push(`${userRoutes.bookingComplete}?product=${encodeURIComponent(experience.slug)}`);
        return;
      }

      if (response.status === 401) {
        router.push(`${userRoutes.login}?redirect=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
        return;
      }

      if (!response.ok) {
        setMessage(result.message ?? "예약 정보를 다시 확인해 주세요.");
        return;
      }
    } catch {
      setMessage("일시적으로 예약 요청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  if (!selected) {
    return (
      <aside className="booking-panel" id="reserve" aria-label="예약 선택">
        <div className="booking-title">
          <span>
            <small>예약 일정</small>
            <strong>예약 오픈 예정</strong>
          </span>
        </div>
        <p className="form-message">예약 가능한 회차가 등록되면 이 영역에 표시됩니다.</p>
      </aside>
    );
  }

  return (
    <aside className="booking-panel" id="reserve" aria-label="예약 선택">
      <div className="booking-title">
        <span>
          <small>1인 기준</small>
          <strong>{formatWon(selected.price)}</strong>
        </span>
        <b>{reservationTypeLabel}</b>
      </div>

      <div className="booking-step-title">
        <RiCalendarLine size={18} />
        <span>날짜 선택</span>
        <strong>{formatDateLabel(selectedDate)}</strong>
      </div>
      <DatePicker
        availableDates={dateOptions}
        className="booking-date-picker"
        helper={availableDateLabel}
        label="예약 날짜"
        max={dateOptions.at(-1)}
        min={dateOptions[0]}
        onChange={chooseDate}
        value={selectedDate}
      />

      <div className="booking-step-title">
        <RiCalendarLine size={18} />
        <span>회차 선택</span>
        <strong>{variant === "compact" ? "선택 가능" : "팀 단위 재고"}</strong>
      </div>
      <div className="booking-options" aria-label="예약 회차 선택">
        {selectedDateSchedules.map((schedule) => {
          const stockRatio = Math.round((schedule.booked / schedule.capacity) * 100);
          const maxTeams = schedule.maxTeams ?? 1;
          const reservedTeams = schedule.reservedTeams ?? 0;
          const remainingTeams = Math.max(maxTeams - reservedTeams, 0);
          const teamCapacity = schedule.teamCapacity ?? schedule.capacity;
          const disabled = schedule.capacity <= schedule.booked || remainingTeams === 0;

          return (
            <button
              className="schedule-option"
              data-active={selected.date === schedule.date && selected.label === schedule.label}
              disabled={disabled}
              key={`${schedule.date}-${schedule.label}`}
              onClick={() => {
                setSelected(schedule);
                setPeople(1);
                setMessage("");
              }}
              type="button"
            >
              <span>
                <RiCalendarLine size={16} />
                <b>{schedule.label}</b>
                <span className="schedule-seat-status">{disabled ? "마감" : `${schedule.capacity - schedule.booked}자리`}</span>
              </span>
              <span className="stock-line">
                <i style={{ width: `${Math.min(stockRatio, 100)}%` }} />
              </span>
              {variant === "compact" ? null : (
                <>
                  <small>{getStockText(schedule.capacity, schedule.booked)}</small>
                  <span className="schedule-meta">
                    <span className="schedule-meta-pill">{getTeamStockText(maxTeams, reservedTeams)}</span>
                    <span className="schedule-meta-pill">팀당 최대 {teamCapacity}명</span>
                    <span className="schedule-meta-pill">{schedule.reservationType === "instant" && !schedule.approvalRequired ? "즉시예약" : schedule.reservationType === "inquiry" ? "문의예약" : "승인예약"}</span>
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="people-stepper">
        <span>
          <RiGroupLine size={18} />
          인원
        </span>
        <div>
          <button type="button" onClick={() => updatePeople(people - 1)} aria-label="인원 줄이기">
            <RiSubtractLine size={16} />
          </button>
          <strong>{people}</strong>
          <button type="button" onClick={() => updatePeople(people + 1)} aria-label="인원 늘리기">
            <RiAddLine size={16} />
          </button>
        </div>
      </div>

      <dl className="booking-total">
        <div>
          <dt>예약 가능</dt>
          <dd>{getStockText(selected.capacity, selected.booked)}</dd>
        </div>
        <div>
          <dt>팀 재고</dt>
          <dd>{getTeamStockText(selectedMaxTeams, selectedReservedTeams)}</dd>
        </div>
        <div>
          <dt>팀당 최대</dt>
          <dd>{selectedTeamCapacity}명</dd>
        </div>
        <div>
          <dt>예약 방식</dt>
          <dd>{reservationTypeLabel}</dd>
        </div>
        <div>
          <dt>총 금액</dt>
          <dd>{formatWon(total)}</dd>
        </div>
      </dl>

      <button className="primary-button full" disabled={remain === 0 || selectedRemainingTeams === 0} onClick={submitReservation} type="button">
        <RiCheckboxCircleLine size={18} />
        예약 요청
      </button>
      {message ? <p className="form-message">{message}</p> : null}

      <BookingAltCta variant="package" experienceTitle={experience.title} />
    </aside>
  );
}

function InquiryPanel({ experience }: BookingPanelProps) {
  const router = useRouter();
  const firstSchedule = experience.schedules[0];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState(firstSchedule?.date ?? "");
  const [people, setPeople] = useState(2);
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      setMessage("이름과 연락처를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setMessage("문의를 접수하는 중입니다.");

    try {
      const response = await fetch(withBasePath("/api/inquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          message: memo,
          inquiryType: "product",
          productSlug: experience.slug,
          preferredDate,
          people,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (response.ok || data.ok) {
        router.push(`${userRoutes.bookingComplete}?product=${encodeURIComponent(experience.slug)}&mode=inquiry`);
        return;
      }
      setMessage(data.message ?? "문의 정보를 다시 확인해 주세요.");
    } catch {
      setMessage("일시적으로 문의를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="booking-panel" id="reserve" aria-label="문의 예약">
      <div className="booking-title">
        <span>
          <small>문의 예약</small>
          <strong>일정 협의 후 확정</strong>
        </span>
        <b>문의예약</b>
      </div>

      <p className="booking-inquiry-note">
        <RiChat3Line size={16} />
        희망 일정과 인원을 남겨 주시면 호스트 일정 확인 후 24시간 안에 안내드립니다.
      </p>

      <form
        className="booking-inquiry-form"
        id="reserve-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <FormField label="이름" required>
          <input onChange={(event) => setName(event.target.value)} placeholder="실명을 입력해 주세요" value={name} />
        </FormField>
        <FormField label="연락처" required>
          <input onChange={(event) => setPhone(event.target.value)} placeholder="010-0000-0000" value={phone} />
        </FormField>
        <div className="booking-inquiry-row">
          <DatePicker
            availableDates={experience.schedules.map((schedule) => schedule.date)}
            label="희망 일정"
            min={firstSchedule?.date}
            onChange={setPreferredDate}
            value={preferredDate}
          />
          <FormField label={<><RiGroupLine size={16} />인원</>}>
            <input min={1} onChange={(event) => setPeople(Math.max(1, Number(event.target.value)))} type="number" value={people} />
          </FormField>
        </div>
        <FormField label="요청사항">
          <textarea
            onChange={(event) => setMemo(event.target.value)}
            placeholder="식이 제한, 이동 수단, 단체 인원 등 호스트가 알아야 할 내용을 남겨 주세요."
            value={memo}
          />
        </FormField>

        <button className="primary-button full" disabled={submitting} type="submit">
          <RiCheckboxCircleLine size={18} />
          문의 접수
        </button>
        {message ? <p className="form-message">{message}</p> : null}
      </form>

      <BookingAltCta variant="package" experienceTitle={experience.title} />
    </aside>
  );
}

function PackageRedirectPanel({ experience }: BookingPanelProps) {
  return (
    <aside className="booking-panel" id="reserve" aria-label="패키지 견적">
      <div className="booking-title">
        <span>
          <small>기업·기관 단체 패키지</small>
          <strong>맞춤 견적 안내</strong>
        </span>
        <b>견적요청</b>
      </div>

      <p className="booking-inquiry-note">
        <RiBuilding2Line size={16} />
        기간·인원·프로그램·옵션을 선택해 단체 견적을 즉시 받아보세요. 10명 이상부터 단체 할인이 적용됩니다.
      </p>

      <ul className="booking-package-points">
        <li>
          <RiCheckboxCircleLine size={16} />
          기간·프로그램을 묶어 한 번에 요청
        </li>
        <li>
          <RiCheckboxCircleLine size={16} />
          인원별 단체 할인(최대 15%) 자동 미리보기
        </li>
        <li>
          <RiCheckboxCircleLine size={16} />
          담당자가 24시간 안에 견적서 발송
        </li>
      </ul>

      <Link
        className="primary-button full"
        href={`${userRoutes.b2bQuote}?from=${encodeURIComponent(experience.slug)}`}
      >
        <RiArrowRightLine size={18} />
        단체 견적 만들기
      </Link>

      <BookingAltCta variant="inquiry" experienceTitle={experience.title} />
    </aside>
  );
}

function BookingAltCta({ variant, experienceTitle }: { variant: "package" | "inquiry"; experienceTitle: string }) {
  if (variant === "package") {
    return (
      <Link
        className="booking-alt-cta"
        href={`${userRoutes.b2bQuote}?from=${encodeURIComponent(experienceTitle)}`}
      >
        <span>
          <RiBuilding2Line size={16} />
          단체 견적이 필요하신가요?
        </span>
        <RiArrowRightLine size={16} />
      </Link>
    );
  }

  return (
    <Link className="booking-alt-cta" href={userRoutes.help}>
      <span>
        <RiChat3Line size={16} />
        진행 일정·진행 방식이 궁금하신가요?
      </span>
      <RiArrowRightLine size={16} />
    </Link>
  );
}

function formatDateLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "일정 협의";
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(parsed);
}
