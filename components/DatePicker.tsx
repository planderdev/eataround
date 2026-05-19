"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from "@remixicon/react";

type DatePickerProps = {
  availableDates?: string[];
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  helper?: string;
  id?: string;
  label: string;
  max?: string;
  min?: string;
  name?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  value?: string;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePicker({
  availableDates,
  className,
  defaultValue,
  disabled,
  helper,
  id,
  label,
  max,
  min,
  name,
  onChange,
  required,
  value,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const isControlled = value !== undefined;
  const initialValue = value ?? defaultValue ?? min ?? toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parseDate(initialValue)));
  const [open, setOpen] = useState(false);

  const availableSet = useMemo(() => (availableDates?.length ? new Set(availableDates) : null), [availableDates]);
  const monthLabel = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(visibleMonth);
  const calendarDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  useEffect(() => {
    if (!isControlled) return;
    setSelectedDate(value ?? "");
    if (value) setVisibleMonth(startOfMonth(parseDate(value)));
  }, [isControlled, value]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function isDateDisabled(date: string) {
    if (disabled) return true;
    if (min && date < min) return true;
    if (max && date > max) return true;
    if (availableSet && !availableSet.has(date)) return true;
    return false;
  }

  function selectDate(date: string) {
    if (isDateDisabled(date)) return;
    if (!isControlled) setSelectedDate(date);
    onChange?.(date);
    setOpen(false);
  }

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : "날짜 선택";

  return (
    <div className={["date-picker", className].filter(Boolean).join(" ")} ref={rootRef}>
      <span id={`${inputId}-label`}>{label}</span>
      <input id={inputId} name={name} readOnly required={required} type="hidden" value={selectedDate} />
      <button
        aria-controls={`${inputId}-calendar`}
        aria-expanded={open}
        aria-labelledby={`${inputId}-label`}
        className="date-picker-trigger"
        data-open={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <RiCalendarLine aria-hidden="true" size={18} />
        <span className="date-picker-value">{displayValue}</span>
      </button>
      {helper ? <small className="date-picker-helper">{helper}</small> : null}

      {open ? (
        <div className="date-picker-popover" id={`${inputId}-calendar`} role="dialog" aria-label={`${label} 달력`}>
          <div className="date-picker-popover-header">
            <button aria-label="이전 달" onClick={() => moveMonth(-1)} type="button">
              <RiArrowLeftSLine size={20} />
            </button>
            <strong>{monthLabel}</strong>
            <button aria-label="다음 달" onClick={() => moveMonth(1)} type="button">
              <RiArrowRightSLine size={20} />
            </button>
          </div>
          <div className="date-picker-weekdays" aria-hidden="true">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="date-picker-days">
            {calendarDays.map((item, index) => {
              if (!item) return <span className="date-picker-empty" key={`empty-${index}`} />;

              const date = item.date;
              const dateDisabled = isDateDisabled(date);

              return (
                <button
                  aria-current={date === toDateString(new Date()) ? "date" : undefined}
                  aria-pressed={date === selectedDate}
                  className="date-picker-day"
                  data-selected={date === selectedDate}
                  data-today={date === toDateString(new Date())}
                  disabled={dateDisabled}
                  key={date}
                  onClick={() => selectDate(date)}
                  type="button"
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(parseDate(value));
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days: ({ date: string; day: number } | null)[] = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    days.push({ date: toDateString(new Date(year, month, day)), day });
  }

  return days;
}
