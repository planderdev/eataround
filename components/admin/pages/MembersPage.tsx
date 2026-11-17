import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
  StatCard,
  memberApprovalStatus,
  toneFromStatus,
} from "@/components/admin/AdminLayoutPrimitives";
import { MemberApprovalInline } from "@/components/admin/MemberApprovalInline";
import type { AdminData } from "@/lib/admin/data";

export function MembersPage({ corporate, data }: { corporate: boolean; data: AdminData }) {
  const rows = data.members.filter((member) => (corporate ? member.type.includes("기업") || member.type.includes("기관") : member.type === "일반회원"));
  const columns: AdminTableColumn<AdminData["members"][number]>[] = corporate
    ? [
        { key: "name", label: "기관명", render: (row) => <strong>{row.organization ?? row.name}</strong> },
        { key: "manager", label: "담당자", render: (row) => row.name },
        { key: "email", label: "이메일", render: (row) => row.email },
        { key: "status", label: "승인 상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
      ]
    : [
        { key: "id", label: "회원번호", render: (row) => (row.id ? `M-${String(row.id).padStart(4, "0")}` : "-") },
        { key: "name", label: "이름", render: (row) => <strong>{row.name}</strong> },
        { key: "email", label: "이메일", render: (row) => row.email },
        { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
      ];

  return (
    <ListFrame
      bulk={
        corporate
          ? [
              { label: "승인 처리", endpoint: "/api/admin/members", payload: { action: "approve" } },
              { label: "권한 보류", unlinked: "보류 상태를 저장할 항목(컬럼)이 아직 없습니다." },
              { label: "안내 발송", unlinked: "메일·알림 발송 수단이 없습니다." },
              { label: "담당자 지정", unlinked: "담당자를 저장할 항목(컬럼)이 아직 없습니다." },
            ]
          : [
              { label: "선택 회원 메모", unlinked: "회원 메모를 저장할 항목(컬럼)이 아직 없습니다." },
              { label: "휴면 처리", unlinked: "휴면 상태를 저장할 항목(컬럼)이 아직 없습니다." },
              { label: "마케팅 동의 변경", unlinked: "마케팅 동의를 저장할 항목(컬럼)이 아직 없습니다." },
            ]
      }
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
        actions={(row) =>
          corporate ? (
            <MemberApprovalInline
              key={`${row.id ?? row.email}-${row.status}`}
              memberId={row.id ? String(row.id) : `sample-${row.email}`}
              memberLabel={row.organization ?? row.name}
              status={memberApprovalStatus(row.status)}
            />
          ) : (
            <small>일반회원 정보 수정·예약 내역 보기·안내 발송은 아직 연결되지 않았습니다.</small>
          )
        }
        columns={columns}
        detail={(row) => (
          <DetailPairs
            items={[
              ["회원 구분", row.type],
              ["이메일", row.email],
              ["계정 상태", row.status],
              ...(row.rejectedReason ? ([["반려 사유", row.rejectedReason]] as [string, string][]) : []),
              ["접근 권한", corporate ? "패키지 견적 요청 가능" : "체험 예약 및 상담 요청 가능"],
            ]}
          />
        )}
        rowId={(row) => row.id}
        rowKey={(row) => `${row.email}-${row.type}`}
        rows={rows}
      />
    </ListFrame>
  );
}
