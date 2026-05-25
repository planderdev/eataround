import "../styles/site.css";
import { AosProvider } from "@/components/AosProvider";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Toaster } from "@/components/Toaster";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-to-content" href="#main-content">본문으로 건너뛰기</a>
      <AosProvider />
      <SmoothScroll />
      <Header />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
      <BottomNav />
      <Toaster />
    </>
  );
}
