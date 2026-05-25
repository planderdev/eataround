import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { PackageEditorPage } from "@/components/admin/pages/PackageEditorPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "packages/new";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <PackageEditorPage data={data} />
    </AdminRouteShell>
  );
}
