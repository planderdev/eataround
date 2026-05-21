import type { ReactNode } from "react";

type ListToolbarProps = {
  children?: ReactNode;
  summary: ReactNode;
};

export function ListToolbar({ children, summary }: ListToolbarProps) {
  return (
    <div className="list-toolbar">
      <div className="list-toolbar-main">{summary}</div>
      {children}
    </div>
  );
}
