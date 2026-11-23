"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModal } from "@/lib/useModal";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBuilding2Line,
  RiChat3Line,
  RiSubtractLine,
} from "@remixicon/react";
import { detectBookingMode } from "@/lib/booking-mode";
import { bookingOptionPrices, calculateBookingTotal, recommendedBookingOptions } from "@/lib/booking-price";
import type { Experience, ScheduleStock } from "@/lib/data";
import { formatWon, getStockText, getTeamStockText } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

type DetailOptionSelectorProps = {
  experience: Experience;
};

type OptionKey = "adult" | "teen" | "child" | "privateGuide";

type OptionItem = {
  key: OptionKey;
  title: string;
  description: string;
  price: number;
};

const recommendedOptions = recommendedBookingOptions;

export function DetailOptionSelector({ experience }: DetailOptionSelectorProps) {
  const mode = detectBookingMode(experience);

  if (mode === "package") {
    return (
      <Link
        className="detail-option-bar detail-option-bar--package"
        href={`${userRoutes.b2bQuote}?from=${encodeURIComponent(experience.slug)}`}
        id="reserve"
      >
        <span>
          <RiBuilding2Line size={16} />
          <small>기업·기관 단체 패키지</small>
          <strong>단체 견적 받기</strong>
        </span>
        <RiArrowRightLine size={18} />
      </Link>
    );
  }

  if (mode === "inquiry") {
    return (
      <a className="detail-option-bar detail-option-bar--inquiry" href="#reserve-form" id="reserve">
        <span>
          <RiChat3Line size={16} />
          <small>문의 예약</small>
          <strong>희망 일정 남기기</strong>
        </span>
        <RiArrowRightLine size={18} />
      </a>
    );
  }

  return <DetailOptionSelectorSchedule experience={experience} />;
}

