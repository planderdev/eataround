import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <section className="page-section auth-page">
      <SectionHeader eyebrow="Login" title="로그인" description="예약, 찜, 견적 내역을 이어서 확인하세요." level="h1" />
      <LoginForm />
    </section>
  );
}
