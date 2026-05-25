import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ProductEditorPage } from "@/components/admin/pages/ProductEditorPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "products/new";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ProductEditorPage data={data} />
    </AdminRouteShell>
  );
}
