import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { EventsPage } from "@/components/admin/pages/EventsPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "events/ongoing";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <EventsPage closed={false} data={data} />
    </AdminRouteShell>
  );
}