function DetailOptionSelectorSchedule({ experience }: DetailOptionSelectorProps) {
  const router = useRouter();
  const firstSchedule = experience.schedules[0];
  const { isOpen: open, open: openModal, close: closeModal } = useModal();
  const [selectedDate, setSelectedDate] = useState(firstSchedule?.date ?? "");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleStock | undefined>(firstSchedule);
  const [monthDate, setMonthDate] = useState(() => parseDate(firstSchedule?.date) ?? new Date());
  const [counts, setCounts] = useState<Record<OptionKey, number>>({ adult: 1, teen: 0, child: 0, privateGuide: 0 });
  const [recommendedChecked, setRecommendedChecked] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");

  const schedulesByDate = useMemo(() => {
    return experience.schedules.reduce<Record<string, ScheduleStock[]>>((acc, schedule) => {
      acc[schedule.date] = [...(acc[schedule.date] ?? []), schedule];
      return acc;
    }, {});
  }, [experience.schedules]);

  const selectedDateSchedules = schedulesByDate[selectedDate] ?? [];
  const selectedPrice = selectedSchedule?.price ?? experience.price;
  const optionPrices = bookingOptionPrices(selectedPrice);
  const optionItems: OptionItem[] = [
    { key: "adult", title: "성인", description: "1인 기준", price: optionPrices.adult },
    { key: "teen", title: "청소년", description: "만 13세 이상", price: optionPrices.teen },
    { key: "child", title: "아동", description: "보호자 동반, 만 3세 이상", price: optionPrices.child },
    { key: "privateGuide", title: "프라이빗 안내 추가", description: "업체로부터 안내 시 확정", price: optionPrices.privateGuide },
  ];
  const totalPeople = counts.adult + counts.teen + counts.child;
  const checkedRecommended = Object.entries(recommendedChecked)
    .filter(([, checked]) => checked)
    .map(([title]) => title);
  const total = calculateBookingTotal(selectedPrice, counts, checkedRecommended);
  const canReserve = Boolean(selectedSchedule) && totalPeople > 0;


  function chooseDate(date: string) {
    const nextSchedule = schedulesByDate[date]?.find((schedule) => isScheduleAvailable(schedule));
    if (!nextSchedule) return;
    setSelectedDate(date);
    setSelectedSchedule(nextSchedule);
    setMessage("");
  }

  function updateCount(key: OptionKey, amount: number) {
    const maxPeople = selectedSchedule ? Math.max(selectedSchedule.capacity - selectedSchedule.booked, 0) : 0;
    setCounts((current) => {
      const next = Math.max(0, current[key] + amount);
      const nextCounts = { ...current, [key]: next };
      const nextPeople = nextCounts.adult + nextCounts.teen + nextCounts.child;
      if (key !== "privateGuide" && nextPeople > Math.max(maxPeople, 1)) return current;
      return nextCounts;
    });
  }

  async function submitReservation() {
    if (!selectedSchedule || !canReserve) return;

    setMessage("예약 요청을 접수하는 중입니다.");
    try {
      const response = await fetch(withBasePath("/api/reservations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: experience.slug,
          date: selectedSchedule.date,
          timeLabel: selectedSchedule.label,
          people: totalPeople,
          options: counts,
          recommendedOptions: checkedRecommended,
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

  return (
    <>
      <div className="detail-option-bar" id="reserve">
        <strong>{formatWon(selectedPrice)}~</strong>
        <button type="button" onClick={() => openModal()}>
          옵션 선택
        </button>
      </div>

      {open ? (
        <div className="option-modal" role="dialog" aria-modal="true" aria-label="옵션 선택">
          <div className="option-modal-shell">
            <header className="option-modal-header">
              <button type="button" onClick={() => closeModal()} aria-label="닫기">
                <RiArrowLeftLine size={24} />
              </button>
              <strong>옵션 선택</strong>
              <span aria-hidden="true" />
            </header>

            <div className="option-modal-scroll">
              <section className="option-calendar-panel">
                <div className="option-calendar-month">
                  <button type="button" onClick={() => setMonthDate(addMonths(monthDate, -1))} aria-label="이전 달">
                    <RiArrowLeftSLine size={24} />
                  </button>
                  <strong>{formatMonth(monthDate)}</strong>
                  <button type="button" onClick={() => setMonthDate(addMonths(monthDate, 1))} aria-label="다음 달">
                    <RiArrowRightSLine size={24} />
                  </button>
                </div>
                <CalendarGrid
                  monthDate={monthDate}
                  schedulesByDate={schedulesByDate}
                  selectedDate={selectedDate}
                  onSelect={chooseDate}
                />
              </section>

              {selectedDateSchedules.length ? (
                <section className="option-modal-section">
                  <h2>회차</h2>
                  <div className="option-time-list">
                    {selectedDateSchedules.map((schedule) => {
                      const disabled = !isScheduleAvailable(schedule);
                      const active = selectedSchedule?.date === schedule.date && selectedSchedule.label === schedule.label;

                      return (
                        <button
                          type="button"
                          data-active={active}
                          disabled={disabled}
                          key={`${schedule.date}-${schedule.label}`}
                          onClick={() => setSelectedSchedule(schedule)}
                        >
                          <span>
                            <strong>{schedule.label}</strong>
                            <small>
                              {getStockText(schedule.capacity, schedule.booked)} · {getTeamStockText(schedule.maxTeams ?? 1, schedule.reservedTeams ?? 0)}
                            </small>
                          </span>
                          <b>{formatWon(schedule.price)}</b>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section className="option-modal-section">
                <h2>연령</h2>
                <div className="option-count-list">
                  {optionItems.map((option) => (
                    <OptionCounter
                      count={counts[option.key]}
                      description={option.description}
                      key={option.key}
                      onDecrease={() => updateCount(option.key, -1)}
                      onIncrease={() => updateCount(option.key, 1)}
                      price={option.price}
                      title={option.title}
                    />
                  ))}
                </div>
              </section>

              <section className="option-modal-section option-recommend-section">
                <h2>이더라운드 추천 BEST 옵션</h2>
                <div className="option-recommend-list">
                  {recommendedOptions.map((item) => (
                    <label className="option-recommend-card" key={item.title}>
                      <input
                        checked={Boolean(recommendedChecked[item.title])}
                        onChange={(event) =>
                          setRecommendedChecked((current) => ({ ...current, [item.title]: event.target.checked }))
                        }
                        type="checkbox"
                      />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.summary}</small>
                        <b>{formatWon(item.price)}~</b>
                      </span>
                      <img src={item.image} alt={item.title} loading="lazy" />
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <footer className="option-modal-footer">
              <span>
                <small>총</small>
                <strong>{total ? formatWon(total) : "-원"}</strong>
              </span>
              <button disabled={!canReserve} onClick={submitReservation} type="button">
                예약하기
              </button>
              {message ? <p>{message}</p> : null}
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

function OptionCounter({
  count,
  description,
  onDecrease,
  onIncrease,
  price,
  title,
}: {
  count: number;
  description: string;
  onDecrease: () => void;
  onIncrease: () => void;
  price: number;
  title: string;
}) {
  return (
    <article className="option-count-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
        <b>{formatWon(price)}</b>
      </span>
      <div>
        <button aria-label={`${title} 감소`} disabled={count === 0} onClick={onDecrease} type="button">
          <RiSubtractLine size={18} />
        </button>
        <strong>{count}</strong>
        <button aria-label={`${title} 증가`} onClick={onIncrease} type="button">
          <RiAddLine size={18} />
        </button>
      </div>
    </article>
  );
}

function CalendarGrid({
  monthDate,
  onSelect,
  schedulesByDate,
  selectedDate,
}: {
  monthDate: Date;
  onSelect: (date: string) => void;
  schedulesByDate: Record<string, ScheduleStock[]>;
  selectedDate: string;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstDay.getDay() }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => new Date(year, month, index + 1)),
  ];

  return (
    <div className="option-calendar">
      {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
        <span className="option-calendar-weekday" key={day}>
          {day}
        </span>
      ))}
      {cells.map((date, index) => {
        if (!date) return <span className="option-calendar-empty" key={`empty-${index}`} />;

        const key = toDateKey(date);
        const schedules = schedulesByDate[key] ?? [];
        const availableSchedules = schedules.filter(isScheduleAvailable);
        const lowestPrice = Math.min(...availableSchedules.map((schedule) => schedule.price));
        const available = availableSchedules.length > 0;
        const selected = selectedDate === key;
        const isSunday = date.getDay() === 0;

        return (
          <button
            className="option-calendar-day"
            data-available={available}
            data-selected={selected}
            data-sunday={isSunday}
            disabled={!available}
            key={key}
            onClick={() => onSelect(key)}
            type="button"
          >
            <strong>{date.getDate()}</strong>
            {available ? <small>{formatCompactPrice(lowestPrice)}</small> : null}
          </button>
        );
      })}
    </div>
  );
}

function isScheduleAvailable(schedule: ScheduleStock) {
  const remainingSeats = schedule.capacity - schedule.booked;
  const remainingTeams = (schedule.maxTeams ?? 1) - (schedule.reservedTeams ?? 0);
  return remainingSeats > 0 && remainingTeams > 0;
}

function parseDate(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월`;
}

function formatCompactPrice(price: number) {
  if (price >= 10000) return `${Number((price / 10000).toFixed(1))}만`;
  return `${Number((price / 1000).toFixed(1))}천`;
}
