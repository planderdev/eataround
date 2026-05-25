import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { AdminWorkflowPage } from "@/components/admin/pages/AdminWorkflowPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "quotes/convert";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <AdminWorkflowPage actionKey={ROUTE_KEY} data={data} />
    </AdminRouteShell>
  );
}
