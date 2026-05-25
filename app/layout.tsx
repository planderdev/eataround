import type { Metadata } from "next";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "./globals.css";

const metadataBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "이더라운드 eat.around",
    template: "%s | 이더라운드",
  },
  description:
    "제주의 음식, 문화, 사람을 연결하는 로컬 경험 예약 플랫폼. 미식 클래스, 양조장 투어, 기업·기관 패키지를 예약하세요.",
  openGraph: {
    title: "이더라운드 eat.around",
    description: "진짜 제주를 맛보는 로컬 경험 플랫폼",
    url: "https://eataround.co.kr",
    siteName: "이더라운드",
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: `${metadataBasePath}/assets/images/symbol.png`,
    apple: `${metadataBasePath}/assets/images/symbol.png`,
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eataround.co.kr";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "이더라운드",
  alternateName: "eat.around",
  url: siteUrl,
  logo: `${siteUrl}${metadataBasePath}/assets/images/logo.png`,
  description: "제주 로컬 체험을 예약·운영하는 콘텐츠 플랫폼",
  sameAs: [siteUrl],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "이더라운드",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
