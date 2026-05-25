import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { PackagesPage } from "@/components/admin/pages/PackagesPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "packages";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <PackagesPage data={data} />
    </AdminRouteShell>
  );
}
