import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ContentPage } from "@/components/admin/pages/ContentPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "curations";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ContentPage data={data} type="curations" />
    </AdminRouteShell>
  );
}
