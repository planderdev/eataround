import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RiAddLine,
  RiArrowRightLine,
  RiFilePdf2Line,
  RiMailSendLine,
  RiSave3Line,
} from "@remixicon/react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminPagination,
  AdminResultSummary,
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

const dashboardBars = [38, 58, 46, 68, 74, 62, 88, 54, 71, 96];

export function generateStaticParams() {
  return adminRouteSlugs;
}

export async function generateMetadata({ params }: AdminCatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getAdminRouteConfig(slug.join("/"));
  return { title: config?.title ?? "관리자" };
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
  if (/(취소|환불|종료|마감|반려|숨김|삭제|CANCELED|REFUNDED|CLOSED)/i.test(status)) return "danger";
  if (/(검토|대기|요청|임시|예정|PENDING|REQUESTED|IN_REVIEW|DRAFT)/i.test(status)) return "warning";
  if (/(확정|승인|노출|진행|발행|결제|완료|CONFIRMED|PAID|ONGOING|PUBLISHED|APPROVED)/i.test(status)) return "success";
  if (/(비공개|문의|UNPAID|HIDDEN|ARCHIVED)/i.test(status)) return "info";
  return "neutral";
}

function HeaderActions({ primary, secondary }: { primary?: string; secondary?: string }) {
  return (
    <>
      {primary ? (
        <button
          className="admin-action-button primary"
          type="button"
          data-admin-panel={primary}
          data-admin-description={`${primary} 작업에 필요한 상태, 담당자, 운영 메모를 빠르게 정리합니다.`}
        >
          {primary.includes("발송") || primary.includes("메일") ? <RiMailSendLine size={16} /> : null}
          {primary.includes("견적서") ? <RiFilePdf2Line size={16} /> : null}
          {primary.includes("저장") ? <RiSave3Line size={16} /> : null}
          {!primary.includes("발송") && !primary.includes("메일") && !primary.includes("견적서") && !primary.includes("저장") ? (
            <RiAddLine size={16} />
          ) : null}
          {primary}
        </button>
      ) : null}
      {secondary ? (
        <button
          className="admin-action-button"
          type="button"
          data-admin-panel={secondary}
          data-admin-description={`${secondary} 진행 전 대상 항목과 후속 처리 내용을 확인합니다.`}
        >
          {secondary.includes("메일") ? <RiMailSendLine size={16} /> : <RiArrowRightLine size={16} />}
          {secondary}
        </button>
      ) : null}
    </>
  );
}

