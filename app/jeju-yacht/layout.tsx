import type { Metadata } from "next";
import "../styles/yacht.css";
import { AosProvider } from "@/components/AosProvider";
import { eventInfo } from "@/lib/yacht/data";

export const metadata: Metadata = {
  title: {
    default: `${eventInfo.title} ${eventInfo.edition}`,
    template: `%s | ${eventInfo.title}`,
  },
  description: `${eventInfo.tagline}. ${eventInfo.dateLabel}, ${eventInfo.venue}. 관람권 온라인 예매.`,
  openGraph: {
    title: `${eventInfo.title} ${eventInfo.edition}`,
    description: eventInfo.tagline,
    locale: "ko_KR",
    type: "website",
  },
};

export default function YachtRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="yacht">
      <AosProvider />
      {children}
    </div>
  );
}
