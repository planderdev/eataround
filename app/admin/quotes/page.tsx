import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { QuotesPage } from "@/components/admin/pages/QuotesPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "quotes";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <QuotesPage data={data} />
    </AdminRouteShell>
  );
}