function AdminMetricCard({ detail, label, value }: { detail: string; label: string; value: string | number }) {
  return (
    <article className="admin-card admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
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
      <section className="admin-metrics" aria-label="오늘 운영 지표">
        <AdminMetricCard detail="어제 대비 +12%" label="오늘 신규 예약" value={data.reservations.length} />
        <AdminMetricCard detail="어제 대비 +8%" label="오늘 매출" value={formatWon(estimatedSales)} />
        <AdminMetricCard detail="처리하러 가기" label="미확정 예약" value={pendingReservations.length} />
        <AdminMetricCard detail="견적 검토 필요" label="미처리 견적" value={pendingQuotes.length} />
        <AdminMetricCard detail="7일 내 마감 행사 포함" label="진행중 행사" value={ongoingEvents.length} />
        <AdminMetricCard detail={`일반 ${data.members.length - corporateMembers.length} / 기업 ${corporateMembers.length}`} label="신규 가입 회원" value={data.members.length} />
      </section>

      <section className="admin-analytics-grid" aria-label="대시보드 차트">
        <article className="admin-card admin-chart-card">
          <div className="admin-card-header">
            <div>
              <span>최근 30일</span>
              <h2>예약 추이</h2>
            </div>
          </div>
          <div className="admin-chart-line" aria-hidden="true">
            {dashboardBars.map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </article>
        <article className="admin-card admin-chart-card">
          <div className="admin-card-header">
            <div>
              <span>카테고리</span>
              <h2>예약 비율</h2>
            </div>
          </div>
          <div className="admin-donut-chart" aria-hidden="true" />
          <ul className="admin-chart-legend">
            <li>쿠킹·베이킹 42%</li>
            <li>지역·전통 28%</li>
            <li>웰니스 18%</li>
            <li>기타 12%</li>
          </ul>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>예약관리</span>
              <h2>최근 예약 10건</h2>
            </div>
            <Link className="admin-text-link" href="/admin/reservations">
              전체보기
              <RiArrowRightLine size={16} />
            </Link>
          </div>
          <ReservationTable rows={data.reservations.slice(0, 10)} />
        </article>
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>견적관리</span>
              <h2>최근 견적 요청</h2>
            </div>
            <Link className="admin-text-link" href="/admin/quotes">
              처리하기
              <RiArrowRightLine size={16} />
            </Link>
          </div>
          <div className="admin-task-list">
            {(pendingQuotes.length ? pendingQuotes : data.quoteRequests).slice(0, 5).map((quote) => (
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
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>상품관리</span>
              <h2>인기 상품 TOP 5</h2>
            </div>
          </div>
          <div className="admin-task-list">
            {data.experiences.slice(0, 5).map((experience, index) => (
              <Link href="/admin/products" key={experience.slug}>
                <span>
                  <strong>{experience.title}</strong>
                  <small>{experience.region} · {experience.category}</small>
                </span>
                <b>{index + 1}위</b>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function ListFrame({
  children,
  filters,
  resultLabel,
  total,
}: {
  children: React.ReactNode;
  filters: Parameters<typeof AdminFilterBar>[0]["fields"];
  resultLabel: string;
  total: number;
}) {
  return (
    <section className="admin-card admin-list-card">
      <AdminFilterBar fields={filters} resultLabel={resultLabel} />
      <AdminResultSummary>
        <span>총 {total.toLocaleString("ko-KR")}건</span>
        <select className="admin-select" defaultValue="bulk">
          <option value="bulk">일괄 액션</option>
          <option value="visible">노출 ON</option>
          <option value="hidden">비공개</option>
          <option value="delete">소프트 삭제</option>
        </select>
      </AdminResultSummary>
      {children}
      <AdminPagination total={total} />
    </section>
  );
}

function ReservationTable({ rows }: { rows: AdminData["reservations"] }) {
  const columns: AdminTableColumn<AdminData["reservations"][number]>[] = [
    { key: "product", label: "상품명", render: (row) => row.product },
    { key: "user", label: "예약자", render: (row) => row.user },
    { key: "date", label: "이용일정", render: (row) => row.date },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "payment", label: "결제금액", align: "right", render: (row) => (row.amount ? formatWon(row.amount) : "UNPAID") },
    {
      key: "status",
      label: "예약상태",
      render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge>,
    },
  ];
  return <AdminDataTable columns={columns} rowKey={(row) => `${row.product}-${row.user}-${row.date}`} rows={rows} />;
}

function MembersPage({ data, corporate }: { data: AdminData; corporate: boolean }) {
  const rows = data.members.filter((member) => (corporate ? member.type.includes("기업") || member.type.includes("기관") : member.type === "일반회원"));
  const columns: AdminTableColumn<AdminData["members"][number]>[] = corporate
    ? [
        { key: "name", label: "기관명", render: (row) => row.name },
        { key: "manager", label: "담당자", render: (row) => row.name },
        { key: "type", label: "구분", render: (row) => row.type },
        { key: "email", label: "이메일", render: (row) => row.email },
        { key: "quotes", label: "견적요청", align: "center", render: () => "2건" },
        { key: "status", label: "승인 상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
      ]
    : [
        { key: "id", label: "회원번호", render: (row) => `M-${String(row.email.length * 37).padStart(4, "0")}` },
        { key: "name", label: "이름", render: (row) => row.name },
        { key: "email", label: "이메일", render: (row) => row.email },
        { key: "channel", label: "가입경로", render: () => "이메일" },
        { key: "count", label: "예약", align: "center", render: () => "1건" },
        { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
      ];

  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: corporate ? "기관명, 담당자, 이메일" : "이름, 이메일, 연락처" },
        { label: corporate ? "기관 구분" : "가입경로", name: "type", type: "select", options: corporate ? ["영리", "비영리", "공공"] : ["이메일", "카카오", "네이버"] },
        { label: "상태", name: "status", type: "select", options: corporate ? ["승인대기", "승인완료", "반려"] : ["정상", "휴면", "탈퇴"] },
        { label: "가입일", name: "createdAt", type: "date" },
      ]}
      resultLabel={corporate ? "승인 상태별 기관회원" : "일반회원 목록"}
      total={rows.length}
    >
      <AdminDataTable columns={columns} rowKey={(row) => `${row.email}-${row.type}`} rows={rows} />
    </ListFrame>
  );
}

function ProductsPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["experiences"][number]>[] = [
    { key: "title", label: "상품명", render: (row) => row.title },
    { key: "category", label: "카테고리", render: (row) => row.category },
    { key: "region", label: "지역", render: (row) => row.region },
    { key: "price", label: "기본가", align: "right", render: (row) => formatWon(row.price) },
    { key: "duration", label: "소요시간", render: (row) => row.duration },
    { key: "booking", label: "예약유형", render: (row) => row.schedules[0]?.reservationType ?? "TIMESLOT" },
    { key: "status", label: "노출상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.badge ?? "노출중")}>{row.badge ?? "노출중"}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: "상품명, 태그, 호스트" },
        { label: "카테고리", name: "category", type: "select", options: data.categories.map((category) => category.label) },
        { label: "지역", name: "region", type: "select", options: ["제주시", "서귀포시", "동부", "서부"] },
        { label: "예약유형", name: "bookingType", type: "select", options: ["DATE", "TIMESLOT", "INQUIRY"] },
        { label: "등록일", name: "createdAt", type: "date" },
      ]}
      resultLabel="상품 목록 · 최근 30일 예약수 포함"
      total={data.experiences.length}
    >
      <AdminDataTable columns={columns} rowKey={(row) => row.slug} rows={data.experiences} />
    </ListFrame>
  );
}

function ProductEditorPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-detail-layout">
      <div className="admin-detail-main">
        <article className="admin-card">
          <div className="admin-tabs" role="tablist" aria-label="상품 등록 탭">
            {["기본정보", "미디어", "상세 콘텐츠", "가격·예약", "회차·재고", "연관 설정"].map((tab, index) => (
              <button className="admin-tab" data-active={index === 0} key={tab} type="button">
                {tab}
              </button>
            ))}
          </div>
          <AdminProductForm />
          <div className="admin-editor-grid">
            <label>
              <span>추천 대상</span>
              <input defaultValue="가족, 커플, 혼자, 기업·기관" />
            </label>
            <label>
              <span>날씨 적합</span>
              <input defaultValue="실내, 우천가능" />
            </label>
            <label>
              <span>예약 유형</span>
              <select className="admin-select" defaultValue="TIMESLOT">
                <option>DATE</option>
                <option>TIMESLOT</option>
                <option>INQUIRY</option>
              </select>
            </label>
            <label>
              <span>가격 정책</span>
              <select className="admin-select" defaultValue="PER_PERSON">
                <option>PER_PERSON</option>
                <option>PER_TEAM</option>
              </select>
            </label>
          </div>
        </article>
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>회차 프리셋</span>
              <h2>팀 단위 재고</h2>
            </div>
          </div>
          <div className="admin-schedule-grid">
            {data.experiences.slice(0, 3).flatMap((experience) =>
              experience.schedules.slice(0, 2).map((schedule) => (
                <article className="admin-schedule-card" key={`${experience.slug}-${schedule.date}-${schedule.label}`}>
                  <span>{schedule.date}</span>
                  <strong>{schedule.label}</strong>
                  <small>
                    예약 {schedule.reservedTeams ?? 0}/{schedule.maxTeams ?? 4}팀 · 인원 {schedule.booked}/{schedule.capacity}명
                  </small>
                  <AdminStatusBadge tone="success">OPEN</AdminStatusBadge>
                </article>
              )),
            )}
          </div>
        </article>
      </div>
      <aside className="admin-detail-side">
        <article className="admin-card">
          <span>상태</span>
          <strong>임시저장</strong>
          <button className="admin-action-button primary" type="button" data-admin-panel="상품 저장" data-admin-description="상품 기본정보, 가격, 회차 재고 설정을 저장 전 검토합니다.">
            <RiSave3Line size={16} />
            상품 저장
          </button>
          <button className="admin-action-button" type="button" data-admin-toast="미리보기 화면을 준비했습니다.">미리보기</button>
        </article>
        <article className="admin-card">
          <span>감사 로그</span>
          <p>상품 생성, 상태 변경, 가격 수정 기록이 저장됩니다.</p>
        </article>
      </aside>
    </section>
  );
}

function CategoriesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["categories"][number]>[] = [
    { key: "label", label: "카테고리", render: (row) => row.label },
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
      ]}
      resultLabel="메인 아이콘 카테고리와 상품 분류"
      total={data.categories.length}
    >
      <AdminDataTable columns={columns} rowKey={(row) => row.label} rows={data.categories} />
    </ListFrame>
  );
}

