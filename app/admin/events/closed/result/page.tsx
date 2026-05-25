import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { EventEditorPage } from "@/components/admin/pages/EventEditorPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "events/closed/result";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <EventEditorPage closed data={data} />
    </AdminRouteShell>
  );
}
