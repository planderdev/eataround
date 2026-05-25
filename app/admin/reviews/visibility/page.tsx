import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ReviewVisibilityPage } from "@/components/admin/pages/ReviewVisibilityPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "reviews/visibility";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ReviewVisibilityPage data={data} />
    </AdminRouteShell>
  );
}
