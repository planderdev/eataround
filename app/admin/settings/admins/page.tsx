import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { SettingsPage } from "@/components/admin/pages/SettingsPage";
import { getAdminAccounts } from "@/lib/admin/content";
import { connection } from "next/server";

const ROUTE_KEY = "settings/admins";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  // 요청마다 최신 관리자 목록을 읽는다.
  await connection();
  const admins = await getAdminAccounts();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <SettingsPage admins={admins} type="admins" />
    </AdminRouteShell>
  );
}
