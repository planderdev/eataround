import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ProductsPage } from "@/components/admin/pages/ProductsPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "products";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ProductsPage data={data} />
    </AdminRouteShell>
  );
}
