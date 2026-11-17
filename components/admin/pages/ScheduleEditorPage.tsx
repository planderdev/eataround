import { AdminCreateForm, type AdminCreateField } from "@/components/admin/AdminCreateForm";
import type { AdminData } from "@/lib/admin/data";

export function ScheduleEditorPage({ data, mode }: { data: AdminData; mode: "single" | "recurring" | "close" }) {
  const isClose = mode === "close";
  const isRecurring = mode === "recurring";
  const products = data.adminProducts.filter((product) => product.id);

  const productField: AdminCreateField = {
    name: "productId",
    label: "상품",
    type: "select",
    numeric: true,
    required: true,
    wide: true,
    options: products.map((product) => ({ value: String(product.id), label: product.isVisible ? product.title : `${product.title} (비공개)` })),
  };

  const stockFields: AdminCreateField[] = [
    { name: "label", label: "회차 시간", type: "text", defaultValue: "오전 10:30", maxLength: 80, required: true, placeholder: "예: 오전 10:30" },
    { name: "maxTeams", label: "최대 팀", type: "number", defaultValue: 4, required: true },
    { name: "teamCapacity", label: "팀당 인원", type: "number", defaultValue: 6, required: true },
    {
      name: "reservationType",
      label: "승인 방식",
      type: "select",
      defaultValue: "approval",
      options: [
        { value: "instant", label: "즉시예약" },
        { value: "approval", label: "승인 후 확정" },
        { value: "inquiry", label: "문의예약" },
      ],
    },
    { name: "price", label: "회차 가격(비우면 상품 기본가)", type: "number" },
  ];

  const fields: AdminCreateField[] = isClose
    ? [
        productField,
        { name: "startDate", label: "마감 시작일", type: "date" },
        { name: "endDate", label: "종료일", type: "date" },
        {
          name: "status",
          label: "처리",
          type: "select",
          defaultValue: "closed",
          options: [
            { value: "closed", label: "기간 내 회차 마감" },
            { value: "open", label: "기간 내 회차 다시 열기" },
          ],
        },
      ]
    : isRecurring
      ? [
          productField,
          { name: "date", label: "시작일", type: "date" },
          { name: "endDate", label: "종료일", type: "date" },
          { name: "weekdays", label: "반복 요일", type: "weekdays", defaultValue: [5, 6, 0] },
          ...stockFields,
        ]
      : [productField, { name: "date", label: "행사일", type: "date" }, ...stockFields];

  return (
    <section className="admin-creation-layout" data-variant="schedule">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>{isClose ? "Close schedule" : isRecurring ? "Recurring schedule" : "Schedule setup"}</span>
          <h2>{isClose ? "회차를 기간 단위로 마감합니다." : isRecurring ? "반복 회차를 미리 생성합니다." : "날짜별 팀 단위 재고를 등록합니다."}</h2>
          <p>
            {isClose
              ? "선택한 상품의 기간 안 회차를 한 번에 마감하거나 다시 엽니다. 이미 받은 예약은 그대로 유지됩니다."
              : "총 좌석은 최대 팀 × 팀당 인원으로 계산합니다. 같은 상품·날짜·시간의 회차가 이미 있으면 건너뜁니다."}
          </p>
        </div>
        {products.length ? (
          <AdminCreateForm
            backHref="/admin/reservations/schedules"
            endpoint={isClose ? "/api/admin/schedules/bulk-close" : "/api/admin/schedules"}
            fields={fields}
            submitLabel={isClose ? "일괄 처리 실행" : isRecurring ? "반복 회차 생성" : "회차 저장"}
          />
        ) : (
          <p>회차를 등록할 상품이 없습니다. 먼저 상품을 등록해 주세요.</p>
        )}
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>등록된 회차</span>
          <div className="admin-stock-preview-grid">
            {data.adminSchedules.slice(0, 4).map((schedule) => (
              <div key={`${schedule.id ?? ""}-${schedule.product}-${schedule.date}-${schedule.label}`}>
                <b>{schedule.date}</b>
                <strong>{schedule.label}</strong>
                <small>
                  {schedule.product} · {schedule.status === "closed" ? "마감" : `${schedule.reservedTeams}/${schedule.maxTeams}팀 예약`}
                </small>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}
