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
  days: { date: string; label: string; count: number; sales: number }[];
  categories: { label: string; count: number }[];
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

const CATEGORY_COLORS = ["#2A5E42", "#F1C180", "#C9E9EB", "#F9A2A2"];

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

export function AdminDashboardCharts({ days, categories, totalReservations, totalSales }: AdminDashboardChartsProps) {
  const [mode, setMode] = useState<ChartMode>("reservations");
  const [activeBar, setActiveBar] = useState(Math.max(0, days.length - 1));
  const [activeCategory, setActiveCategory] = useState(0);

  const chartData = useMemo(() => {
    return days.map((day, index) => ({
      index,
      label: day.label,
      value: mode === "reservations" ? day.count : day.sales,
      displayValue: mode === "reservations" ? `${day.count}건` : `${day.sales.toLocaleString("ko-KR")}원`,
    }));
  }, [days, mode]);

  // 카테고리 비율은 취소를 뺀 예약 건수로 계산한다.
  const categoryShare = useMemo(() => {
    const total = categories.reduce((sum, item) => sum + item.count, 0);
    return categories.map((item, index) => ({
      label: item.label,
      value: total ? Math.round((item.count / total) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categories]);

  const selectedBar = chartData[activeBar] ?? chartData[0];
  const selectedCategory = categoryShare[activeCategory] ?? categoryShare[0] ?? { label: "예약 없음", value: 0, color: CATEGORY_COLORS[0] };
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
          {categoryShare.length ? (
            <>
              가장 높은 예약 카테고리는 <strong>{categoryShare[0].label}</strong>입니다.
            </>
          ) : (
            "아직 예약이 없어 비율을 계산할 수 없습니다."
          )}
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