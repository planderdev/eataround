import type { Metadata } from "next";
import "../styles/admin-entry.css";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "관리자",
    template: "%s | 관리자",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell>{children}</AdminShell>;
}