function ReservationsPage({ data }: { data: AdminData }) {
  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: "예약번호, 예약자, 연락처" },
        { label: "예약상태", name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED_BY_USER", "CANCELED_BY_ADMIN", "NO_SHOW"] },
        { label: "결제상태", name: "payment", type: "select", options: ["UNPAID", "PAID", "REFUND_REQUESTED", "REFUNDED", "PARTIAL_REFUNDED"] },
        { label: "이용일", name: "useDate", type: "date" },
        { label: "회원구분", name: "memberType", type: "select", options: ["일반", "기업"] },
      ]}
      resultLabel="승인 대기 예약 우선 정렬"
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
    })),
  );

  return (
    <section className="admin-card">
      <AdminFilterBar
        fields={[
          { label: "상품", name: "product", placeholder: "상품명 자동완성" },
          { label: "호스트", name: "host", placeholder: "호스트명" },
          { label: "월", name: "month", type: "date", defaultValue: "2026-05-23" },
          { label: "상태", name: "status", type: "select", options: ["OPEN", "CLOSED", "HIDDEN"] },
        ]}
        resultLabel="월/주/일 캘린더 뷰"
      />
      <div className="admin-calendar-board">
        {Array.from({ length: 7 }).map((_, index) => (
          <span key={index}>{["일", "월", "화", "수", "목", "금", "토"][index]}</span>
        ))}
        {schedules.slice(0, 14).map((schedule, index) => (
          <article className="admin-calendar-cell" key={`${schedule.product}-${schedule.date}-${schedule.label}`}>
            <b>{index + 17}</b>
            <strong>{schedule.product}</strong>
            <small>{schedule.label}</small>
            <AdminStatusBadge tone={schedule.booked >= schedule.capacity ? "danger" : "success"}>
              {schedule.reservedTeams ?? 0}/{schedule.maxTeams ?? 4}팀
            </AdminStatusBadge>
          </article>
        ))}
      </div>
      <AdminResultSummary>
        <span>일괄 마감 / 일괄 오픈 액션은 선택한 회차 기준으로 동작합니다.</span>
        <button className="admin-action-button" type="button" data-admin-panel="일괄 마감" data-admin-description="선택한 회차를 마감 처리하고 예약 가능 재고를 동시에 업데이트합니다.">일괄 마감</button>
      </AdminResultSummary>
    </section>
  );
}

