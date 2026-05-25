import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HeaderActions } from "@/components/admin/AdminLayoutPrimitives";
import { getAdminRouteConfig } from "@/lib/admin";

type AdminRouteShellProps = {
  routeKey: string;
  children: ReactNode;
};

export function AdminRouteShell({ routeKey, children }: AdminRouteShellProps) {
  const config = getAdminRouteConfig(routeKey);
  if (!config) notFound();

  const headerActions =
    config.mode === "form" ? null : (
      <HeaderActions currentKey={routeKey} primary={config.primaryAction} secondary={config.secondaryAction} />
    );

  return (
    <>
      <AdminPageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        actions={headerActions}
      />
      {children}
    </>
  );
}

export function adminPageMetadata(routeKey: string) {
  const config = getAdminRouteConfig(routeKey);
  return { title: config?.title ?? "관리자" };
}
