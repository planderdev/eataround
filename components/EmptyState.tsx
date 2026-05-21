import type { ReactNode } from "react";
import { RiInbox2Line } from "@remixicon/react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const displayIcon = icon ?? <RiInbox2Line size={32} aria-hidden />;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{displayIcon}</div>
      <strong className="empty-state-title">{title}</strong>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