function EventsPage({ data, closed }: { data: AdminData; closed: boolean }) {
  const rows = data.events.filter((event) => (closed ? event.status !== "ongoing" : event.status === "ongoing"));
  const columns: AdminTableColumn<AdminData["events"][number]>[] = [
    { key: "title", label: "행사명", render: (row) => row.title },
    { key: "period", label: "기간", render: (row) => row.period },
    { key: "venue", label: "장소", render: (row) => row.venue },
    { key: "partner", label: "파트너", render: (row) => row.partner },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.badge)}>{row.badge}</AdminStatusBadge> },
  ];
  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: "행사명, 장소" },
        { label: "상태", name: "status", type: "select", options: ["DRAFT", "UPCOMING", "ONGOING", "CLOSED"] },
        { label: "행사일", name: "eventDate", type: "date" },
      ]}
      resultLabel={closed ? "종료된 행사 포트폴리오" : "진행중 행사 운영"}
      total={rows.length}
    >
      <AdminDataTable columns={columns} rowKey={(row) => row.slug} rows={rows} />
    </ListFrame>
  );
}

function PackagesPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-detail-layout">
      <div className="admin-detail-main">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>패키지 구성</span>
              <h2>프로그램 선택</h2>
            </div>
          </div>
          <div className="admin-section-grid">
            {data.programs.map((program) => (
              <article className="admin-control-item" key={program.id}>
                <span>{program.type}</span>
                <strong>{program.title}</strong>
                <small>{program.duration} · {formatWon(program.basePrice)}</small>
              </article>
            ))}
          </div>
        </article>
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>추가 옵션</span>
              <h2>숙박·식사·이동</h2>
            </div>
          </div>
          <div className="admin-section-grid">
            {data.packageOptions.map((option) => (
              <article className="admin-control-item" key={option.id}>
                <span>{option.priceType === "person" ? "인당" : "고정"}</span>
                <strong>{option.title}</strong>
                <small>{option.description} · {formatWon(option.price)}</small>
              </article>
            ))}
          </div>
        </article>
      </div>
      <aside className="admin-detail-side">
        <article className="admin-card">
          <span>인원 구간 할인</span>
          <strong>RFP 기본값</strong>
          <div className="admin-tier-list">
            {data.discountTiers.map((tier) => (
              <p key={tier.min}>
                {tier.label}
                <b>{tier.rate}%</b>
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
    { key: "org", label: "기관명", render: (row) => row.org },
    { key: "contact", label: "담당자", render: (row) => row.contact ?? "-" },
    { key: "period", label: "희망기간", render: () => "2026-06-12 - 2026-06-13" },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "program", label: "선택 패키지", render: (row) => row.program },
    { key: "amount", label: "예상금액", align: "right", render: (row) => (row.estimatedTotal ? formatWon(row.estimatedTotal) : row.budget) },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];
  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: "기관명, 견적번호" },
        { label: "상태", name: "status", type: "select", options: ["REQUESTED", "IN_REVIEW", "QUOTED", "WON", "LOST", "CANCELED"] },
        { label: "요청일", name: "requestedAt", type: "date" },
        { label: "담당자", name: "owner", type: "select", options: ["김선재", "운영팀"] },
      ]}
      resultLabel="요청 접수 → 검토 → 견적 발송 → 예약 전환"
      total={data.quoteRequests.length}
    >
      <AdminDataTable columns={columns} rowKey={(row) => `${row.org}-${row.contact ?? ""}`} rows={data.quoteRequests} />
    </ListFrame>
  );
}

