import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { PolicyVersionPage } from "@/components/admin/pages/PolicyVersionPage";

const ROUTE_KEY = "settings/policies/new";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default function Page() {
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <PolicyVersionPage />
    </AdminRouteShell>
  );
}
