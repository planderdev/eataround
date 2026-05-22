import type { Metadata } from "next";
import { CheckoutClient } from "@/components/CheckoutClient";

type PageProps = {
  params: Promise<{ reservationId: string }>;
};

export const metadata: Metadata = {
  title: "예약 확인",
};

export function generateStaticParams() {
  return [{ reservationId: "preview" }];
}

export default async function CheckoutPage({ params }: PageProps) {
  const { reservationId } = await params;

  return <CheckoutClient reservationId={reservationId} />;
}
