import type { Metadata } from "next";
import { AdminRouteShell, adminPageMetadata } from "@/components/admin/AdminRouteShell";
import { InquiriesPage } from "@/components/admin/pages/InquiriesPage";
import { requireAdminPage } from "@/lib/admin/data";
import { getAdminInquiries } from "@/lib/admin/inquiries";
import { withStrictDatabase } from "@/lib/db-strict";

const ROUTE_KEY = "inquiries";
export const metadata: Metadata = adminPageMetadata(ROUTE_KEY);

export default async function Page() {
  await requireAdminPage();
  const inquiries = await withStrictDatabase(() => getAdminInquiries());
  return (
    <AdminRouteShell routeKey={ROUTE_KEY}>
      <InquiriesPage inquiries={inquiries} />
    </AdminRouteShell>
  );
}
