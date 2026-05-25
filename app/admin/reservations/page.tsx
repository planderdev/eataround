import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { ReservationsPage } from "@/components/admin/pages/ReservationsPage";
import { loadAdminData } from "@/lib/admin/data";

const ROUTE_KEY = "reservations";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  const data = await loadAdminData();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <ReservationsPage data={data} />
    </AdminRouteShell>
  );
}
