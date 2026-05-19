"use client";

import { useMemo, useState } from "react";
import { RiAddLine, RiCalendarLine, RiCheckboxCircleLine, RiGroupLine, RiSubtractLine } from "@remixicon/react";
import { DatePicker } from "@/components/DatePicker";
import type { Experience, ScheduleStock } from "@/lib/data";
import { formatWon, getStockText, getTeamStockText } from "@/lib/format";
import { withBasePath } from "@/lib/paths";

type BookingPanelProps = {
  experience: Experience;
};

export function BookingPanel({ experience }: BookingPanelProps) {
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
  const reservationTypeLabel =
    selected?.reservationType === "instant" && !selected.approvalRequired
      ? "즉시예약"
      : selected?.reservationType === "inquiry"
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
    const response = await fetch(withBasePath("/api/reservations"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: experience.slug,
        date: selected.date,
        timeLabel: selected.label,
        people,
        totalAmount: total,
        reservationType: selected.reservationType ?? "approval",
        approvalRequired: selected.approvalRequired ?? true,
      }),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "예약 요청을 접수했습니다.");
  }

  if (!selected) {
    return (
      <aside className="booking-panel" id="reserve" aria-label="예약 선택">
        <div className="booking-title">
          <span>
            <small>예약 일정</small>
            <strong>준비중</strong>
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
        <strong>팀 단위 재고</strong>
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
              <small>{getStockText(schedule.capacity, schedule.booked)}</small>
              <span className="schedule-meta">
                <span className="schedule-meta-pill">{getTeamStockText(maxTeams, reservedTeams)}</span>
                <span className="schedule-meta-pill">팀당 최대 {teamCapacity}명</span>
                <span className="schedule-meta-pill">{schedule.reservationType === "instant" && !schedule.approvalRequired ? "즉시예약" : "승인예약"}</span>
              </span>
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
    </aside>
  );
}

function formatDateLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "일정 협의";
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(parsed);
}
