import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ScheduleEditorPage } from "@/components/admin/pages/ScheduleEditorPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "reservations/schedules/recurring";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ScheduleEditorPage data={data} mode="recurring" />
    </AdminRouteShell>
  );
}