function ContentPage({ data, type }: { data: AdminData; type: "banners" | "curations" | "journal" | "reviews" }) {
  if (type === "banners") {
    const rows = [
      ...data.heroSlides.map((banner, index) => ({ slot: "MAIN_HERO", title: banner.title, subtitle: banner.description, href: banner.href, status: "노출중", key: `hero-${index}` })),
      ...data.packageCtas.map((banner, index) => ({ slot: "MAIN_B2B_CTA", title: banner.title, subtitle: banner.subtitle, href: banner.href, status: "노출중", key: `cta-${index}` })),
    ];
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "slot", label: "슬롯", render: (row) => row.slot },
      { key: "title", label: "제목", render: (row) => row.title },
      { key: "period", label: "노출기간", render: () => "상시" },
      { key: "link", label: "링크", render: (row) => row.href },
      { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone="success">{row.status}</AdminStatusBadge> },
    ];
    return <ListFrame filters={[{ label: "슬롯", name: "slot", type: "select", options: ["MAIN_HERO", "MAIN_EVENT", "MAIN_CURATION", "MAIN_B2B_CTA", "LIST_TOP"] }]} resultLabel="노출 위치별 배너 슬롯" total={rows.length}><AdminDataTable columns={columns} rowKey={(row) => row.key} rows={rows} /></ListFrame>;
  }

  if (type === "curations") {
    const columns: AdminTableColumn<AdminData["collections"][number]>[] = [
      { key: "title", label: "기획전명", render: (row) => row.title },
      { key: "products", label: "포함 상품수", align: "center", render: () => "3개" },
      { key: "period", label: "노출기간", render: () => "상시" },
      { key: "status", label: "상태", render: () => <AdminStatusBadge tone="success">노출중</AdminStatusBadge> },
      { key: "views", label: "페이지뷰", align: "right", render: () => "1,248" },
    ];
    return <ListFrame filters={[{ label: "검색어", name: "query", placeholder: "기획전명" }, { label: "상태", name: "status", type: "select", options: ["노출중", "비공개", "예약노출"] }]} resultLabel="테마 큐레이션 목록" total={data.collections.length}><AdminDataTable columns={columns} rowKey={(row) => row.title} rows={data.collections} /></ListFrame>;
  }

  if (type === "journal") {
    const columns: AdminTableColumn<AdminData["journals"][number]>[] = [
      { key: "title", label: "제목", render: (row) => row.title },
      { key: "category", label: "카테고리", render: (row) => row.category },
      { key: "date", label: "발행일", render: (row) => row.date },
      { key: "status", label: "상태", render: () => <AdminStatusBadge tone="success">PUBLISHED</AdminStatusBadge> },
      { key: "views", label: "조회수", align: "right", render: () => "842" },
    ];
    return <ListFrame filters={[{ label: "검색어", name: "query", placeholder: "제목, 태그" }, { label: "발행상태", name: "status", type: "select", options: ["DRAFT", "PUBLISHED", "ARCHIVED"] }]} resultLabel="저널 발행 목록" total={data.journals.length}><AdminDataTable columns={columns} rowKey={(row) => row.slug} rows={data.journals} /></ListFrame>;
  }

  const columns: AdminTableColumn<AdminData["flatReviews"][number]>[] = [
    { key: "name", label: "작성자", render: (row) => row.name },
    { key: "rating", label: "평점", align: "center", render: (row) => row.rating },
    { key: "content", label: "내용 요약", render: (row) => row.text },
    { key: "status", label: "노출상태", render: () => <AdminStatusBadge tone="success">VISIBLE</AdminStatusBadge> },
    { key: "reports", label: "신고", align: "center", render: () => "0" },
  ];
  return <ListFrame filters={[{ label: "상품", name: "product", placeholder: "상품명" }, { label: "평점", name: "rating", type: "select", options: ["5", "4", "3", "2", "1"] }, { label: "노출상태", name: "status", type: "select", options: ["VISIBLE", "HIDDEN", "PENDING"] }]} resultLabel="리뷰 검수 대기열" total={data.flatReviews.length}><AdminDataTable columns={columns} rowKey={(row) => `${row.name}-${row.text}`} rows={data.flatReviews} /></ListFrame>;
}

