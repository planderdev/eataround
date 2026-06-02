"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AdminDashboardChartsProps = {
  bars: number[];
  totalReservations: number;
  totalSales: number;
};

type ChartMode = "reservations" | "sales";
type TooltipPayload = {
  payload?: {
    label: string;
    displayValue: string;
  };
};

const categoryShare = [
  { label: "쿠킹·베이킹", value: 42, color: "#2A5E42" },
  { label: "지역·전통", value: 28, color: "#F1C180" },
  { label: "웰니스", value: 18, color: "#C9E9EB" },
  { label: "기타", value: 12, color: "#F9A2A2" },
];

const dayLabels = ["월", "화", "수", "목", "금", "토", "일", "월", "화", "수"];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="admin-recharts-tooltip">
      <span>{item.label}</span>
      <strong>{item.displayValue}</strong>
    </div>
  );
}

export function AdminDashboardCharts({ bars, totalReservations, totalSales }: AdminDashboardChartsProps) {
  const [mode, setMode] = useState<ChartMode>("reservations");
  const [activeBar, setActiveBar] = useState(Math.max(0, bars.length - 1));
  const [activeCategory, setActiveCategory] = useState(0);

  const chartData = useMemo(() => {
    return bars.map((height, index) => {
      const reservationValue = Math.max(1, Math.round((height / 100) * Math.max(totalReservations, 1)));
      const salesValue = Math.max(120000, Math.round((height / 100) * Math.max(totalSales, 1)));
      const value = mode === "reservations" ? reservationValue : salesValue;

      return {
        index,
        label: dayLabels[index] ?? `${index + 1}일`,
        value,
        displayValue: mode === "reservations" ? `${reservationValue}건` : `${salesValue.toLocaleString("ko-KR")}원`,
      };
    });
  }, [bars, mode, totalReservations, totalSales]);

  const selectedBar = chartData[activeBar] ?? chartData[0];
  const selectedCategory = categoryShare[activeCategory] ?? categoryShare[0];
  const modeTotal = mode === "reservations" ? `${totalReservations.toLocaleString("ko-KR")}건` : `${totalSales.toLocaleString("ko-KR")}원`;

  return (
    <section className="admin-analytics-grid" aria-label="대시보드 차트">
      <article className="admin-card admin-chart-card admin-bar-chart-card">
        <div className="admin-card-header">
          <div>
            <span>최근 10일</span>
            <h2>{mode === "reservations" ? "예약 추이" : "매출 추이"}</h2>
          </div>
          <div className="admin-chart-toggle" role="tablist" aria-label="차트 기준">
            <button type="button" role="tab" aria-selected={mode === "reservations"} data-active={mode === "reservations"} onClick={() => setMode("reservations")}>
              예약
            </button>
            <button type="button" role="tab" aria-selected={mode === "sales"} data-active={mode === "sales"} onClick={() => setMode("sales")}>
              매출
            </button>
          </div>
        </div>

        <div className="admin-recharts-frame" aria-label={`${mode === "reservations" ? "예약" : "매출"} 막대 차트`}>
          <ResponsiveContainer height="100%" initialDimension={{ width: 900, height: 260 }} minWidth={0} width="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 8, bottom: 0, left: -18 }} onMouseLeave={() => setActiveBar(chartData.length - 1)}>
              <CartesianGrid stroke="#C9E9EB" strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="label" tick={{ fill: "#424241", fontSize: 13, fontWeight: 700 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fill: "#424241", fontSize: 12 }} tickLine={false} width={42} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42, 94, 66, 0.06)", radius: 8 }} />
              <Bar dataKey="value" maxBarSize={44} radius={[10, 10, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={activeBar === index ? "#2A5E42" : "#C9E9EB"}
                    key={entry.index}
                    onClick={() => setActiveBar(index)}
                    onMouseEnter={() => setActiveBar(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-caption">
          <span>선택 구간</span>
          <strong>{selectedBar?.label}</strong>
          <b>{selectedBar?.displayValue}</b>
          <small>전체 {mode === "reservations" ? "예약" : "매출"} {modeTotal}</small>
        </div>
      </article>

      <article className="admin-card admin-chart-card admin-category-chart-card">
        <div className="admin-card-header">
          <div>
            <span>카테고리</span>
            <h2>예약 비율</h2>
          </div>
        </div>
        <div className="admin-recharts-donut" aria-label={`${selectedCategory.label} ${selectedCategory.value}%`}>
          <ResponsiveContainer height="100%" initialDimension={{ width: 250, height: 250 }} minWidth={0} width="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as { label?: string; value?: number } | undefined;
                  if (!active || !item) return null;
                  return (
                    <div className="admin-recharts-tooltip">
                      <span>{item.label}</span>
                      <strong>{item.value}%</strong>
                    </div>
                  );
                }}
              />
              <Pie
                cx="50%"
                cy="50%"
                data={categoryShare}
                dataKey="value"
                innerRadius="58%"
                outerRadius="84%"
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                onMouseEnter={(_, index) => setActiveCategory(index)}
                onClick={(_, index) => setActiveCategory(index)}
              >
                {categoryShare.map((entry, index) => (
                  <Cell fill={entry.color} key={entry.label} opacity={activeCategory === index ? 1 : 0.58} stroke="#F8F4EE" strokeWidth={4} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="admin-donut-center">
            <b>{selectedCategory.value}%</b>
            <small>{selectedCategory.label}</small>
          </div>
        </div>
        <p className="admin-donut-caption">
          가장 높은 예약 카테고리는 <strong>{selectedCategory.label}</strong>입니다.
        </p>
        <ul className="admin-chart-legend">
          {categoryShare.map((item, index) => (
            <li key={item.label}>
              <button type="button" data-active={activeCategory === index} onClick={() => setActiveCategory(index)}>
                <i style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
                <b>{item.value}%</b>
              </button>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}