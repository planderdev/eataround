import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RiAddLine,
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiEdit2Line,
  RiFilePdf2Line,
  RiFileTextLine,
  RiMailSendLine,
  RiMapPinLine,
  RiMegaphoneLine,
  RiSave3Line,
  RiShieldCheckLine,
  RiTeamLine,
  RiTimeLine,
} from "@remixicon/react";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminPagination,
  AdminResultSummary,
  AdminSelect,
  AdminStatusBadge,
  type AdminTableColumn,
  type AdminTone,
} from "@/components/admin/AdminPrimitives";
import { adminRouteSlugs, getAdminRouteConfig } from "@/lib/admin";
import {
  getAdminMembers,
  getAdminQuoteRequests,
  getAdminReservations,
  getCategories,
  getCollections,
  getDiscountTiers,
  getEvents,
  getExperiences,
  getHeroSlides,
  getJournals,
  getPackageCtas,
  getPackageOptions,
  getPackagePrograms,
  getProductReviews,
} from "@/lib/content";
import { formatWon } from "@/lib/format";

type AdminCatchAllPageProps = {
  params: Promise<{ slug: string[] }>;
};

type AdminData = Awaited<ReturnType<typeof loadAdminData>>;
type AdminRoute = NonNullable<ReturnType<typeof getAdminRouteConfig>>;
type ButtonVariant = "primary" | "secondary" | "info" | "warning" | "danger" | "ghost";

const dashboardBars = [38, 58, 46, 68, 74, 62, 88, 54, 71, 96];

const adminActionTargets: Record<string, { primary?: string; secondary?: string }> = {
  dashboard: { primary: "/admin/reservations", secondary: "/admin/quotes" },
  "members/general": { primary: "/admin/members/general/export" },
  "members/corporate": { primary: "/admin/members/corporate/approval" },
  products: { primary: "/admin/products/new", secondary: "/admin/products/bulk-visibility" },
  "products/categories": { primary: "/admin/products/categories/new" },
  reservations: { primary: "/admin/reservations/confirm", secondary: "/admin/reservations/mail" },
  "reservations/schedules": { primary: "/admin/reservations/schedules/new", secondary: "/admin/reservations/schedules/recurring" },
  "events/ongoing": { primary: "/admin/events/ongoing/new" },
  "events/closed": { primary: "/admin/events/closed/result" },
  packages: { primary: "/admin/packages/new" },
  quotes: { primary: "/admin/quotes/send", secondary: "/admin/quotes/convert" },
  banners: { primary: "/admin/banners/new" },
  curations: { primary: "/admin/curations/new" },
  journal: { primary: "/admin/journal/new" },
  reviews: { primary: "/admin/reviews/visibility" },
  "settings/admins": { primary: "/admin/settings/admins/invite" },
  "settings/policies": { primary: "/admin/settings/policies/new" },
};

const workflowCopy: Record<string, { backHref: string; scope: string; fields: string[]; checklist: string[] }> = {
  "members/general/export": {
    backHref: "/admin/members/general",
    scope: "회원 데이터 내보내기",
    fields: ["내보내기 기간", "회원 상태", "가입 경로", "마스킹 기준"],
    checklist: ["개인정보 마스킹 적용", "다운로드 만료 시간 설정", "관리자 작업 로그 저장"],
  },
  "members/corporate/approval": {
    backHref: "/admin/members/corporate",
    scope: "기업·기관 승인",
    fields: ["기관명", "사업자 구분", "견적 접근 권한", "승인 안내 메시지"],
    checklist: ["기관 정보 확인", "패키지 견적 권한 반영", "담당자에게 승인 안내 발송"],
  },
  "products/bulk-visibility": {
    backHref: "/admin/products",
    scope: "상품 일괄 변경",
    fields: ["대상 상품", "노출 상태", "예약 가능 여부", "적용 예약일"],
    checklist: ["상품 목록 노출 확인", "상세 예약 CTA 상태 확인", "변경 이력 저장"],
  },
  "reservations/confirm": {
    backHref: "/admin/reservations",
    scope: "예약 승인",
    fields: ["예약번호", "이용일", "회차", "확정 안내 문구"],
    checklist: ["팀 단위 재고 차감", "예약 상태 확정 처리", "고객 안내 메시지 발송"],
  },
  "reservations/mail": {
    backHref: "/admin/reservations",
    scope: "예약 안내 발송",
    fields: ["예약 상태", "발송 대상", "메일 템플릿", "예약 발송 시간"],
    checklist: ["취소·환불 문구 포함", "중복 발송 방지", "발송 이력 저장"],
  },
  "reservations/schedules/new": {
    backHref: "/admin/reservations/schedules",
    scope: "회차 생성",
    fields: ["상품", "날짜", "시간", "팀 재고", "팀당 인원"],
    checklist: ["예약 유형 확인", "승인 필요 여부 설정", "캘린더 재고 반영"],
  },
  "reservations/schedules/recurring": {
    backHref: "/admin/reservations/schedules",
    scope: "반복 회차",
    fields: ["반복 기간", "요일", "시간대", "팀 재고"],
    checklist: ["공휴일 제외 여부 확인", "중복 회차 방지", "생성 전 미리보기"],
  },
  "reservations/schedules/bulk-close": {
    backHref: "/admin/reservations/schedules",
    scope: "회차 마감",
    fields: ["대상 기간", "상품", "마감 사유", "고객 안내"],
    checklist: ["예약 가능 재고 0 처리", "기존 예약 유지", "프론트 캘린더 마감 반영"],
  },
  "events/ongoing/new": {
    backHref: "/admin/events/ongoing",
    scope: "행사 등록",
    fields: ["행사명", "모집 기간", "장소", "신청 CTA"],
    checklist: ["진행중 행사 리스트 노출", "행사 상세 페이지 연결", "배너 슬롯 연결"],
  },
  "events/closed/result": {
    backHref: "/admin/events/closed",
    scope: "행사 결과",
    fields: ["행사명", "결과 요약", "대표 이미지", "파트너"],
    checklist: ["종료된 행사로 분류", "포트폴리오 이미지 등록", "기관 영업 자료로 사용"],
  },
  "quotes/send": {
    backHref: "/admin/quotes",
    scope: "견적서 발송",
    fields: ["견적번호", "최종 금액", "포함 옵션", "발송 메시지"],
    checklist: ["견적 상태 QUOTED 처리", "기관 담당자 연락처 확인", "견적서 이력 저장"],
  },
  "quotes/convert": {
    backHref: "/admin/quotes",
    scope: "예약 전환",
    fields: ["견적번호", "이용 기간", "예약 상태", "결제 방식"],
    checklist: ["예약번호 생성", "회차 재고 연결", "마이페이지 견적 상태 변경"],
  },
  "settings/policies/new": {
    backHref: "/admin/settings/policies",
    scope: "약관 버전 발행",
    fields: ["정책 종류", "버전", "시행일", "변경 요약", "본문"],
    checklist: ["푸터 모달 내용 반영", "이전 버전 보관", "시행일 예약 발행"],
  },
};

