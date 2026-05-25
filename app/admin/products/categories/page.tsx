import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { CategoriesPage } from "@/components/admin/pages/CategoriesPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "products/categories";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <CategoriesPage data={data} />
    </AdminRouteShell>
  );
}
