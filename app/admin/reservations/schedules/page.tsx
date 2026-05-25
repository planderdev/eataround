import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { SchedulesPage } from "@/components/admin/pages/SchedulesPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "reservations/schedules";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <SchedulesPage data={data} />
    </AdminRouteShell>
  );
}