export function generateStaticParams() {
  return adminRouteSlugs;
}

export async function generateMetadata({ params }: AdminCatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getAdminRouteConfig(slug.join("/"));
  return { title: config ? `${config.title} | 이더라운드 관리자` : "관리자" };
}

async function loadAdminData() {
  const [
    experiences,
    events,
    journals,
    reservations,
    quoteRequests,
    members,
    programs,
    packageOptions,
    discountTiers,
    heroSlides,
    packageCtas,
    collections,
    categories,
  ] = await Promise.all([
    getExperiences(),
    getEvents(),
    getJournals(),
    getAdminReservations(),
    getAdminQuoteRequests(),
    getAdminMembers(),
    getPackagePrograms(),
    getPackageOptions(),
    getDiscountTiers(),
    getHeroSlides(),
    getPackageCtas(),
    getCollections(),
    getCategories(),
  ]);
  const productReviews = await Promise.all(experiences.slice(0, 4).map((experience) => getProductReviews(experience.slug)));

  return {
    categories,
    collections,
    discountTiers,
    events,
    experiences,
    flatReviews: productReviews.flat(),
    heroSlides,
    journals,
    members,
    packageCtas,
    packageOptions,
    programs,
    quoteRequests,
    reservations,
  };
}

function toneFromStatus(status: string): AdminTone {
  if (/(취소|환불|종료|마감|반려|삭제|CANCELED|REFUNDED|CLOSED|HIDDEN|LOST)/i.test(status)) return "danger";
  if (/(검토|대기|요청|임시|예정|PENDING|REQUESTED|IN_REVIEW|DRAFT|UNPAID)/i.test(status)) return "warning";
  if (/(확정|승인|노출|진행|발행|결제|완료|CONFIRMED|PAID|ONGOING|PUBLISHED|APPROVED|VISIBLE|WON)/i.test(status)) return "success";
  if (/(문의|ARCHIVED|PRIVATE)/i.test(status)) return "info";
  return "neutral";
}

function actionVariant(label: string, primary?: boolean): ButtonVariant {
  if (primary) return "primary";
  if (/(삭제|취소|마감|반려|환불)/.test(label)) return "danger";
  if (/(메일|발송|안내)/.test(label)) return "info";
  if (/(전환|승인|확정)/.test(label)) return "secondary";
  if (/(검토|보류)/.test(label)) return "warning";
  return "ghost";
}

function ActionIcon({ label }: { label: string }) {
  if (/(발송|메일|안내)/.test(label)) return <RiMailSendLine size={16} />;
  if (/(견적|PDF)/.test(label)) return <RiFilePdf2Line size={16} />;
  if (/(저장|발행)/.test(label)) return <RiSave3Line size={16} />;
  if (/(수정|변경)/.test(label)) return <RiEdit2Line size={16} />;
  return <RiAddLine size={16} />;
}

