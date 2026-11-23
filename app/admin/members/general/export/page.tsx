import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { MemberExportPage } from "@/components/admin/pages/MemberExportPage";
import { requireAdminPage } from "@/lib/admin/data";
import { hasDatabaseConfig } from "@/lib/db";

const ROUTE_KEY = "members/general/export";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  await requireAdminPage();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <MemberExportPage live={hasDatabaseConfig()} />
    </AdminRouteShell>
  );
}
