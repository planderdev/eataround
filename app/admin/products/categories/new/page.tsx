import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { CategoryEditorPage } from "@/components/admin/pages/CategoryEditorPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "products/categories/new";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <CategoryEditorPage data={data} />
    </AdminRouteShell>
  );
}
