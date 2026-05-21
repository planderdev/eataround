import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "urgent"
  | "sale"
  | "stock"
  | "ongoing"
  | "booking"
  | "pending"
  | "confirmed"
  | "done"
  | "received"
  | "cancelled";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
  variant?: "soft" | "solid";
};

export function Badge({ children, className, tone = "neutral", variant = "soft" }: BadgeProps) {
  const classNames = ["badge-chip", variant === "solid" ? "badge-chip--solid" : null, className].filter(Boolean).join(" ");

  return (
    <span className={classNames} data-tone={tone}>
      {children}
    </span>
  );
}

export function ProductBadge({ children, tone }: { children: ReactNode; tone: BadgeTone }) {
  return (
    <Badge tone={tone} variant="solid">
      {children}
    </Badge>
  );
}

export function StatusBadge({ children, tone }: { children: ReactNode; tone: BadgeTone }) {
  return (
    <Badge className="status-badge" tone={tone}>
      {children}
    </Badge>
  );
}
