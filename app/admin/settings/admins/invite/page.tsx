import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { AdminInvitePage } from "@/components/admin/pages/AdminInvitePage";

const ROUTE_KEY = "settings/admins/invite";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default function Page() {
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <AdminInvitePage />
    </AdminRouteShell>
  );
}