function SettingsPage({ type }: { type: "admins" | "site" | "policies" }) {
  if (type === "admins") {
    const rows = [
      { name: "김선재", email: "hello@eataround.co.kr", role: "SUPER_ADMIN", lastLogin: "2026-05-19 10:30", status: "활성" },
      { name: "운영팀", email: "ops@eataround.co.kr", role: "OPERATOR", lastLogin: "2026-05-18 18:20", status: "활성" },
    ];
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "name", label: "이름", render: (row) => row.name },
      { key: "email", label: "이메일", render: (row) => row.email },
      { key: "role", label: "역할", render: (row) => row.role },
      { key: "lastLogin", label: "마지막 로그인", render: (row) => row.lastLogin },
      { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone="success">{row.status}</AdminStatusBadge> },
    ];
    return <ListFrame filters={[{ label: "검색어", name: "query", placeholder: "이름, 이메일" }, { label: "역할", name: "role", type: "select", options: ["SUPER_ADMIN", "OPERATOR"] }]} resultLabel="관리자 계정과 권한" total={rows.length}><AdminDataTable columns={columns} rowKey={(row) => row.email} rows={rows} /></ListFrame>;
  }

  return (
    <section className="admin-detail-layout">
      <div className="admin-detail-main">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <span>{type === "site" ? "사이트 기본정보" : "약관·정책"}</span>
              <h2>{type === "site" ? "사업자·고객센터·SEO" : "버전 관리"}</h2>
            </div>
          </div>
          <div className="admin-editor-grid">
            {(type === "site"
              ? ["회사명", "대표자", "사업자번호", "통신판매업번호", "고객센터", "비즈니스 이메일", "기본 SEO 제목", "기본 SEO 설명"]
              : ["이용약관", "개인정보처리방침", "환불정책", "취소·환불 템플릿"]
            ).map((label) => (
              <label key={label}>
                <span>{label}</span>
                <input defaultValue={type === "site" ? "지붕뚫은친구들" : "v1.0 · 2026-05-19"} />
              </label>
            ))}
          </div>
        </article>
      </div>
      <aside className="admin-detail-side">
        <article className="admin-card">
          <span>권한</span>
          <strong>SUPER_ADMIN</strong>
          <p>정책과 관리자 계정 변경은 슈퍼관리자만 저장할 수 있습니다.</p>
        </article>
      </aside>
    </section>
  );
}