function HeaderAction({ href, label, primary }: { href?: string; label: string; primary?: boolean }) {
  const className = `admin-action-button ${actionVariant(label, primary)}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        <ActionIcon label={label} />
        {label}
      </Link>
    );
  }

  return (
    <button className={className} type="button" data-admin-toast={`${label} 작업을 준비했습니다.`}>
      <ActionIcon label={label} />
      {label}
    </button>
  );
}

function HeaderActions({ currentKey, primary, secondary }: { currentKey: string; primary?: string; secondary?: string }) {
  const targets = adminActionTargets[currentKey] ?? {};

  return (
    <>
      {secondary ? <HeaderAction href={targets.secondary} label={secondary} /> : null}
      {primary ? <HeaderAction href={targets.primary} label={primary} primary /> : null}
    </>
  );
}

function DetailPairs({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <div className="admin-detail-pairs">
      {items.map(([label, value]) => (
        <dl key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </dl>
      ))}
    </div>
  );
}

function RowActionButtons({
  danger,
  info,
  primary,
  secondary,
}: {
  danger?: string;
  info?: string;
  primary?: string;
  secondary?: string;
}) {
  return (
    <>
      {secondary ? (
        <button className="admin-action-button ghost" type="button" data-admin-toast={`${secondary} 작업을 열었습니다.`}>
          {secondary}
        </button>
      ) : null}
      {info ? (
        <button className="admin-action-button info" type="button" data-admin-toast={`${info} 작업을 준비했습니다.`}>
          {info}
        </button>
      ) : null}
      {danger ? (
        <button className="admin-action-button danger" type="button" data-admin-toast={`${danger} 처리 전 확인이 필요합니다.`}>
          {danger}
        </button>
      ) : null}
      {primary ? (
        <button className="admin-action-button secondary" type="button" data-admin-toast={`${primary} 작업을 저장했습니다.`}>
          {primary}
        </button>
      ) : null}
    </>
  );
}

function StatCard({ detail, icon, label, value }: { detail: string; icon?: React.ReactNode; label: string; value: string | number }) {
  return (
    <article className="admin-stat-card">
      {icon ? <i>{icon}</i> : null}
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ListFrame({
  children,
  filters,
  resultLabel,
  total,
  bulkOptions = ["선택 항목 검토", "노출 ON", "노출 OFF", "담당자 지정"],
  summary,
}: {
  children: React.ReactNode;
  filters: Parameters<typeof AdminFilterBar>[0]["fields"];
  resultLabel: string;
  total: number;
  bulkOptions?: string[];
  summary?: React.ReactNode;
}) {
  return (
    <section className="admin-list-shell">
      {summary}
      <AdminFilterBar fields={filters} resultLabel={resultLabel} />
      <AdminResultSummary>
        <span>총 {total.toLocaleString("ko-KR")}건</span>
        <AdminSelect defaultValue={bulkOptions[0]}>
          {bulkOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </AdminSelect>
        <button className="admin-action-button ghost" type="button" data-admin-toast="선택 항목에 일괄 작업을 적용했습니다.">
          일괄 적용
        </button>
      </AdminResultSummary>
      <div className="admin-table-panel">{children}</div>
      <AdminPagination total={total} />
    </section>
  );
}

function DashboardPage({ data }: { data: AdminData }) {
  const estimatedSales = data.reservations.reduce((sum, reservation) => sum + (reservation.amount ?? 0), 0);
  const pendingReservations = data.reservations.filter((reservation) => toneFromStatus(reservation.status) === "warning");
  const pendingQuotes = data.quoteRequests.filter((quote) => toneFromStatus(quote.status) === "warning");
  const ongoingEvents = data.events.filter((event) => event.status === "ongoing");
  const corporateMembers = data.members.filter((member) => member.type.includes("기업") || member.type.includes("기관"));

  return (
    <>
      <section className="admin-ops-grid">
        <article className="admin-ops-hero">
          <span>오늘 처리할 운영 흐름</span>
          <h2>예약 승인, B2B 견적, 행사 노출을 한 번에 확인합니다.</h2>
          <p>프론트의 실제 예약·견적·콘텐츠 노출 흐름과 연결될 수 있도록 관리자 업무 단위를 분리했습니다.</p>
          <div className="admin-kpi-strip">
            <StatCard detail="최근 등록 예약" icon={<RiCalendarCheckLine size={18} />} label="전체 예약" value={data.reservations.length} />
            <StatCard detail="승인 또는 결제 확인 필요" label="처리 대기" value={pendingReservations.length} />
            <StatCard detail="기업·기관 응대" icon={<RiFileTextLine size={18} />} label="미처리 견적" value={pendingQuotes.length} />
            <StatCard detail="모집/운영 중" icon={<RiMegaphoneLine size={18} />} label="진행 행사" value={ongoingEvents.length} />
            <StatCard detail={`일반 ${data.members.length - corporateMembers.length} / 기관 ${corporateMembers.length}`} icon={<RiTeamLine size={18} />} label="회원" value={data.members.length} />
            <StatCard detail="예약 기준 추정" label="매출" value={formatWon(estimatedSales)} />
          </div>
        </article>
        <aside className="admin-priority-board">
          <div className="admin-priority-head">
            <span>우선 처리</span>
            <strong>운영 큐</strong>
          </div>
          {[
            ["승인 대기 예약", pendingReservations.length, "/admin/reservations"],
            ["견적 검토 요청", pendingQuotes.length, "/admin/quotes"],
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

      <AdminDashboardCharts bars={dashboardBars} totalReservations={data.reservations.length} totalSales={estimatedSales} />
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
          <ReservationTable rows={data.reservations} compact />
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
    </>
  );
}

function ReservationTable({ compact, rows }: { compact?: boolean; rows: AdminData["reservations"] }) {
  const columns: AdminTableColumn<AdminData["reservations"][number]>[] = [
    { key: "product", label: "상품명", render: (row) => <strong>{row.product}</strong> },
    { key: "user", label: "예약자", render: (row) => row.user },
    { key: "date", label: "이용일정", render: (row) => row.date },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "payment", label: "결제금액", align: "right", render: (row) => (row.amount ? formatWon(row.amount) : "UNPAID") },
    { key: "status", label: "예약상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];

  return (
    <AdminDataTable
      actions={(row) => <RowActionButtons danger="취소 처리" info="안내 발송" primary={row.approvalRequired ? "예약 확정" : "결제 확인"} secondary="상담 메모" />}
      columns={compact ? columns.slice(0, 5) : columns}
      detail={(row) => (
        <DetailPairs
          items={[
            ["예약 유형", row.reservationType ?? "승인예약"],
            ["승인 필요", row.approvalRequired ? "필요" : "불필요"],
            ["고객 안내", "예약 확정 후 이용 장소와 준비물을 자동 안내합니다."],
            ["운영 메모", "회차별 팀 재고와 결제 상태를 함께 확인하세요."],
          ]}
        />
      )}
      rowKey={(row) => `${row.product}-${row.user}-${row.date}`}
      rows={rows}
    />
  );
}

function MembersPage({ corporate, data }: { corporate: boolean; data: AdminData }) {
  const rows = data.members.filter((member) => (corporate ? member.type.includes("기업") || member.type.includes("기관") : member.type === "일반회원"));
  const columns: AdminTableColumn<AdminData["members"][number]>[] = corporate
    ? [
        { key: "name", label: "기관명", render: (row) => <strong>{row.name}</strong> },
        { key: "manager", label: "담당자", render: (row) => row.name },
        { key: "email", label: "이메일", render: (row) => row.email },
        { key: "quotes", label: "견적요청", align: "center", render: () => "2건" },
        { key: "status", label: "승인 상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
      ]
    : [
        { key: "id", label: "회원번호", render: (row) => `M-${String(row.email.length * 37).padStart(4, "0")}` },
        { key: "name", label: "이름", render: (row) => <strong>{row.name}</strong> },
        { key: "email", label: "이메일", render: (row) => row.email },
        { key: "channel", label: "가입경로", render: () => "이메일" },
        { key: "count", label: "예약", align: "center", render: () => "1건" },
        { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
      ];

  return (
    <ListFrame
      bulkOptions={corporate ? ["승인 처리", "권한 보류", "안내 발송", "담당자 지정"] : ["선택 회원 메모", "휴면 처리", "마케팅 동의 변경"]}
      filters={[
        { label: "검색어", name: "query", placeholder: corporate ? "기관명, 담당자, 이메일" : "이름, 이메일, 연락처" },
        { label: corporate ? "기관 구분" : "가입경로", name: "type", type: "select", options: corporate ? ["기업", "비영리", "공공기관", "학교"] : ["이메일", "카카오", "네이버"] },
        { label: "상태", name: "status", type: "select", options: corporate ? ["승인대기", "승인완료", "반려"] : ["정상", "휴면", "탈퇴"] },
        { label: "가입일", name: "createdAt", type: "date" },
        { label: "마케팅 동의", name: "marketing", type: "select", options: ["동의", "미동의"] },
      ]}
      resultLabel={corporate ? "기업·기관 승인과 견적 권한 관리" : "일반회원 예약·상담 이력 관리"}
      summary={
        <div className="admin-module-summary" data-module={corporate ? "corporate" : "members"}>
          <StatCard detail="가입/승인 상태 기준" label={corporate ? "기관 회원" : "일반 회원"} value={rows.length} />
          <StatCard detail={corporate ? "견적 요청 가능" : "예약 이용 가능"} label="활성 계정" value={rows.filter((row) => toneFromStatus(row.status) === "success").length} />
          <StatCard detail="필터에서 권한별 확인" label={corporate ? "승인 대기" : "휴면 후보"} value={rows.filter((row) => toneFromStatus(row.status) === "warning").length} />
        </div>
      }
      total={rows.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons info="안내 발송" primary={corporate ? "승인 처리" : "회원 수정"} secondary={corporate ? "견적 내역" : "예약 내역"} />}
        columns={columns}
        detail={(row) => (
          <DetailPairs
            items={[
              ["회원 구분", row.type],
              ["이메일", row.email],
              ["계정 상태", row.status],
              ["접근 권한", corporate ? "패키지 견적 요청 가능" : "체험 예약 및 상담 요청 가능"],
            ]}
          />
        )}
        rowKey={(row) => `${row.email}-${row.type}`}
        rows={rows}
      />
    </ListFrame>
  );
}

function ProductsPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["experiences"][number]>[] = [
    { key: "title", label: "상품명", render: (row) => <strong>{row.title}</strong> },
    { key: "category", label: "카테고리", render: (row) => row.category },
    { key: "region", label: "지역", render: (row) => row.region },
    { key: "price", label: "기본가", align: "right", render: (row) => formatWon(row.price) },
    { key: "stock", label: "재고", align: "center", render: (row) => `${row.schedules.reduce((sum, item) => sum + item.booked, 0)}/${row.schedules.reduce((sum, item) => sum + item.capacity, 0)}` },
    { key: "booking", label: "예약유형", render: (row) => row.schedules[0]?.reservationType ?? "timeslot" },
    { key: "status", label: "노출상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.badge ?? "노출중")}>{row.badge ?? "노출중"}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulkOptions={["선택 상품 검토", "노출 ON", "노출 OFF", "특가 배지 적용", "회차 일괄 마감"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "상품명, 태그, 호스트" },
        { label: "카테고리", name: "category", type: "select", options: data.categories.map((category) => category.label) },
        { label: "지역", name: "region", type: "select", options: ["제주시", "서귀포시", "구좌", "애월"] },
        { label: "예약유형", name: "bookingType", type: "select", options: ["instant", "approval", "inquiry"] },
        { label: "재고상태", name: "stock", type: "select", options: ["예약가능", "마감임박", "마감"] },
        { label: "등록일", name: "createdAt", type: "date" },
      ]}
      resultLabel="상품 노출, 예약유형, 회차 재고 기준 관리"
      summary={
        <div className="admin-product-overview">
          {data.experiences.slice(0, 3).map((experience) => (
            <article key={experience.slug}>
              <img alt="" src={experience.image} />
              <span>{experience.category}</span>
              <strong>{experience.title}</strong>
              <small>{experience.region} · {experience.schedules.length}개 회차</small>
            </article>
          ))}
        </div>
      }
      total={data.experiences.length}
    >
      <AdminDataTable
        actions={(row) => (
          <>
            <Link className="admin-action-button ghost" href={`/experiences/${row.slug}`} target="_blank">
              프론트 보기
            </Link>
            <RowActionButtons info="회차 관리" primary="상품 수정" secondary="배지 설정" />
          </>
        )}
        columns={columns}
        detail={(row) => (
          <div className="admin-row-product-detail">
            <img alt="" src={row.image} />
            <DetailPairs
              items={[
                ["요약", row.summary],
                ["호스트", row.host.name],
                ["장소", `${row.place.name} · ${row.place.address}`],
                ["태그", row.tags.join(", ") || "-"],
                ["포함사항", row.included.join(", ")],
              ]}
            />
          </div>
        )}
        rowKey={(row) => row.slug}
        rows={data.experiences}
      />
    </ListFrame>
  );
}

function ProductEditorPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-editor-layout">
      <article className="admin-card admin-editor-main">
        <div className="admin-tabs" role="tablist" aria-label="상품 등록 단계">
          {["기본정보", "미디어", "상세 콘텐츠", "가격·예약", "회차·재고", "연관 설정"].map((tab, index) => (
            <button aria-selected={index === 0} className="admin-tab" data-active={index === 0} key={tab} role="tab" tabIndex={index === 0 ? 0 : -1} type="button">
              {tab}
            </button>
          ))}
        </div>
        <AdminProductForm />
      </article>
      <aside className="admin-editor-aside">
        <article className="admin-card">
          <span>등록 체크</span>
          <strong>프론트 노출 전 확인</strong>
          <ul className="admin-checklist">
            <li>세로형 썸네일과 상세 이미지 등록</li>
            <li>예약 유형과 승인 필요 여부 확인</li>
            <li>팀 단위 재고와 캘린더 노출 확인</li>
          </ul>
          <button className="admin-action-button primary" type="button" data-admin-toast="상품 저장 준비가 완료되었습니다.">
            <RiSave3Line size={16} />
            상품 저장
          </button>
        </article>
        <article className="admin-card">
          <span>회차 미리보기</span>
          <div className="admin-schedule-mini-list">
            {data.experiences.slice(0, 2).flatMap((experience) =>
              experience.schedules.slice(0, 2).map((schedule) => (
                <p key={`${experience.slug}-${schedule.date}-${schedule.label}`}>
                  <b>{schedule.date}</b>
                  <span>{schedule.label} · {schedule.reservedTeams ?? 0}/{schedule.maxTeams ?? 4}팀</span>
                </p>
              )),
            )}
          </div>
        </article>
      </aside>
    </section>
  );
}

function CategoriesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["categories"][number]>[] = [
    { key: "label", label: "카테고리", render: (row) => <strong>{row.label}</strong> },
    { key: "href", label: "연결 경로", render: (row) => row.href },
    { key: "icon", label: "아이콘 에셋", render: (row) => row.iconAsset },
    { key: "depth", label: "깊이", align: "center", render: () => "1단계" },
    { key: "status", label: "노출", render: () => <AdminStatusBadge tone="success">노출중</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: "카테고리명" },
        { label: "깊이", name: "depth", type: "select", options: ["1단계", "2단계"] },
        { label: "노출위치", name: "placement", type: "select", options: ["홈 아이콘", "상품 필터", "메가메뉴"] },
      ]}
      resultLabel="홈 아이콘 카테고리와 상품 분류 관리"
      total={data.categories.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons danger="숨김 처리" primary="카테고리 수정" secondary="순서 변경" />}
        columns={columns}
        detail={(row) => <DetailPairs items={[["아이콘 파일", row.iconAsset], ["연결 경로", row.href], ["톤", row.tone], ["프론트 반영", "홈 아이콘, 필터 모달, 메가메뉴에 동시 사용"]]} />}
        rowKey={(row) => row.label}
        rows={data.categories}
      />
    </ListFrame>
  );
}

function ReservationsPage({ data }: { data: AdminData }) {
  const pending = data.reservations.filter((reservation) => toneFromStatus(reservation.status) === "warning");
  const paid = data.reservations.filter((reservation) => /결제|확정/.test(reservation.status));
  const canceled = data.reservations.filter((reservation) => toneFromStatus(reservation.status) === "danger");

  return (
    <ListFrame
      bulkOptions={["예약 확정", "안내 메일 발송", "환불 요청 검토", "노쇼 처리"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "예약번호, 예약자, 연락처" },
        { label: "예약상태", name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED_BY_USER", "NO_SHOW"] },
        { label: "결제상태", name: "payment", type: "select", options: ["UNPAID", "PAID", "REFUND_REQUESTED", "REFUNDED"] },
        { label: "예약유형", name: "reservationType", type: "select", options: ["즉시예약", "승인예약", "문의예약"] },
        { label: "이용일", name: "useDate", type: "date" },
        { label: "회원구분", name: "memberType", type: "select", options: ["일반", "기업"] },
      ]}
      resultLabel="승인 대기 예약을 우선 처리"
      summary={
        <div className="admin-lane-summary">
          <StatCard detail="호스트 확인 필요" label="승인 대기" value={pending.length} />
          <StatCard detail="이용 안내 발송 대상" label="확정/결제" value={paid.length} />
          <StatCard detail="환불 또는 노쇼 검토" label="취소·이슈" value={canceled.length} />
        </div>
      }
      total={data.reservations.length}
    >
      <ReservationTable rows={data.reservations} />
    </ListFrame>
  );
}

function SchedulesPage({ data }: { data: AdminData }) {
  const schedules = data.experiences.flatMap((experience) =>
    experience.schedules.map((schedule) => ({
      ...schedule,
      product: experience.title,
      host: experience.host.name,
      region: experience.region,
    })),
  );

  return (
    <section className="admin-schedule-shell">
      <AdminFilterBar
        fields={[
          { label: "상품", name: "product", placeholder: "상품명 자동완성" },
          { label: "호스트", name: "host", placeholder: "호스트명" },
          { label: "월", name: "month", type: "date", defaultValue: "2026-05-23" },
          { label: "상태", name: "status", type: "select", options: ["OPEN", "CLOSED", "HIDDEN"] },
          { label: "재고", name: "stock", type: "select", options: ["여유", "마감임박", "마감"] },
        ]}
        resultLabel="캘린더 기반 회차·팀 재고 관리"
      />
      <div className="admin-schedule-dashboard">
        <div className="admin-calendar-panel">
          <div className="admin-calendar-board">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {schedules.slice(0, 14).map((schedule, index) => {
              const isFull = schedule.booked >= schedule.capacity;
              return (
                <article className="admin-calendar-cell" data-state={isFull ? "full" : "open"} key={`${schedule.product}-${schedule.date}-${schedule.label}`}>
                  <b>{index + 17}</b>
                  <strong>{schedule.product}</strong>
                  <small>{schedule.label} · {schedule.region}</small>
                  <AdminStatusBadge tone={isFull ? "danger" : "success"}>
                    {schedule.reservedTeams ?? 0}/{schedule.maxTeams ?? 4}팀
                  </AdminStatusBadge>
                </article>
              );
            })}
          </div>
        </div>
        <aside className="admin-stock-inspector">
          <span>선택 회차</span>
          <strong>{schedules[0]?.product ?? "회차 없음"}</strong>
          <DetailPairs
            items={[
              ["운영일", schedules[0]?.date ?? "-"],
              ["시간", schedules[0]?.label ?? "-"],
              ["팀 재고", `${schedules[0]?.reservedTeams ?? 0}/${schedules[0]?.maxTeams ?? 0}팀`],
              ["인원 재고", `${schedules[0]?.booked ?? 0}/${schedules[0]?.capacity ?? 0}명`],
            ]}
          />
          <RowActionButtons danger="일괄 마감" info="예약자 안내" primary="재고 수정" secondary="반복 등록" />
        </aside>
      </div>
    </section>
  );
}

function EventsPage({ closed, data }: { closed: boolean; data: AdminData }) {
  const rows = data.events.filter((event) => (closed ? event.status !== "ongoing" : event.status === "ongoing"));
  const columns: AdminTableColumn<AdminData["events"][number]>[] = [
    { key: "title", label: "행사명", render: (row) => <strong>{row.title}</strong> },
    { key: "period", label: "기간", render: (row) => row.period },
    { key: "venue", label: "장소", render: (row) => row.venue },
    { key: "partner", label: "파트너", render: (row) => row.partner },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.badge)}>{row.badge}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulkOptions={closed ? ["포트폴리오 노출", "결과 숨김", "성과 리포트 발행"] : ["모집 시작", "모집 마감", "상단 배너 연결"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "행사명, 장소, 파트너" },
        { label: "상태", name: "status", type: "select", options: ["DRAFT", "UPCOMING", "ONGOING", "CLOSED"] },
        { label: "행사일", name: "eventDate", type: "date" },
        { label: "배너 연결", name: "banner", type: "select", options: ["연결됨", "미연결"] },
      ]}
      resultLabel={closed ? "종료 행사 포트폴리오 관리" : "진행중 행사 모집과 노출 관리"}
      summary={
        <div className="admin-event-showcase">
          {rows.slice(0, 3).map((event) => (
            <article key={event.slug}>
              <img alt="" src={event.image} />
              <span>{event.period}</span>
              <strong>{event.title}</strong>
              <small>{event.venue} · {event.partner}</small>
            </article>
          ))}
        </div>
      }
      total={rows.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons info={closed ? "성과 리포트" : "참가자 안내"} primary={closed ? "결과 수정" : "행사 수정"} secondary="상세 미리보기" />}
        columns={columns}
        detail={(row) => <DetailPairs items={[["요약", row.summary], ["파트너", row.partner], ["장소", row.venue], ["프론트 노출", closed ? "종료된 행사 포트폴리오" : "진행중 행사 리스트"]]} />}
        rowKey={(row) => row.slug}
        rows={rows}
      />
    </ListFrame>
  );
}

function PackagesPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-b2b-layout">
      <article className="admin-card admin-package-builder">
        <div className="admin-card-header">
          <div>
            <span>패키지 구성</span>
            <h2>프로그램과 옵션을 견적 단위로 묶습니다.</h2>
          </div>
          <Link className="admin-action-button primary" href="/admin/packages/new">
            <RiAddLine size={16} />
            패키지 등록
          </Link>
        </div>
        <div className="admin-program-matrix">
          {data.programs.map((program) => (
            <article key={program.id}>
              <span>{program.type}</span>
              <strong>{program.title}</strong>
              <small>{program.duration}</small>
              <b>{formatWon(program.basePrice)}</b>
            </article>
          ))}
        </div>
      </article>
      <aside className="admin-b2b-side">
        <article className="admin-card">
          <span>인원 구간 할인</span>
          <strong>기관 견적 기준</strong>
          <div className="admin-tier-list">
            {data.discountTiers.map((tier) => (
              <p key={tier.min}>
                {tier.label}
                <b>{tier.rate}%</b>
              </p>
            ))}
          </div>
        </article>
        <article className="admin-card">
          <span>추가 옵션</span>
          <div className="admin-option-stack">
            {data.packageOptions.map((option) => (
              <p key={option.id}>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
                <b>{formatWon(option.price)}</b>
              </p>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}

function QuotesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["quoteRequests"][number]>[] = [
    { key: "org", label: "기관명", render: (row) => <strong>{row.org}</strong> },
    { key: "contact", label: "담당자", render: (row) => row.contact ?? "-" },
    { key: "period", label: "희망기간", render: () => "2026-06-12 - 2026-06-13" },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "program", label: "선택 프로그램", render: (row) => row.program },
    { key: "amount", label: "예상금액", align: "right", render: (row) => (row.estimatedTotal ? formatWon(row.estimatedTotal) : row.budget) },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulkOptions={["견적 검토", "견적서 발송", "예약 전환", "담당자 배정"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "기관명, 견적번호, 담당자" },
        { label: "상태", name: "status", type: "select", options: ["REQUESTED", "IN_REVIEW", "QUOTED", "WON", "LOST", "CANCELED"] },
        { label: "인원", name: "people", type: "select", options: ["10명 이하", "20명", "30명", "40명 이상"] },
        { label: "예산", name: "budget", type: "select", options: ["500만원 이하", "1,000만원 이하", "2,000만원 이하", "협의"] },
        { label: "요청일", name: "requestedAt", type: "date" },
        { label: "담당자", name: "owner", type: "select", options: ["김선재", "운영팀"] },
      ]}
      resultLabel="요청 접수 → 검토 → 견적 발송 → 예약 전환"
      summary={
        <div className="admin-pipeline-board">
          {["요청 접수", "검토중", "견적 발송", "예약 전환"].map((step, index) => (
            <article key={step}>
              <span>{step}</span>
              <strong>{index === 0 ? data.quoteRequests.length : index}</strong>
              <small>{index === 0 ? "새 요청 확인" : "담당자 처리 필요"}</small>
            </article>
          ))}
        </div>
      }
      total={data.quoteRequests.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons info="견적서 발송" primary="예약 전환" secondary="금액 조정" />}
        columns={columns}
        detail={(row) => <DetailPairs items={[["기관", row.org], ["담당자", row.contact ?? "-"], ["프로그램", row.program], ["옵션", row.options ?? "-"], ["예산", row.budget]]} />}
        rowKey={(row) => `${row.org}-${row.contact ?? ""}`}
        rows={data.quoteRequests}
      />
    </ListFrame>
  );
}

function ContentPage({ data, type }: { data: AdminData; type: "banners" | "curations" | "journal" | "reviews" }) {
  if (type === "banners") {
    const rows = [
      ...data.heroSlides.map((banner, index) => ({ slot: "MAIN_HERO", title: banner.title, subtitle: banner.description, href: banner.href, image: banner.image, status: "노출중", key: `hero-${index}` })),
      ...data.packageCtas.map((banner, index) => ({ slot: "MAIN_B2B_CTA", title: banner.title, subtitle: banner.subtitle, href: banner.href, image: banner.hostImages[0], status: "노출중", key: `cta-${index}` })),
    ];
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "slot", label: "슬롯", render: (row) => row.slot },
      { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
      { key: "period", label: "노출기간", render: () => "상시" },
      { key: "link", label: "링크", render: (row) => row.href },
      { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone="success">{row.status}</AdminStatusBadge> },
    ];
    return (
      <ListFrame
        filters={[
          { label: "슬롯", name: "slot", type: "select", options: ["MAIN_HERO", "MAIN_EVENT", "MAIN_CURATION", "MAIN_B2B_CTA", "LIST_TOP"] },
          { label: "노출상태", name: "status", type: "select", options: ["노출중", "예약노출", "비공개"] },
          { label: "노출 시작일", name: "startAt", type: "date" },
        ]}
        resultLabel="위치별 배너 슬롯과 링크 관리"
        total={rows.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons danger="비공개 전환" primary="배너 수정" secondary="순서 변경" />}
          columns={columns}
          detail={(row) => (
            <div className="admin-row-product-detail">
              <img alt="" src={row.image} />
              <DetailPairs items={[["서브카피", row.subtitle], ["연결 링크", row.href], ["노출 슬롯", row.slot]]} />
            </div>
          )}
          rowKey={(row) => row.key}
          rows={rows}
        />
      </ListFrame>
    );
  }

  if (type === "curations") {
    const columns: AdminTableColumn<AdminData["collections"][number]>[] = [
      { key: "title", label: "기획전명", render: (row) => <strong>{row.title}</strong> },
      { key: "products", label: "포함 상품", align: "center", render: () => "3개" },
      { key: "period", label: "노출기간", render: () => "상시" },
      { key: "status", label: "상태", render: () => <AdminStatusBadge tone="success">노출중</AdminStatusBadge> },
      { key: "views", label: "페이지뷰", align: "right", render: () => "1,248" },
    ];
    return (
      <ListFrame
        filters={[
          { label: "검색어", name: "query", placeholder: "기획전명, 테마" },
          { label: "상태", name: "status", type: "select", options: ["노출중", "비공개", "예약노출"] },
          { label: "연결 상품", name: "products", type: "select", options: ["3개 이하", "4개 이상"] },
        ]}
        resultLabel="테마 큐레이션 목록"
        total={data.collections.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons primary="기획전 수정" secondary="상품 연결" />}
          columns={columns}
          detail={(row) => <DetailPairs items={[["설명", row.description], ["링크", row.href], ["키 비주얼", row.image]]} />}
          rowKey={(row) => row.title}
          rows={data.collections}
        />
      </ListFrame>
    );
  }

  if (type === "journal") {
    const columns: AdminTableColumn<AdminData["journals"][number]>[] = [
      { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
      { key: "category", label: "카테고리", render: (row) => row.category },
      { key: "date", label: "발행일", render: (row) => row.date },
      { key: "status", label: "상태", render: () => <AdminStatusBadge tone="success">PUBLISHED</AdminStatusBadge> },
      { key: "views", label: "조회수", align: "right", render: () => "842" },
    ];
    return (
      <ListFrame
        filters={[
          { label: "검색어", name: "query", placeholder: "제목, 태그, SEO 키워드" },
          { label: "발행상태", name: "status", type: "select", options: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          { label: "카테고리", name: "category", type: "select", options: ["Local", "Food", "Guide", "B2B"] },
          { label: "발행일", name: "publishedAt", type: "date" },
        ]}
        resultLabel="저널 발행과 검색 노출 관리"
        total={data.journals.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons primary="본문 수정" secondary="SEO 설정" />}
          columns={columns}
          detail={(row) => <DetailPairs items={[["요약", row.excerpt], ["대표 이미지", row.image], ["상세 URL", `/journal/${row.slug}`]]} />}
          rowKey={(row) => row.slug}
          rows={data.journals}
        />
      </ListFrame>
    );
  }

  const columns: AdminTableColumn<AdminData["flatReviews"][number]>[] = [
    { key: "name", label: "작성자", render: (row) => <strong>{row.name}</strong> },
    { key: "rating", label: "평점", align: "center", render: (row) => row.rating },
    { key: "content", label: "내용 요약", render: (row) => row.text },
    { key: "status", label: "노출상태", render: () => <AdminStatusBadge tone="success">VISIBLE</AdminStatusBadge> },
    { key: "reports", label: "신고", align: "center", render: () => "0" },
  ];
  return (
    <ListFrame
      bulkOptions={["선택 리뷰 노출", "선택 리뷰 숨김", "호스트 답변 요청"]}
      filters={[
        { label: "상품", name: "product", placeholder: "상품명" },
        { label: "평점", name: "rating", type: "select", options: ["5", "4", "3", "2", "1"] },
        { label: "노출상태", name: "status", type: "select", options: ["VISIBLE", "HIDDEN", "PENDING"] },
        { label: "신고상태", name: "report", type: "select", options: ["신고 없음", "신고 있음"] },
      ]}
      resultLabel="리뷰 검수와 노출 관리"
      total={data.flatReviews.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons danger="숨김 처리" info="호스트 답변 요청" primary="노출 승인" />}
        columns={columns}
        detail={(row) => <DetailPairs items={[["작성자", row.name], ["평점", row.rating], ["전문", row.text], ["검수 기준", "개인정보와 부적절 표현 확인"]]} />}
        rowKey={(row) => `${row.name}-${row.text}`}
        rows={data.flatReviews}
      />
    </ListFrame>
  );
}

function AdminWorkflowPage({ actionKey, config, data }: { actionKey: string; config: AdminRoute; data: AdminData }) {
  const parentHref = `/${["admin", ...actionKey.split("/").slice(0, -1)].join("/")}`;
  const detail = workflowCopy[actionKey] ?? {
    backHref: parentHref,
    scope: config.eyebrow,
    fields: ["대상", "상태", "담당자", "메모"],
    checklist: ["입력값 검토", "프론트 노출 영향 확인", "작업 로그 저장"],
  };
  const referenceCount = actionKey.startsWith("reservations")
    ? data.reservations.length
    : actionKey.startsWith("quotes")
      ? data.quoteRequests.length
      : actionKey.startsWith("events")
        ? data.events.length
        : actionKey.startsWith("members")
          ? data.members.length
          : actionKey.startsWith("journal")
            ? data.journals.length
            : data.experiences.length;

  return (
    <section className="admin-workflow-detail">
      <nav className="admin-workflow-back" aria-label="관리자 상세 탐색">
        <Link href={detail.backHref}>목록으로 돌아가기</Link>
      </nav>
      <div className="admin-workflow-hero">
        <div>
          <span>{detail.scope}</span>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <dl>
          <div>
            <dt>참조 데이터</dt>
            <dd>{referenceCount.toLocaleString("ko-KR")}건</dd>
          </div>
          <div>
            <dt>처리 방식</dt>
            <dd>검토 후 저장</dd>
          </div>
        </dl>
      </div>
      <div className="admin-workflow-layout">
        <article className="admin-workflow-form-panel">
          <div className="admin-card-header">
            <div>
              <span>입력 정보</span>
              <h2>{config.title} 상세 설정</h2>
            </div>
          </div>
          <div className="admin-workflow-fields">
            {detail.fields.map((field, index) => (
              <label data-wide={/(본문|메시지|요약|안내|메모)/.test(field)} key={field}>
                <span>{field}</span>
                {/(상태|역할|슬롯|형식|구분|정책|요일|노출|예약|권한)/.test(field) ? (
                  <AdminSelect defaultValue="">
                    <option value="">선택</option>
                    <option value="primary">기본값</option>
                    <option value="review">검토 필요</option>
                  </AdminSelect>
                ) : /(본문|메시지|요약|안내|메모)/.test(field) ? (
                  <textarea placeholder={`${field}을 입력하세요.`} />
                ) : (
                  <input placeholder={index === 0 ? `${field} 검색 또는 입력` : `${field} 입력`} />
                )}
              </label>
            ))}
          </div>
          <div className="admin-workflow-actions">
            <Link className="admin-action-button ghost" href={detail.backHref}>
              취소
            </Link>
            <button className={`admin-action-button ${actionVariant(config.primaryAction ?? config.title, true)}`} type="button" data-admin-toast={`${config.title} 작업 내용을 저장했습니다.`}>
              <ActionIcon label={config.primaryAction ?? config.title} />
              {config.primaryAction ?? "저장"}
            </button>
          </div>
        </article>
        <aside className="admin-workflow-side-panel">
          <div>
            <span>처리 체크리스트</span>
            <strong>저장 전 확인</strong>
          </div>
          <ol>
            {detail.checklist.map((checkpoint) => (
              <li key={checkpoint}>{checkpoint}</li>
            ))}
          </ol>
          <p>프론트 데이터와 관리자 DB가 같은 업무 단위로 연결될 수 있도록 필드와 검수 기준을 분리했습니다.</p>
        </aside>
      </div>
    </section>
  );
}

function SettingsPage({ type }: { type: "admins" | "site" | "policies" }) {
  if (type === "admins") {
    const rows = [
      { name: "김선재", email: "hello@eataround.co.kr", role: "SUPER_ADMIN", lastLogin: "2026-05-19 10:30", status: "활성" },
      { name: "운영팀", email: "ops@eataround.co.kr", role: "OPERATOR", lastLogin: "2026-05-18 18:20", status: "활성" },
    ];
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "name", label: "이름", render: (row) => <strong>{row.name}</strong> },
      { key: "email", label: "이메일", render: (row) => row.email },
      { key: "role", label: "역할", render: (row) => row.role },
      { key: "lastLogin", label: "마지막 로그인", render: (row) => row.lastLogin },
      { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone="success">{row.status}</AdminStatusBadge> },
    ];
    return (
      <ListFrame
        filters={[
          { label: "검색어", name: "query", placeholder: "이름, 이메일" },
          { label: "역할", name: "role", type: "select", options: ["SUPER_ADMIN", "OPERATOR"] },
          { label: "상태", name: "status", type: "select", options: ["활성", "잠금", "초대중"] },
        ]}
        resultLabel="관리자 계정과 권한"
        total={rows.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons danger="잠금 처리" primary="권한 변경" secondary="접속 로그" />}
          columns={columns}
          detail={(row) => <DetailPairs items={[["계정", row.email], ["역할", row.role], ["마지막 로그인", row.lastLogin], ["권한 범위", row.role === "SUPER_ADMIN" ? "전체 메뉴" : "운영 메뉴"]]} />}
          rowKey={(row) => row.email}
          rows={rows}
        />
      </ListFrame>
    );
  }

  const labels =
    type === "site"
      ? ["회사명", "대표자", "사업자번호", "통신판매업번호", "고객센터", "비즈니스 이메일", "기본 SEO 제목", "기본 SEO 설명"]
      : ["이용약관", "개인정보처리방침", "환불정책", "취소·환불 템플릿"];

  return (
    <section className="admin-settings-layout">
      <article className="admin-card">
        <div className="admin-card-header">
          <div>
            <span>{type === "site" ? "사이트 기본정보" : "약관·정책"}</span>
            <h2>{type === "site" ? "사업자·고객센터·SEO" : "버전 관리"}</h2>
          </div>
          {type === "policies" ? (
            <Link className="admin-action-button primary" href="/admin/settings/policies/new">
              새 버전 발행
            </Link>
          ) : null}
        </div>
        <div className="admin-settings-grid">
          {labels.map((label) => (
            <label key={label}>
              <span>{label}</span>
              <input defaultValue={type === "site" ? "지붕뚫은친구들" : "v1.0 · 2026-05-19"} />
            </label>
          ))}
        </div>
      </article>
      <aside className="admin-card admin-settings-guard">
        <RiShieldCheckLine size={22} />
        <strong>SUPER_ADMIN 권한</strong>
        <p>정책, 사업자 정보, 관리자 계정 변경은 감사 로그에 남도록 구성했습니다.</p>
      </aside>
    </section>
  );
}

function AdminPageBody({ config, data, routeKey }: { config: AdminRoute; data: AdminData; routeKey: string }) {
  if (routeKey === "dashboard") return <DashboardPage data={data} />;
  if (routeKey === "members/general") return <MembersPage corporate={false} data={data} />;
  if (routeKey === "members/corporate") return <MembersPage corporate data={data} />;
  if (routeKey === "products") return <ProductsPage data={data} />;
  if (routeKey === "products/new") return <ProductEditorPage data={data} />;
  if (routeKey === "products/categories") return <CategoriesPage data={data} />;
  if (routeKey === "reservations") return <ReservationsPage data={data} />;
  if (routeKey === "reservations/schedules") return <SchedulesPage data={data} />;
  if (routeKey === "events/ongoing") return <EventsPage closed={false} data={data} />;
  if (routeKey === "events/closed") return <EventsPage closed data={data} />;
  if (routeKey === "packages") return <PackagesPage data={data} />;
  if (routeKey === "quotes") return <QuotesPage data={data} />;
  if (routeKey === "banners") return <ContentPage data={data} type="banners" />;
  if (routeKey === "curations") return <ContentPage data={data} type="curations" />;
  if (routeKey === "journal") return <ContentPage data={data} type="journal" />;
  if (routeKey === "reviews") return <ContentPage data={data} type="reviews" />;
  if (routeKey === "settings/admins") return <SettingsPage type="admins" />;
  if (routeKey === "settings/site") return <SettingsPage type="site" />;
  if (routeKey === "settings/policies") return <SettingsPage type="policies" />;
  if (config.mode === "form") return <AdminWorkflowPage actionKey={routeKey} config={config} data={data} />;
  return <AdminWorkflowPage actionKey={routeKey} config={config} data={data} />;
}

export default async function AdminCatchAllPage({ params }: AdminCatchAllPageProps) {
  const { slug } = await params;
  const routeKey = slug.join("/");
  const config = getAdminRouteConfig(routeKey);
  if (!config) notFound();

  const data = await loadAdminData();

  return (
    <>
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        actions={<HeaderActions currentKey={routeKey} primary={config.primaryAction} secondary={config.secondaryAction} />}
      />
      <AdminPageBody config={config} data={data} routeKey={routeKey} />
    </>
  );
}
