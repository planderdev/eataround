import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { MembersPage } from "@/components/admin/pages/MembersPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "members/general";

export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <MembersPage corporate={false} data={data} />
    </AdminRouteShell>
  );
}
