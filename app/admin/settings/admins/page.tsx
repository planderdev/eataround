import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { SettingsPage } from "@/components/admin/pages/SettingsPage";
import { getAdminAccounts } from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/admin/data";

const ROUTE_KEY = "settings/admins";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  // 요청마다 최신 관리자 목록을 읽는다(관리자 권한을 DB에서 다시 확인한 뒤).
  await requireAdminPage();
  const admins = await getAdminAccounts();
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <SettingsPage admins={admins} type="admins" />
    </AdminRouteShell>
  );
}
