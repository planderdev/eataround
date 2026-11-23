import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiMegaphoneLine,
  RiTeamLine,
} from "@remixicon/react";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import {
  AdminStatusBadge,
} from "@/components/admin/AdminPrimitives";
import {
  StatCard,
  toneFromStatus,
} from "@/components/admin/AdminLayoutPrimitives";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { loadAdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

const ROUTE_KEY = "dashboard";

export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function DashboardPage() {
  const data = await loadAdminData();
  // 숫자는 목록 일부가 아니라 DB 전체 집계(lib/admin/dashboard.ts)로 센다.
  const stats = await getDashboardStats(data);
  const pendingQuotes = data.quoteRequests.filter((quote) => toneFromStatus(quote.status) === "warning");
  const ongoingEvents = data.events.filter((event) => event.status === "ongoing");
  const recentReservations = data.reservations.slice(0, 10);

  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <section className="admin-ops-grid">
        <article className="admin-ops-hero">
          <span>오늘 처리할 운영 흐름</span>
          <h2>예약 승인, B2B 견적, 행사 노출을 한 번에 확인합니다.</h2>
          <p>프론트의 실제 예약·견적·콘텐츠 노출 흐름과 연결될 수 있도록 관리자 업무 단위를 분리했습니다.</p>
          <div className="admin-kpi-strip">
            <StatCard detail="등록된 전체 예약" icon={<RiCalendarCheckLine size={18} />} label="전체 예약" value={stats.totalReservations} />
            <StatCard detail="승인 또는 결제 확인 필요" label="처리 대기" value={stats.pendingReservations} />
            <StatCard detail="기업·기관 응대" icon={<RiFileTextLine size={18} />} label="미처리 견적" value={stats.pendingQuotes} />
            <StatCard detail="모집/운영 중" icon={<RiMegaphoneLine size={18} />} label="진행 행사" value={ongoingEvents.length} />
            <StatCard
              detail={`일반 ${stats.members - stats.corporateMembers} / 기관 ${stats.corporateMembers}`}
              icon={<RiTeamLine size={18} />}
              label="회원"
              value={stats.members}
            />
            <StatCard detail="예약 기준 추정 · 취소 제외" label="매출" value={formatWon(stats.sales)} />
          </div>
        </article>
        <aside className="admin-priority-board">
          <div className="admin-priority-head">
            <span>우선 처리</span>
            <strong>운영 큐</strong>
          </div>
          {[
            ["승인 대기 예약", stats.pendingReservations, "/admin/reservations"],
            ["견적 검토 요청", stats.pendingQuotes, "/admin/quotes"],
            ["진행 행사 노출", ongoingEvents.length, "/admin/events/ongoing"],
          ].map(([label, count, href]) => (
            <Link href={String(href)} key={String(label)}>
              <span>
                <strong>{label}</strong>
                <small>상세 페이지에서 담당자 처리와 이력을 관리합니다.</small>
              </span>
              <b>{count}</b>
            </Link>
          ))}
        </aside>
      </section>

      <AdminDashboardCharts
        categories={stats.categories}
        days={stats.days}
        totalReservations={stats.totalReservations}
        totalSales={stats.sales}
      />

      <section className="admin-dashboard-grid">
        <article className="admin-table-panel admin-dashboard-table">
          <div className="admin-card-header">
            <div>
              <span>예약관리</span>
              <h2>최근 예약</h2>
            </div>
            <Link className="admin-text-link" href="/admin/reservations">
              전체보기
              <RiArrowRightLine size={16} />
            </Link>
          </div>
          <ReservationTable rows={recentReservations} compact />
        </article>
        <article className="admin-queue-panel">
          <div className="admin-card-header">
            <div>
              <span>견적관리</span>
              <h2>기관 요청</h2>
            </div>
          </div>
          <div className="admin-task-list">
            {(pendingQuotes.length ? pendingQuotes : data.quoteRequests).map((quote) => (
              <Link href="/admin/quotes" key={`${quote.org}-${quote.contact ?? ""}`}>
                <span>
                  <strong>{quote.org}</strong>
                  <small>{quote.people}명 · {quote.program}</small>
                </span>
                <AdminStatusBadge tone={toneFromStatus(quote.status)}>{quote.status}</AdminStatusBadge>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </AdminRouteShell>
  );
}
