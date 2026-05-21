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
      <AosProvider />
      <SmoothScroll />
      <Header />
      <main>{children}</main>
      <Footer />
      <BottomNav />
      <Toaster />
    </>
  );
}
