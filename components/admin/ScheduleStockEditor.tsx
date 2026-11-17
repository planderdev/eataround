"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiAlarmWarningLine, RiSave3Line } from "@remixicon/react";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

type ScheduleStockEditorProps = {
  scheduleId: string;
  scheduleLabel: string;
  capacity: number;
  maxTeams: number;
  teamCapacity: number;
  status?: "open" | "closed";
};

export function ScheduleStockEditor({ scheduleId, scheduleLabel, capacity, maxTeams, teamCapacity, status = "open" }: ScheduleStockEditorProps) {
  const router = useRouter();
  const isClosed = status === "closed";
  const [draft, setDraft] = useState({ capacity, maxTeams, teamCapacity });
  const [busy, setBusy] = useState<"save" | "close" | null>(null);
  const dirty = draft.capacity !== capacity || draft.maxTeams !== maxTeams || draft.teamCapacity !== teamCapacity;

  async function patch(payload: Partial<typeof draft> & { status?: "open" | "closed" }, busyKey: NonNullable<typeof busy>, successMessage: string) {
    setBusy(busyKey);
    try {
      const response = await fetch(withBasePath(`/api/admin/schedules/${encodeURIComponent(scheduleId)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? successMessage, "success");
        router.refresh();
        return;
      }
      notifyAdminToast(data.message ?? "처리에 실패했습니다.", "error");
    } catch {
      notifyAdminToast("네트워크 오류로 처리하지 못했습니다.", "error");
    } finally {
      setBusy(null);
    }
  }

  function updateField<K extends keyof typeof draft>(key: K, value: number) {
    setDraft((current) => ({ ...current, [key]: Math.max(0, Number.isFinite(value) ? value : 0) }));
  }

  return (
    <div className="admin-stock-editor" data-admin-own-action aria-label={`${scheduleLabel} 재고 편집`}>
      <div className="admin-stock-editor-fields">
        <label>
          <span>총 좌석</span>
          <input min={0} onChange={(event) => updateField("capacity", Number(event.target.value))} type="number" value={draft.capacity} />
        </label>
        <label>
          <span>최대 팀</span>
          <input min={0} onChange={(event) => updateField("maxTeams", Number(event.target.value))} type="number" value={draft.maxTeams} />
        </label>
        <label>
          <span>팀당 인원</span>
          <input min={0} onChange={(event) => updateField("teamCapacity", Number(event.target.value))} type="number" value={draft.teamCapacity} />
        </label>
      </div>
      <div className="admin-stock-editor-actions">
        <button
          className={isClosed ? "admin-action-button secondary" : "admin-action-button danger"}
          disabled={Boolean(busy)}
          onClick={() =>
            patch(
              { status: isClosed ? "open" : "closed" },
              "close",
              isClosed ? `${scheduleLabel} 회차 예약을 다시 열었습니다.` : `${scheduleLabel} 회차를 마감했습니다.`,
            )
          }
          type="button"
        >
          <RiAlarmWarningLine size={14} />
          {busy === "close" ? "처리 중..." : isClosed ? "예약 다시 열기" : "회차 마감"}
        </button>
        <button
          className="admin-action-button primary"
          disabled={!dirty || Boolean(busy)}
          onClick={() => patch(draft, "save", `${scheduleLabel} 재고를 저장했습니다.`)}
          type="button"
        >
          <RiSave3Line size={14} />
          {busy === "save" ? "저장 중..." : "재고 저장"}
        </button>
      </div>
    </div>
  );
}
