import "../styles/site.css";
import { SiteShell } from "@/components/SiteShell";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