export default async function AdminCatchAllPage({ params }: AdminCatchAllPageProps) {
  const { slug } = await params;
  const key = slug.join("/");
  const config = getAdminRouteConfig(key);
  if (!config) notFound();

  const data = await loadAdminData();

  return (
    <>
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        actions={<HeaderActions primary={config.primaryAction} secondary={config.secondaryAction} />}
      />

      {key === "dashboard" ? <DashboardPage data={data} /> : null}
      {key === "members/general" ? <MembersPage corporate={false} data={data} /> : null}
      {key === "members/corporate" ? <MembersPage corporate data={data} /> : null}
      {key === "products" ? <ProductsPage data={data} /> : null}
      {key === "products/new" ? <ProductEditorPage data={data} /> : null}
      {key === "products/categories" ? <CategoriesPage data={data} /> : null}
      {key === "reservations" ? <ReservationsPage data={data} /> : null}
      {key === "reservations/schedules" ? <SchedulesPage data={data} /> : null}
      {key === "events/ongoing" ? <EventsPage closed={false} data={data} /> : null}
      {key === "events/closed" ? <EventsPage closed data={data} /> : null}
      {key === "packages" ? <PackagesPage data={data} /> : null}
      {key === "quotes" ? <QuotesPage data={data} /> : null}
      {key === "banners" ? <ContentPage data={data} type="banners" /> : null}
      {key === "curations" ? <ContentPage data={data} type="curations" /> : null}
      {key === "journal" ? <ContentPage data={data} type="journal" /> : null}
      {key === "reviews" ? <ContentPage data={data} type="reviews" /> : null}
      {key === "settings/admins" ? <SettingsPage type="admins" /> : null}
      {key === "settings/site" ? <SettingsPage type="site" /> : null}
      {key === "settings/policies" ? <SettingsPage type="policies" /> : null}
    </>
  );
}
