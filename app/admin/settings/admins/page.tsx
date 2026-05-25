import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { SettingsPage } from "@/components/admin/pages/SettingsPage";

const ROUTE_KEY = "settings/admins";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default function Page() {
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <SettingsPage type="admins" />
    </AdminRouteShell>
  );
}
