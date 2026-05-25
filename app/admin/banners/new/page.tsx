import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ContentEditorPage } from "@/components/admin/pages/ContentEditorPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "banners/new";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ContentEditorPage data={data} type="banners" />
    </AdminRouteShell>
  );
}
